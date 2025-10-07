import { NextResponse } from 'next/server';
import { readDatabase, writeDatabase, nextId } from '../../_lib/db';
import { hashPassword, signToken } from '../../_lib/auth';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateUsername(username) {
  return /^[A-Za-z][A-Za-z0-9._-]{2,19}$/.test(username);
}

function validatePassword(password) {
  return /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json({ message: 'Todos los campos son obligatorios.' }, { status: 400 });
    }

    if (!validateUsername(username)) {
      return NextResponse.json({ message: 'El nombre de usuario no es válido.' }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ message: 'El correo electrónico no es válido.' }, { status: 400 });
    }

    if (!validatePassword(password)) {
      return NextResponse.json({ message: 'La contraseña debe tener al menos 6 caracteres, incluyendo letras y números.' }, { status: 400 });
    }

    const db = await readDatabase();

    if (db.users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json({ message: 'El correo electrónico ya está registrado.' }, { status: 409 });
    }

    if (db.users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
      return NextResponse.json({ message: 'El nombre de usuario ya está en uso.' }, { status: 409 });
    }

    const id = nextId(db.users);
    const passwordHash = hashPassword(password);
    const role = db.users.length === 0 ? 'ADMIN' : 'USER';
    const newUser = {
      id,
      username,
      email,
      passwordHash,
      role,
      googleId: null,
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
    console.error('Error en registro:', error);
    return NextResponse.json({ message: 'No se pudo completar el registro.' }, { status: 500 });
  }
}
