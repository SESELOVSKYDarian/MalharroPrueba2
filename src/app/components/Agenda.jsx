"use client";

import { useEffect, useMemo, useState } from "react";
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
          setEvents(Array.isArray(data.items) ? data.items : []);
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

  const visibleEvents = useMemo(() => {
    if (events.length <= 3) return events;
    const result = [];
    for (let i = 0; i < 3; i += 1) {
      result.push(events[(cursor + i) % events.length]);
    }
    return result;
  }, [events, cursor]);

  if (!events.length) {
    return null;
  }

  const goNext = () => setCursor((prev) => (prev + 1) % events.length);
  const goPrev = () => setCursor((prev) => (prev - 1 + events.length) % events.length);

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
          <div className="agenda-wrapper">
            <button className="agenda-btn left-btn" type="button" onClick={goPrev} aria-label="Anterior">
              <img src={asset("/malharrooficial/images/Icon_Agenda_Actualizado.svg")} alt="Anterior" />
            </button>

            <button className="agenda-btn right-btn" type="button" onClick={goNext} aria-label="Siguiente">
              <img src={asset("/malharrooficial/images/Icon_Agenda_Actualizado.svg")} alt="Siguiente" />
            </button>
          </div>

          <div className="agenda-grid">
            {visibleEvents.map((event, index) => {
              const { month, day } = formatDate(event.fecha);
              return (
                <div key={event.id} className={`agenda-card ${index === 0 ? "active" : ""}`}>
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
    </div>
  );
}
