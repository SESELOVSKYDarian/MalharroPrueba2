"use client";

import { useEffect, useState } from "react";
import { API_URL } from "../config";

const FOOTER_SECTION = "footer";

const asset = (path) => {
  if (!path) return "";
  if (/^https?:/i.test(path)) return path;
  const base = (API_URL || "").replace(/\/$/, "");
  return `${base}${path}`;
};

export default function Footer() {
  const [footer, setFooter] = useState(null);

  useEffect(() => {
    async function fetchFooter() {
      try {
        const response = await fetch(`${API_URL}/api/sections/${FOOTER_SECTION}`, { cache: "no-store" });
        if (!response.ok) throw new Error("No se pudo cargar el pie de página");
        const { data } = await response.json();
        setFooter(data);
      } catch (error) {
        console.error(error);
        setFooter(null);
      }
    }

    fetchFooter();
  }, []);

  if (!footer) {
    return null;
  }

  return (
    <footer className="footer-malharro">
      <div className="footer-forma-curva">
        <svg viewBox="0 0 360 150" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0C73 0 146 10 214 30C267 47 316 69 360 95V150H0V0Z" fill="#1B1B1B" />
        </svg>
      </div>

      <div className="container-fluid">
        <div className="contenido-footer">
          <div className="row align-items-start">
            <div className="footer-scroll text-end mb-3">
              <a href="#top" className="footer-scroll-btn" aria-label="Ir arriba">
                <img src={asset(footer.scrollIcon)} alt="Subir" />
              </a>
            </div>

            <div className="col-12 d-md-none text-left">
              <p className="footer-frase h1-titulor" dangerouslySetInnerHTML={{ __html: footer.phrase }}></p>
              <div>
                <img src={asset(footer.charactersImage)} alt="Decoración" className="img-fluid" />
              </div>
              <div className="logo-campus d-flex align-items-center gap-3">
                <div>
                  <img src={asset(footer.logos?.[0]?.src)} alt={footer.logos?.[0]?.alt || "Logo Malharro"} className="footer-campus-logo img-fluid" />
                </div>
                <div className="footer-campus">
                  <a href={footer.campus?.url || "#"} className="footer-campus-link" target="_blank" rel="noreferrer">
                    {footer.campus?.label}
                  </a>
                </div>
              </div>
            </div>

            <div className="col-md-6 d-none d-md-flex align-items-center gap-3">
              <img src={asset(footer.charactersImage)} alt="" className="img-fluid" style={{ maxHeight: "100px" }} />
              <p className="footer-frase m-0" dangerouslySetInnerHTML={{ __html: footer.phrase }}></p>
            </div>

            <div className="col-md-6 d-none d-md-block text-start">
              <div className="footer-campus mb-3">
                <a href={footer.campus?.url || "#"} className="footer-campus-link" target="_blank" rel="noreferrer">
                  {footer.campus?.label}
                </a>
              </div>
              <div>
                <img src={asset(footer.logos?.[0]?.src)} alt={footer.logos?.[0]?.alt || "Logo Malharro"} className="footer-campus-logo img-fluid" />
              </div>
              <div className="footer-social">
                {footer.socials?.map((social) => (
                  <a key={social.id} href={social.url} target="_blank" rel="noreferrer" aria-label={social.label}>
                    <img src={asset(social.icon)} alt={social.label} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="row g-2 footer-links justify-content-left">
                {footer.quickLinks?.map((link) => (
                  <div key={link.id} className="col-auto">
                    <a href={link.url || "#"} className="footer-link">
                      {link.label}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12 text-left">
              <p className="footer-direccion">{footer.address}</p>
            </div>
          </div>

          <div className="footer-social d-md-none">
            {footer.socials?.map((social) => (
              <a key={`mobile-${social.id}`} href={social.url} target="_blank" rel="noreferrer" aria-label={social.label}>
                <img src={asset(social.icon)} alt={social.label} />
              </a>
            ))}
          </div>

          <div className="footer-logos">
            <div className="container-fluid">
              <div className="row justify-content-center align-items-center">
                {footer.logos?.slice(1).map((logo) => (
                  <div key={logo.id} className="col-auto">
                    <img src={asset(logo.src)} alt={logo.alt} className="footer-logo img-fluid" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12 text-left">
              <p className="footer-creditos">{footer.credits}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
