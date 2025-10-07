import { NextResponse } from 'next/server';
import { readDatabase, writeDatabase } from '../../_lib/db';
import { requireAdminAuth } from '../../_lib/auth-guard';

function findIndex(collection, id) {
  return collection.findIndex((item) => Number(item.id) === Number(id));
}

export async function PUT(request, { params }) {
  try {
    requireAdminAuth(request);
    const { id } = params;
    const payload = await request.json();

    const db = await readDatabase();
    const collection = db.slider_images ?? [];
    const index = findIndex(collection, id);

    if (index === -1) {
      return NextResponse.json({ error: 'Elemento no encontrado' }, { status: 404 });
    }

    collection[index] = {
      ...collection[index],
      imageUrl: payload.imageUrl ?? collection[index].imageUrl,
      captionText: payload.captionText ?? collection[index].captionText,
    };

    db.slider_images = collection;
    await writeDatabase(db);

    return NextResponse.json(collection[index]);
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    console.error('Error al actualizar slide:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    requireAdminAuth(request);
    const { id } = params;

    const db = await readDatabase();
    const collection = db.slider_images ?? [];
    const index = findIndex(collection, id);

    if (index === -1) {
      return NextResponse.json({ error: 'Elemento no encontrado' }, { status: 404 });
    }

    const [removed] = collection.splice(index, 1);
    db.slider_images = collection;
    await writeDatabase(db);

    return NextResponse.json(removed);
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    console.error('Error al eliminar slide:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
