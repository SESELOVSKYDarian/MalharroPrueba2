"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { API_URL } from "../config";

const asset = (path) => {
  if (!path) return "";
  if (/^https?:/i.test(path)) return path;
  const base = (API_URL || "").replace(/\/$/, "");
  return `${base}${path}`;
};

const formatDate = (dateString) => {
  if (!dateString) return { month: "", day: "" };
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return { month: "", day: "" };
  return {
    month: date.toLocaleString("es-AR", { month: "short" }).replace(/\.$/, ""),
    day: date.getDate().toString().padStart(2, "0"),
  };
};

export default function Agenda() {
  const [events, setEvents] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [ctaLabel, setCtaLabel] = useState("Ver agenda completa");
  const [ctaUrl, setCtaUrl] = useState("#");
  const [slidesPerView, setSlidesPerView] = useState(3);
  const touchStartRef = useRef(null);

  useEffect(() => {
    async function fetchAgenda() {
      try {
        const [agendaResponse, labelResponse, urlResponse] = await Promise.all([
          fetch(`${API_URL}/api/agenda`, { cache: "no-store" }),
          fetch(`${API_URL}/api/texts/home_agenda_cta_label`, { cache: "no-store" }),
          fetch(`${API_URL}/api/texts/home_agenda_cta_url`, { cache: "no-store" }),
        ]);

        if (agendaResponse.ok) {
          const data = await agendaResponse.json();
          const items = Array.isArray(data.items)
            ? data.items.map((item) => ({
                ...item,
                tags: Array.isArray(item.tags) ? item.tags : [],
              }))
            : [];
          setEvents(items);
        } else {
          throw new Error("No se pudo cargar la agenda");
        }

        if (labelResponse.ok) {
          const labelData = await labelResponse.json();
          setCtaLabel(labelData.contenido || labelData.titulo || "Ver agenda completa");
        }

        if (urlResponse.ok) {
          const urlData = await urlResponse.json();
          setCtaUrl(urlData.contenido || "#");
        }
      } catch (error) {
        console.error(error);
        setEvents([]);
        setCtaLabel("Ver agenda completa");
        setCtaUrl("#");
      }
    }

    fetchAgenda();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const calculateSlides = () => {
      const width = window.innerWidth;
      if (width >= 1200) return 3;
      if (width >= 768) return 2;
      return 1;
    };

    const updateSlides = () => {
      setSlidesPerView(calculateSlides());
    };

    updateSlides();
    window.addEventListener("resize", updateSlides);
    return () => window.removeEventListener("resize", updateSlides);
  }, []);

  useEffect(() => {
    setCursor((previous) => {
      if (!events.length) return 0;
      const normalized = ((previous % events.length) + events.length) % events.length;
      if (events.length <= slidesPerView) {
        return 0;
      }
      return normalized;
    });
  }, [events.length, slidesPerView]);

  const sliderColumns = Math.max(1, Math.min(slidesPerView, events.length || 1));

  const visibleEvents = useMemo(() => {
    if (!events.length) return [];
    if (events.length <= sliderColumns) return events;
    const result = [];
    for (let i = 0; i < sliderColumns; i += 1) {
      result.push(events[(cursor + i) % events.length]);
    }
    return result;
  }, [events, cursor, sliderColumns]);

  if (!events.length) {
    return null;
  }

  const showControls = events.length > sliderColumns;

  const goNext = () => {
    if (!showControls) return;
    setCursor((prev) => (prev + 1) % events.length);
  };

  const goPrev = () => {
    if (!showControls) return;
    setCursor((prev) => (prev - 1 + events.length) % events.length);
  };

  const handleTouchStart = (event) => {
    if (!showControls) return;
    touchStartRef.current = event.touches?.[0]?.clientX ?? null;
  };

  const handleTouchMove = (event) => {
    if (!showControls) return;
    if (touchStartRef.current === null) return;
    const currentX = event.touches?.[0]?.clientX ?? 0;
    const delta = currentX - touchStartRef.current;
    if (Math.abs(delta) > 40) {
      if (delta > 0) {
        goPrev();
      } else {
        goNext();
      }
      touchStartRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  return (
    <div className="agenda-container">
      <div className="container-fluid espaciado-vertical">
        <div className="row justify-content-center text-center">
          <div className="col-12">
            <h1 className="agenda-titulo h1-titulob">Agenda</h1>
            <p className="agenda-subtitulo p1-r">
              Descubrí los eventos, mesas de exámenes y jornadas que tenés este año.
            </p>
          </div>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-12">
          <div className={`agenda-wrapper ${showControls ? "" : "controls-hidden"}`}>
            {showControls && (
              <button className="agenda-btn left-btn" type="button" onClick={goPrev} aria-label="Anterior">
                <img src={asset("/malharrooficial/images/Icon_Agenda_Actualizado.svg")} alt="Anterior" />
              </button>
            )}

            {showControls && (
              <button className="agenda-btn right-btn" type="button" onClick={goNext} aria-label="Siguiente">
                <img src={asset("/malharrooficial/images/Icon_Agenda_Actualizado.svg")} alt="Siguiente" />
              </button>
            )}
          </div>

          <div
            className="agenda-grid responsive-slider"
            style={{ "--agenda-slides": sliderColumns.toString() }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            {visibleEvents.map((event) => {
              const { month, day } = formatDate(event.fecha);
              return (
                <div key={event.id} className="agenda-card active">
                  <img className="agenda-image" src={asset(event.imageUrl)} alt={event.titulo} />
                  <div className="agenda-tags">
                    {(event.tags || []).map((tag, tagIndex) => (
                      <span key={`${event.id}-${tagIndex}`} className="agenda-tag p14-etiqueta-agenda">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="agenda-info d-flex">
                    <div className="agenda-date text-center">
                      <p className="agenda-mes p11-mes-agenda-light">{month}</p>
                      <p className="agenda-dia p12-dia-agenda-light">{day}</p>
                    </div>
                    <div className="agenda-divider" aria-hidden="true"></div>
                    <div className="agenda-texto">
                      <p className="p13-texto-agenda-light" dangerouslySetInnerHTML={{ __html: event.descripcion || event.titulo }}></p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="d-flex justify-content-center mt-3">
            <a
              className="btn-agenda01"
              href={ctaUrl || "#"}
              target={ctaUrl && /^https?:/i.test(ctaUrl) ? "_blank" : undefined}
              rel={ctaUrl && /^https?:/i.test(ctaUrl) ? "noreferrer" : undefined}
            >
              {ctaLabel}
            </a>
          </div>
        </div>
      </div>
      <style jsx>{`
        :global(.agenda-wrapper.controls-hidden .agenda-btn) {
          display: none;
        }

        :global(.agenda-grid.responsive-slider) {
          --agenda-slides: 3;
          display: grid;
          grid-template-columns: repeat(var(--agenda-slides), minmax(0, 1fr));
          gap: 24px;
          position: relative;
        }

        :global(.agenda-grid.responsive-slider .agenda-card) {
          margin-top: 0;
        }

        @media (max-width: 1199.98px) {
          :global(.agenda-grid.responsive-slider) {
            display: flex;
            overflow: hidden;
            gap: 0;
            scroll-behavior: smooth;
            scroll-snap-type: x mandatory;
          }

          :global(.agenda-grid.responsive-slider .agenda-card) {
            flex: 0 0 calc(100% / var(--agenda-slides));
            max-width: calc(100% / var(--agenda-slides));
            display: block;
            scroll-snap-align: center;
          }

          :global(.agenda-wrapper.controls-hidden) {
            display: none;
          }
        }

        @media (max-width: 767.98px) {
          :global(.agenda-grid.responsive-slider) {
            gap: 0;
          }

          :global(.agenda-grid.responsive-slider .agenda-card) {
            flex-basis: 100%;
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
