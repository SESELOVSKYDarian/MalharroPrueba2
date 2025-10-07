import { NextResponse } from 'next/server';
import { readDatabase, writeDatabase, nextId } from '../_lib/db';
import { requireAdmin } from '../_lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await readDatabase();
    return NextResponse.json({ items: db.usina });
  } catch (error) {
    console.error('Error obteniendo usina:', error);
    return NextResponse.json({ message: 'No se pudo obtener la información.' }, { status: 500 });
  }
}

export async function POST(request) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const { titulo, texto, imageUrl } = await request.json();
    if (!titulo || !texto) {
      return NextResponse.json({ message: 'El título y el texto son obligatorios.' }, { status: 400 });
    }

    const db = await readDatabase();
    const newItem = {
      id: nextId(db.usina),
      titulo,
      texto,
      imageUrl: imageUrl || '',
      createdAt: Date.now()
    };
    db.usina.push(newItem);
    await writeDatabase(db);
    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    console.error('Error creando contenido de usina:', error);
    return NextResponse.json({ message: 'No se pudo crear el contenido.' }, { status: 500 });
  }
}
