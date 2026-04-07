import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as authService from '../authService';
import { STORAGE_KEYS } from '../../constants';

// We need to mock storage and encryption at the module level
// since authService depends on them

// Track localStorage state for our mocks
let mockStorage: Record<string, string> = {};

vi.mock('../../utils/encryption', () => ({
  encryptData: vi.fn(async (data: string) => {
    return `encrypted:${btoa(data)}`;
  }),
  decryptData: vi.fn(async (encryptedData: string) => {
    if (encryptedData.startsWith('encrypted:')) {
      return atob(encryptedData.slice('encrypted:'.length));
    }
    throw new Error('Decryption failed');
  }),
  hashPassword: vi.fn(async (password: string) => {
    // Simple deterministic hash for testing
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `hash_${Math.abs(hash).toString(16)}`;
  }),
  deriveKey: vi.fn(),
  generateIV: vi.fn(),
}));

vi.mock('../../utils/storage', () => ({
  getStorageItem: vi.fn(async (key: string) => {
    const raw = mockStorage[key];
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }),
  setStorageItem: vi.fn(async (key: string, value: unknown) => {
    mockStorage[key] = JSON.stringify(value);
  }),
  removeStorageItem: vi.fn((key: string) => {
    delete mockStorage[key];
  }),
  clearStorage: vi.fn(() => {
    mockStorage = {};
  }),
  isStorageAvailable: vi.fn(() => true),
  getStorageUsage: vi.fn(() => ({ used: 0, available: true })),
}));

