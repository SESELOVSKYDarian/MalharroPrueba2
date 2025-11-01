import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getUsinaPosts,
  createUsinaPost,
  updateUsinaPost,
  deleteUsinaPost,
} from "../services/dataStore.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const items = await getUsinaPosts();
    return res.json({ items });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo obtener la usina" });
  }
});

router.post("/", authenticate, async (req, res) => {
  const { titulo, texto, imageUrl, tags } = req.body || {};
  if (!titulo) {
    return res.status(400).json({ message: "El título es obligatorio" });
  }

  if (typeof tags !== "undefined" && !Array.isArray(tags)) {
    return res.status(400).json({ message: "Las etiquetas deben enviarse en una lista" });
  }

  const normalizedTags = Array.isArray(tags)
    ? tags.map((tag) => tag.trim()).filter(Boolean)
    : [];

  if (!normalizedTags.length) {
    return res.status(400).json({ message: "Agregá al menos una etiqueta" });
  }

  try {
    const { id } = await createUsinaPost({
      titulo,
      texto,
      imageUrl,
      tags: normalizedTags,
    });
    return res.status(201).json({ id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo crear el contenido" });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { titulo, texto, imageUrl, tags } = req.body || {};
  let normalizedTags = null;
  if (typeof tags !== "undefined" && !Array.isArray(tags)) {
    return res.status(400).json({ message: "Las etiquetas deben enviarse en una lista" });
  }
  if (Array.isArray(tags)) {
    normalizedTags = tags.map((tag) => tag.trim()).filter(Boolean);
    if (!normalizedTags.length) {
      return res.status(400).json({ message: "Agregá al menos una etiqueta" });
    }
  }
  try {
    await updateUsinaPost(id, {
      titulo,
      texto,
      imageUrl,
      tags: normalizedTags,
    });
    return res.json({ message: "Contenido actualizado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo actualizar el contenido" });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await deleteUsinaPost(id);
    return res.json({ message: "Contenido eliminado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo eliminar el contenido" });
  }
});

export default router;
