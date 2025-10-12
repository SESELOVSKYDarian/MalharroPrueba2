"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "../config";

const NAVBAR_SECTION = "navbar";

const withAssetBase = (path) => {
  if (!path) return "";
  if (/^https?:/i.test(path)) return path;
  const base = (API_URL || "").replace(/\/$/, "");
  return `${base}${path}`;
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
      <nav className="navbar navbar-expand-lg navbar-dark z-index-1000 p-3">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <span className="text-white">{error}</span>
        </div>
      </nav>
    );
  }

  if (!navbar) {
    return null;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark z-index-1000 p-3">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <div className="logo-lupa-box">
          <div className="d-flex align-items-center bg-highlight p-2 rounded">
            <Link href="/" className="navbar-brand botonlogo" aria-label="Ir a inicio">
              {navbar.logoUrl ? (
                <img src={withAssetBase(navbar.logoUrl)} alt="Isotipo Malharro" className="logo-nav" />
              ) : (
                <span className="fw-bold text-white">Malharro</span>
              )}
            </Link>
            {navbar.searchIconUrl && (
              <a className="ms-2" role="button" data-bs-toggle="modal" data-bs-target="#searchModal" aria-label="Buscar">
                <img src={withAssetBase(navbar.searchIconUrl)} alt="Buscar" className="lupa-nav" />
              </a>
            )}
          </div>
        </div>

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
                            <a className="dropdown-item" href={option.url || "#"}>
                              {option.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <a className="nav-link" href={item.url || "#"}>
                      {item.label}
                    </a>
                  )}
                </li>
              ))}

              {navbar.links?.map((link) => (
                <li key={link.id} className="nav-item list">
                  <a className={`nav-link ${link.highlight ? "navtext" : ""}`} href={link.url || "#"}>
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
