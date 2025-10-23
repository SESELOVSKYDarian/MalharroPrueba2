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
  const defaultDescription =
    "Descubrí los proyectos creados en nuestros talleres y aulas.";
  const [cards, setCards] = useState([]);
  const [titleHtml, setTitleHtml] = useState(defaultTitle);
  const [descriptionHtml, setDescriptionHtml] = useState(defaultDescription);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    async function fetchUsina() {
      try {
        const [postsResponse, titleResponse, descriptionResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/usina`, { cache: "no-store" }),
            fetch(`${API_URL}/api/texts/home_students_title`, {
              cache: "no-store",
            }),
            fetch(`${API_URL}/api/texts/home_students_description`, {
              cache: "no-store",
            }),
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
          setDescriptionHtml(
            descriptionData.contenido ||
              descriptionData.titulo ||
              defaultDescription
          );
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

  const handleImageClick = (card) => {
    setSelectedImage(card);
  };

  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  return (
    <section className="container-fluid espaciado-vertical" id="estudiantes">
      <div className="row justify-content-center">
        <div className="nuestros-estudiantes col-12">
          <div className="estudiantes-titulo col-12">
            <h1
              className="h1-titulor"
              dangerouslySetInnerHTML={{ __html: titleHtml }}
            />
          </div>
          <div className="estudiantes-parrafo p1-r">
            <p dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
          </div>
          <div className="galeria galeria-grid col-12">
            {cards.length ? (
              cards.map((card) => (
                <div
                  key={card.id}
                  className="galeria-item"
                  onClick={() => handleImageClick(card)}
                >
                  <img
                    src={asset(card.imageUrl)}
                    alt={card.titulo || "Proyecto de nuestros estudiantes"}
                    className="galeria-img"
                  />
                </div>
              ))
            ) : (
              <p className="p1-r text-white m-0">
                Pronto compartiremos nuevos proyectos.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal para imagen seleccionada */}
      {selectedImage && (
        <div className="image-modal-overlay" onClick={handleCloseImage}>
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-button" onClick={handleCloseImage}>
              ×
            </button>
            <img
              src={asset(selectedImage.imageUrl)}
              alt={selectedImage.titulo || "Proyecto de nuestros estudiantes"}
              className="modal-image"
            />
            {selectedImage.titulo && (
              <div className="image-caption">
                <h3>{selectedImage.titulo}</h3>
                {selectedImage.descripcion && (
                  <p>{selectedImage.descripcion}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    <style jsx>{`
        :global(.nuestros-estudiantes) {
          overflow: hidden;
        }

        :global(.galeria.galeria-grid) {
          display: grid;
          /* Grid más flexible para cargar más imágenes desde el dashboard */
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 24px;
          justify-items: center;
          padding: 0 24px 48px;
          margin-top: 70px;
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
        
        :global(.galeria-img:hover) {
          cursor: pointer;
        }

        /* Estilos del modal */
        .image-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
        }

        .image-modal-content {
          position: relative;
          max-width: 90%;
          max-height: 90%;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: transparent;
          border-radius: 0;
          padding: 0;
          box-shadow: none;
        }

        .close-button {
          position: absolute;
          top: -40px;
          right: 0;
          background: none;
          border: none;
          font-size: 2rem;
          color: white;
          cursor: pointer;
          z-index: 1001;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.3s ease;
        }

        .close-button:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }

        .modal-image {
          max-width: 100%;
          max-height: 70vh;
          object-fit: contain;
          border-radius: 14px 14px 0 0;
        }

        .image-caption {
          width: 100%;
          margin-top: 0;
          text-align: center;
          color: white;
          background: #333333;
          padding: 20px;
          border-radius: 0 0 14px 14px;
          max-width: none;
        }

        .image-caption h3 {
          margin-bottom: 10px;
          font-size: 1.3rem;
          margin-top: 0;
        }

        .image-caption p {
          font-size: 0.7rem;
          line-height: 1.4;
          margin: 0;
        }

        /* Óvalo negro más pequeño */
        .contenedor-negro{
          width: 100vw;
          height: 500px;
          background-color: #1E1E1E;
          clip-path: ellipse(110% 35% at 50% 50%);
          z-index: 0;
        }

        @media (min-width: 768px) {
          .contenedor-negro{
            width: 100vw;
            height: 450px;
            clip-path: ellipse(85% 35% at 50% 50%);
            z-index: 0;
          }
          
          /* En tablets permitir más columnas */
          :global(.galeria.galeria-grid) {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }
        }

        @media (min-width: 1200px) {
          /* En pantallas grandes mostrar aún más imágenes */
          :global(.galeria.galeria-grid) {
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            max-width: 1400px;
            margin-left: auto;
            margin-right: auto;
          }
        }

        .margenovalo{
          margin-top: -500px;
          z-index: 3;
        }

        @media (max-width: 991.98px) {
          :global(.galeria.galeria-grid) {
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            padding: 0 24px 40px;
          }

          .image-modal-content {
            max-width: 95%;
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

          .image-modal-content {
            max-width: 98%;
          }

          .close-button {
            top: -35px;
            right: -10px;
            font-size: 1.5rem;
            width: 30px;
            height: 30px;
          }

          .image-caption {
            padding: 15px;
          }

          .image-caption h3 {
            font-size: 1.2rem;
          }

          .image-caption p {
            font-size: 0.9rem;
          }
          
          .margenovalo{
            margin-top: -500px;
          }
        }
   `}</style>
</section>)}