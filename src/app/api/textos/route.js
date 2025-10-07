import { NextResponse } from 'next/server';
import { readDatabase, writeDatabase, nextId } from '../_lib/db';
import { requireAdminAuth } from '../_lib/auth-guard';

function normalizeSection(section) {
  return section?.toString().trim().toLowerCase();
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const sectionQuery = normalizeSection(url.searchParams.get('seccion'));
    const db = await readDatabase();
    const collection = db.textos_generales ?? [];

    if (sectionQuery) {
      const match = collection.find(
        (item) => normalizeSection(item.seccion) === sectionQuery
      );
      if (!match) {
        return NextResponse.json(null, { status: 404 });
      }
      return NextResponse.json(match);
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error('Error al obtener textos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    requireAdminAuth(request);
    const payload = await request.json();
    const section = normalizeSection(payload.seccion);

    if (!section) {
      return NextResponse.json({ error: 'La sección es obligatoria' }, { status: 400 });
    }

    const db = await readDatabase();
    const collection = db.textos_generales ?? [];

    const exists = collection.some(
      (item) => normalizeSection(item.seccion) === section
    );

    if (exists) {
      return NextResponse.json({ error: 'La sección ya existe' }, { status: 409 });
    }

    const newItem = {
      id: nextId(collection),
      seccion: section,
      contenido: payload.contenido ?? ''
    };

    collection.push(newItem);
    db.textos_generales = collection;
    await writeDatabase(db);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    console.error('Error al crear texto:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
