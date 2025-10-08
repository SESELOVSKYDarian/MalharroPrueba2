import express from "express";
import { authenticate } from "../middleware/auth.js";
import { query } from "../db.js";

const router = express.Router();

async function getSection(section) {
  const { rows } = await query(`SELECT data FROM site_sections WHERE section = $1 LIMIT 1`, [section]);
  return rows[0]?.data || null;
}

router.get("/:section", async (req, res) => {
  const { section } = req.params;
  try {
    const data = await getSection(section);
    if (!data) {
      return res.status(404).json({ message: "Sección no encontrada" });
    }
    return res.json({ section, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo obtener la sección" });
  }
});

router.put("/:section", authenticate, async (req, res) => {
  const { section } = req.params;
  const data = req.body;
  try {
    await query(
      `INSERT INTO site_sections (section, data) VALUES ($1, $2)
       ON CONFLICT (section) DO UPDATE SET data = EXCLUDED.data`,
      [section, data]
    );
    const updated = await getSection(section);
    return res.json({ section, data: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo actualizar la sección" });
  }
});

export default router;
