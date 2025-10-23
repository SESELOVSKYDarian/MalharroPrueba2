// EnProcesoEAV.jsx
import React from "react";

export default function EnProcesoEAV() {
  return (
    <>
      {/* Botón Volver */}
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            {/* Nota: Semánticamente es mejor un <a> con clases de botón que un <button> con <a> adentro */}
            <a href="../web 05 09/index.html" className="btn btn-volver">
              <img
                src="images/Icon_VolverActualizado.svg"
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
            * La construcci&oacute;n de la web de la Malharro es un proyecto conjunto
            que continuar&aacute; el pr&oacute;ximo a&ntilde;o de la mano de 4&deg; de Dise&ntilde;o
            Gr&aacute;fico y estudiantes de la T&eacute;cnica N&deg;5. *
          </p>
          <div className="espaciado-vertical margen" />
          <img
            src="images/persoanjes-enproceso.svg"
            alt="Personajes de las carreras, página en proceso"
            width={400}
          />
        </div>
      </div>
    </>
  );
}
