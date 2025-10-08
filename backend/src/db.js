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
    caption_text TEXT DEFAULT '',
    position INTEGER DEFAULT 0
  );`);

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
    image_url TEXT DEFAULT ''
  );`);

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

  const defaultNavbar = {
    logoUrl: "/malharrooficial/images/Iso_Malharro.svg",
    searchIconUrl: "/malharrooficial/images/Icon_Lupa.svg",
    campusUrl: "#",
    menu: [
      {
        id: "carreras",
        label: "Carreras",
        type: "dropdown",
        items: [
          { id: "diseno-grafico", label: "Diseño Gráfico", url: "disenografico.html" },
          { id: "escenografia", label: "Escenografía", url: "escenografia.html" },
          { id: "fotografia", label: "Fotografía", url: "fotografia.html" },
          { id: "ilustracion", label: "Ilustración", url: "ilustracion.html" },
          { id: "medios-audiovisuales", label: "Medios Audiovisuales", url: "mediosav.html" },
          { id: "profesorado", label: "Profesorado", url: "profesorado.html" },
          { id: "realizador", label: "Realizador", url: "realizador.html" }
        ]
      },
      {
        id: "institucional",
        label: "Institucional",
        type: "dropdown",
        items: [
          { id: "acerca", label: "Acerca de Malharro", url: "#" },
          { id: "autoridades", label: "Autoridades", url: "#" },
          { id: "biblioteca", label: "Biblioteca", url: "#" },
          { id: "consejo", label: "Consejo Académico", url: "#" },
          { id: "cooperadora", label: "Cooperadora", url: "#" },
          { id: "docentes", label: "Docentes", url: "#" },
          { id: "estudiantes", label: "Nuestros Estudiantes", url: "#" },
          { id: "pasantias", label: "Pasantías", url: "#" },
          { id: "planimetria", label: "Planimetría", url: "#" }
        ]
      },
      {
        id: "estudiantes",
        label: "Estudiantes",
        type: "dropdown",
        items: [
          { id: "convivencia", label: "Convivencia", url: "#" },
          { id: "documentacion", label: "Documentación", url: "#" },
          { id: "titulos", label: "Títulos", url: "#" }
        ]
      },
      {
        id: "ciclo-2025",
        label: "Ciclo 2025",
        type: "dropdown",
        items: [
          { id: "horarios", label: "Horarios", url: "#" },
          { id: "licencias", label: "Licencias docentes", url: "#" },
          { id: "mesas", label: "Mesas de examen", url: "#" }
        ]
      },
      {
        id: "talleres",
        label: "Talleres",
        type: "dropdown",
        items: [
          { id: "jovenes", label: "Jóvenes - Adultos", url: "#" },
          { id: "infancias", label: "Infancias - Adolescentes", url: "#" }
        ]
      }
    ],
    links: [
      { id: "faq", label: "Preguntas frecuentes", url: "#", highlight: false },
      { id: "campus", label: "CAMPUS", url: "#", highlight: true }
    ]
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
     VALUES ('footer', $1)
     ON CONFLICT (section) DO NOTHING;`,
    [defaultFooter]
  );

  const sliderCount = await query(`SELECT COUNT(*) AS count FROM carousel_slides`);
  if (Number(sliderCount.rows[0]?.count || 0) === 0) {
    await query(
      `INSERT INTO carousel_slides (image_url, caption_text, position) VALUES
        ('/malharrooficial/images/BANNER MUESTRA.png', 'Mostrá tu creatividad en la Malharro', 1),
        ('/malharrooficial/images/BANNER MUESTRA.png', 'Formación pública con identidad', 2),
        ('/malharrooficial/images/BANNER MUESTRA.png', 'Sumate a nuestra comunidad artística', 3)`
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
      `INSERT INTO usina_posts (titulo, texto, image_url) VALUES
        ('Historias que inspiran', 'Nuestros egresados comparten proyectos que transforman la comunidad.', '/malharrooficial/images/CHARLA FEED.png'),
        ('Proyectos interdisciplinarios', 'Diseño, ilustración y medios audiovisuales se unen para crear experiencias únicas.', '/malharrooficial/images/AVISO uno.png')`
    );
  }
}

export default pool;
