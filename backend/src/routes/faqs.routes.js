import express from "express";
import { authenticate } from "../middleware/auth.js";
import { query } from "../db.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, question, answer, position, tags
       FROM faqs
       ORDER BY position ASC, id ASC`
    );
    return res.json({ items: rows });
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
      const { rows } = await query(`SELECT COALESCE(MAX(position), 0) + 1 AS next FROM faqs`);
      finalPosition = Number(rows[0]?.next || 1);
    }

    const { rows } = await query(
      `INSERT INTO faqs (question, answer, position, tags)
       VALUES ($1, $2, $3, $4)
       RETURNING id, question, answer, position, tags`,
      [question.trim(), answer.trim(), finalPosition, normalizedTags]
    );

    return res.status(201).json(rows[0]);
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

  const updates = [];
  const values = [];

  if (typeof question === "string") {
    updates.push(`question = $${updates.length + 1}`);
    values.push(question.trim());
  }

  if (typeof answer === "string") {
    updates.push(`answer = $${updates.length + 1}`);
    values.push(answer.trim());
  }

  if (typeof position !== "undefined") {
    const parsed = Number(position);
    if (Number.isFinite(parsed)) {
      updates.push(`position = $${updates.length + 1}`);
      values.push(parsed);
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
    updates.push(`tags = $${updates.length + 1}`);
    values.push(normalizedTags);
  }

  if (!updates.length) {
    return res.status(400).json({ message: "No hay cambios para aplicar" });
  }

  values.push(id);

  try {
    const { rows } = await query(
      `UPDATE faqs
       SET ${updates.join(", ")}
       WHERE id = $${updates.length + 1}
       RETURNING id, question, answer, position, tags`,
      values
    );

    const item = rows[0];
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
    const { rowCount } = await query(`DELETE FROM faqs WHERE id = $1`, [id]);
    if (!rowCount) {
      return res.status(404).json({ message: "Pregunta frecuente no encontrada" });
    }
    return res.json({ message: "Pregunta frecuente eliminada" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo eliminar la pregunta frecuente" });
  }
});

export default router;

