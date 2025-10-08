"use client";

import { useEffect, useState } from "react";
import { API_URL } from "../config";

const asset = (path) => {
  if (!path) return "";
  if (/^https?:/i.test(path)) return path;
  const base = (API_URL || "").replace(/\/$/, "");
  return `${base}${path}`;
};

export default function Usina() {
  const defaultTitle = "Nuestros <br><b>estudiantes</b>";
  const defaultDescription = "Descubrí los proyectos creados en nuestros talleres y aulas.";
  const [cards, setCards] = useState([]);
  const [titleHtml, setTitleHtml] = useState(defaultTitle);
  const [descriptionHtml, setDescriptionHtml] = useState(defaultDescription);

  useEffect(() => {
    async function fetchUsina() {
      try {
        const [postsResponse, titleResponse, descriptionResponse] = await Promise.all([
          fetch(`${API_URL}/api/usina`, { cache: "no-store" }),
          fetch(`${API_URL}/api/texts/home_students_title`, { cache: "no-store" }),
          fetch(`${API_URL}/api/texts/home_students_description`, { cache: "no-store" }),
        ]);

        if (postsResponse.ok) {
          const data = await postsResponse.json();
          const items = Array.isArray(data.items) ? data.items : [];
          if (items.length) {
            const shuffled = items.slice().sort(() => Math.random() - 0.5);
            setCards(shuffled.slice(0, 4));
          } else {
            setCards([]);
          }
        } else {
          throw new Error("No se pudo cargar la galería de estudiantes");
        }

        if (titleResponse.ok) {
          const titleData = await titleResponse.json();
          setTitleHtml(titleData.contenido || titleData.titulo || defaultTitle);
        }

        if (descriptionResponse.ok) {
          const descriptionData = await descriptionResponse.json();
          setDescriptionHtml(descriptionData.contenido || descriptionData.titulo || defaultDescription);
        }
      } catch (error) {
        console.error(error);
        setCards([]);
        setTitleHtml(defaultTitle);
        setDescriptionHtml(defaultDescription);
      }
    }

    fetchUsina();
  }, []);

  return (
    <section className="container-fluid espaciado-vertical" id="estudiantes">
      <div className="row justify-content-center">
        <div className="nuestros-estudiantes col-12">
          <div className="estudiantes-titulo col-12">
            <h1 className="h1-titulor" dangerouslySetInnerHTML={{ __html: titleHtml }} />
          </div>
          <div className="estudiantes-parrafo p1-r">
            <p dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
          </div>
          <div className="galeria d-flex align-items-center col-12 flex-wrap justify-content-center gap-4">
            {cards.length ? (
              cards.map((card) => (
                <div key={card.id} className="col-6 col-md-3 d-flex justify-content-center">
                  <img
                    src={asset(card.imageUrl)}
                    alt={card.titulo || "Proyecto de nuestros estudiantes"}
                    className="galeria-img"
                  />
                </div>
              ))
            ) : (
              <p className="p1-r text-white m-0">Pronto compartiremos nuevos proyectos.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
