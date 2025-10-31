import express from "express";
import { authenticate } from "../middleware/auth.js";
import { query } from "../db.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, titulo, descripcion, fecha, image_url AS "imageUrl", tags
       FROM agenda_events
       ORDER BY fecha DESC NULLS LAST, id DESC`
    );
    return res.json({ items: rows });
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
    const { rows } = await query(
      `INSERT INTO agenda_events (titulo, descripcion, fecha, image_url, tags)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [titulo, descripcion || "", fecha || null, imageUrl || "", Array.isArray(tags) ? tags : []]
    );
    return res.status(201).json({ id: rows[0].id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo crear el evento" });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, fecha, imageUrl, tags } = req.body;
  try {
    await query(
      `UPDATE agenda_events
       SET titulo = COALESCE($1, titulo),
           descripcion = COALESCE($2, descripcion),
           fecha = COALESCE($3, fecha),
           image_url = COALESCE($4, image_url),
           tags = COALESCE($5, tags)
       WHERE id = $6`,
      [titulo, descripcion, fecha, imageUrl, Array.isArray(tags) ? tags : null, id]
    );
    return res.json({ message: "Evento actualizado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo actualizar el evento" });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await query("DELETE FROM agenda_events WHERE id = $1", [id]);
    return res.json({ message: "Evento eliminado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo eliminar el evento" });
  }
});

export default router;
