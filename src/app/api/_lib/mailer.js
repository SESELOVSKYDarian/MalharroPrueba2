import { promises as fs } from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'data', 'last-verification-code.log');

export async function deliverVerificationCode(email, code) {
  const message = `Código de verificación para ${email}: ${code}`;
  console.info(message);
  try {
    await fs.writeFile(logFile, `${new Date().toISOString()} - ${message}\n`, 'utf8');
  } catch (error) {
    console.error('No se pudo escribir el archivo de registro de códigos:', error);
  }
}
