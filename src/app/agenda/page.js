import AgendaPageContent from "./pageContent";
import { API_URL } from "../config";

export const metadata = {
  title: "Agenda completa",
  description: "Explora todos los eventos, charlas y actividades de la Escuela Martin Malharro.",
};

const apiBase = (API_URL || "http://localhost:4000").replace(/\/$/, "");

async function fetchAgendaItems() {
  try {
    const response = await fetch(`${apiBase}/api/agenda`, {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.error("Fallo al cargar la agenda completa", response.statusText);
      return [];
    }

    const data = await response.json();
    if (!Array.isArray(data.items)) return [];

    return data.items.map((item) => ({
      id: item.id,
      titulo: item.titulo || "Evento sin titulo",
      descripcion: item.descripcion || "",
      fecha: item.fecha || null,
      imageUrl: item.imageUrl || "",
      tags: Array.isArray(item.tags) ? item.tags : [],
    }));
  } catch (error) {
    console.error("No se pudo obtener la agenda completa", error);
    return [];
  }
}

export default async function AgendaPage() {
  const events = await fetchAgendaItems();
  return <AgendaPageContent events={events} apiBase={apiBase} />;
}
