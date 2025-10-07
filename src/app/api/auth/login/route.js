import { NextResponse } from 'next/server';
import { readDatabase } from '../../_lib/db';
import { verifyPassword, signToken } from '../../_lib/auth';

export async function POST(request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ message: 'Credenciales incompletas.' }, { status: 400 });
    }

    const db = await readDatabase();
    const normalized = identifier.toLowerCase();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === normalized || u.username.toLowerCase() === normalized
    );

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ message: 'Usuario o contraseña incorrectos.' }, { status: 401 });
    }

    const token = signToken({ sub: user.id, email: user.email, role: user.role, nombre: user.username });

    return NextResponse.json({
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json({ message: 'No se pudo iniciar sesión.' }, { status: 500 });
  }
}
