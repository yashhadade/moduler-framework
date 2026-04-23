import crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12;

/** Get encryption key from env. Must be 32-byte hex string (64 chars) or 32-char utf8 string. */
const getKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length < 16) {
    throw new Error('ENCRYPTION_KEY must be set in .env (16+ chars or 64-char hex for 256-bit)');
  }
  if (/^[0-9a-fA-F]{64}$/.test(key)) {
    return Buffer.from(key, 'hex');
  }
  return crypto.createHash('sha256').update(key).digest();
};

let _key: Buffer | null = null;
const key = (): Buffer => {
  if (!_key) _key = getKey();
  return _key;
};

/**
 * Encrypt a string. Returns base64-encoded format: iv:authTag:encrypted
 */
export const encrypt = (plainText: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, key(), iv);
  let encrypted = cipher.update(plainText, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
};

/**
 * Decrypt a string. Input format: iv:authTag:encrypted (base64)
 */
export const decrypt = (encryptedPayload: string): string => {
  if (!encryptedPayload || typeof encryptedPayload !== 'string') {
    return typeof encryptedPayload === 'string' ? encryptedPayload : '';
  }
  const parts = encryptedPayload.split(':');
  const [ivB64, tagB64, cipherB64] = parts;
  if (parts.length !== 3 || !ivB64 || !tagB64 || !cipherB64) {
    return encryptedPayload as string;
  }
  try {
    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(tagB64, 'base64');
    const decipher = crypto.createDecipheriv(ALGO, key(), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(cipherB64, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return encryptedPayload;
  }
};

/** Check if a value looks like our encrypted format (iv:authTag:encrypted) */
export const isEncrypted = (value: unknown): value is string =>
  typeof value === 'string' && /^[A-Za-z0-9+/]+=*:[A-Za-z0-9+/]+=*:.+$/.test(value);
