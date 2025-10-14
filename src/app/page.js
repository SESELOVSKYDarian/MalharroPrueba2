import Navbar from "./components/Navbar";
import Carousel from "./components/Carousel";
import Agenda from "./components/Agenda";
import Usina from "./components/Usina";
import Faqs from "./components/Faqs";
import Footer from "./components/Footer";

export const dynamic = "force-dynamic";

const asset = (path) => {
  if (!path) return "";
  if (/^https?:/i.test(path)) return path;
  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  return `${base}${path}`;
};

const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

async function fetchSiteText(slug) {
  try {
    const response = await fetch(`${apiBase}/api/texts/${slug}`, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function fetchCareers() {
  try {
    const response = await fetch(`${apiBase}/api/sections/careers`, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

const defaultCareerVisuals = [
  {
    id: "diseno-grafico",
    name: "Diseño Gráfico",
    accent: "dg",
    decoration: "/malharrooficial/images/Personaje_DisenoGrafico_C.svg",
  },
  {
    id: "escenografia",
    name: "Escenografía",
    accent: "es",
    decoration: "/malharrooficial/images/Personaje_DisenoGrafico_C.svg",
  },
  {
    id: "fotografia",
    name: "Fotografía",
    accent: "fo",
    decoration: "/malharrooficial/images/Personaje_Fotografia_C.svg",
  },
  {
    id: "ilustracion",
    name: "Ilustración",
    accent: "il",
    decoration: "/malharrooficial/images/Personaje_Ilustracion_C.svg",
  },
  {
    id: "medios-audiovisuales",
    name: "Medios Audiovisuales",
    accent: "ma",
    decoration: "/malharrooficial/images/Personaje_MediosA_C.svg",
  },
  {
    id: "profesorado",
    name: "Profesorado",
    accent: "pr",
    decoration: "/malharrooficial/images/Personaje_Profesorado_C.svg",
  },
  {
    id: "realizador",
    name: "Realizador en AV",
    accent: "re",
    decoration: "/malharrooficial/images/Personaje_Realizador_C.svg",
  },
];

const defaultCareerAccentOrder = ["dg", "es", "fo", "il", "ma", "pr", "re"];
const defaultCareerDecoration = "/malharrooficial/images/Personaje_DisenoGrafico_C.svg";

export default async function Page() {
  const [sixtyHeadingData, sixtyBodyData, careersData] = await Promise.all([
    fetchSiteText("home_60_heading"),
    fetchSiteText("home_60_body"),
    fetchCareers(),
  ]);

  const sixtyHeading = sixtyHeadingData?.contenido || sixtyHeadingData?.titulo || "60 años formando profesionales";
  const sixtyBody = sixtyBodyData?.contenido || sixtyBodyData?.titulo || "";

  const rawCareers = Array.isArray(careersData?.data?.items) ? careersData.data.items : [];
  const baseCareers = rawCareers.length ? rawCareers : defaultCareerVisuals;
  const careers = baseCareers.map((career, index) => {
    const preset =
      defaultCareerVisuals.find((item) => item.id === career.id) || defaultCareerVisuals[index] || defaultCareerVisuals[0];
    const accent = career.accent || preset?.accent || defaultCareerAccentOrder[index % defaultCareerAccentOrder.length];
    const decoration = career.decoration || preset?.decoration || defaultCareerDecoration;
    return {
      ...preset,
      ...career,
      accent,
      decoration,
    };
  });

  return (
    <div className="malharro-home">
      <div id="top"></div>
      <Navbar />

      <main>
        <section className="banner-section">
          <Carousel />
        </section>

        <section className="container espaciado-vertical">
          <div className="row botones-grid">
            <div className="botones-uno col-12 justify-content-center col-lg-4 gx-lg-0">
              <a href="#carreras" className="btn-bloque btn-carreras">
                Carreras
              </a>
              <a href="https://esavmamalharro-bue.infd.edu.ar/aula/acceso.cgi" className="btn-bloque btn-campus" target="_blank" rel="noreferrer">
                Campus
              </a>
            </div>
            <div className="botones-uno col-12 justify-content-center col-lg-4">
              <a href="#agenda" className="btn-bloque btn-agenda">
                Agenda
              </a>
              <a href="#estudiantes" className="btn-bloque btn-estudiantes">
                Estudiantes
              </a>
            </div>
            <div className="botones-uno col-12 justify-content-center col-lg-4 gx-lg-0">
              <a href="#institucional" className="btn-bloque btn-institucional">
                Institucional
              </a>
              <a href="#talleres" className="btn-bloque btn-talleres">
                Talleres
              </a>
            </div>
          </div>
        </section>

        <section className="container-fluid espaciado-vertical" id="acerca">
          <div className="row">
            <div className="col-md-1" aria-hidden="true"></div>
            <div className="nosotros tituloacercanostrs col-12 col-md-5">
              <h1 className="h1-titulor">Acerca de</h1>
              <h1 className="h1-titulob"> nosotros</h1>
            </div>
            <div className="nosotros textoacercanostrs col-12 col-md-5">
              <p className="p1-r">
                Somos una <strong>institución pública en Mar del Plata</strong> comprometida con la formación académica y profesional en el ámbito de las artes visuales. Fomentamos la <strong>creatividad</strong>, el <strong>pensamiento crítico</strong> y la <strong>innovación</strong>, contribuyendo al enriquecimiento cultural y social de nuestra comunidad.
              </p>
              <div className="d-flex justify-content-start">
                <a href="#carreras" className="btn btn-sabermas">
                  Saber más
                </a>
              </div>
            </div>
            <div className="col-md-1" aria-hidden="true"></div>
          </div>
        </section>

        <section className="contenedor-negro">
          <div className="container-fluid my-4 px-0" id="carreras">
            <div className="row gx-0">
              <div className="carrerastitulo">
                <h1 className="h1-titulor"> Nuestras</h1>
                <h1 className="h1-titulob"> Carreras</h1>
              </div>
              <div className="col-12 px-0">
                <div className="accordion" id="accordionCarreras">
                  {careers.map((career, index) => {
                    const slug = (career.id || career.name || `career-${index}`)
                      .toString()
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, "");
                    const collapseId = `collapse-${slug || index}`;
                    const headingId = `heading-${slug || index}`;
                    const accent = career.accent || defaultCareerAccentOrder[index % defaultCareerAccentOrder.length] || "dg";
                    const pdfUrl = career.pdfUrl ? asset(career.pdfUrl) : "";
                    const hasPdf = Boolean(pdfUrl);
                    return (
                      <div key={career.id || slug || index} className={`accordion-item custom-accordion-item ${accent}`}>
                        <h2 className="accordion-header" id={headingId}>
                          <button
                            className="accordion-button custom-accordion-btn collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#${collapseId}`}
                            aria-expanded="false"
                            aria-controls={collapseId}
                          >
                            <span>{career.name || career.title || "Carrera"}</span>
                            <img src={asset("/malharrooficial/images/Icon_DesplegarMenu.svg")} className="accordion-icon" alt="Icono desplegar" />
                          </button>
                        </h2>
                        <div id={collapseId} className="accordion-collapse collapse" aria-labelledby={headingId} data-bs-parent="#accordionCarreras">
                          <div className="accordion-body custom-accordion-body">
                            <p className="mb-4">
                              Información detallada disponible próximamente.
                            </p>
                            <a
                              href={hasPdf ? pdfUrl : undefined}
                              className={`btn btn-sabermas-${accent}`}
                              target={hasPdf ? "_blank" : undefined}
                              rel={hasPdf ? "noreferrer" : undefined}
                              aria-disabled={hasPdf ? undefined : true}
                            >
                              Saber más
                            </a>
                            <img src={asset(career.decoration)} className="decorativo" alt="" aria-hidden="true" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <section id="agenda">
            <Agenda />
          </section>
        </section>

        <section className="container-fluid espaciado-vertical" id="formando-profesionales">
          <div className="row">
            <div className="col-md-1" aria-hidden="true"></div>
            <div className="titulo-prof col-12 col-md-5">
              <h1 dangerouslySetInnerHTML={{ __html: sixtyHeading }} />
            </div>
            <div className="texto-prof col-12 col-md-5">
              <p dangerouslySetInnerHTML={{ __html: sixtyBody }} />
            </div>
            <div className="col-md-1" aria-hidden="true"></div>
          </div>
        </section>

        <Usina />

        <Faqs />
      </main>

      <Footer />
    </div>
  );
}
