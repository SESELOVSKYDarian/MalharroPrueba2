import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { config } from "./config.js";

const pool = new Pool({
  connectionString: config.postgres.connectionString,
  host: config.postgres.host,
  port: config.postgres.port,
  database: config.postgres.database,
  user: config.postgres.user,
  password: config.postgres.password,
  ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : undefined,
});

export async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export async function initializeDatabase() {
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

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, 'ADMIN')
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'ADMIN';`,
      [config.adminEmail, passwordHash]
    );
  }

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
      { id: "realizador", name: "Realizador en AV", pdfUrl: "" }
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
      { id: "direccion-bsas", src: "/malharrooficial/images/Logo_Direcc_BsAs.svg", alt: "Dirección de Cultura" }
    ],
    quickLinks: [
      { id: "carreras", label: "Carreras", url: "#" },
      { id: "institucional", label: "Institucional", url: "#" },
      { id: "estudiantes", label: "Estudiantes", url: "#" },
      { id: "agenda", label: "Agenda", url: "#" },
      { id: "talleres", label: "Talleres", url: "#" },
      { id: "faq", label: "Preguntas frecuentes", url: "#" }
    ],
    address: "La Pampa 1619, Mar del Plata, Argentina. 7600",
    socials: [
      { id: "facebook", label: "Facebook", url: "https://www.facebook.com/avmalharro/", icon: "/malharrooficial/images/Icon_Facebook.svg" },
      { id: "instagram", label: "Instagram", url: "https://www.instagram.com/avmartinmalharro/?hl=es", icon: "/malharrooficial/images/Icon_Instagram.svg" },
      { id: "x", label: "X", url: "https://x.com/avmalharro", icon: "/malharrooficial/images/Icon_Twitter.svg" },
      { id: "youtube", label: "YouTube", url: "https://www.youtube.com/@AVMartinMalharroOK", icon: "/malharrooficial/images/Icon_YT.svg" }
    ],
    credits: "2025 © ESCUELA DE ARTES VISUALES MARTÍN A. MALHARRO | Sitio diseñado por alumn@s de la carrera de Diseño Gráfico 4ºA"
  };

  await query(
    `INSERT INTO site_sections (section, data)
     VALUES ('navbar', $1)
     ON CONFLICT (section) DO NOTHING;`,
    [defaultNavbar]
  );

  await query(
    `INSERT INTO site_sections (section, data)
     VALUES ('careers', $1)
     ON CONFLICT (section) DO NOTHING;`,
    [defaultCareers]
  );

  await query(
    `INSERT INTO site_sections (section, data)
     VALUES ('footer', $1)
     ON CONFLICT (section) DO NOTHING;`,
    [defaultFooter]
  );

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

  for (const seed of textSeeds) {
    // Sequential inserts ensure deterministic ordering for seeds.
    await query(
      `INSERT INTO site_texts (slug, titulo, contenido)
       VALUES ($1, $2, $3)
       ON CONFLICT (slug) DO NOTHING;`,
      [seed.slug, seed.titulo, seed.contenido]
    );
  }

  const sliderCount = await query(`SELECT COUNT(*) AS count FROM carousel_slides`);
  if (Number(sliderCount.rows[0]?.count || 0) === 0) {
    await query(
      `INSERT INTO carousel_slides (image_url, image_desktop_url, image_mobile_url, caption_text, position) VALUES
        ('/malharrooficial/images/BANNER MUESTRA.png', '/malharrooficial/images/BANNER MUESTRA.png', '/malharrooficial/images/BANNER MUESTRA.png', 'Mostrá tu creatividad en la Malharro', 1),
        ('/malharrooficial/images/BANNER MUESTRA.png', '/malharrooficial/images/BANNER MUESTRA.png', '/malharrooficial/images/BANNER MUESTRA.png', 'Formación pública con identidad', 2),
        ('/malharrooficial/images/BANNER MUESTRA.png', '/malharrooficial/images/BANNER MUESTRA.png', '/malharrooficial/images/BANNER MUESTRA.png', 'Sumate a nuestra comunidad artística', 3)`
    );
  }

  const agendaCount = await query(`SELECT COUNT(*) AS count FROM agenda_events`);
  if (Number(agendaCount.rows[0]?.count || 0) === 0) {
    await query(
      `INSERT INTO agenda_events (titulo, descripcion, fecha, image_url, tags) VALUES
        ('Taller de afiches', 'por Coco Cerella', '2025-10-24', '/malharrooficial/images/CHARLA FEED.png', ARRAY['CHARLAS','JORNADAS']),
        ('Aviso importante', 'Reunión informativa de ingresantes', '2025-11-10', '/malharrooficial/images/AVISO uno.png', ARRAY['INGRESANTES','INFORMES']),
        ('Encuentro creativo', 'Jam de ilustración y medios audiovisuales', '2025-12-02', '/malharrooficial/images/AVISO dos.png', ARRAY['JORNADAS','COMUNIDAD'])`
    );
  }

  const usinaCount = await query(`SELECT COUNT(*) AS count FROM usina_posts`);
  if (Number(usinaCount.rows[0]?.count || 0) === 0) {
    await query(
      `INSERT INTO usina_posts (titulo, texto, image_url, tags) VALUES
        ('Historias que inspiran', 'Nuestros egresados comparten proyectos que transforman la comunidad.', '/malharrooficial/images/CHARLA FEED.png', ARRAY['Historias','Destacados']),
        ('Proyectos interdisciplinarios', 'Diseño, ilustración y medios audiovisuales se unen para crear experiencias únicas.', '/malharrooficial/images/AVISO uno.png', ARRAY['Proyectos','Colaboraciones'])`
    );
  }

  const faqCount = await query(`SELECT COUNT(*) AS count FROM faqs`);
  if (Number(faqCount.rows[0]?.count || 0) === 0) {
    await query(
      `INSERT INTO faqs (question, answer, position, tags) VALUES
        ('¿Dónde queda la Malharro?', 'La Escuela se encuentra en la ciudad de Mar del Plata. Ubicada en la esquina de Luro y La Pampa, frente a la Terminal de micros.<br><br><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3144.449087550747!2d-57.56621552511716!3d-37.98998424412818!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9584d951f12bae1f%3A0x7b0eaea299a69b09!2sEscuela%20de%20Artes%20Visuales%20M.A%20Malharro!5e0!3m2!1ses-419!2sar!4v1756941987999!5m2!1ses-419!2sar" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>', 1, ARRAY['Ubicación','Ingreso']),
        ('¿Se puede cursar más de una carrera a la vez?', 'Consultar con el equipo académico permite evaluar la carga horaria y compatibilidad de materias para cada caso en particular.', 2, ARRAY['Académico','Orientación']),
        ('¿Cuándo comienzan las clases?', 'El ciclo lectivo suele comenzar en abril y se divide en dos cuatrimestres. El calendario académico se publica en el sitio web institucional y se informa a través de los canales oficiales.', 3, ARRAY['Calendario','Clases'])
      `
    );
  }

  await query(`DELETE FROM site_texts WHERE slug = 'home_agenda_cta_url'`);
}

export default pool;
