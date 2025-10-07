import express from "express";
import { authenticate } from "../middleware/auth.js";
import { query } from "../db.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const { rows } = await query(
      "SELECT id, image_url AS \"imageUrl\", caption_text AS \"captionText\", position FROM carousel_slides ORDER BY position ASC, id ASC"
    );
    return res.json({ items: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo obtener el carrusel" });
  }
});

router.post("/", authenticate, async (req, res) => {
  const { imageUrl, captionText, position } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ message: "La imagen es obligatoria" });
  }

  try {
    let nextPosition = position;
    if (typeof nextPosition !== "number") {
      const { rows } = await query("SELECT COALESCE(MAX(position), 0) + 1 AS next FROM carousel_slides");
      nextPosition = Number(rows[0]?.next || 1);
    }

    const { rows } = await query(
      `INSERT INTO carousel_slides (image_url, caption_text, position) VALUES ($1, $2, $3) RETURNING id`,
      [imageUrl, captionText || "", nextPosition]
    );
    return res.status(201).json({ id: rows[0].id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo crear la diapositiva" });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { imageUrl, captionText, position } = req.body;
  try {
    await query(
      `UPDATE carousel_slides SET image_url = COALESCE($1, image_url), caption_text = COALESCE($2, caption_text), position = COALESCE($3, position) WHERE id = $4`,
      [imageUrl, captionText, position, id]
    );
    return res.json({ message: "Diapositiva actualizada" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo actualizar la diapositiva" });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await query("DELETE FROM carousel_slides WHERE id = $1", [id]);
    return res.json({ message: "Diapositiva eliminada" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo eliminar la diapositiva" });
  }
});

export default router;
