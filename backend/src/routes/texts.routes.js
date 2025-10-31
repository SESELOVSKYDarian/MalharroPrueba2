import express from "express";
import { authenticate } from "../middleware/auth.js";
import { query } from "../db.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, slug, titulo, contenido
       FROM site_texts
       ORDER BY slug ASC`
    );
    return res.json({ items: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo obtener los textos" });
  }
});

router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const { rows } = await query(
      `SELECT id, slug, titulo, contenido FROM site_texts WHERE slug = $1 LIMIT 1`,
      [slug]
    );
    const item = rows[0];
    if (!item) {
      return res.status(404).json({ message: "Texto no encontrado" });
    }
    return res.json(item);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo obtener el texto" });
  }
});

router.put("/:slug", authenticate, async (req, res) => {
  const { slug } = req.params;
  const { titulo, contenido } = req.body;
  try {
    const { rowCount } = await query(
      `UPDATE site_texts SET titulo = COALESCE($1, titulo), contenido = COALESCE($2, contenido) WHERE slug = $3`,
      [titulo, contenido, slug]
    );
    if (!rowCount) {
      await query(
        `INSERT INTO site_texts (slug, titulo, contenido) VALUES ($1, $2, $3)`,
        [slug, titulo || "", contenido || ""]
      );
    }
    return res.json({ message: "Texto actualizado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo actualizar el texto" });
  }
});

export default router;
