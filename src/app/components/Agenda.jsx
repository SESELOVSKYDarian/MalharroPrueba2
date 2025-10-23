"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { API_URL } from "../config";
import styles from "./AgendaHome.module.css";

const DEFAULT_CTA_LABEL = "Ver agenda completa";
const DEFAULT_CTA_URL = "/agenda";
const AUTO_SLIDE_INTERVAL = 6000;
const DEFAULT_TAG_POSITION = { x: 50, y: 85 };

const buildEventKey = (event, fallbackIndex) => {
  if (!event || typeof event !== "object") {
    return `agenda-event-${fallbackIndex}`;
  }

  if (event.id !== undefined && event.id !== null) {
    return `id-${event.id}`;
  }

  if (event._id !== undefined && event._id !== null) {
    return `id-${event._id}`;
  }

  if (typeof event.slug === "string" && event.slug.trim()) {
    return `slug-${event.slug.trim()}`;
  }

  if (typeof event.titulo === "string" && event.titulo.trim()) {
    const normalizedTitle = event.titulo.trim().toLowerCase().replace(/\s+/g, "-");
    const datePart = typeof event.fecha === "string" && event.fecha.trim() ? event.fecha.trim() : `idx-${fallbackIndex}`;
    return `title-${normalizedTitle}-${datePart}`;
  }

  if (typeof event.descripcion === "string" && event.descripcion.trim()) {
    return `desc-${event.descripcion.trim().slice(0, 24)}-${fallbackIndex}`;
  }

  return `agenda-event-${fallbackIndex}`;
};

const asset = (path) => {
  if (!path) return "";
  if (/^https?:/i.test(path)) return path;
  const base = (API_URL || "").replace(/\/$/, "");
  return `${base}${path}`;
};

const formatDateParts = (value) => {
  if (!value) return { month: "", day: "" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { month: "", day: "" };
  return {
    month: date.toLocaleString("es-AR", { month: "short" }).replace(/\.$/, ""),
    day: date.getDate().toString().padStart(2, "0"),
  };
};

const formatLongDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "long",
  }).format(date);
};

const summarizeHtml = (html) => {
  if (!html) return "";
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length <= 160) return text;
  return `${text.slice(0, 157)}...`;
};

