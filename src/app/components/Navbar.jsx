"use client";

import { useEffect, useState } from "react";
import { API_URL } from "../config";
import Buscador from './Buscador';

const NAVBAR_SECTION = "navbar";

const withAssetBase = (path) => {
  if (!path) return "";
  if (/^https?:/i.test(path)) return path;
  const base = (API_URL || "").replace(/\/$/, "");
  return `${base}${path}`;
};

const CAREER_LINK_IDS = new Set([
  "carreras",
  "diseno-grafico",
  "escenografia",
  "fotografia",
  "ilustracion",
  "medios-audiovisuales",
  "profesorado",
  "realizador",
]);

const resolveUrl = (entry) => {
  if (!entry) return "#";
  if (CAREER_LINK_IDS.has(entry.id)) {
    return "/carreras";
  }
  const url = entry.url;
  if (entry.id === "agenda" && (!url || url === "#")) {
    return "/agenda";
  }
  if (entry.id === "faq" && (!url || url === "#")) {
    return "/#preguntasfrecuentes";
  }
  if (entry.id === "campus" && (!url || url === "#")) {
    return "https://esavmamalharro-bue.infd.edu.ar/aula/acceso.cgi";
  }
  if (!url) return "#";
  return url;
};

export default function Navbar() {
  const [navbar, setNavbar] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    import("../../../malharrooficial/js/bootstrap.bundle.min.js").catch(() => {});
  }, []);

  useEffect(() => {
    async function fetchNavbar() {
      try {
        const response = await fetch(`${API_URL}/api/sections/${NAVBAR_SECTION}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("No se pudo cargar la navegación");
        }
        const { data } = await response.json();
        setNavbar(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la navegación");
      }
    }

    fetchNavbar();
  }, []);

  if (error) {
    return (
      <div className="responsive">
      <nav className="navbar navbar-expand-lg navbar-dark z-index-1000 p-3">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <span className="text-white">{error}</span>
        </div>
      </nav>
      </div>
    );
  }

  if (!navbar) {
    return null;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark z-index-1000 p-3">
      <div className="container-fluid d-flex justify-content-between align-items-center">
       <Buscador navbar={navbar} withAssetBase={withAssetBase} />

        <button
          className="navbar-toggler collapsed p-2"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">
          <div className="menu-box-lg d-flex flex-column px-3 py-2 rounded">
            <button
              className="btn-close-menu d-lg-none"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-label="Cerrar menú"
            >
              <img src={withAssetBase("/malharrooficial/images/Icon_X_Blanca.svg")} alt="Cerrar menú" />
            </button>

            <ul className="navbar-nav mt-4">
              {navbar.menu?.map((item) => (
                <li key={item.id} className={`nav-item ${item.type === "dropdown" ? "dropdown" : ""}`}>
                  {item.type === "dropdown" ? (
                    <>
                      <a
                        className="nav-link dropdown-toggle texitem"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        {item.label}
                      </a>
                      <ul className="dropdown-menu">
                        {item.items?.map((option) => (
                          <li key={option.id}>
                            <a className="dropdown-item" href={resolveUrl(option)}>
                              {option.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <a className="nav-link" href={resolveUrl(item)}>
                      {item.label}
                    </a>
                  )}
                </li>
              ))}

              {navbar.links?.map((link) => (
                <li key={link.id} className="nav-item list">
                  <a className={`nav-link ${link.highlight ? "navtext" : ""}`} href={resolveUrl(link)}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}