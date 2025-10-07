import crypto from 'crypto';

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = 4 - (normalized.length % 4 || 4);
  return Buffer.from(normalized + '='.repeat(padding % 4), 'base64').toString();
}

export function signJwt(payload, secret, options = {}) {
  if (!secret) {
    throw new Error('JWT secret is not configured');
  }

  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const exp = options.expiresIn
    ? now + options.expiresIn
    : options.expiresAt
    ? options.expiresAt
    : now + 60 * 60; // default 1 hour

  const tokenPayload = { ...payload, iat: now, exp };

  const headerPart = base64UrlEncode(JSON.stringify(header));
  const payloadPart = base64UrlEncode(JSON.stringify(tokenPayload));
  const data = `${headerPart}.${payloadPart}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${data}.${signature}`;
}

export function verifyJwt(token, secret) {
  if (!secret) {
    throw new Error('JWT secret is not configured');
  }

  const [headerPart, payloadPart, signaturePart] = token.split('.');
  if (!headerPart || !payloadPart || !signaturePart) {
    throw new Error('Invalid token structure');
  }

  const data = `${headerPart}.${payloadPart}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (expectedSignature !== signaturePart) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(base64UrlDecode(payloadPart));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) {
    throw new Error('Token expired');
  }

  return payload;
}
