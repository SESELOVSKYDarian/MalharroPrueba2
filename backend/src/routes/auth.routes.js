import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import {
  findUserByEmail,
  createLoginCode,
  findRecentLoginCodes,
  deleteLoginCodesByUser,
  findUserById,
} from "../services/dataStore.js";
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
    const user = await findUserByEmail(email);
    if (!user || user.email !== config.adminEmail) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await createLoginCode(user.id, code, expiresAt);

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
    const user = await findUserByEmail(email);
    if (!user || user.email !== config.adminEmail) {
      return res.status(401).json({ message: "Código inválido" });
    }

    const codes = await findRecentLoginCodes(user.id, 5);

    const now = new Date();
    const match = codes.find((entry) => entry.code === code && new Date(entry.expires_at) > now);

    if (!match) {
      return res.status(401).json({ message: "Código inválido o expirado" });
    }

    await deleteLoginCodesByUser(user.id);

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
    const user = await findUserById(req.user.id);
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
