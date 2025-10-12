import {
  query,
  isUsingInMemoryDatabase,
  getMemoryStore,
  allocateMemoryId,
} from "../db.js";

function cloneTags(tags) {
  return Array.isArray(tags) ? [...tags] : [];
}

function sortByPositionAndId(items) {
  return [...items].sort((a, b) => {
    const positionA = Number(a.position) || 0;
    const positionB = Number(b.position) || 0;
    if (positionA !== positionB) {
      return positionA - positionB;
    }
    return Number(a.id) - Number(b.id);
  });
}

function sortByDateDesc(items, accessor) {
  return [...items].sort((a, b) => {
    const valueA = accessor(a);
    const valueB = accessor(b);
    if (valueA === valueB) {
      return Number(b.id) - Number(a.id);
    }
    if (valueA === null) return 1;
    if (valueB === null) return -1;
    return valueB - valueA;
  });
}

// Carousel helpers
export async function getCarouselSlides() {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    const slides = sortByPositionAndId(store.carouselSlides);
    return slides.map((slide) => ({
      id: slide.id,
      imageDesktopUrl: slide.image_desktop_url || slide.image_url,
      imageMobileUrl: slide.image_mobile_url || slide.image_url,
      imageUrl: slide.image_url,
      captionText: slide.caption_text || "",
      position: slide.position,
    }));
  }

  const { rows } = await query(
    `SELECT
       id,
       COALESCE(NULLIF(image_desktop_url, ''), image_url) AS "imageDesktopUrl",
       COALESCE(NULLIF(image_mobile_url, ''), image_url) AS "imageMobileUrl",
       image_url AS "imageUrl",
       caption_text AS "captionText",
       position
     FROM carousel_slides
     ORDER BY position ASC, id ASC`
  );
  return rows;
}

export async function getNextCarouselPosition() {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    const maxPosition = store.carouselSlides.reduce((acc, slide) => {
      const value = Number(slide.position) || 0;
      return value > acc ? value : acc;
    }, 0);
    return maxPosition + 1;
  }

  const { rows } = await query("SELECT COALESCE(MAX(position), 0) + 1 AS next FROM carousel_slides");
  return Number(rows[0]?.next || 1);
}

export async function createCarouselSlide({
  imageUrl,
  imageDesktopUrl,
  imageMobileUrl,
  captionText,
  position,
}) {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    const id = allocateMemoryId("carouselSlides");
    store.carouselSlides.push({
      id,
      image_url: imageUrl,
      image_desktop_url: imageDesktopUrl || imageUrl,
      image_mobile_url: imageMobileUrl || imageUrl,
      caption_text: captionText || "",
      position,
    });
    return { id };
  }

  const { rows } = await query(
    `INSERT INTO carousel_slides (image_url, image_desktop_url, image_mobile_url, caption_text, position)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [imageUrl, imageDesktopUrl, imageMobileUrl, captionText, position]
  );
  return rows[0];
}

export async function updateCarouselSlide(id, { imageUrl, imageDesktopUrl, imageMobileUrl, captionText, position }) {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    const slide = store.carouselSlides.find((item) => Number(item.id) === Number(id));
    if (!slide) {
      return false;
    }

    if (typeof imageUrl === "string") {
      slide.image_url = imageUrl;
    }
    if (typeof imageDesktopUrl === "string") {
      slide.image_desktop_url = imageDesktopUrl;
    }
    if (typeof imageMobileUrl === "string") {
      slide.image_mobile_url = imageMobileUrl;
    }
    if (typeof captionText === "string") {
      slide.caption_text = captionText;
    }
    if (Number.isFinite(position)) {
      slide.position = Number(position);
    }
    return true;
  }

  await query(
    `UPDATE carousel_slides
       SET image_url = COALESCE($1, image_url),
           image_desktop_url = COALESCE($2, image_desktop_url),
           image_mobile_url = COALESCE($3, image_mobile_url),
           caption_text = COALESCE($4, caption_text),
           position = COALESCE($5, position)
     WHERE id = $6`,
    [imageUrl, imageDesktopUrl, imageMobileUrl, captionText, position, id]
  );
  return true;
}

export async function deleteCarouselSlide(id) {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    const initialLength = store.carouselSlides.length;
    store.carouselSlides = store.carouselSlides.filter((item) => Number(item.id) !== Number(id));
    return store.carouselSlides.length !== initialLength;
  }

  await query("DELETE FROM carousel_slides WHERE id = $1", [id]);
  return true;
}

// Agenda helpers
export async function getAgendaEvents() {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    const sorted = sortByDateDesc(store.agendaEvents, (item) =>
      item.fecha ? new Date(item.fecha).getTime() : null
    );
    return sorted.map((event) => ({
      id: event.id,
      titulo: event.titulo,
      descripcion: event.descripcion,
      fecha: event.fecha,
      imageUrl: event.image_url,
      tags: cloneTags(event.tags),
    }));
  }

  const { rows } = await query(
    `SELECT id, titulo, descripcion, fecha, image_url AS "imageUrl", tags
     FROM agenda_events
     ORDER BY fecha DESC NULLS LAST, id DESC`
  );
  return rows;
}

export async function createAgendaEvent({ titulo, descripcion, fecha, imageUrl, tags }) {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    const id = allocateMemoryId("agendaEvents");
    store.agendaEvents.push({
      id,
      titulo,
      descripcion: descripcion || "",
      fecha: fecha || null,
      image_url: imageUrl || "",
      tags: cloneTags(tags),
    });
    return { id };
  }

  const { rows } = await query(
    `INSERT INTO agenda_events (titulo, descripcion, fecha, image_url, tags)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [titulo, descripcion || "", fecha || null, imageUrl || "", tags]
  );
  return rows[0];
}

