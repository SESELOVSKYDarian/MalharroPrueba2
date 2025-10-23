"use client";

import { useMemo, useRef, useState } from "react";
import styles from "./page.module.css";

const normalizeBase = (base) => (base || "").replace(/\/$/, "");

const assetUrl = (base, path) => {
  if (!path) return "";
  if (/^https?:/i.test(path)) return path;
  return `${normalizeBase(base)}${path.startsWith("/") ? path : `/${path}`}`;
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
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const normalizeDateKey = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const buildTagList = (events) => {
  const unique = new Set();
  events.forEach((event) => {
    (event.tags || []).forEach((tag) => {
      if (tag) unique.add(tag);
    });
  });
  return Array.from(unique).sort((a, b) => a.localeCompare(b, "es"));
};

const filterEvents = (events, { search, category, tag, exactDate, allowPast }) => {
  const needle = search.trim().toLocaleLowerCase("es-AR");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const normalizedExactDate = exactDate ? normalizeDateKey(exactDate) : "";

  return events.filter((event) => {
    const title = event.titulo || "";
    const description = event.descripcion || "";
    const blob = `${title} ${description}`.toLocaleLowerCase("es-AR");

    if (needle && !blob.includes(needle)) return false;

    const primaryTag = Array.isArray(event.tags) ? event.tags[0] : "";
    if (category && primaryTag !== category) return false;
    if (tag && (!Array.isArray(event.tags) || !event.tags.includes(tag))) return false;

    if (normalizedExactDate) {
      const candidateKey = normalizeDateKey(event.fecha);
      if (!candidateKey || candidateKey !== normalizedExactDate) return false;
    }

    if (!event.fecha) return true;

    const parsed = new Date(event.fecha);
    if (Number.isNaN(parsed.getTime())) return true;

    if (parsed >= now) return true;
    return allowPast;
  });
};

const sortEventsForHero = (events) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = [];
  const past = [];
  const undated = [];

  events.forEach((event) => {
    if (!event.fecha) {
      undated.push(event);
      return;
    }
    const parsed = new Date(event.fecha);
    if (Number.isNaN(parsed.getTime())) {
      undated.push(event);
      return;
    }
    if (parsed >= today) {
      upcoming.push({ event, date: parsed });
    } else {
      past.push({ event, date: parsed });
    }
  });

  upcoming.sort((a, b) => a.date - b.date);
  past.sort((a, b) => b.date - a.date);

  const hero = upcoming[0]?.event || past[0]?.event || undated[0] || null;
  const rest = [];

  if (hero) {
    const heroId = hero.id;
    upcoming.slice(hero === upcoming[0]?.event ? 1 : 0).forEach(({ event }) => {
      if (event.id !== heroId) rest.push(event);
    });
    past.forEach(({ event }) => {
      if (event.id !== heroId) rest.push(event);
    });
    undated.forEach((event) => {
      if (event.id !== heroId) rest.push(event);
    });
  } else {
    rest.push(...events);
  }

  return { hero, rest };
};

