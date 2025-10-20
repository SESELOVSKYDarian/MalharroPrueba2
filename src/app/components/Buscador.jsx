"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./Buscador.module.css";

export default function Buscador({ navbar, withAssetBase }) {
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [fadeState, setFadeState] = useState("showLogo");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const sections = [
    { name: "Agenda", id: "agenda", tags: ["eventos", "reuniones", "calendario"] },
    { name: "Carreras", id: "carreras", tags: ["universidad", "facultad", "estudios"] },
    { name: "Preguntas frecuentes", id: "preguntasfrecuentes", tags: ["preguntas", "consultas", "preguntas frecuentes"] },
    { name: "Nuestros estudiantes", id: "estudiantes", tags: ["nuestros estudiantes", "estudiantes", "usina"] },
    { name: "Footer", id: "estudiantes", tags: ["Footer" ] },
    { name: "Trabajos", id: "trabajos", tags: ["empleos", "ofertas", "puestos"] }
  ];

  const lowerQuery = query.trim().toLowerCase();

  const directMatches = sections.filter((s) =>
    s.name.toLowerCase().includes(lowerQuery)
  );
  const relatedMatches = sections.filter(
    (s) =>
      !directMatches.includes(s) &&
      s.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
  const filteredSections = [...directMatches, ...relatedMatches];

  // Animaciones coordinadas
  const animateOpen = () => {
    setFadeState("fadeOutLogo");
    setTimeout(() => {
      setShowSearch(true);
      setFadeState("showInput");
      setTimeout(() => inputRef.current?.focus(), 50);
    }, 300);
  };

  const animateClose = () => {
    setFadeState("fadeOutInput");
    setTimeout(() => {
      setShowSearch(false);
      setFadeState("showLogo");
      setQuery("");
    }, 300);
  };

  const toggleSearch = () => {
    if (showSearch) {
      animateClose();
    } else {
      animateOpen();
    }
  };

  const handleSelect = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `/${id}`;
    }
    animateClose();
  };

  // Cerrar al hacer click fuera
  useEffect(() => {
    function onDocClick(e) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target) && showSearch) {
        animateClose();
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [showSearch]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && showSearch) {
        animateClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showSearch]);

  return (
    <>
      {/* Contenedor del logo/lupa - TRANSPARENTE SOLO CUANDO showSearch ES TRUE */}
      <div
        ref={containerRef}
        className="logo-lupa-box position-relative"
        style={{ 
          cursor: "pointer",
          background: showSearch ? 'transparent' : '#f4155b' 
        }}
      >
        {!showSearch && (
          <div
            className={`d-flex align-items-center bg-highlight p-2 rounded ${
              fadeState === "fadeOutLogo"
                ? styles.fadeOutLogo
                : styles.fadeInLogo
            }`}
            onClick={toggleSearch}
          >
            <Link
              href="/"
              className="navbar-brand botonlogo"
              aria-label="Ir a inicio"
            >
              {navbar.logoUrl ? (
                <img
                  src={withAssetBase(navbar.logoUrl)}
                  alt="Isotipo Malharro"
                  className="logo-nav"
                />
              ) : (
                <span className="fw-bold text-white">Malharro</span>
              )}
            </Link>

            {navbar.searchIconUrl && (
              <a className="ms-2" role="button" aria-label="Buscar">
                <img
                  src={withAssetBase(navbar.searchIconUrl)}
                  alt="Buscar"
                  className="lupa-nav"
                />
              </a>
            )}
          </div>
        )}

        {/* Buscador que se expande en la misma posición */}
        {showSearch && (
          <div
            className={`position-absolute top-0 start-0 ${styles.searchContainer} ${
              fadeState === "fadeOutInput"
                ? styles.fadeOutSearch
                : styles.fadeInSearch
            }`}
            style={{
              zIndex: 9999,
              width: "300px",
              background: 'transparent'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center gap-2 w-100">
              <input
                ref={inputRef}
                type="text"
                className={`${styles.searcher} w-100`}
                placeholder="Buscar..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filteredSections[0]) {
                    handleSelect(filteredSections[0].id);
                  }
                }}
                style={{
                  boxSizing: 'border-box'
                }}
              />

              <button 
                className={styles.closeBtn} 
                onClick={toggleSearch}
                type="button"
              >
                ✕
              </button>

              {/* Resultados de búsqueda */}
              {query && filteredSections.length > 0 && (
                <div
                  className="position-absolute start-0 end-0 bg-white rounded shadow p-2 mt-1"
                  style={{
                    top: '100%',
                    zIndex: 10000,
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}
                >
                  {directMatches.length > 0 && (
                    <>
                      <p className={styles.listTitle}>Resultados:</p>
                      <ul className={styles.list}>
                        {directMatches.map((item) => (
                          <li key={item.id} onClick={() => handleSelect(item.id)}>
                            {item.name} 
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {relatedMatches.length > 0 && (
                    <>
                      <p className={`${styles.listTitle} mt-2`}>
                        Búsquedas relacionadas:
                      </p>
                      <ul className={styles.list}>
                        {relatedMatches.map((item) => (
                          <li key={item.id} onClick={() => handleSelect(item.id)}>
                            {item.name} 
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}

              {query && filteredSections.length === 0 && (
                <div
                  className="position-absolute start-0 end-0 bg-white rounded shadow p-2 mt-1"
                  style={{
                    top: '100%',
                    zIndex: 10000
                  }}
                >
                  <p className="text-muted mb-0">No se encontraron resultados</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}