export async function updateAgendaEvent(id, { titulo, descripcion, fecha, imageUrl, tags }) {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    const event = store.agendaEvents.find((item) => Number(item.id) === Number(id));
    if (!event) {
      return false;
    }
    if (typeof titulo === "string") {
      event.titulo = titulo;
    }
    if (typeof descripcion === "string") {
      event.descripcion = descripcion;
    }
    if (typeof fecha !== "undefined") {
      event.fecha = fecha || null;
    }
    if (typeof imageUrl === "string") {
      event.image_url = imageUrl;
    }
    if (Array.isArray(tags)) {
      event.tags = cloneTags(tags);
    }
    return true;
  }

  await query(
    `UPDATE agenda_events
     SET titulo = COALESCE($1, titulo),
         descripcion = COALESCE($2, descripcion),
         fecha = COALESCE($3, fecha),
         image_url = COALESCE($4, image_url),
         tags = COALESCE($5, tags)
     WHERE id = $6`,
    [titulo, descripcion, fecha, imageUrl, Array.isArray(tags) ? tags : null, id]
  );
  return true;
}

export async function deleteAgendaEvent(id) {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    const original = store.agendaEvents.length;
    store.agendaEvents = store.agendaEvents.filter((item) => Number(item.id) !== Number(id));
    return store.agendaEvents.length !== original;
  }

  await query("DELETE FROM agenda_events WHERE id = $1", [id]);
  return true;
}

// Usina helpers
export async function getUsinaPosts() {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    const posts = [...store.usinaPosts].sort((a, b) => Number(b.id) - Number(a.id));
    return posts.map((post) => ({
      id: post.id,
      titulo: post.titulo,
      texto: post.texto,
      imageUrl: post.image_url,
      tags: cloneTags(post.tags),
    }));
  }

  const { rows } = await query(
    `SELECT id, titulo, texto, image_url AS "imageUrl", tags
     FROM usina_posts
     ORDER BY id DESC`
  );
  return rows;
}

