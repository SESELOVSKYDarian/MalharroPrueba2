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
    const index = db.usina.findIndex((item) => item.id === id);
    if (index === -1) {
      return NextResponse.json({ message: 'Registro no encontrado.' }, { status: 404 });
    }
    db.usina[index] = { ...db.usina[index], ...changes, id };
    await writeDatabase(db);
    return NextResponse.json({ item: db.usina[index] });
  } catch (error) {
    console.error('Error actualizando usina:', error);
    return NextResponse.json({ message: 'No se pudo actualizar el registro.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const id = Number(params.id);
    const db = await readDatabase();
    const exists = db.usina.some((item) => item.id === id);
    if (!exists) {
      return NextResponse.json({ message: 'Registro no encontrado.' }, { status: 404 });
    }
    db.usina = db.usina.filter((item) => item.id !== id);
    await writeDatabase(db);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error eliminando usina:', error);
    return NextResponse.json({ message: 'No se pudo eliminar el registro.' }, { status: 500 });
  }
}
