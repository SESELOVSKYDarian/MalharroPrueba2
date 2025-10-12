import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getCarouselSlides,
  getNextCarouselPosition,
  createCarouselSlide,
  updateCarouselSlide,
  deleteCarouselSlide,
} from "../services/dataStore.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const items = await getCarouselSlides();
    return res.json({ items });
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
      nextPosition = await getNextCarouselPosition();
    } else {
      nextPosition = Number(nextPosition);
    }

    const { id: createdId } = await createCarouselSlide({
      imageUrl: fallback,
      imageDesktopUrl: desktop,
      imageMobileUrl: mobile,
      captionText: captionText || "",
      position: nextPosition,
    });
    return res.status(201).json({ id: createdId });
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
    await updateCarouselSlide(id, {
      imageUrl: fallback,
      imageDesktopUrl: desktop,
      imageMobileUrl: mobile,
      captionText,
      position: normalizedPosition,
    });
    return res.json({ message: "Diapositiva actualizada" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo actualizar la diapositiva" });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await deleteCarouselSlide(id);
    return res.json({ message: "Diapositiva eliminada" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo eliminar la diapositiva" });
  }
});

export default router;