const prioritizeEvents = (items) => {
  if (!Array.isArray(items)) return [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = [];
  const past = [];
  const undated = [];

  items.forEach((item) => {
    if (!item.fecha) {
      undated.push(item);
      return;
    }

    const parsed = new Date(item.fecha);
    if (Number.isNaN(parsed.getTime())) {
      undated.push(item);
      return;
    }

    if (parsed >= today) {
      upcoming.push({ item, date: parsed });
    } else {
      past.push({ item, date: parsed });
    }
  });

  upcoming.sort((a, b) => a.date - b.date);
  past.sort((a, b) => b.date - a.date); // most recent past first
  undated.sort((a, b) => (a.titulo || "").localeCompare(b.titulo || "", "es"));

  const ordered = upcoming.map((entry) => entry.item);

  if (!ordered.length) {
    ordered.push(...past.map((entry) => entry.item));
  } else if (ordered.length < 6) {
    ordered.push(...past.map((entry) => entry.item));
  }

  ordered.push(...undated);
  return ordered;
};

export default function Agenda() {
  const [events, setEvents] = useState([]);
  const [ctaLabel, setCtaLabel] = useState(DEFAULT_CTA_LABEL);
  const [ctaUrl, setCtaUrl] = useState(DEFAULT_CTA_URL);
  const [slidesPerView, setSlidesPerView] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tagPositions, setTagPositions] = useState({});
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
          const label = typeof labelData.contenido === "string" ? labelData.contenido.trim() : "";
          const fallback = typeof labelData.titulo === "string" ? labelData.titulo.trim() : "";
          setCtaLabel(label || fallback || DEFAULT_CTA_LABEL);
        }

        if (urlResponse.ok) {
          const urlData = await urlResponse.json();
          const value = typeof urlData.contenido === "string" ? urlData.contenido.trim() : "";
          setCtaUrl(value || DEFAULT_CTA_URL);
        }
      } catch (error) {
        console.error(error);
        setEvents([]);
        setCtaLabel(DEFAULT_CTA_LABEL);
        setCtaUrl(DEFAULT_CTA_URL);
      }
    }

    fetchAgenda();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const calculateSlides = () => {
      const width = window.innerWidth;
      if (width >= 1200) return 3;
      if (width >= 900) return 2;
      return 1;
    };

    const updateSlides = () => {
      setSlidesPerView(calculateSlides());
    };

    updateSlides();
    window.addEventListener("resize", updateSlides);
    return () => window.removeEventListener("resize", updateSlides);
  }, []);

  const carouselEvents = useMemo(() => prioritizeEvents(events), [events]);
  const total = carouselEvents.length;
  const effectiveColumns = Math.min(slidesPerView, total || 1);
  const canNavigate = total > effectiveColumns;

  useEffect(() => {
    if (!total) {
      setCurrentIndex(0);
      return;
    }
    setCurrentIndex((prev) => {
      const normalized = ((prev % total) + total) % total;
      return canNavigate ? normalized : 0;
    });
  }, [total, canNavigate]);

  useEffect(() => {
    if (!canNavigate) return undefined;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [canNavigate, total]);

  const visibleEvents = useMemo(() => {
    if (!total) return [];
    if (!canNavigate) {
      return carouselEvents.slice(0, effectiveColumns);
    }
    const items = [];
    for (let i = 0; i < effectiveColumns; i += 1) {
      items.push(carouselEvents[(currentIndex + i) % total]);
    }
    return items;
  }, [carouselEvents, currentIndex, effectiveColumns, canNavigate, total]);

  useEffect(() => {
    if (!carouselEvents.length) {
      setTagPositions((previous) => (Object.keys(previous).length ? {} : previous));
      return;
    }

    setTagPositions((previous) => {
      const allowedKeys = new Set(carouselEvents.map((eventItem, index) => buildEventKey(eventItem, index)));
      const next = {};
      let changed = false;

      Object.entries(previous).forEach(([key, value]) => {
        if (allowedKeys.has(key)) {
          next[key] = value;
        } else {
          changed = true;
        }
      });

      if (!changed && Object.keys(next).length === Object.keys(previous).length) {
        return previous;
      }

      return next;
    });
  }, [carouselEvents]);

  const arrowIcon = asset("/malharrooficial/images/Icon_Agenda_Actualizado.svg");
  const trackStyle = { "--agenda-columns": `${Math.max(1, effectiveColumns)}` };
  const isExternalCta = /^https?:/i.test(ctaUrl || "");

  const getTagPosition = (key) => tagPositions[key] || DEFAULT_TAG_POSITION;

  const updateTagPosition = (key, x, y) => {
    setTagPositions((previous) => {
      const clampedX = Math.min(95, Math.max(5, x));
      const clampedY = Math.min(95, Math.max(5, y));
      const current = previous[key];

      if (current && Math.abs(current.x - clampedX) < 0.1 && Math.abs(current.y - clampedY) < 0.1) {
        return previous;
      }

      return {
        ...previous,
        [key]: { x: clampedX, y: clampedY },
      };
    });
  };

  const updateTagPositionFromPointer = (event, key) => {
    const overlay = event.currentTarget;
    const container = overlay?.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const relativeX = ((event.clientX - rect.left) / rect.width) * 100;
    const relativeY = ((event.clientY - rect.top) / rect.height) * 100;
    updateTagPosition(key, relativeX, relativeY);
  };

  const handleTagPointerDown = (event, key) => {
    if (!event.isPrimary) return;
    event.preventDefault();
    const overlay = event.currentTarget;
    if (typeof overlay.focus === "function") {
      overlay.focus({ preventScroll: true });
    }
    if (overlay.setPointerCapture) {
      overlay.setPointerCapture(event.pointerId);
    }
    updateTagPositionFromPointer(event, key);
  };

  const handleTagPointerMove = (event, key) => {
    const overlay = event.currentTarget;
    const supportsPointerCapture = typeof overlay.hasPointerCapture === "function";
    if (supportsPointerCapture && !overlay.hasPointerCapture(event.pointerId)) {
      return;
    }
    updateTagPositionFromPointer(event, key);
  };

  const handleTagPointerUp = (event) => {
    const overlay = event.currentTarget;
    if (
      typeof overlay.releasePointerCapture === "function" &&
      typeof overlay.hasPointerCapture === "function" &&
      overlay.hasPointerCapture(event.pointerId)
    ) {
      overlay.releasePointerCapture(event.pointerId);
    }
  };

  const handleTagKeyDown = (event, key) => {
    const step = event.shiftKey ? 5 : 2;
    const position = getTagPosition(key);

    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        updateTagPosition(key, position.x, position.y - step);
        break;
      case "ArrowDown":
        event.preventDefault();
        updateTagPosition(key, position.x, position.y + step);
        break;
      case "ArrowLeft":
        event.preventDefault();
        updateTagPosition(key, position.x - step, position.y);
        break;
      case "ArrowRight":
        event.preventDefault();
        updateTagPosition(key, position.x + step, position.y);
        break;
      default:
        break;
    }
  };

  const handlePrev = () => {
    if (!canNavigate) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    if (!canNavigate) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handleTouchStart = (event) => {
    if (!canNavigate || slidesPerView !== 1) return;
    touchStartRef.current = event.touches?.[0]?.clientX ?? null;
  };

  const handleTouchMove = (event) => {
    if (!canNavigate || slidesPerView !== 1) return;
    if (touchStartRef.current === null) return;
    const currentX = event.touches?.[0]?.clientX ?? 0;
    const delta = currentX - touchStartRef.current;
    if (Math.abs(delta) > 45) {
      if (delta > 0) {
        handlePrev();
      } else {
        handleNext();
      }
      touchStartRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  return (
    <section className={styles.section} aria-labelledby="agenda-home-heading">
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.kicker}>Agenda</span>
          <h2 id="agenda-home-heading" className={styles.title}>
            Un vistazo a los proximos encuentros
          </h2>
          <p className={styles.subtitle}>
            Descubri los eventos, mesas de examenes y jornadas que tenes este ano.
          </p>
        </div>

        <div
          className={styles.slider}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          {canNavigate ? (
            <>
              <button
                type="button"
                className={`${styles.navButton} ${styles.navButtonLeft}`}
                onClick={handlePrev}
                aria-label="Evento anterior"
              >
                {arrowIcon ? <img src={arrowIcon} alt="Anterior" className={`${styles.navIcon} ${styles.navIconLeft}`} /> : <span>{"<"}</span>}
              </button>
              <button
                type="button"
                className={`${styles.navButton} ${styles.navButtonRight}`}
                onClick={handleNext}
                aria-label="Evento siguiente"
              >
                {arrowIcon ? <img src={arrowIcon} alt="Siguiente" className={styles.navIcon} /> : <span>{">"}</span>}
              </button>
            </>
          ) : null}

          {visibleEvents.length ? (
            <div className={styles.cardsTrack} style={trackStyle}>
              {visibleEvents.map((event, index) => {
                const dateParts = formatDateParts(event.fecha);
                const humanDate = formatLongDate(event.fecha);
                const plainDescription = summarizeHtml(event.descripcion);
                const summary = plainDescription
                  ? `${plainDescription.charAt(0).toUpperCase()}${plainDescription.slice(1)}`
                  : "";
                const eventKey = buildEventKey(event, index);
                const position = getTagPosition(eventKey);
                const tagOverlayLabel = event.titulo
                  ? `Etiquetas del evento ${event.titulo}. Arrastrá o usá las flechas para moverlas.`
                  : "Etiquetas del evento. Arrastrá o usá las flechas para moverlas.";

                return (
                  <article key={eventKey} className={styles.card}>
                    <div className={styles.cardMedia}>
                      {event.imageUrl ? (
                        <img className={styles.cardMediaImage} src={asset(event.imageUrl)} alt={event.titulo} />
                      ) : (
                        <div className={styles.cardMediaPlaceholder} aria-hidden="true">
                          <span>Sin imagen</span>
                        </div>
                      )}

                      {(event.tags || []).length ? (
                        <div
                          role="button"
                          tabIndex={0}
                          aria-label={tagOverlayLabel}
                          className={styles.tagOverlay}
                          style={{ left: `${position.x}%`, top: `${position.y}%` }}
                          onPointerDown={(pointerEvent) => handleTagPointerDown(pointerEvent, eventKey)}
                          onPointerMove={(pointerEvent) => handleTagPointerMove(pointerEvent, eventKey)}
                          onPointerUp={handleTagPointerUp}
                          onPointerCancel={handleTagPointerUp}
                          onKeyDown={(keyboardEvent) => handleTagKeyDown(keyboardEvent, eventKey)}
                        >
                          {(event.tags || []).map((tag, tagIndex) => (
                            <span key={`${eventKey}-tag-${tagIndex}`} className={styles.tag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.cardHeader}>
                        <div className={styles.dateBadge}>
                          <span className={styles.dateMonth}>{dateParts.month}</span>
                          <span className={styles.dateDay}>{dateParts.day}</span>
                        </div>
                      </div>

                      <h3 className={styles.cardTitle}>{event.titulo || "Evento sin titulo"}</h3>
                      {humanDate ? <p className={styles.cardDate}>{humanDate}</p> : null}
                      {summary ? <p className={styles.cardSummary}>{summary}</p> : null}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No hay eventos publicados por el momento. Vuelve pronto para descubrir nuevas actividades.</p>
            </div>
          )}
        </div>

        <div className={styles.ctaRow}>
          {isExternalCta ? (
            <a href={ctaUrl || DEFAULT_CTA_URL} className={styles.ctaButton} target="_blank" rel="noreferrer">
              {ctaLabel || DEFAULT_CTA_LABEL}
            </a>
          ) : (
            <Link href={ctaUrl || DEFAULT_CTA_URL} className={styles.ctaButton}>
              {ctaLabel || DEFAULT_CTA_LABEL}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
