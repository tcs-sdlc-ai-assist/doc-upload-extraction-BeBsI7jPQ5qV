import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  encryptData,
  decryptData,
  deriveKey,
  generateIV,
  hashPassword,
} from '../encryption';

describe('encryption utility', () => {
  describe('encryptData', () => {
    it('should encrypt a string and return a base64-encoded result', async () => {
      const plaintext = 'Hello, World!';
      const encrypted = await encryptData(plaintext, 'test-key');

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
      // Result should be different from the plaintext
      expect(encrypted).not.toBe(plaintext);
    });

    it('should produce different ciphertexts for the same plaintext (due to random IV)', async () => {
      const plaintext = 'Same input text';
      const key = 'test-key-deterministic';

      const encrypted1 = await encryptData(plaintext, key);
      const encrypted2 = await encryptData(plaintext, key);

      // Due to random IV, the two encryptions should differ
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should encrypt an empty string without error', async () => {
      const encrypted = await encryptData('', 'test-key');
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
    });

    it('should encrypt a long string', async () => {
      const longText = 'A'.repeat(10000);
      const encrypted = await encryptData(longText, 'test-key');

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
    });

    it('should encrypt unicode content', async () => {
      const unicodeText = '日本語テスト 🎉 émojis and spëcial chars';
      const encrypted = await encryptData(unicodeText, 'test-key');

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
    });

    it('should use default key when no key is provided', async () => {
      const plaintext = 'test data';
      const encrypted = await encryptData(plaintext);

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
    });
  });

  describe('decryptData', () => {
    it('should decrypt data back to the original plaintext', async () => {
      const plaintext = 'Hello, World!';
      const key = 'test-key';

      const encrypted = await encryptData(plaintext, key);
      const decrypted = await decryptData(encrypted, key);

      expect(decrypted).toBe(plaintext);
    });

    it('should correctly round-trip an empty string', async () => {
      const key = 'test-key';
      const encrypted = await encryptData('', key);
      const decrypted = await decryptData(encrypted, key);

      expect(decrypted).toBe('');
    });

    it('should correctly round-trip unicode content', async () => {
      const unicodeText = '日本語テスト 🎉 émojis and spëcial chars';
      const key = 'unicode-key';

      const encrypted = await encryptData(unicodeText, key);
      const decrypted = await decryptData(encrypted, key);

      expect(decrypted).toBe(unicodeText);
    });

    it('should correctly round-trip a long string', async () => {
      const longText = 'B'.repeat(10000);
      const key = 'long-key';

      const encrypted = await encryptData(longText, key);
      const decrypted = await decryptData(encrypted, key);

      expect(decrypted).toBe(longText);
    });

    it('should correctly round-trip JSON data', async () => {
      const jsonData = JSON.stringify({ username: 'testuser', token: 'abc123', nested: { value: 42 } });
      const key = 'json-key';

      const encrypted = await encryptData(jsonData, key);
      const decrypted = await decryptData(encrypted, key);

      expect(decrypted).toBe(jsonData);
      expect(JSON.parse(decrypted)).toEqual(JSON.parse(jsonData));
    });

    it('should fail to decrypt with a wrong key', async () => {
      const plaintext = 'Secret message';
      const encrypted = await encryptData(plaintext, 'correct-key');

      await expect(decryptData(encrypted, 'wrong-key')).rejects.toThrow('Decryption failed');
    });

    it('should fail to decrypt corrupted data', async () => {
      const corruptedData = 'dGhpcyBpcyBub3QgdmFsaWQgZW5jcnlwdGVkIGRhdGE=';

      await expect(decryptData(corruptedData, 'any-key')).rejects.toThrow();
    });

    it('should fail to decrypt an invalid base64 string gracefully', async () => {
      await expect(decryptData('!!!not-base64!!!', 'key')).rejects.toThrow();
    });

    it('should use default key when no key is provided for decryption', async () => {
      const plaintext = 'default key test';
      const encrypted = await encryptData(plaintext);
      const decrypted = await decryptData(encrypted);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe('deriveKey', () => {
    it('should derive a CryptoKey from a password string', async () => {
      const key = await deriveKey('my-password');

      expect(key).toBeDefined();
      expect(key.type).toBe('secret');
      expect(key.algorithm).toBeDefined();
    });

    it('should derive a key that supports encrypt and decrypt', async () => {
      const key = await deriveKey('my-password');

      expect(key.usages).toContain('encrypt');
      expect(key.usages).toContain('decrypt');
    });

    it('should derive the same key for the same password', async () => {
      const key1 = await deriveKey('same-password');
      const key2 = await deriveKey('same-password');

      // Export both keys to compare
      const raw1 = await crypto.subtle.exportKey('raw', key1).catch(() => null);
      const raw2 = await crypto.subtle.exportKey('raw', key2).catch(() => null);

      // Keys derived with extractable=false can't be exported, so we test by
      // encrypting with one and decrypting with the other
      const iv = generateIV();
      const data = new TextEncoder().encode('test');

      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key1,
        data
      );

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key2,
        encrypted
      );

      expect(new TextDecoder().decode(decrypted)).toBe('test');
    });

    it('should derive different keys for different passwords', async () => {
      const key1 = await deriveKey('password-one');
      const key2 = await deriveKey('password-two');

      const iv = generateIV();
      const data = new TextEncoder().encode('test');

      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key1,
        data
      );

      // Decrypting with a different key should fail
      await expect(
        crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key2, encrypted)
      ).rejects.toThrow();
    });

    it('should handle an empty password string', async () => {
      const key = await deriveKey('');

      expect(key).toBeDefined();
      expect(key.type).toBe('secret');
    });
  });

  describe('generateIV', () => {
    it('should return a Uint8Array of length 12', () => {
      const iv = generateIV();

      expect(iv).toBeInstanceOf(Uint8Array);
      expect(iv.length).toBe(12);
    });

    it('should generate different IVs on each call', () => {
      const iv1 = generateIV();
      const iv2 = generateIV();

      // Convert to strings for comparison
      const str1 = Array.from(iv1).join(',');
      const str2 = Array.from(iv2).join(',');

      expect(str1).not.toBe(str2);
    });

    it('should contain non-zero values (statistically)', () => {
      // Generate multiple IVs and check that at least some bytes are non-zero
      const iv = generateIV();
      const hasNonZero = Array.from(iv).some((byte) => byte !== 0);

      expect(hasNonZero).toBe(true);
    });
  });

  describe('hashPassword', () => {
    it('should return a hex string', async () => {
      const hash = await hashPassword('mypassword');

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      // SHA-256 produces 64 hex characters
      expect(hash.length).toBe(64);
      expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
    });

    it('should produce the same hash for the same password', async () => {
      const hash1 = await hashPassword('consistent');
      const hash2 = await hashPassword('consistent');

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different passwords', async () => {
      const hash1 = await hashPassword('password1');
      const hash2 = await hashPassword('password2');

      expect(hash1).not.toBe(hash2);
    });

    it('should hash an empty string', async () => {
      const hash = await hashPassword('');

      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
      expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
    });

    it('should hash unicode passwords', async () => {
      const hash = await hashPassword('パスワード🔑');

      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
      expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
    });

    it('should be case-sensitive', async () => {
      const hashLower = await hashPassword('password');
      const hashUpper = await hashPassword('Password');

      expect(hashLower).not.toBe(hashUpper);
    });
  });

  describe('encrypt/decrypt integration', () => {
    it('should handle multiple sequential encrypt/decrypt operations', async () => {
      const key = 'integration-key';
      const messages = ['first', 'second', 'third', 'fourth'];

      for (const msg of messages) {
        const encrypted = await encryptData(msg, key);
        const decrypted = await decryptData(encrypted, key);
        expect(decrypted).toBe(msg);
      }
    });

    it('should handle special characters in the key', async () => {
      const key = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const plaintext = 'test with special key';

      const encrypted = await encryptData(plaintext, key);
      const decrypted = await decryptData(encrypted, key);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle newlines and tabs in plaintext', async () => {
      const plaintext = 'line1\nline2\ttabbed\r\nwindows-line';
      const key = 'whitespace-key';

      const encrypted = await encryptData(plaintext, key);
      const decrypted = await decryptData(encrypted, key);

      expect(decrypted).toBe(plaintext);
    });
  });
});