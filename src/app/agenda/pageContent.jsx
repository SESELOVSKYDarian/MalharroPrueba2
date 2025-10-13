"use client";

import { useMemo, useState } from "react";
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

  return events.filter((event) => {
    const title = event.titulo || "";
    const description = event.descripcion || "";
    const blob = `${title} ${description}`.toLocaleLowerCase("es-AR");

    if (needle && !blob.includes(needle)) return false;

    const primaryTag = Array.isArray(event.tags) ? event.tags[0] : "";
    if (category && primaryTag !== category) return false;
    if (tag && (!Array.isArray(event.tags) || !event.tags.includes(tag))) return false;

    if (exactDate) {
      const candidate = event.fecha ? new Date(event.fecha) : null;
      if (!candidate || Number.isNaN(candidate.getTime())) return false;
      const wanted = new Date(exactDate);
      wanted.setHours(0, 0, 0, 0);
      candidate.setHours(0, 0, 0, 0);
      if (candidate.getTime() !== wanted.getTime()) return false;
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

  const { hero, rest } = useMemo(() => sortEventsForHero(events), [events]);
  const categories = useMemo(() => {
    const unique = new Set();
    events.forEach((event) => {
      const primary = Array.isArray(event.tags) ? event.tags[0] : "";
      if (primary) unique.add(primary);
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b, "es"));
  }, [events]);
  const tags = useMemo(() => buildTagList(events), [events]);

  const hasUpcoming = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return rest.some((event) => {
      if (!event.fecha) return false;
      const parsed = new Date(event.fecha);
      if (Number.isNaN(parsed.getTime())) return false;
      return parsed >= today;
    });
  }, [rest]);

  const filtered = useMemo(
    () =>
      filterEvents(rest, {
        search,
        category: selectedCategory,
        tag: selectedTag,
        exactDate,
        allowPast: !hasUpcoming,
      }),
    [rest, search, selectedCategory, selectedTag, exactDate, hasUpcoming]
  );

  const heroDateParts = formatDateParts(hero?.fecha);
  const heroImage = hero?.imageUrl ? assetUrl(apiBase, hero.imageUrl) : "";

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedTag("");
    setExactDate("");
  };

  const applyFilters = () => {
    setSearch((value) => value.trim());
  };

  return (
    <div className={styles.pageWrapper}>
      <section className={styles.hero}>
        <div className={styles.heroMedia}>
          {heroImage ? <img src={heroImage} alt={hero?.titulo || "Evento destacado"} className={styles.heroImage} /> : null}
          <div className={styles.heroOverlay}></div>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroHeading}>
            <span className={styles.heroKicker}>Agenda</span>
            <h1 className={styles.heroTitle}>Un vistazo a los proximos encuentros</h1>
            <p className={styles.heroSubtitle}>Descubri los eventos, mesas de examenes y jornadas que tenes este ano.</p>
          </div>

          {hero ? (
            <div className={styles.heroDateCard}>
              <div className={styles.heroDate}>
                <span className={styles.heroDateMonth}>{heroDateParts.month}</span>
                <span className={styles.heroDateDay}>{heroDateParts.day}</span>
              </div>
              <div>
                <p className={styles.heroEventTitle}>{hero.titulo || "Evento destacado"}</p>
                <div className={styles.heroTags}>
                  {(hero.tags || []).map((tag) => (
                    <span key={tag} className={styles.heroTag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className={styles.filtersWrapper}>
        <h2 className={styles.filtersHeading}>Descubri los eventos, mesas de examenes y jornadas que tenes este ano.</h2>

        <div className={styles.filtersGrid}>
          <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} className={styles.selectField}>
            <option value="">Tipo de evento</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select value={selectedTag} onChange={(event) => setSelectedTag(event.target.value)} className={styles.selectField}>
            <option value="">Etiquetas</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={exactDate}
            onChange={(event) => setExactDate(event.target.value)}
            className={styles.inputField}
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={styles.inputField}
            placeholder="Buscar..."
          />
        </div>

        <div className={styles.filtersActions}>
          <button type="button" className={styles.calendarButton}>
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
                  {image ? <img src={image} alt={event.titulo} className={styles.eventImage} /> : null}
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
