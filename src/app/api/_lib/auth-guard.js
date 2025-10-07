import { NextResponse } from 'next/server';
import { verifyJwt } from './jwt';

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function badRequest(message = 'Bad request') {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function internalError(message = 'Internal server error') {
  return NextResponse.json({ error: message }, { status: 500 });
}

export function success(payload, init = {}) {
  return NextResponse.json(payload, init);
}

export function requireEnv(variable, name) {
  if (!variable) {
    throw new Error(`${name} is not configured`);
  }
  return variable;
}

export function extractBearerToken(request) {
  const header = request.headers.get('authorization');
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

export function requireAdminAuth(request) {
  try {
    const token = extractBearerToken(request);
    if (!token) {
      throw new Error('Missing token');
    }

    const secret = requireEnv(process.env.JWT_SECRET, 'JWT_SECRET');
    const payload = verifyJwt(token, secret);

    const adminEmail = requireEnv(process.env.ADMIN_EMAIL, 'ADMIN_EMAIL');
    if (payload.sub?.toLowerCase() !== adminEmail.toLowerCase()) {
      throw new Error('Invalid subject');
    }

    if (payload.role !== 'admin') {
      throw new Error('Invalid role');
    }

    return payload;
  } catch (error) {
    throw Object.assign(new Error('Unauthorized'), { cause: error });
  }
}
