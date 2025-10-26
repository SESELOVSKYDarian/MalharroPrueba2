import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { config, assertConfig } from "./config.js";
import { initializeDatabase } from "./db.js";
import authRoutes from "./routes/auth.routes.js";
import carouselRoutes from "./routes/carousel.routes.js";
import agendaRoutes from "./routes/agenda.routes.js";
import usinaRoutes from "./routes/usina.routes.js";
import textsRoutes from "./routes/texts.routes.js";
import sectionsRoutes from "./routes/sections.routes.js";
import uploadsRoutes from "./routes/uploads.routes.js";
import faqsRoutes from "./routes/faqs.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../..");

const app = express();

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

const uploadsPath = path.resolve(rootDir, "backend/uploads");
const imagesPath = path.resolve(rootDir, "malharrooficial/images");

app.use("/uploads", express.static(uploadsPath));
app.use("/malharrooficial/images", express.static(imagesPath));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/carousel", carouselRoutes);
app.use("/api/agenda", agendaRoutes);
app.use("/api/usina", usinaRoutes);
app.use("/api/texts", textsRoutes);
app.use("/api/sections", sectionsRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/faqs", faqsRoutes);

assertConfig();

initializeDatabase()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`Servidor backend escuchando en el puerto ${config.port}`);
    });
  })
  .catch((error) => {
    console.error("No se pudo inicializar la base de datos", error);
    process.exit(1);
  });