export default function AgendaPageContent({ events, apiBase }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [exactDate, setExactDate] = useState("");
  const [draftFilters, setDraftFilters] = useState({
    search: "",
    category: "",
    tag: "",
    date: "",
  });
  const dateInputRef = useRef(null);

  const sortedEvents = useMemo(() => {
    const { hero, rest } = sortEventsForHero(events);
    return hero ? [hero, ...rest] : rest;
  }, [events]);
  const categories = useMemo(() => {
    const unique = new Set();
    events.forEach((event) => {
      const primary = Array.isArray(event.tags) ? event.tags[0] : "";
      if (primary) unique.add(primary);
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b, "es"));
  }, [events]);
  const tags = useMemo(() => buildTagList(events), [events]);

  const filtered = useMemo(
    () =>
      filterEvents(sortedEvents, {
        search,
        category: selectedCategory,
        tag: selectedTag,
        exactDate,
        allowPast: true,
      }),
    [sortedEvents, search, selectedCategory, selectedTag, exactDate]
  );

  const heroImage =
    sortedEvents[0]?.imageUrl
      ? assetUrl(apiBase, sortedEvents[0].imageUrl)
      : assetUrl(apiBase, "/malharrooficial/images/BANNER MUESTRA.png");

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedTag("");
    setExactDate("");
    setDraftFilters({
      search: "",
      category: "",
      tag: "",
      date: "",
    });
  };

  const applyFilters = () => {
    const trimmedSearch = draftFilters.search.trim();
    setSearch(trimmedSearch);
    setSelectedCategory(draftFilters.category);
    setSelectedTag(draftFilters.tag);
    setExactDate(draftFilters.date);
    setDraftFilters((prev) => ({
      ...prev,
      search: trimmedSearch,
    }));
  };

  return (
    <div className={styles.pageWrapper}>
      <section className={styles.hero}>
        <div className={styles.heroMedia}>
          {heroImage ? <img src={heroImage} alt="Agenda" className={styles.heroImage} /> : null}
          <div className={styles.heroOverlay}></div>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroHeading}>
            <span className={styles.heroKicker}>Agenda</span>
            <h1 className={styles.heroTitle}>Un vistazo a los proximos encuentros</h1>
            <p className={styles.heroSubtitle}>Descubri los eventos, mesas de examenes y jornadas que tenes este año.</p>
          </div>
        </div>
      </section>

      <section className={styles.filtersWrapper}>
        <h2 className={styles.filtersHeading}>Descubri los eventos, mesas de examenes y jornadas que tenes este año.</h2>

        <div className={styles.filtersGrid}>
          <select
            value={draftFilters.category}
            onChange={(event) =>
              setDraftFilters((prev) => ({ ...prev, category: event.target.value }))
            }
            className={styles.selectField}
          >
            <option value="">Tipo de evento</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={draftFilters.tag}
            onChange={(event) => setDraftFilters((prev) => ({ ...prev, tag: event.target.value }))}
            className={styles.selectField}
          >
            <option value="">Etiquetas</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={draftFilters.date}
            onChange={(event) => setDraftFilters((prev) => ({ ...prev, date: event.target.value }))}
            className={styles.inputField}
            ref={dateInputRef}
          />

          <input
            type="search"
            value={draftFilters.search}
            onChange={(event) => setDraftFilters((prev) => ({ ...prev, search: event.target.value }))}
            className={styles.inputField}
            placeholder="Buscar..."
          />
        </div>

        <div className={styles.filtersActions}>
          <button
            type="button"
            className={styles.calendarButton}
            onClick={() => {
              if (dateInputRef.current) {
                dateInputRef.current.focus({ preventScroll: true });
                if (typeof dateInputRef.current.showPicker === "function") {
                  dateInputRef.current.showPicker();
                  return;
                }
              }
              const nextDate = new Date();
              nextDate.setHours(0, 0, 0, 0);
              setDraftFilters((prev) => ({
                ...prev,
                date: nextDate.toISOString().slice(0, 10),
              }));
            }}
          >
            Vista calendario
          </button>
          <button type="button" className={styles.applyButton} onClick={applyFilters}>
            Filtrar
          </button>
          <button type="button" className={styles.resetButton} onClick={resetFilters}>
            Limpiar filtros
          </button>
        </div>
      </section>

      <section className={styles.listContainer}>
        {!filtered.length ? (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>No encontramos eventos</h3>
            <p className={styles.emptyCopy}>Probalo con otra combinacion de filtros o volve a mostrar todos los eventos.</p>
          </div>
        ) : (
          filtered.map((event) => {
            const parts = formatDateParts(event.fecha);
            const humanDate = formatLongDate(event.fecha);
            const image = event.imageUrl ? assetUrl(apiBase, event.imageUrl) : "";
            return (
              <article key={event.id} className={styles.eventCard}>
                <div className={styles.eventMedia}>
                  {image ? (
                    <img src={image} alt={event.titulo} className={styles.eventImage} />
                  ) : (
                    <div className={styles.eventHeroFallback}>Sin imagen</div>
                  )}
                  <div className={styles.eventBadge}>
                    <div>
                      <span className={styles.eventMonth}>{parts.month}</span>
                      <span className={styles.eventDay}>{parts.day}</span>
                    </div>
                    <div className={styles.eventTags}>
                      {(event.tags || []).map((tag) => (
                        <span key={`${event.id}-${tag}`} className={styles.eventTag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.eventBody}>
                  <h3 className={styles.eventTitle}>{event.titulo}</h3>
                  {humanDate ? <p className={styles.eventDate}>{humanDate}</p> : null}
                  {event.descripcion ? (
                    <div
                      className={styles.eventDescription}
                      dangerouslySetInnerHTML={{ __html: event.descripcion }}
                    />
                  ) : null}
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
