import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getSiteTexts,
  getSiteTextBySlug,
  upsertSiteText,
} from "../services/dataStore.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const items = await getSiteTexts();
    return res.json({ items });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo obtener los textos" });
  }
});

router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const item = await getSiteTextBySlug(slug);
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
    await upsertSiteText(slug, titulo, contenido);
    return res.json({ message: "Texto actualizado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo actualizar el texto" });
  }
});

export default router;
