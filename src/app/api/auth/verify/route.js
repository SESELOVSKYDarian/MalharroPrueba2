import { NextResponse } from 'next/server';
import { validateVerificationCode } from '../../_lib/auth-codes';
import { requireEnv } from '../../_lib/auth-guard';
import { signJwt } from '../../_lib/jwt';

export async function POST(request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Correo y código son obligatorios' },
        { status: 400 }
      );
    }

    const adminEmail = requireEnv(process.env.ADMIN_EMAIL, 'ADMIN_EMAIL');
    if (email.toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json({ error: 'Correo no autorizado' }, { status: 401 });
    }

    const isValid = await validateVerificationCode(email, code);
    if (!isValid) {
      return NextResponse.json({ error: 'Código inválido o expirado' }, { status: 401 });
    }

    const secret = requireEnv(process.env.JWT_SECRET, 'JWT_SECRET');
    const token = signJwt({ sub: email.toLowerCase(), role: 'admin' }, secret, {
      expiresIn: 60 * 60 * 6 // 6 horas
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error al verificar código:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
