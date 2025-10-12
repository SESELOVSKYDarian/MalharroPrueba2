import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { config } from "./config.js";

const memoryStore = createEmptyMemoryStore();
const memorySequences = createInitialSequences();

let usingInMemory = config.useInMemoryDb;
let pool = usingInMemory ? null : createPgPool();

function createPgPool() {
  return new Pool({
    connectionString: config.postgres.connectionString,
    host: config.postgres.host,
    port: config.postgres.port,
    database: config.postgres.database,
    user: config.postgres.user,
    password: config.postgres.password,
    ssl:
      process.env.PGSSLMODE === "require"
        ? { rejectUnauthorized: false }
        : undefined,
  });
}

function createEmptyMemoryStore() {
  return {
    users: [],
    loginCodes: [],
    carouselSlides: [],
    agendaEvents: [],
    usinaPosts: [],
    siteTexts: [],
    siteSections: new Map(),
    faqs: [],
  };
}

function createInitialSequences() {
  return {
    users: 0,
    loginCodes: 0,
    carouselSlides: 0,
    agendaEvents: 0,
    usinaPosts: 0,
    siteTexts: 0,
    faqs: 0,
  };
}

function resetMemoryStore() {
  memoryStore.users = [];
  memoryStore.loginCodes = [];
  memoryStore.carouselSlides = [];
  memoryStore.agendaEvents = [];
  memoryStore.usinaPosts = [];
  memoryStore.siteTexts = [];
  memoryStore.siteSections = new Map();
  memoryStore.faqs = [];

  for (const key of Object.keys(memorySequences)) {
    memorySequences[key] = 0;
  }
}

function nextMemoryId(table) {
  if (!Object.prototype.hasOwnProperty.call(memorySequences, table)) {
    throw new Error(`Unknown in-memory table: ${table}`);
  }
  memorySequences[table] += 1;
  return memorySequences[table];
}

function isConnectionError(error) {
  if (!error) return false;
  if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
    return true;
  }

  if (error.errors && Array.isArray(error.errors)) {
    return error.errors.some((innerError) => isConnectionError(innerError));
  }

  return false;
}

