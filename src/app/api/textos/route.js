import { NextResponse } from 'next/server';
import { readDatabase } from '../_lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const seccion = searchParams.get('seccion');
    const db = await readDatabase();
    if (seccion) {
      const item = db.textos.find((t) => t.seccion === seccion);
      return NextResponse.json({ item: item || null });
    }
    return NextResponse.json({ items: db.textos });
  } catch (error) {
    console.error('Error obteniendo textos:', error);
    return NextResponse.json({ message: 'No se pudieron obtener los textos.' }, { status: 500 });
  }
}
