import { NextResponse } from 'next/server';
import { readDatabase, writeDatabase, nextId } from '../_lib/db';
import { requireAdminAuth } from '../_lib/auth-guard';

export async function GET() {
  try {
    const db = await readDatabase();
    return NextResponse.json(db.usina ?? []);
  } catch (error) {
    console.error('Error al obtener usina:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    requireAdminAuth(request);
    const payload = await request.json();
    const { titulo, texto, imageUrl } = payload;

    if (!titulo || !texto) {
      return NextResponse.json(
        { error: 'Título y texto son obligatorios' },
        { status: 400 }
      );
    }

    const db = await readDatabase();
    const collection = db.usina ?? [];

    const newItem = {
      id: nextId(collection),
      titulo,
      texto,
      imageUrl: imageUrl ?? ''
    };

    collection.push(newItem);
    db.usina = collection;
    await writeDatabase(db);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    console.error('Error al crear contenido de usina:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
