import { NextResponse } from 'next/server';
import { deliverVerificationCode } from '../../_lib/mailer';
import { storeVerificationCode } from '../../_lib/auth-codes';
import { requireEnv } from '../../_lib/auth-guard';

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'El correo es obligatorio' }, { status: 400 });
    }

    const adminEmail = requireEnv(process.env.ADMIN_EMAIL, 'ADMIN_EMAIL');
    if (email.toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json({ error: 'Correo no autorizado' }, { status: 401 });
    }

    const code = generateCode();
    await storeVerificationCode(email, code);
    await deliverVerificationCode(email, code);

    return NextResponse.json({ message: 'Código enviado' });
  } catch (error) {
    console.error('Error al solicitar código:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
