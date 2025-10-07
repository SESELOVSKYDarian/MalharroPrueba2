import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { readDatabase } from './db';

const DEFAULT_EXP_SECONDS = 60 * 60 * 8; // 8 horas

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash) return false;
  const [salt, originalHash] = storedHash.split(':');
  if (!salt || !originalHash) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
}

export function signToken(payload, { expiresIn = DEFAULT_EXP_SECONDS } = {}) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresIn };
  const secret = process.env.AUTH_SECRET || 'local-secret';

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(body));
  const data = `${headerEncoded}.${payloadEncoded}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64url');

  return `${data}.${signature}`;
}

export function verifyToken(token) {
  if (!token) throw new Error('Token ausente');
  const secret = process.env.AUTH_SECRET || 'local-secret';
  const [headerEncoded, payloadEncoded, signature] = token.split('.');
  if (!headerEncoded || !payloadEncoded || !signature) {
    throw new Error('Token malformado');
  }
  const data = `${headerEncoded}.${payloadEncoded}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64url');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    throw new Error('Firma inválida');
  }

  const payload = JSON.parse(base64UrlDecode(payloadEncoded));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error('Token expirado');
  }
  return payload;
}

export async function requireAdmin(request) {
  try {
    const token = getTokenFromRequest(request);
    const payload = verifyToken(token);
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }
    return { id: payload.sub, role: payload.role, email: payload.email, nombre: payload.nombre };
  } catch (error) {
    return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
  }
}

export function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader) throw new Error('Sin token');
  const [, token] = authHeader.split(' ');
  if (!token) throw new Error('Token ausente');
  return token;
}

export async function getUserFromRequest(request) {
  try {
    const token = getTokenFromRequest(request);
    const payload = verifyToken(token);
    const db = await readDatabase();
    const user = db.users.find((u) => u.id === payload.sub);
    if (!user) throw new Error('Usuario no encontrado');
    return { id: user.id, email: user.email, nombre: user.username, role: user.role };
  } catch (error) {
    return null;
  }
}
