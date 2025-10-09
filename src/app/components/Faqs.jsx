"use client";

import { useEffect, useState } from "react";
import { API_URL } from "../config";

const asset = (path) => {
  if (!path) return "";
  if (/^https?:/i.test(path)) return path;
  const base = (API_URL || "").replace(/\/$/, "");
  return `${base}${path}`;
};

export default function Faqs() {
  const [faqs, setFaqs] = useState([]);
  const [titleHtml, setTitleHtml] = useState("Preguntas frecuentes");

  useEffect(() => {
    async function fetchFaqs() {
      try {
        const [faqResponse, titleResponse] = await Promise.all([
          fetch(`${API_URL}/api/faqs`, { cache: "no-store" }),
          fetch(`${API_URL}/api/texts/home_faq_title`, { cache: "no-store" }),
        ]);

        if (faqResponse.ok) {
          const data = await faqResponse.json();
          setFaqs(Array.isArray(data.items) ? data.items : []);
        } else {
          throw new Error("No se pudieron cargar las preguntas frecuentes");
        }

        if (titleResponse.ok) {
          const titleData = await titleResponse.json();
          setTitleHtml(titleData.contenido || titleData.titulo || "Preguntas frecuentes");
        }
      } catch (error) {
        console.error(error);
        setFaqs([]);
        setTitleHtml("Preguntas frecuentes");
      }
    }

    fetchFaqs();
  }, []);

  return (
    <section className="container espaciado-vertical" id="preguntasfrecuentes">
      <h1
        className="container mb-3 d-flex justify-content-center"
        dangerouslySetInnerHTML={{ __html: titleHtml }}
      />
      <div className="faq-list">
        {faqs.map((faq) => (
          <details key={faq.id} className="faq-item">
            <summary className="faq-summary">
              {faq.question}
              <img
                src={asset("/malharrooficial/images/Icon_FlechaAgendaPreguntas.svg")}
                className="chevron"
                alt="Mostrar respuesta"
              />
            </summary>
            <div className="faq-content">
              <div className="col-12 col-md-8" dangerouslySetInnerHTML={{ __html: faq.answer }} />
              <div className="col-md-4"></div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