export async function createUsinaPost({ titulo, texto, imageUrl, tags }) {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    const id = allocateMemoryId("usinaPosts");
    store.usinaPosts.push({
      id,
      titulo,
      texto: texto || "",
      image_url: imageUrl || "",
      tags: cloneTags(tags),
    });
    return { id };
  }

  const { rows } = await query(
    `INSERT INTO usina_posts (titulo, texto, image_url, tags)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [titulo, texto || "", imageUrl || "", tags]
  );
  return rows[0];
}

export async function updateUsinaPost(id, { titulo, texto, imageUrl, tags }) {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    const post = store.usinaPosts.find((item) => Number(item.id) === Number(id));
    if (!post) {
      return false;
    }
    if (typeof titulo === "string") {
      post.titulo = titulo;
    }
    if (typeof texto === "string") {
      post.texto = texto;
    }
    if (typeof imageUrl === "string") {
      post.image_url = imageUrl;
    }
    if (Array.isArray(tags)) {
      post.tags = cloneTags(tags);
    }
    return true;
  }

  await query(
    `UPDATE usina_posts
     SET titulo = COALESCE($1, titulo),
         texto = COALESCE($2, texto),
         image_url = COALESCE($3, image_url),
         tags = COALESCE($4, tags)
     WHERE id = $5`,
    [titulo, texto, imageUrl, Array.isArray(tags) ? tags : null, id]
  );
  return true;
}

export async function deleteUsinaPost(id) {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    const original = store.usinaPosts.length;
    store.usinaPosts = store.usinaPosts.filter((item) => Number(item.id) !== Number(id));
    return store.usinaPosts.length !== original;
  }

  await query("DELETE FROM usina_posts WHERE id = $1", [id]);
  return true;
}

// FAQ helpers
export async function getFaqs() {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    const faqs = sortByPositionAndId(store.faqs);
    return faqs.map((faq) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      position: faq.position,
      tags: cloneTags(faq.tags),
    }));
  }

  const { rows } = await query(
    `SELECT id, question, answer, position, tags
     FROM faqs
     ORDER BY position ASC, id ASC`
  );
  return rows;
}

export async function getNextFaqPosition() {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    const max = store.faqs.reduce((acc, item) => {
      const value = Number(item.position) || 0;
      return value > acc ? value : acc;
    }, 0);
    return max + 1;
  }

  const { rows } = await query("SELECT COALESCE(MAX(position), 0) + 1 AS next FROM faqs");
  return Number(rows[0]?.next || 1);
}

export async function createFaq({ question, answer, position, tags }) {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    const id = allocateMemoryId("faqs");
    const item = {
      id,
      question,
      answer,
      position,
      tags: cloneTags(tags),
    };
    store.faqs.push(item);
    return item;
  }

  const { rows } = await query(
    `INSERT INTO faqs (question, answer, position, tags)
     VALUES ($1, $2, $3, $4)
     RETURNING id, question, answer, position, tags`,
    [question, answer, position, tags]
  );
  return rows[0];
}

export async function updateFaq(id, { question, answer, position, tags }) {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    const faq = store.faqs.find((item) => Number(item.id) === Number(id));
    if (!faq) {
      return null;
    }
    if (typeof question === "string") {
      faq.question = question;
    }
    if (typeof answer === "string") {
      faq.answer = answer;
    }
    if (Number.isFinite(position)) {
      faq.position = Number(position);
    }
    if (Array.isArray(tags)) {
      faq.tags = cloneTags(tags);
    }
    return {
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      position: faq.position,
      tags: cloneTags(faq.tags),
    };
  }

  const setClauses = [];
  const values = [];
  if (typeof question !== "undefined") {
    setClauses.push(`question = $${setClauses.length + 1}`);
    values.push(question);
  }
  if (typeof answer !== "undefined") {
    setClauses.push(`answer = $${setClauses.length + 1}`);
    values.push(answer);
  }
  if (typeof position !== "undefined") {
    setClauses.push(`position = $${setClauses.length + 1}`);
    values.push(position);
  }
  if (typeof tags !== "undefined") {
    setClauses.push(`tags = $${setClauses.length + 1}`);
    values.push(tags);
  }

  if (!setClauses.length) {
    return null;
  }

  values.push(id);

  const { rows } = await query(
    `UPDATE faqs
       SET ${setClauses.join(", ")}
     WHERE id = $${setClauses.length + 1}
     RETURNING id, question, answer, position, tags`,
    values
  );

  return rows[0] || null;
}

export async function deleteFaq(id) {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    const original = store.faqs.length;
    store.faqs = store.faqs.filter((item) => Number(item.id) !== Number(id));
    return store.faqs.length !== original;
  }

  const { rowCount } = await query(`DELETE FROM faqs WHERE id = $1`, [id]);
  return Boolean(rowCount);
}

// Site texts
export async function getSiteTexts() {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    const texts = [...store.siteTexts].sort((a, b) => a.slug.localeCompare(b.slug));
    return texts.map((item) => ({
      id: item.id,
      slug: item.slug,
      titulo: item.titulo,
      contenido: item.contenido,
    }));
  }

  const { rows } = await query(
    `SELECT id, slug, titulo, contenido
     FROM site_texts
     ORDER BY slug ASC`
  );
  return rows;
}

export async function getSiteTextBySlug(slug) {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    const item = store.siteTexts.find((entry) => entry.slug === slug);
    return item
      ? { id: item.id, slug: item.slug, titulo: item.titulo, contenido: item.contenido }
      : null;
  }

  const { rows } = await query(
    `SELECT id, slug, titulo, contenido FROM site_texts WHERE slug = $1 LIMIT 1`,
    [slug]
  );
  return rows[0] || null;
}

export async function upsertSiteText(slug, titulo, contenido) {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    let item = store.siteTexts.find((entry) => entry.slug === slug);
    if (item) {
      item.titulo = typeof titulo === "string" ? titulo : item.titulo;
      item.contenido = typeof contenido === "string" ? contenido : item.contenido;
    } else {
      item = {
        id: allocateMemoryId("siteTexts"),
        slug,
        titulo: titulo || "",
        contenido: contenido || "",
      };
      store.siteTexts.push(item);
    }
    return item;
  }

  const { rowCount } = await query(
    `UPDATE site_texts SET titulo = COALESCE($1, titulo), contenido = COALESCE($2, contenido) WHERE slug = $3`,
    [titulo, contenido, slug]
  );

  if (!rowCount) {
    await query(`INSERT INTO site_texts (slug, titulo, contenido) VALUES ($1, $2, $3)`, [slug, titulo || "", contenido || ""]);
  }

  return getSiteTextBySlug(slug);
}

// Site sections
export async function getSiteSection(section) {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    return store.siteSections.get(section) || null;
  }

  const { rows } = await query(`SELECT data FROM site_sections WHERE section = $1 LIMIT 1`, [section]);
  return rows[0]?.data || null;
}

export async function upsertSiteSection(section, data) {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    store.siteSections.set(section, data);
    return data;
  }

  await query(
    `INSERT INTO site_sections (section, data) VALUES ($1, $2)
     ON CONFLICT (section) DO UPDATE SET data = EXCLUDED.data`,
    [section, data]
  );
  return getSiteSection(section);
}

// Auth helpers
export async function findUserByEmail(email) {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    return store.users.find((user) => user.email === email) || null;
  }

  const { rows } = await query("SELECT * FROM users WHERE email = $1 LIMIT 1", [email]);
  return rows[0] || null;
}

export async function findUserById(id) {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    const user = store.users.find((entry) => Number(entry.id) === Number(id));
    if (!user) {
      return null;
    }
    return { id: user.id, email: user.email, role: user.role };
  }

  const { rows } = await query("SELECT id, email, role FROM users WHERE id = $1", [id]);
  return rows[0] || null;
}

export async function createLoginCode(userId, code, expiresAt) {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    store.loginCodes.push({
      id: allocateMemoryId("loginCodes"),
      user_id: userId,
      code,
      expires_at: expiresAt instanceof Date ? expiresAt.toISOString() : new Date(expiresAt).toISOString(),
    });
    return;
  }

  await query(`INSERT INTO login_codes (user_id, code, expires_at) VALUES ($1, $2, $3)`, [userId, code, expiresAt]);
}

export async function findRecentLoginCodes(userId, limit = 5) {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    const codes = store.loginCodes
      .filter((entry) => Number(entry.user_id) === Number(userId))
      .sort((a, b) => new Date(b.expires_at).getTime() - new Date(a.expires_at).getTime())
      .slice(0, limit);
    return codes;
  }

  const { rows } = await query(
    `SELECT * FROM login_codes WHERE user_id = $1 ORDER BY expires_at DESC LIMIT $2`,
    [userId, limit]
  );
  return rows;
}

export async function deleteLoginCodesByUser(userId) {
  if (isUsingInMemoryDatabase()) {
    const store = getMemoryStore();
    store.loginCodes = store.loginCodes.filter((entry) => Number(entry.user_id) !== Number(userId));
    return;
  }

  await query(`DELETE FROM login_codes WHERE user_id = $1`, [userId]);
}
