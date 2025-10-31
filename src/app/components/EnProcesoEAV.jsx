import React from "react";
import "../../../malharrooficial/css/bootstrap.min.css";
import "../../../malharrooficial/css/design-system.css";
import "../../../malharrooficial/css/styles.css";
import "../../../malharrooficial/css/paginauno.css";
import { API_URL } from "../config";

const asset = (path) => {
  if (!path) return "";
  if (/^https?:/i.test(path)) return path;
  const base = (API_URL || "").replace(/\/$/, "");
  return `${base}${path}`;
};

export default function EnProcesoEAV() {
  return (
    <>
      {/* Botón Volver */}
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <a
              href="https://www.avmartinmalharro.edu.ar/inicio.html"
              className="btn btn-volver"
            >
              <img
                src={asset("/malharrooficial/images/Icon_Volver.svg")}
                alt="Volver al menú principal"
                className="volver-svg"
              />
              <p className="p1-r textovolver-btn">PR&Oacute;XIMAMENTE</p>
            </a>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="row">
        <div className="col-12 col-md-6">
          <div className="espaciado-vertical margen" />
          <h1
            className="h1-titulob"
            style={{ color: "var(--color-neutral-)", textAlign: "left" }}
          >
            Página en proceso
          </h1>
          <div className="espaciado-vertical margen" />
          <p className="p1-r" style={{ color: "var(--color-neutral-6)" }}>
            * La construcci&oacute;n de la web de la Malharro es un proyecto
            conjunto que continuar&aacute; el pr&oacute;ximo a&ntilde;o de la
            mano de 4&deg; de Dise&ntilde;o Gr&aacute;fico y estudiantes de la
            T&eacute;cnica N&deg;5. *
          </p>
          <div className="espaciado-vertical margen" />
          <img
            src={asset("/malharrooficial/images/persoanjes-enproceso.svg")}
            alt="Personajes de las carreras, página en proceso"
            width={400}
          />
        </div>
      </div>
    </>
  );
}
