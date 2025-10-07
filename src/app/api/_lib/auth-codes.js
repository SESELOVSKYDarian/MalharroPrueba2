import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const dataDir = path.join(process.cwd(), 'data');
const codesFile = path.join(dataDir, 'auth-codes.json');

async function ensureStorage() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(codesFile);
  } catch {
    await fs.writeFile(codesFile, '[]', 'utf8');
  }
}

function hashCode(email, code) {
  return crypto
    .createHash('sha256')
    .update(`${email.toLowerCase()}::${code}`)
    .digest('hex');
}

export async function storeVerificationCode(email, code, ttlMinutes = 10) {
  await ensureStorage();
  const raw = await fs.readFile(codesFile, 'utf8');
  const records = JSON.parse(raw);
  const now = Date.now();
  const expiresAt = now + ttlMinutes * 60 * 1000;

  const filtered = records.filter((entry) => entry.email !== email.toLowerCase());
  filtered.push({
    email: email.toLowerCase(),
    hash: hashCode(email, code),
    expiresAt
  });

  await fs.writeFile(codesFile, JSON.stringify(filtered, null, 2), 'utf8');

  return { expiresAt };
}

export async function validateVerificationCode(email, code) {
  await ensureStorage();
  const raw = await fs.readFile(codesFile, 'utf8');
  const records = JSON.parse(raw);
  const now = Date.now();

  const match = records.find((entry) => entry.email === email.toLowerCase());
  if (!match) return false;

  const isValid = match.hash === hashCode(email, code) && now < match.expiresAt;

  const remaining = records.filter((entry) => entry.email !== email.toLowerCase());
  await fs.writeFile(codesFile, JSON.stringify(remaining, null, 2), 'utf8');

  return isValid;
}
