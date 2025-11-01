import express from "express";
import { authenticate } from "../middleware/auth.js";
import { getSiteSection, upsertSiteSection } from "../services/dataStore.js";

const router = express.Router();

router.get("/:section", async (req, res) => {
  const { section } = req.params;
  try {
    const data = await getSiteSection(section);
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
    const updated = await upsertSiteSection(section, data);
    return res.json({ section, data: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo actualizar la sección" });
  }
});

export default router;
