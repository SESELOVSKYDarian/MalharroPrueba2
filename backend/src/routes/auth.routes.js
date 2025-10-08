import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { query } from "../db.js";
import { sendVerificationCode } from "../services/email.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email y contraseña son obligatorios" });
  }

  try {
    const { rows } = await query("SELECT * FROM users WHERE email = $1 LIMIT 1", [email]);
    const user = rows[0];
    if (!user || user.email !== config.adminEmail) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await query(
      `INSERT INTO login_codes (user_id, code, expires_at) VALUES ($1, $2, $3)`,
      [user.id, code, expiresAt]
    );

    try {
      await sendVerificationCode(user.email, code);
    } catch (emailError) {
      console.error("No se pudo enviar el código de verificación", emailError);
      return res.status(500).json({ message: "No se pudo enviar el código de verificación" });
    }

    return res.json({ message: "Código enviado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al iniciar sesión" });
  }
});

router.post("/verify", async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ message: "Email y código son obligatorios" });
  }

  try {
    const { rows } = await query("SELECT * FROM users WHERE email = $1 LIMIT 1", [email]);
    const user = rows[0];
    if (!user || user.email !== config.adminEmail) {
      return res.status(401).json({ message: "Código inválido" });
    }

    const { rows: codes } = await query(
      `SELECT * FROM login_codes WHERE user_id = $1 ORDER BY expires_at DESC LIMIT 5`,
      [user.id]
    );

    const now = new Date();
    const match = codes.find((entry) => entry.code === code && new Date(entry.expires_at) > now);

    if (!match) {
      return res.status(401).json({ message: "Código inválido o expirado" });
    }

    await query(`DELETE FROM login_codes WHERE user_id = $1`, [user.id]);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

    return res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo verificar el código" });
  }
});

router.get("/me", authenticate, async (req, res) => {
  try {
    const { rows } = await query("SELECT id, email, role FROM users WHERE id = $1", [req.user.id]);
    const user = rows[0];
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    return res.json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo obtener el usuario" });
  }
});

export default router;
