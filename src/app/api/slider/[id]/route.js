import { NextResponse } from 'next/server';
import { readDatabase, writeDatabase } from '../../_lib/db';
import { requireAdmin } from '../../_lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const id = Number(params.id);
    const changes = await request.json();
    const db = await readDatabase();
    const index = db.slider.findIndex((item) => item.id === id);
    if (index === -1) {
      return NextResponse.json({ message: 'Imagen no encontrada.' }, { status: 404 });
    }
    db.slider[index] = { ...db.slider[index], ...changes, id };
    await writeDatabase(db);
    return NextResponse.json({ item: db.slider[index] });
  } catch (error) {
    console.error('Error actualizando slider:', error);
    return NextResponse.json({ message: 'No se pudo actualizar la imagen.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const id = Number(params.id);
    const db = await readDatabase();
    const exists = db.slider.some((item) => item.id === id);
    if (!exists) {
      return NextResponse.json({ message: 'Imagen no encontrada.' }, { status: 404 });
    }
    db.slider = db.slider.filter((item) => item.id !== id);
    await writeDatabase(db);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error eliminando slider:', error);
    return NextResponse.json({ message: 'No se pudo eliminar la imagen.' }, { status: 500 });
  }
}
