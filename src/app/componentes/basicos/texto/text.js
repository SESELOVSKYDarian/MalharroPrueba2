"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { API_URL } from "@/app/config";

export const Texto = ({ textoID }) => {
  const [status, setStatus] = useState("loading");
  const [contenido, setContenido] = useState("");

  useEffect(() => {
    if (!textoID) {
      setStatus("error");
      return;
    }

    const controller = new AbortController();

    async function load() {
      try {
        setStatus("loading");
        const res = await fetch(
          `${API_URL}/textos?seccion=${encodeURIComponent(textoID)}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (res.status === 404) {
          setStatus("error");
          return;
        }

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        setContenido(data?.contenido ?? "");
        setStatus("success");
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error al cargar texto", error);
          setStatus("error");
        }
      }
    }

    load();

    return () => controller.abort();
  }, [textoID]);

  if (status === "loading") return <p className="text">Cargando...</p>;
  if (status === "error") return <p className="text">Contenido no disponible</p>;

  return (
    <div className="text-container">
      <ReactMarkdown
        components={{
          p: ({ node, ...props }) => <p className="texto-regular" {...props} />,
          strong: ({ node, ...props }) => <strong className="texto-negrita" {...props} />,
        }}
      >
        {contenido}
      </ReactMarkdown>
    </div>
  );
};
