import { NextResponse } from 'next/server';
import { readDatabase, writeDatabase, nextId } from '../_lib/db';
import { requireAdmin } from '../_lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await readDatabase();
    return NextResponse.json({ items: db.agenda });
  } catch (error) {
    console.error('Error obteniendo agenda:', error);
    return NextResponse.json({ message: 'No se pudo obtener la agenda.' }, { status: 500 });
  }
}

export async function POST(request) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const { titulo, descripcion, fecha, imageUrl } = await request.json();
    if (!titulo || !fecha) {
      return NextResponse.json({ message: 'El título y la fecha son obligatorios.' }, { status: 400 });
    }

    const db = await readDatabase();
    const newEvent = {
      id: nextId(db.agenda),
      titulo,
      descripcion: descripcion || '',
      fecha,
      imageUrl: imageUrl || '',
      createdAt: Date.now()
    };
    db.agenda.push(newEvent);
    await writeDatabase(db);
    return NextResponse.json({ item: newEvent }, { status: 201 });
  } catch (error) {
    console.error('Error creando agenda:', error);
    return NextResponse.json({ message: 'No se pudo crear el evento.' }, { status: 500 });
  }
}
