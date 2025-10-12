import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getFaqs,
  getNextFaqPosition,
  createFaq,
  updateFaq,
  deleteFaq,
} from "../services/dataStore.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const items = await getFaqs();
    return res.json({ items });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudieron obtener las preguntas frecuentes" });
  }
});

router.post("/", authenticate, async (req, res) => {
  const { question, answer, position, tags } = req.body || {};
  if (!question || !question.trim() || !answer || !answer.trim()) {
    return res.status(400).json({ message: "La pregunta y la respuesta son obligatorias" });
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
    let finalPosition = Number.isFinite(Number(position)) ? Number(position) : null;
    if (finalPosition === null) {
      finalPosition = await getNextFaqPosition();
    }

    const created = await createFaq({
      question: question.trim(),
      answer: answer.trim(),
      position: finalPosition,
      tags: normalizedTags,
    });

    return res.status(201).json(created);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo crear la pregunta frecuente" });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { question, answer, position, tags } = req.body || {};

  if (!question && !answer && typeof position === "undefined" && typeof tags === "undefined") {
    return res.status(400).json({ message: "No hay cambios para aplicar" });
  }

  const updatePayload = {};

  if (typeof question === "string") {
    updatePayload.question = question.trim();
  }

  if (typeof answer === "string") {
    updatePayload.answer = answer.trim();
  }

  if (typeof position !== "undefined") {
    const parsed = Number(position);
    if (Number.isFinite(parsed)) {
      updatePayload.position = parsed;
    }
  }

  if (typeof tags !== "undefined") {
    if (!Array.isArray(tags)) {
      return res.status(400).json({ message: "Las etiquetas deben enviarse en una lista" });
    }
    const normalizedTags = tags.map((tag) => tag.trim()).filter(Boolean);
    if (!normalizedTags.length) {
      return res.status(400).json({ message: "Agregá al menos una etiqueta" });
    }
    updatePayload.tags = normalizedTags;
  }

  if (!Object.keys(updatePayload).length) {
    return res.status(400).json({ message: "No hay cambios para aplicar" });
  }

  try {
    const item = await updateFaq(id, updatePayload);
    if (!item) {
      return res.status(404).json({ message: "Pregunta frecuente no encontrada" });
    }

    return res.json(item);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo actualizar la pregunta frecuente" });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const removed = await deleteFaq(id);
    if (!removed) {
      return res.status(404).json({ message: "Pregunta frecuente no encontrada" });
    }
    return res.json({ message: "Pregunta frecuente eliminada" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo eliminar la pregunta frecuente" });
  }
});

export default router;

