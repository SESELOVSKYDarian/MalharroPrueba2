import nodemailer from "nodemailer";
import { config } from "../config.js";

let transporter;
const useConsoleTransport = !config.smtp.host && config.smtp.devConsole;

export function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (!config.smtp.host && !useConsoleTransport) {
    throw new Error(
      "No hay un servidor SMTP configurado. Define SMTP_HOST o habilita el fallback de consola con SMTP_DEV_CONSOLE=true"
    );
  }

  if (useConsoleTransport) {
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: "unix",
      buffer: true,
    });
    return transporter;
  }

  const transportOptions = {
    host: config.smtp.host,
    secure: config.smtp.secure,
    ...(config.smtp.port ? { port: config.smtp.port } : {}),
    ...(config.smtp.user
      ? {
          auth: {
            user: config.smtp.user,
            pass: config.smtp.pass,
          },
        }
      : {}),
  };

  transporter = nodemailer.createTransport(transportOptions);
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

  const info = await transport.sendMail({
    from: config.smtp.from,
    to: email,
    subject: "Código de verificación - Dashboard Malharro",
    text: `Tu código de verificación es ${code}. Vence en 10 minutos.`,
    html,
  });

  if (useConsoleTransport) {
    const output = Buffer.isBuffer(info.message) ? info.message.toString() : info.message;
    console.info("[DEV EMAIL] Se generó un correo simulado para %s:\n%s", email, output);
  }
}
