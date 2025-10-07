import { NextResponse } from 'next/server';
import { readDatabase, writeDatabase } from '../../_lib/db';
import { requireAdminAuth } from '../../_lib/auth-guard';

function findIndex(collection, id) {
  return collection.findIndex((item) => Number(item.id) === Number(id));
}

function normalizeSection(section) {
  return section?.toString().trim().toLowerCase();
}

export async function PUT(request, { params }) {
  try {
    requireAdminAuth(request);
    const { id } = params;
    const payload = await request.json();

    const db = await readDatabase();
    const collection = db.textos_generales ?? [];
    const index = findIndex(collection, id);

    if (index === -1) {
      return NextResponse.json({ error: 'Elemento no encontrado' }, { status: 404 });
    }

    const updatedSection = payload.seccion
      ? normalizeSection(payload.seccion)
      : collection[index].seccion;

    if (updatedSection !== collection[index].seccion) {
      const duplicated = collection.some(
        (item, itemIndex) =>
          itemIndex !== index && normalizeSection(item.seccion) === updatedSection
      );
      if (duplicated) {
        return NextResponse.json({ error: 'La sección ya existe' }, { status: 409 });
      }
    }

    collection[index] = {
      ...collection[index],
      seccion: updatedSection,
      contenido: payload.contenido ?? collection[index].contenido,
    };

    db.textos_generales = collection;
    await writeDatabase(db);

    return NextResponse.json(collection[index]);
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    console.error('Error al actualizar texto:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    requireAdminAuth(request);
    const { id } = params;

    const db = await readDatabase();
    const collection = db.textos_generales ?? [];
    const index = findIndex(collection, id);

    if (index === -1) {
      return NextResponse.json({ error: 'Elemento no encontrado' }, { status: 404 });
    }

    const [removed] = collection.splice(index, 1);
    db.textos_generales = collection;
    await writeDatabase(db);

    return NextResponse.json(removed);
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    console.error('Error al eliminar texto:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
