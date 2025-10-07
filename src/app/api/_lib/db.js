import { promises as fs } from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

async function ensureDatabase() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    const initialData = {
      users: [],
      slider: [],
      agenda: [],
      usina: [],
      textos: []
    };
    await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2), 'utf8');
  }
}

export async function readDatabase() {
  await ensureDatabase();
  const raw = await fs.readFile(DB_PATH, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error al parsear la base de datos JSON:', error);
    throw new Error('Base de datos corrupta');
  }
}

export async function writeDatabase(data) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

export function nextId(collection = []) {
  if (collection.length === 0) return 1;
  return Math.max(...collection.map((item) => item.id || 0)) + 1;
}
