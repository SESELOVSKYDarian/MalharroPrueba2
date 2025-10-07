import nodemailer from "nodemailer";
import { config } from "../config.js";

let transporter;

export function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.user
        ? {
            user: config.smtp.user,
            pass: config.smtp.pass,
          }
        : undefined,
    });
  }
  return transporter;
}

export async function sendVerificationCode(email, code) {
  const transport = getTransporter();
  const html = `
    <div style="font-family: Inter, Arial, sans-serif;">
      <h2>Código de verificación</h2>
      <p>Tu código para acceder al panel administrativo es:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
      <p>Este código vence en 10 minutos.</p>
    </div>
  `;

  await transport.sendMail({
    from: config.smtp.from,
    to: email,
    subject: "Código de verificación - Dashboard Malharro",
    text: `Tu código de verificación es ${code}. Vence en 10 minutos.`,
    html,
  });
}
