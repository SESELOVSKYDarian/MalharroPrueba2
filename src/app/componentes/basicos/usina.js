"use client";

import { useEffect, useState } from 'react';

export default function Usina() {
  const [usinas, setUsinas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/usina', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo obtener la información de Usina');
        return res.json();
      })
      .then(({ items }) => {
        setUsinas(Array.isArray(items) ? items : []);
      })
      .catch((err) => console.error('Error en getUsinas:', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <p className="usina-loading">Cargando contenido…</p>;
  }

  return (
    <div className="usina-container">
      {usinas.length === 0 ? (
        <p>No hay datos disponibles.</p>
      ) : (
        usinas.map((item) => {
          const { id, titulo, texto, imageUrl } = item;

          return (
            <div
              key={id}
              className="usina-card"
              style={{
                backgroundImage: `linear-gradient(rgba(7, 7, 7, 0.55), rgba(7,7,7,0.55)), url(${imageUrl || ''})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="usina-contenido">
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