export async function query(text, params) {
  if (usingInMemory) {
    throw new Error("Direct SQL queries are not available while using the in-memory database.");
  }

  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

function getSeedData() {
  const withTags = (item, defaultTags = []) => ({
    tags: defaultTags,
    ...item,
  });

  const defaultNavbar = {
    logoUrl: "/malharrooficial/images/Iso_Malharro.svg",
    searchIconUrl: "/malharrooficial/images/Icon_Lupa.svg",
    campusUrl: "#",
    menu: [
      withTags(
        {
          id: "carreras",
          label: "Carreras",
          type: "dropdown",
          items: [
            withTags({ id: "diseno-grafico", label: "Diseño Gráfico", url: "disenografico.html" }),
            withTags({ id: "escenografia", label: "Escenografía", url: "escenografia.html" }),
            withTags({ id: "fotografia", label: "Fotografía", url: "fotografia.html" }),
            withTags({ id: "ilustracion", label: "Ilustración", url: "ilustracion.html" }),
            withTags({ id: "medios-audiovisuales", label: "Medios Audiovisuales", url: "mediosav.html" }),
            withTags({ id: "profesorado", label: "Profesorado", url: "profesorado.html" }),
            withTags({ id: "realizador", label: "Realizador", url: "realizador.html" })
          ],
        },
        ["inicio", "orientacion"]
      ),
      withTags(
        {
          id: "institucional",
          label: "Institucional",
          type: "dropdown",
          items: [
            withTags({ id: "acerca", label: "Acerca de Malharro", url: "#" }),
            withTags({ id: "autoridades", label: "Autoridades", url: "#" }),
            withTags({ id: "biblioteca", label: "Biblioteca", url: "#" }),
            withTags({ id: "consejo", label: "Consejo Académico", url: "#" }),
            withTags({ id: "cooperadora", label: "Cooperadora", url: "#" }),
            withTags({ id: "docentes", label: "Docentes", url: "#" }),
            withTags({ id: "estudiantes", label: "Nuestros Estudiantes", url: "#" }),
            withTags({ id: "pasantias", label: "Pasantías", url: "#" }),
            withTags({ id: "planimetria", label: "Planimetría", url: "#" })
          ],
        },
        ["institucional"]
      ),
      withTags(
        {
          id: "estudiantes",
          label: "Estudiantes",
          type: "dropdown",
          items: [
            withTags({ id: "convivencia", label: "Convivencia", url: "#" }),
            withTags({ id: "documentacion", label: "Documentación", url: "#" }),
            withTags({ id: "titulos", label: "Títulos", url: "#" })
          ],
        },
        ["estudiantes"]
      ),
      withTags(
        {
          id: "ciclo-2025",
          label: "Ciclo 2025",
          type: "dropdown",
          items: [
            withTags({ id: "horarios", label: "Horarios", url: "#" }),
            withTags({ id: "licencias", label: "Licencias docentes", url: "#" }),
            withTags({ id: "mesas", label: "Mesas de examen", url: "#" })
          ],
        },
        ["gestion"]
      ),
      withTags(
        {
          id: "talleres",
          label: "Talleres",
          type: "dropdown",
          items: [
            withTags({ id: "jovenes", label: "Jóvenes - Adultos", url: "#" }),
            withTags({ id: "infancias", label: "Infancias - Adolescentes", url: "#" })
          ],
        },
        ["talleres"]
      ),
    ],
    links: [
      withTags({ id: "faq", label: "Preguntas frecuentes", url: "#", highlight: false }, ["soporte", "info"]),
      withTags({ id: "campus", label: "CAMPUS", url: "#", highlight: true }, ["accesos", "plataforma"]),
    ],
  };

  const defaultCareers = {
    items: [
      { id: "diseno-grafico", name: "Diseño Gráfico", pdfUrl: "" },
      { id: "escenografia", name: "Escenografía", pdfUrl: "" },
      { id: "fotografia", name: "Fotografía", pdfUrl: "" },
      { id: "ilustracion", name: "Ilustración", pdfUrl: "" },
      { id: "medios-audiovisuales", name: "Medios Audiovisuales", pdfUrl: "" },
      { id: "profesorado", name: "Profesorado", pdfUrl: "" },
      { id: "realizador", name: "Realizador en AV", pdfUrl: "" },
    ],
  };

  const defaultFooter = {
    scrollIcon: "/malharrooficial/images/Icon_SubirFooter.svg",
    phrase: "Educación <br>pública con <br>identidad",
    charactersImage: "/malharrooficial/images/Personajes_Footer_Prueba.svg",
    campus: {
      label: "CAMPUS",
      url: "https://esavmamalharro-bue.infd.edu.ar/",
    },
    logos: [
      { id: "malharro", src: "/malharrooficial/images/Logo_Malharro.svg", alt: "Escuela de Artes Visuales Martín Malharro" },
      { id: "educacion-artistica", src: "/malharrooficial/images/Logo_Educ_Art.svg", alt: "Educación artística" },
      { id: "direccion-bsas", src: "/malharrooficial/images/Logo_Direcc_BsAs.svg", alt: "Dirección de Cultura" },
    ],
    quickLinks: [
      { id: "carreras", label: "Carreras", url: "#" },
      { id: "institucional", label: "Institucional", url: "#" },
      { id: "estudiantes", label: "Estudiantes", url: "#" },
      { id: "agenda", label: "Agenda", url: "#" },
      { id: "talleres", label: "Talleres", url: "#" },
      { id: "faq", label: "Preguntas frecuentes", url: "#" },
    ],
    address: "La Pampa 1619, Mar del Plata, Argentina. 7600",
    socials: [
      { id: "facebook", label: "Facebook", url: "https://www.facebook.com/avmalharro/", icon: "/malharrooficial/images/Icon_Facebook.svg" },
      { id: "instagram", label: "Instagram", url: "https://www.instagram.com/avmartinmalharro/?hl=es", icon: "/malharrooficial/images/Icon_Instagram.svg" },
      { id: "x", label: "X", url: "https://x.com/avmalharro", icon: "/malharrooficial/images/Icon_Twitter.svg" },
      { id: "youtube", label: "YouTube", url: "https://www.youtube.com/@AVMartinMalharroOK", icon: "/malharrooficial/images/Icon_YT.svg" },
    ],
    credits: "2025 © ESCUELA DE ARTES VISUALES MARTÍN A. MALHARRO | Sitio diseñado por alumn@s de la carrera de Diseño Gráfico 4ºA",
  };

  const textSeeds = [
    {
      slug: "home_60_heading",
      titulo: "60 años formando profesionales - Título",
      contenido: "60 años formando profesionales",
    },
    {
      slug: "home_60_body",
      titulo: "60 años formando profesionales - Texto",
      contenido:
        "<b>Brindamos a nuestros estudiantes una formación especializada que les permita insertarse en el mundo laboral con éxito.</b><br><br>La Escuela promueve el vínculo ofreciendo espacios de encuentro con <b>empresas referentes del sector</b>, charlas, talleres y eventos que permiten a los estudiantes generar <b>conexiones valiosas</b> para su desarrollo profesional.<br><br><b>“La Malharro”</b> sigue formando artistas y diseñadores listos para aportar su creatividad al mundo.",
    },
    {
      slug: "home_agenda_cta_label",
      titulo: "Agenda - Texto botón",
      contenido: "Ver agenda completa",
    },
    {
      slug: "home_students_title",
      titulo: "Nuestros estudiantes - Título",
      contenido: "Nuestros <br><b>estudiantes</b>",
    },
    {
      slug: "home_students_description",
      titulo: "Nuestros estudiantes - Descripción",
      contenido: "Descubrí los proyectos creados en nuestros talleres y aulas.",
    },
    {
      slug: "home_faq_title",
      titulo: "Preguntas frecuentes - Título",
      contenido: "Preguntas frecuentes",
    },
  ];

  const carouselSlides = [
    {
      imageUrl: "/malharrooficial/images/BANNER MUESTRA.png",
      imageDesktopUrl: "/malharrooficial/images/BANNER MUESTRA.png",
      imageMobileUrl: "/malharrooficial/images/BANNER MUESTRA.png",
      captionText: "Mostrá tu creatividad en la Malharro",
      position: 1,
    },
    {
      imageUrl: "/malharrooficial/images/BANNER MUESTRA.png",
      imageDesktopUrl: "/malharrooficial/images/BANNER MUESTRA.png",
      imageMobileUrl: "/malharrooficial/images/BANNER MUESTRA.png",
      captionText: "Formación pública con identidad",
      position: 2,
    },
    {
      imageUrl: "/malharrooficial/images/BANNER MUESTRA.png",
      imageDesktopUrl: "/malharrooficial/images/BANNER MUESTRA.png",
      imageMobileUrl: "/malharrooficial/images/BANNER MUESTRA.png",
      captionText: "Sumate a nuestra comunidad artística",
      position: 3,
    },
  ];

  const agendaEvents = [
    {
      titulo: "Taller de afiches",
      descripcion: "por Coco Cerella",
      fecha: "2025-10-24",
      imageUrl: "/malharrooficial/images/CHARLA FEED.png",
      tags: ["CHARLAS", "JORNADAS"],
    },
    {
      titulo: "Aviso importante",
      descripcion: "Reunión informativa de ingresantes",
      fecha: "2025-11-10",
      imageUrl: "/malharrooficial/images/AVISO uno.png",
      tags: ["INGRESANTES", "INFORMES"],
    },
    {
      titulo: "Encuentro creativo",
      descripcion: "Jam de ilustración y medios audiovisuales",
      fecha: "2025-12-02",
      imageUrl: "/malharrooficial/images/AVISO dos.png",
      tags: ["JORNADAS", "COMUNIDAD"],
    },
  ];

  const usinaPosts = [
    {
      titulo: "Historias que inspiran",
      texto: "Nuestros egresados comparten proyectos que transforman la comunidad.",
      imageUrl: "/malharrooficial/images/CHARLA FEED.png",
      tags: ["Historias", "Destacados"],
    },
    {
      titulo: "Proyectos interdisciplinarios",
      texto: "Diseño, ilustración y medios audiovisuales se unen para crear experiencias únicas.",
      imageUrl: "/malharrooficial/images/AVISO uno.png",
      tags: ["Proyectos", "Colaboraciones"],
    },
  ];

  const faqs = [
    {
      question: "¿Dónde queda la Malharro?",
      answer:
        "La Escuela se encuentra en la ciudad de Mar del Plata. Ubicada en la esquina de Luro y La Pampa, frente a la Terminal de micros.<br><br><iframe src=\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3144.449087550747!2d-57.56621552511716!3d-37.98998424412818!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9584d951f12bae1f%3A0x7b0eaea299a69b09!2sEscuela%20de%20Artes%20Visuales%20M.A%20Malharro!5e0!3m2!1ses-419!2sar!4v1756941987999!5m2!1ses-419!2sar\" width=\"600\" height=\"450\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>",
      position: 1,
      tags: ["Ubicación", "Ingreso"],
    },
    {
      question: "¿Se puede cursar más de una carrera a la vez?",
      answer:
        "Consultar con el equipo académico permite evaluar la carga horaria y compatibilidad de materias para cada caso en particular.",
      position: 2,
      tags: ["Académico", "Orientación"],
    },
    {
      question: "¿Cuándo comienzan las clases?",
      answer:
        "El ciclo lectivo suele comenzar en abril y se divide en dos cuatrimestres. El calendario académico se publica en el sitio web institucional y se informa a través de los canales oficiales.",
      position: 3,
      tags: ["Calendario", "Clases"],
    },
  ];

  return {
    defaultNavbar,
    defaultCareers,
    defaultFooter,
    textSeeds,
    carouselSlides,
    agendaEvents,
    usinaPosts,
    faqs,
  };
}

async function seedMemoryStore() {
  resetMemoryStore();
  const seeds = getSeedData();

  if (config.adminPassword) {
    const passwordHash = await bcrypt.hash(config.adminPassword, 12);
    memoryStore.users.push({
      id: nextMemoryId("users"),
      email: config.adminEmail,
      password_hash: passwordHash,
      role: "ADMIN",
    });
  }

  memoryStore.siteSections.set("navbar", seeds.defaultNavbar);
  memoryStore.siteSections.set("careers", seeds.defaultCareers);
  memoryStore.siteSections.set("footer", seeds.defaultFooter);

  for (const seed of seeds.textSeeds) {
    memoryStore.siteTexts.push({
      id: nextMemoryId("siteTexts"),
      slug: seed.slug,
      titulo: seed.titulo,
      contenido: seed.contenido,
    });
  }

  for (const slide of seeds.carouselSlides) {
    memoryStore.carouselSlides.push({
      id: nextMemoryId("carouselSlides"),
      image_url: slide.imageUrl,
      image_desktop_url: slide.imageDesktopUrl,
      image_mobile_url: slide.imageMobileUrl,
      caption_text: slide.captionText,
      position: slide.position,
    });
  }

  for (const event of seeds.agendaEvents) {
    memoryStore.agendaEvents.push({
      id: nextMemoryId("agendaEvents"),
      titulo: event.titulo,
      descripcion: event.descripcion,
      fecha: event.fecha,
      image_url: event.imageUrl,
      tags: [...event.tags],
    });
  }

  for (const post of seeds.usinaPosts) {
    memoryStore.usinaPosts.push({
      id: nextMemoryId("usinaPosts"),
      titulo: post.titulo,
      texto: post.texto,
      image_url: post.imageUrl,
      tags: [...post.tags],
    });
  }

  for (const faq of seeds.faqs) {
    memoryStore.faqs.push({
      id: nextMemoryId("faqs"),
      question: faq.question,
      answer: faq.answer,
      position: faq.position,
      tags: [...faq.tags],
    });
  }
}

async function runMigrations() {
  if (usingInMemory) {
    await seedMemoryStore();
    return;
  }

  await query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'ADMIN'
  );`);

  await query(`CREATE TABLE IF NOT EXISTS carousel_slides (
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    image_desktop_url TEXT DEFAULT '',
    image_mobile_url TEXT DEFAULT '',
    caption_text TEXT DEFAULT '',
    position INTEGER DEFAULT 0
  );`);

  await query(
    "ALTER TABLE carousel_slides ADD COLUMN IF NOT EXISTS image_desktop_url TEXT DEFAULT ''"
  );
  await query(
    "ALTER TABLE carousel_slides ADD COLUMN IF NOT EXISTS image_mobile_url TEXT DEFAULT ''"
  );

  await query(`CREATE TABLE IF NOT EXISTS agenda_events (
    id SERIAL PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion TEXT DEFAULT '',
    fecha DATE,
    image_url TEXT DEFAULT '',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[]
  );`);

  await query(`CREATE TABLE IF NOT EXISTS usina_posts (
    id SERIAL PRIMARY KEY,
    titulo TEXT NOT NULL,
    texto TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[]
  );`);

  await query(
    "ALTER TABLE usina_posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[]"
  );

  await query(`CREATE TABLE IF NOT EXISTS site_texts (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    titulo TEXT DEFAULT '',
    contenido TEXT DEFAULT ''
  );`);

  await query(`CREATE TABLE IF NOT EXISTS site_sections (
    section TEXT PRIMARY KEY,
    data JSONB NOT NULL
  );`);

  await query(`CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[]
  );`);

  await query(
    "ALTER TABLE faqs ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[]"
  );

  await query(`CREATE TABLE IF NOT EXISTS login_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
  );`);

  if (config.adminPassword) {
    const passwordHash = await bcrypt.hash(config.adminPassword, 12);
    await query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, 'ADMIN')
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'ADMIN';`,
      [config.adminEmail, passwordHash]
    );
  }

  const seeds = getSeedData();

  await query(
    `INSERT INTO site_sections (section, data)
     VALUES ('navbar', $1)
     ON CONFLICT (section) DO NOTHING;`,
    [seeds.defaultNavbar]
  );

  await query(
    `INSERT INTO site_sections (section, data)
     VALUES ('careers', $1)
     ON CONFLICT (section) DO NOTHING;`,
    [seeds.defaultCareers]
  );

  await query(
    `INSERT INTO site_sections (section, data)
     VALUES ('footer', $1)
     ON CONFLICT (section) DO NOTHING;`,
    [seeds.defaultFooter]
  );

  for (const seed of seeds.textSeeds) {
    await query(
      `INSERT INTO site_texts (slug, titulo, contenido)
       VALUES ($1, $2, $3)
       ON CONFLICT (slug) DO NOTHING;`,
      [seed.slug, seed.titulo, seed.contenido]
    );
  }

  const sliderCount = await query(`SELECT COUNT(*) AS count FROM carousel_slides`);
  if (Number(sliderCount.rows[0]?.count || 0) === 0) {
    for (const slide of seeds.carouselSlides) {
      await query(
        `INSERT INTO carousel_slides (image_url, image_desktop_url, image_mobile_url, caption_text, position)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          slide.imageUrl,
          slide.imageDesktopUrl,
          slide.imageMobileUrl,
          slide.captionText,
          slide.position,
        ]
      );
    }
  }

  const agendaCount = await query(`SELECT COUNT(*) AS count FROM agenda_events`);
  if (Number(agendaCount.rows[0]?.count || 0) === 0) {
    for (const event of seeds.agendaEvents) {
      await query(
        `INSERT INTO agenda_events (titulo, descripcion, fecha, image_url, tags)
         VALUES ($1, $2, $3, $4, $5)`,
        [event.titulo, event.descripcion, event.fecha, event.imageUrl, event.tags]
      );
    }
  }

  const usinaCount = await query(`SELECT COUNT(*) AS count FROM usina_posts`);
  if (Number(usinaCount.rows[0]?.count || 0) === 0) {
    for (const post of seeds.usinaPosts) {
      await query(
        `INSERT INTO usina_posts (titulo, texto, image_url, tags)
         VALUES ($1, $2, $3, $4)`,
        [post.titulo, post.texto, post.imageUrl, post.tags]
      );
    }
  }

  const faqCount = await query(`SELECT COUNT(*) AS count FROM faqs`);
  if (Number(faqCount.rows[0]?.count || 0) === 0) {
    for (const faq of seeds.faqs) {
      await query(
        `INSERT INTO faqs (question, answer, position, tags)
         VALUES ($1, $2, $3, $4)`,
        [faq.question, faq.answer, faq.position, faq.tags]
      );
    }
  }

  await query(`DELETE FROM site_texts WHERE slug = 'home_agenda_cta_url'`);
}

export async function initializeDatabase() {
  try {
    await runMigrations();
  } catch (error) {
    if (!usingInMemory && isConnectionError(error)) {
      console.warn(
        "Could not connect to the configured PostgreSQL database. Falling back to an in-memory database."
      );
      usingInMemory = true;
      if (pool && typeof pool.end === "function") {
        try {
          await pool.end();
        } catch (endError) {
          console.warn("Failed to close PostgreSQL pool during fallback", endError);
        }
      }
      pool = null;
      await runMigrations();
    } else {
      console.error("Failed to initialize database", error);
      throw error;
    }
  }
}

export function isUsingInMemoryDatabase() {
  return usingInMemory;
}

export function getMemoryStore() {
  return memoryStore;
}

export function allocateMemoryId(table) {
  return nextMemoryId(table);
}

export default pool;
