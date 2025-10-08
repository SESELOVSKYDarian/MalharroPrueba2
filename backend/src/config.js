import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET || "malharro-dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  adminEmail: process.env.ADMIN_EMAIL || "admin@example.com",
  smtp: {
    host: process.env.SMTP_HOST?.trim() || "",
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.EMAIL_FROM || process.env.ADMIN_EMAIL || "admin@example.com",
    devConsole: process.env.SMTP_DEV_CONSOLE !== "false",
  },
  postgres: {
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    connectionString: process.env.DATABASE_URL,
  },
};

export function assertConfig() {
  const required = ["PGHOST", "PGDATABASE", "PGUSER", "PGPASSWORD", "JWT_SECRET", "ADMIN_EMAIL", "ADMIN_PASSWORD"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    console.warn(`Missing environment variables: ${missing.join(", ")}`);
  }
}
