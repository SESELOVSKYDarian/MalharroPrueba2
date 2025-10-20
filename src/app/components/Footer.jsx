"use client";

import { useEffect, useState } from "react";

// 🔹 Importa todas las imágenes
import IconSubir from "../../../malharrooficial/images/Icon_SubirFooter.svg";
import PersonajeDisenador from "../../../malharrooficial/images/Personaje_DisenoGrafico_C.svg";
import LogoMalharro from "../../../malharrooficial/images/Logo_Malharro.svg";
import IconFacebook from "../../../malharrooficial/images/Icon_Facebook.svg";
import IconInstagram from "../../../malharrooficial/images/Icon_Instagram.svg";
import IconX from "../../../malharrooficial/images/Icon_X_Blanca.svg";
import IconYoutube from "../../../malharrooficial/images/Icon_YT.svg";
import LogoEducArt from "../../../malharrooficial/images/Logo_Educ_Art.svg";
import LogoBsAs from "../../../malharrooficial/images/Logo_Direcc_BsAs.svg";

// 🔹 Imágenes aleatorias
import Profesorado from "../../../malharrooficial/images/profesorado 100_.svg";
import Realizador from "../../../malharrooficial/images/realizador 30.svg";
import PersonajeMedios from "../../../malharrooficial/images/Personaje_MediosA.svg";
import Ilustracion from "../../../malharrooficial/images/Ilustracion 30_.svg";
import Foto from "../../../malharrooficial/images/foto 100_.svg";
import Escenografia from "../../../malharrooficial/images/pj_escenografia.png";

export default function Footer() {
  const [randomImages, setRandomImages] = useState([]);

  useEffect(() => {
    const imagenes = [
      Profesorado,
      Realizador,
      PersonajeMedios,
      Ilustracion,
      Foto,
      Escenografia,
      PersonajeDisenador,
    ];

    const seleccionadas = [...imagenes]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    setRandomImages(seleccionadas);
  }, []);

  return (
    <footer className="footer-malharro">
      <div className="footer-forma-curva">
        <svg
          viewBox="0 0 360 150"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 0C73 0 146 10 214 30C267 47 316 69 360 95V150H0V0Z"
            fill="#1B1B1B"
          />
        </svg>
      </div>

      <div className="container-fluid">
        <div className="contenido-footer">
          <div className="row align-items-start">
            <div className="footer-scroll text-end mb-3">
              <a href="#top" className="footer-scroll-btn" aria-label="Ir arriba">
                <img src={IconSubir.src} alt="Subir" />
              </a>
            </div>

            <div className="col-12 d-md-none text-left">
              <p className="footer-frase h1-titulor">
                Educación <br /> pública con <br /> identidad
              </p>
              <div>
                <img
                  src={PersonajeDisenador.src}
                  alt="Decoración"
                  className="img-fluid"
                />
              </div>

              <div className="logo-campus d-flex align-items-center gap-3">
                <div>
                  <img
                    src={LogoMalharro.src}
                    alt="Logo Malharro"
                    className="footer-campus-logo img-fluid"
                  />
                </div>
                <div className="footer-campus">
                  <a
                    href="https://esavmamalharro-bue.infd.edu.ar/"
                    className="footer-campus-link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    CAMPUS
                  </a>
                </div>
              </div>
            </div>

            <div className="col-md-6 d-none d-md-flex align-items-center gap-3">
              <div className="imagenes-aleatorias d-flex gap-2">
                {randomImages.map((src, i) => (
                  <img
                    key={i}
                    src={src.src}
                    alt={`Decoración ${i}`}
                    className="img-fluid"
                    style={{
                      height: "100px",
                      width: "auto",
                      borderRadius: "10px",
                    }}
                  />
                ))}
              </div>
              <p className="footer-frase m-0 text-left">
                Educación <br /> pública con <br /> identidad
              </p>
            </div>

            <div className="col-md-6 d-none d-md-block text-start">
              <div className="footer-campus mb-3">
                <a
                  href="https://esavmamalharro-bue.infd.edu.ar/"
                  className="footer-campus-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  CAMPUS
                </a>
              </div>
              <div>
                <img
                  src={LogoMalharro.src}
                  alt="Logo Malharro"
                  className="footer-campus-logo img-fluid"
                />
              </div>
              <div className="footer-social">
                <a
                  href="https://www.facebook.com/avmalharro/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={IconFacebook.src} alt="Facebook" />
                </a>
                <a
                  href="https://www.instagram.com/avmartinmalharro/?hl=es"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={IconInstagram.src} alt="Instagram" />
                </a>
                <a
                  href="https://x.com/avmalharro"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={IconX.src} alt="X" />
                </a>
                <a
                  href="https://www.youtube.com/@AVMartinMalharroOK"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={IconYoutube.src} alt="YouTube" />
                </a>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="row g-2 footer-links justify-content-left">
                {[
                  "Carreras",
                  "Institucional",
                  "Estudiantes",
                  "Agenda",
                  "Talleres",
                  "Preguntas frecuentes",
                ].map((label, i) => (
                  <div key={i} className="col-auto">
                    <a href="#" className="footer-link">
                      {label}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12 text-left">
              <p className="footer-direccion">
                La Pampa 1619, Mar del Plata, Argentina. 7600
              </p>
            </div>
          </div>

          <div className="footer-logos">
            <div className="container-fluid">
              <div className="row justify-content-center align-items-center">
                <div className="col-auto">
                  <img
                    src={LogoEducArt.src}
                    alt="Logo Educación Artística"
                    className="footer-logo img-fluid"
                  />
                </div>
                <div className="col-auto">
                  <img
                    src={LogoBsAs.src}
                    alt="Logo Dirección Cultura"
                    className="footer-logo img-fluid"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12 text-left">
              <p className="footer-creditos">
                2025 © ESCUELA DE ARTES VISUALES MARTÍN A. MALHARRO <br />
                Sitio diseñado por alumn@s de Diseño Gráfico 4ºA <br />
                Desarrollado por los alumn@s de la Técnica N°5 — Informática:
                Banegas Agustina, Salvia Malena, Vallejos Alexis, Cecchini
                Mateo, Seselovsky Darian, Willers Sara, Megnini Tiziano
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
