import { NextResponse } from 'next/server';
import { readDatabase, writeDatabase } from '../../_lib/db';
import { requireAdmin } from '../../_lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  try {
    const id = Number(params.id);
    const { contenido, seccion } = await request.json();
    const db = await readDatabase();
    const index = db.textos.findIndex((item) => item.id === id);
    if (index === -1) {
      return NextResponse.json({ message: 'Texto no encontrado.' }, { status: 404 });
    }

    if (typeof contenido === 'string') {
      db.textos[index].contenido = contenido;
    }
    if (typeof seccion === 'string') {
      db.textos[index].seccion = seccion;
    }
    db.textos[index].updatedAt = Date.now();
    await writeDatabase(db);
    return NextResponse.json({ item: db.textos[index] });
  } catch (error) {
    console.error('Error actualizando texto:', error);
    return NextResponse.json({ message: 'No se pudo actualizar el texto.' }, { status: 500 });
  }
}
