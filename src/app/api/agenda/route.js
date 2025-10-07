import { NextResponse } from 'next/server';
import { readDatabase, writeDatabase, nextId } from '../_lib/db';
import { requireAdminAuth } from '../_lib/auth-guard';

export async function GET() {
  try {
    const db = await readDatabase();
    return NextResponse.json(db.agenda ?? []);
  } catch (error) {
    console.error('Error al obtener agenda:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    requireAdminAuth(request);
    const payload = await request.json();
    const { titulo, descripcion, fecha, imageUrl } = payload;

    if (!titulo || !descripcion || !fecha) {
      return NextResponse.json(
        { error: 'Título, descripción y fecha son obligatorios' },
        { status: 400 }
      );
    }

    const db = await readDatabase();
    const collection = db.agenda ?? [];

    const newItem = {
      id: nextId(collection),
      titulo,
      descripcion,
      fecha,
      imageUrl: imageUrl ?? ''
    };

    collection.push(newItem);
    db.agenda = collection;
    await writeDatabase(db);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    console.error('Error al crear evento:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
