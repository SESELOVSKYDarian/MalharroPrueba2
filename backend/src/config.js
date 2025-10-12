import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

dotenv.config();

const DEFAULT_ADMIN_EMAIL = "admin@example.com";
const DEFAULT_ADMIN_PASSWORD = "admin123";

const postgresConfigProvided =
  Boolean(process.env.DATABASE_URL) ||
  ["PGHOST", "PGDATABASE", "PGUSER", "PGPASSWORD"].every((key) =>
    Boolean(process.env[key])
  );

export const config = {
  port: process.env.PORT || 4000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET || "malharro-dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  adminEmail: process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD,
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
  useInMemoryDb:
    process.env.USE_IN_MEMORY_DB === "true" || !postgresConfigProvided,
};

export function assertConfig() {
  const required = [];

  if (!process.env.JWT_SECRET) {
    console.warn(
      "JWT_SECRET is not set. A fallback secret will be used for development. Set JWT_SECRET to secure production tokens."
    );
  }

  if (!config.useInMemoryDb) {
    required.push("PGHOST", "PGDATABASE", "PGUSER", "PGPASSWORD");
  }

  if (!process.env.ADMIN_EMAIL) {
    console.warn(
      `ADMIN_EMAIL is not set, using default value "${DEFAULT_ADMIN_EMAIL}".`
    );
  }

  if (!process.env.ADMIN_PASSWORD) {
    console.warn(
      "ADMIN_PASSWORD is not set. A default development password will be used."
    );
  }

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    console.warn(`Missing environment variables: ${missing.join(", ")}`);
  }

  if (config.useInMemoryDb) {
    console.info(
      "Using in-memory PostgreSQL. Provide database credentials or set USE_IN_MEMORY_DB=false to connect to a real database."
    );
  }
}
