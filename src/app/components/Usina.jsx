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
  const [cards, setCards] = useState([]);

  useEffect(() => {
    async function fetchUsina() {
      try {
        const response = await fetch(`${API_URL}/api/usina`, { cache: "no-store" });
        if (!response.ok) throw new Error("No se pudo cargar la usina");
        const data = await response.json();
        setCards(Array.isArray(data.items) ? data.items : []);
      } catch (error) {
        console.error(error);
        setCards([]);
      }
    }

    fetchUsina();
  }, []);

  if (!cards.length) {
    return null;
  }

  return (
    <section className="usina-section" id="usina">
      <div className="container-fluid espaciado-vertical">
        <div className="row">
          <div className="col-12 col-lg-4 mb-4">
            <h1 className="h1-titulor">Usina</h1>
            <h2 className="h1-titulob"> creativa</h2>
            <p className="p1-r">
              Historias destacadas de nuestra comunidad educativa. Compartimos proyectos, experiencias y logros que inspiran.
            </p>
          </div>
          <div className="col-12 col-lg-8">
            <div className="row g-4">
              {cards.map((card) => (
                <div key={card.id} className="col-12 col-md-6">
                  <article
                    className="usina-card"
                    style={{
                      backgroundImage: `linear-gradient(rgba(10,10,10,0.6), rgba(10,10,10,0.6)), url(${asset(card.imageUrl)})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      minHeight: "320px",
                      borderRadius: "24px",
                      display: "flex",
                      alignItems: "flex-end",
                      padding: "2.5rem",
                      color: "#fff",
                    }}
                  >
                    <div>
                      <h3 className="usina-title" style={{ fontWeight: 600, fontSize: "1.75rem", marginBottom: "1rem" }}>
                        {card.titulo}
                      </h3>
                      <p className="usina-text" style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: card.texto }}></p>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
