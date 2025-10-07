import { NextResponse } from 'next/server';
import { readDatabase, writeDatabase, nextId } from '../_lib/db';
import { requireAdminAuth } from '../_lib/auth-guard';

export async function GET() {
  try {
    const db = await readDatabase();
    return NextResponse.json(db.slider_images ?? []);
  } catch (error) {
    console.error('Error al obtener el carrusel:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    requireAdminAuth(request);
    const { imageUrl, captionText } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'La imagen es obligatoria' }, { status: 400 });
    }

    const db = await readDatabase();
    const collection = db.slider_images ?? [];
    const newItem = {
      id: nextId(collection),
      imageUrl,
      captionText: captionText ?? '',
      createdAt: new Date().toISOString()
    };

    collection.push(newItem);
    db.slider_images = collection;
    await writeDatabase(db);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    console.error('Error al crear slide:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
