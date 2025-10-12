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
          <div className="galeria galeria-grid col-12">
            {cards.length ? (
              cards.map((card) => (
                <div key={card.id} className="galeria-item">
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
      <style jsx>{`
        :global(.nuestros-estudiantes) {
          overflow: hidden;
        }

        :global(.galeria.galeria-grid) {
          display: grid;
          grid-template-columns: repeat(4, minmax(140px, 1fr));
          gap: 24px;
          justify-items: center;
          padding: 0 24px 48px;
        }

        :global(.galeria-item) {
          width: 100%;
          max-width: 220px;
          display: flex;
          justify-content: center;
        }

        :global(.galeria-img) {
          width: 100%;
          height: auto;
          aspect-ratio: 3 / 4;
          object-fit: cover;
          border-radius: 24px;
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.2);
        }

        @media (max-width: 1199.98px) {
          :global(.nuestros-estudiantes) {
            clip-path: none;
            border-radius: 72px 72px 0 0;
            padding-bottom: 64px;
            height: auto;
          }

          :global(.galeria.galeria-grid) {
            grid-template-columns: repeat(3, minmax(140px, 1fr));
            gap: 20px;
          }
        }

        @media (max-width: 991.98px) {
          :global(.galeria.galeria-grid) {
            grid-template-columns: repeat(2, minmax(140px, 1fr));
            padding: 0 24px 40px;
          }
        }

        @media (max-width: 575.98px) {
          :global(.nuestros-estudiantes) {
            border-radius: 48px 48px 0 0;
            padding-bottom: 48px;
          }

          :global(.galeria.galeria-grid) {
            grid-template-columns: repeat(2, minmax(120px, 1fr));
            gap: 16px;
            padding: 0 18px 32px;
          }

          :global(.galeria-img) {
            border-radius: 20px;
          }
        }
      `}</style>
    </section>
  );
}
