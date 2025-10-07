import { API_URL } from "@/app/config";

async function getUsinas() {
  try {
    const res = await fetch(`${API_URL}/usina`, { cache: "no-store" });

    if (!res.ok) {
      console.error("Error en fetch:", res.statusText);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error en getUsinas:", err);
    return [];
  }
}

export default async function Usina() {
  const usinas = await getUsinas();

  return (
    <div className="usina-container">
      {usinas.length === 0 ? (
        <p>No hay datos disponibles.</p>
      ) : (
        usinas.map((item) => {
          const { id, titulo, texto, imageUrl } = item;

          return (
            <div key={id} className="usina-card" style={{
                  backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}>
              <div className="usina-contenido">
                <h2>{titulo}</h2>
                <p>{texto}</p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
    