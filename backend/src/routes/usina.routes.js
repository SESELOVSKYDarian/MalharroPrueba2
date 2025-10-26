import express from "express";
import { authenticate } from "../middleware/auth.js";
import { query } from "../db.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, titulo, texto, image_url AS "imageUrl"
       FROM usina_posts
       ORDER BY id DESC`
    );
    return res.json({ items: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo obtener la usina" });
  }
});

router.post("/", authenticate, async (req, res) => {
  const { titulo, texto, imageUrl } = req.body;
  if (!titulo) {
    return res.status(400).json({ message: "El título es obligatorio" });
  }

  try {
    const { rows } = await query(
      `INSERT INTO usina_posts (titulo, texto, image_url)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [titulo, texto || "", imageUrl || ""]
    );
    return res.status(201).json({ id: rows[0].id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo crear el contenido" });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { titulo, texto, imageUrl } = req.body;
  try {
    await query(
      `UPDATE usina_posts
       SET titulo = COALESCE($1, titulo),
           texto = COALESCE($2, texto),
           image_url = COALESCE($3, image_url)
       WHERE id = $4`,
      [titulo, texto, imageUrl, id]
    );
    return res.json({ message: "Contenido actualizado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo actualizar el contenido" });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await query("DELETE FROM usina_posts WHERE id = $1", [id]);
    return res.json({ message: "Contenido eliminado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo eliminar el contenido" });
  }
});

export default router;
