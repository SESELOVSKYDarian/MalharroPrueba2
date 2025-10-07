import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../_lib/auth';

export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }
  return NextResponse.json({ user });
}
