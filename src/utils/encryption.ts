import { ENCRYPTION_CONFIG } from '../constants';

const DEFAULT_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'doc-upload-default-key-change-in-production';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.IV_LENGTH));
}

export async function deriveKey(password: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('doc-upload-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: ENCRYPTION_CONFIG.ALGORITHM,
      length: ENCRYPTION_CONFIG.KEY_LENGTH,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(data: string, key?: string): Promise<string> {
  try {
    const password = key || DEFAULT_KEY;
    const cryptoKey = await deriveKey(password);
    const iv = generateIV();
    const encodedData = encoder.encode(data);

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: ENCRYPTION_CONFIG.ALGORITHM,
        iv,
      },
      cryptoKey,
      encodedData
    );

    const encryptedArray = new Uint8Array(encryptedBuffer);
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv, 0);
    combined.set(encryptedArray, iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    throw new Error(
      `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function decryptData(encryptedData: string, key?: string): Promise<string> {
  try {
    const password = key || DEFAULT_KEY;
    const cryptoKey = await deriveKey(password);

    const combined = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, ENCRYPTION_CONFIG.IV_LENGTH);
    const data = combined.slice(ENCRYPTION_CONFIG.IV_LENGTH);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_CONFIG.ALGORITHM,
        iv,
      },
      cryptoKey,
      data
    );

    return decoder.decode(decryptedBuffer);
  } catch (error) {
    throw new Error(
      `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function hashPassword(password: string): Promise<string> {
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}