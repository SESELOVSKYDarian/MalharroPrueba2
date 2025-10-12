"use client";

import { useEffect, useState } from "react";
import { API_URL } from "../config";

const asset = (path) => {
  if (!path) return "";
  if (/^https?:/i.test(path)) return path;
  const base = (API_URL || "").replace(/\/$/, "");
  return `${base}${path}`;
};

export default function Carousel() {
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    import("../../../malharrooficial/js/bootstrap.bundle.min.js").catch(() => {});
  }, []);

  useEffect(() => {
    async function fetchSlides() {
      try {
        const response = await fetch(`${API_URL}/api/carousel`, { cache: "no-store" });
        if (!response.ok) throw new Error("No se pudo cargar el carrusel");
        const data = await response.json();
        const items = Array.isArray(data.items)
          ? data.items.map((item) => ({
              ...item,
              imageDesktopUrl: item.imageDesktopUrl || item.imageUrl,
              imageMobileUrl: item.imageMobileUrl || item.imageDesktopUrl || item.imageUrl,
            }))
          : [];
        setSlides(items);
      } catch (error) {
        console.error(error);
        setSlides([]);
      }
    }

    fetchSlides();
  }, []);

  if (!slides.length) {
    return null;
  }

  return (
    <div id="bannerCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="3000">
      <div className="carousel-indicators">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            data-bs-target="#bannerCarousel"
            data-bs-slide-to={index}
            className={index === 0 ? "active indicador-triangulo" : index === 1 ? "indicador-circulo" : "indicador-cuadrado"}
            aria-current={index === 0 ? "true" : undefined}
            aria-label={`Slide ${index + 1}`}
          ></button>
        ))}
      </div>

      <div className="carousel-inner">
        {slides.map((slide, index) => (
          <div key={slide.id} className={`carousel-item ${index === 0 ? "active" : ""}`}>
            <picture>
              {slide.imageMobileUrl && (
                <source media="(max-width: 767.98px)" srcSet={asset(slide.imageMobileUrl)} />
              )}
              <img
                src={asset(slide.imageDesktopUrl || slide.imageUrl)}
                className="d-block w-100 banner-img"
                alt={slide.captionText || `Slide ${index + 1}`}
              />
            </picture>
            {slide.captionText ? (
              <div className="carousel-caption d-flex justify-content-center align-items-center h-100">
                <h2 className="textocarrusel fw-bold text-shadow">
                  <span className="fw-bolder">{slide.captionText}</span>
                </h2>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="degradado-carousel"></div>

      <button className="carousel-control-prev" type="button" data-bs-target="#bannerCarousel" data-bs-slide="prev">
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Anterior</span>
      </button>
      <button className="carousel-control-next" type="button" data-bs-target="#bannerCarousel" data-bs-slide="next">
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Siguiente</span>
      </button>
    </div>
  );
}