describe('authService', () => {
  beforeEach(() => {
    mockStorage = {};
    vi.clearAllMocks();
  });

  describe('signup', () => {
    it('should successfully sign up a new user', async () => {
      const result = await authService.signup('testuser', 'password123');

      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session?.username).toBe('testuser');
      expect(result.session?.token).toBeDefined();
      expect(result.session?.token.length).toBeGreaterThan(0);
      expect(result.session?.timestamp).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should store the user in storage after signup', async () => {
      await authService.signup('alice', 'securepass');

      const storedUsers = JSON.parse(mockStorage[STORAGE_KEYS.USERS]);
      expect(storedUsers).toHaveLength(1);
      expect(storedUsers[0].username).toBe('alice');
      expect(storedUsers[0].passwordHash).toBeDefined();
    });

    it('should store a session after signup', async () => {
      await authService.signup('alice', 'securepass');

      const storedSession = JSON.parse(mockStorage[STORAGE_KEYS.SESSION]);
      expect(storedSession).toBeDefined();
      expect(storedSession.username).toBe('alice');
      expect(storedSession.token).toBeDefined();
    });

    it('should reject signup with duplicate username', async () => {
      await authService.signup('alice', 'password123');
      const result = await authService.signup('alice', 'differentpass');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Username is already taken.');
    });

    it('should reject signup with duplicate username case-insensitively', async () => {
      await authService.signup('Alice', 'password123');
      const result = await authService.signup('alice', 'differentpass');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Username is already taken.');
    });

    it('should reject signup with empty username', async () => {
      const result = await authService.signup('', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject signup with short username', async () => {
      const result = await authService.signup('ab', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('at least 3 characters');
    });

    it('should reject signup with username exceeding max length', async () => {
      const longUsername = 'a'.repeat(33);
      const result = await authService.signup(longUsername, 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('no more than 32 characters');
    });

    it('should reject signup with non-alphanumeric username', async () => {
      const result = await authService.signup('user@name', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('alphanumeric');
    });

    it('should reject signup with empty password', async () => {
      const result = await authService.signup('testuser', '');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject signup with short password', async () => {
      const result = await authService.signup('testuser', '12345');

      expect(result.success).toBe(false);
      expect(result.error).toContain('at least 6 characters');
    });

    it('should reject signup with password exceeding max length', async () => {
      const longPassword = 'a'.repeat(65);
      const result = await authService.signup('testuser', longPassword);

      expect(result.success).toBe(false);
      expect(result.error).toContain('no more than 64 characters');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Create a user to log in with
      await authService.signup('testuser', 'password123');
      // Clear the session so we can test login independently
      delete mockStorage[STORAGE_KEYS.SESSION];
    });

    it('should successfully log in with valid credentials', async () => {
      const result = await authService.login('testuser', 'password123');

      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session?.username).toBe('testuser');
      expect(result.session?.token).toBeDefined();
      expect(result.session?.timestamp).toBeDefined();
    });

    it('should create a session on successful login', async () => {
      await authService.login('testuser', 'password123');

      const storedSession = JSON.parse(mockStorage[STORAGE_KEYS.SESSION]);
      expect(storedSession).toBeDefined();
      expect(storedSession.username).toBe('testuser');
    });

    it('should reject login with wrong password', async () => {
      const result = await authService.login('testuser', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid username or password.');
    });

    it('should reject login with non-existent username', async () => {
      const result = await authService.login('nonexistent', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid username or password.');
    });

    it('should reject login with empty username', async () => {
      const result = await authService.login('', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject login with empty password', async () => {
      const result = await authService.login('testuser', '');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject login with short password', async () => {
      const result = await authService.login('testuser', '12345');

      expect(result.success).toBe(false);
      expect(result.error).toContain('at least 6 characters');
    });

    it('should handle case-insensitive username matching on login', async () => {
      const result = await authService.login('TestUser', 'password123');

      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
    });
  });

  describe('logout', () => {
    it('should remove the session on logout', async () => {
      await authService.signup('testuser', 'password123');

      expect(mockStorage[STORAGE_KEYS.SESSION]).toBeDefined();

      await authService.logout();

      expect(mockStorage[STORAGE_KEYS.SESSION]).toBeUndefined();
    });

    it('should not throw when logging out without a session', async () => {
      await expect(authService.logout()).resolves.not.toThrow();
    });
  });

  describe('getSession', () => {
    it('should return the session when one exists', async () => {
      await authService.signup('testuser', 'password123');

      const session = await authService.getSession();

      expect(session).toBeDefined();
      expect(session?.username).toBe('testuser');
      expect(session?.token).toBeDefined();
    });

    it('should return null when no session exists', async () => {
      const session = await authService.getSession();

      expect(session).toBeNull();
    });

    it('should return null after logout', async () => {
      await authService.signup('testuser', 'password123');
      await authService.logout();

      const session = await authService.getSession();

      expect(session).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when a session exists', async () => {
      await authService.signup('testuser', 'password123');

      const authenticated = await authService.isAuthenticated();

      expect(authenticated).toBe(true);
    });

    it('should return false when no session exists', async () => {
      const authenticated = await authService.isAuthenticated();

      expect(authenticated).toBe(false);
    });

    it('should return false after logout', async () => {
      await authService.signup('testuser', 'password123');
      await authService.logout();

      const authenticated = await authService.isAuthenticated();

      expect(authenticated).toBe(false);
    });
  });

  describe('multiple users', () => {
    it('should allow multiple unique users to sign up', async () => {
      const result1 = await authService.signup('user1', 'password123');
      const result2 = await authService.signup('user2', 'password456');

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      const storedUsers = JSON.parse(mockStorage[STORAGE_KEYS.USERS]);
      expect(storedUsers).toHaveLength(2);
    });

    it('should allow different users to log in', async () => {
      await authService.signup('user1', 'password123');
      await authService.signup('user2', 'password456');

      const loginResult = await authService.login('user1', 'password123');
      expect(loginResult.success).toBe(true);
      expect(loginResult.session?.username).toBe('user1');
    });
  });

  describe('error handling', () => {
    it('should handle storage errors gracefully during signup', async () => {
      const { setStorageItem } = await import('../../utils/storage');
      vi.mocked(setStorageItem).mockRejectedValueOnce(new Error('Storage quota exceeded'));

      const result = await authService.signup('testuser', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Storage error');
    });

    it('should handle storage errors gracefully during login', async () => {
      const { getStorageItem } = await import('../../utils/storage');
      vi.mocked(getStorageItem).mockRejectedValueOnce(new Error('Storage read error'));

      const result = await authService.login('testuser', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Storage error');
    });
  });
});