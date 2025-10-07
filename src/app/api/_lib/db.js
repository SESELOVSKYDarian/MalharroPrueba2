import { promises as fs } from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const dataFile = path.join(dataDir, 'content.json');

async function ensureDatabase() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    const initialPayload = {
      slider_images: [],
      agenda: [],
      usina: [],
      textos_generales: []
    };
    await fs.writeFile(dataFile, JSON.stringify(initialPayload, null, 2), 'utf8');
  }
}

export async function readDatabase() {
  await ensureDatabase();
  const raw = await fs.readFile(dataFile, 'utf8');
  return JSON.parse(raw);
}

export async function writeDatabase(data) {
  await ensureDatabase();
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

export function nextId(collection) {
  if (!collection || collection.length === 0) return 1;
  return Math.max(...collection.map((item) => Number(item.id) || 0)) + 1;
}
