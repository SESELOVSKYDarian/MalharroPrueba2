import express from "express";
import { authenticate } from "../middleware/auth.js";
import { query } from "../db.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT
         id,
         COALESCE(NULLIF(image_desktop_url, ''), image_url) AS "imageDesktopUrl",
         COALESCE(NULLIF(image_mobile_url, ''), image_url) AS "imageMobileUrl",
         image_url AS "imageUrl",
         caption_text AS "captionText",
         position
       FROM carousel_slides
       ORDER BY position ASC, id ASC`
    );
    return res.json({ items: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo obtener el carrusel" });
  }
});

router.post("/", authenticate, async (req, res) => {
  const { imageUrl, imageDesktopUrl, imageMobileUrl, captionText, position } = req.body || {};
  const desktop = imageDesktopUrl || imageUrl || "";
  const mobile = imageMobileUrl || imageUrl || desktop;
  const fallback = desktop || mobile;

  if (!fallback) {
    return res.status(400).json({ message: "Debés subir al menos una imagen" });
  }

  try {
    let nextPosition = Number(position);
    if (!Number.isFinite(nextPosition)) {
      const { rows } = await query("SELECT COALESCE(MAX(position), 0) + 1 AS next FROM carousel_slides");
      nextPosition = Number(rows[0]?.next || 1);
    } else {
      nextPosition = Number(nextPosition);
    }

    const { rows } = await query(
      `INSERT INTO carousel_slides (image_url, image_desktop_url, image_mobile_url, caption_text, position)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [fallback, desktop, mobile, captionText || "", nextPosition]
    );
    return res.status(201).json({ id: rows[0].id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo crear la diapositiva" });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { imageUrl, imageDesktopUrl, imageMobileUrl, captionText, position } = req.body || {};

  const desktop = typeof imageDesktopUrl === "string" ? imageDesktopUrl : null;
  const mobile = typeof imageMobileUrl === "string" ? imageMobileUrl : null;
  const fallback = typeof imageUrl === "string" ? imageUrl : null;
  const normalizedPosition = Number.isFinite(Number(position)) ? Number(position) : null;

  try {
    await query(
      `UPDATE carousel_slides
         SET image_url = COALESCE($1, image_url),
             image_desktop_url = COALESCE($2, image_desktop_url),
             image_mobile_url = COALESCE($3, image_mobile_url),
             caption_text = COALESCE($4, caption_text),
             position = COALESCE($5, position)
       WHERE id = $6`,
      [fallback, desktop, mobile, captionText, normalizedPosition, id]
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
