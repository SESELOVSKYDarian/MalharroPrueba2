// Función que obtiene un texto desde la API a partir de su textoID
export async function getTextoByTextoId(textoID) {
  try {
    const params = new URLSearchParams({ seccion: textoID });
    const res = await fetch(`/api/textos?${params.toString()}`);

    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }

    const { item } = await res.json();

    return item || null;
  } catch (err) {
    console.error("Error al obtener texto:", err);
    return null;
  }
}
