import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getAgendaEvents,
  createAgendaEvent,
  updateAgendaEvent,
  deleteAgendaEvent,
} from "../services/dataStore.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const items = await getAgendaEvents();
    return res.json({ items });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo obtener la agenda" });
  }
});

router.post("/", authenticate, async (req, res) => {
  const { titulo, descripcion, fecha, imageUrl, tags } = req.body;
  if (!titulo) {
    return res.status(400).json({ message: "El título es obligatorio" });
  }

  try {
    const { id } = await createAgendaEvent({
      titulo,
      descripcion,
      fecha,
      imageUrl,
      tags: Array.isArray(tags) ? tags : [],
    });
    return res.status(201).json({ id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo crear el evento" });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, fecha, imageUrl, tags } = req.body;
  try {
    await updateAgendaEvent(id, {
      titulo,
      descripcion,
      fecha,
      imageUrl,
      tags: Array.isArray(tags) ? tags : undefined,
    });
    return res.json({ message: "Evento actualizado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo actualizar el evento" });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await deleteAgendaEvent(id);
    return res.json({ message: "Evento eliminado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo eliminar el evento" });
  }
});

export default router;
