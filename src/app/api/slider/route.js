import { NextResponse } from 'next/server';
import { readDatabase, writeDatabase, nextId } from '../_lib/db';
import { requireAdmin } from '../_lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await readDatabase();
    return NextResponse.json({ items: db.slider.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)) });
  } catch (error) {
    console.error('Error obteniendo slider:', error);
    return NextResponse.json({ message: 'No se pudieron obtener las imágenes del carrusel.' }, { status: 500 });
  }
}

export async function POST(request) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const { imageUrl, captionText } = await request.json();
    if (!imageUrl) {
      return NextResponse.json({ message: 'La URL de la imagen es obligatoria.' }, { status: 400 });
    }

    const db = await readDatabase();
    const newItem = {
      id: nextId(db.slider),
      imageUrl,
      captionText: captionText || '',
      createdAt: Date.now()
    };
    db.slider.push(newItem);
    await writeDatabase(db);

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    console.error('Error creando imagen de slider:', error);
    return NextResponse.json({ message: 'No se pudo crear la imagen.' }, { status: 500 });
  }
}
