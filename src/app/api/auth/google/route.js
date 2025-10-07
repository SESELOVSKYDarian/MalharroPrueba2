import { NextResponse } from 'next/server';
import { readDatabase, writeDatabase, nextId } from '../../_lib/db';
import { hashPassword, signToken } from '../../_lib/auth';

function createUsernameFromName(name, existingUsers) {
  const base = name
    .normalize('NFD')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '.')
    .toLowerCase() || 'usuario';
  let username = base;
  let counter = 1;
  const taken = new Set(existingUsers.map((u) => u.username.toLowerCase()));
  while (taken.has(username)) {
    username = `${base}${counter}`;
    counter += 1;
  }
  return username;
}

export async function POST(request) {
  try {
    const { email, name, googleId } = await request.json();
    if (!email || !name || !googleId) {
      return NextResponse.json({ message: 'Datos de Google incompletos.' }, { status: 400 });
    }

    const db = await readDatabase();
    const normalizedEmail = email.toLowerCase();
    const existingUser = db.users.find((user) => user.email.toLowerCase() === normalizedEmail);

    if (existingUser) {
      if (existingUser.googleId && existingUser.googleId !== googleId) {
        return NextResponse.json({ message: 'El correo ya está registrado con otro proveedor.' }, { status: 409 });
      }

      if (!existingUser.googleId) {
        existingUser.googleId = googleId;
        await writeDatabase(db);
      }

      const token = signToken({
        sub: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
        nombre: existingUser.username
      });

      return NextResponse.json({
        user: {
          id: existingUser.id,
          username: existingUser.username,
          email: existingUser.email,
          role: existingUser.role
        },
        token
      });
    }

    const id = nextId(db.users);
    const username = createUsernameFromName(name, db.users);
    const passwordHash = hashPassword(googleId);
    const role = db.users.length === 0 ? 'ADMIN' : 'USER';

    const newUser = {
      id,
      username,
      email,
      passwordHash,
      role,
      googleId,
      createdAt: Date.now()
    };

    db.users.push(newUser);
    await writeDatabase(db);

    const token = signToken({ sub: id, email, role, nombre: username });

    return NextResponse.json({
      user: { id, username, email, role },
      token
    });
  } catch (error) {
    console.error('Error en login con Google:', error);
    return NextResponse.json({ message: 'No se pudo autenticar con Google.' }, { status: 500 });
  }
}
