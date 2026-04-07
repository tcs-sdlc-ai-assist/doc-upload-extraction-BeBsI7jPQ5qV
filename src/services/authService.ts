import { AuthResult, Session, User } from '../types';
import { STORAGE_KEYS } from '../constants';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/storage';
import { hashPassword } from '../utils/encryption';

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function validateUsername(username: string): string | null {
  if (!username || username.trim().length === 0) {
    return 'Username is required.';
  }
  if (username.length < 3) {
    return 'Username must be at least 3 characters.';
  }
  if (username.length > 32) {
    return 'Username must be no more than 32 characters.';
  }
  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    return 'Username must contain only alphanumeric characters.';
  }
  return null;
}

function validatePassword(password: string): string | null {
  if (!password || password.length === 0) {
    return 'Password is required.';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  if (password.length > 64) {
    return 'Password must be no more than 64 characters.';
  }
  return null;
}

export async function signup(username: string, password: string): Promise<AuthResult> {
  try {
    const usernameError = validateUsername(username);
    if (usernameError) {
      return { success: false, error: usernameError };
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return { success: false, error: passwordError };
    }

    const users = await getStorageItem<User[]>(STORAGE_KEYS.USERS);
    const existingUsers = users ?? [];

    const userExists = existingUsers.some(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
    if (userExists) {
      return { success: false, error: 'Username is already taken.' };
    }

    const passwordHash = await hashPassword(password);

    const newUser: User = {
      username,
      passwordHash,
    };

    existingUsers.push(newUser);
    await setStorageItem(STORAGE_KEYS.USERS, existingUsers);

    const session: Session = {
      username,
      token: generateToken(),
      timestamp: Date.now(),
    };

    await setStorageItem(STORAGE_KEYS.SESSION, session);

    return { success: true, session };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred during signup.';
    return { success: false, error: `Storage error: ${message}` };
  }
}

export async function login(username: string, password: string): Promise<AuthResult> {
  try {
    const usernameError = validateUsername(username);
    if (usernameError) {
      return { success: false, error: usernameError };
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return { success: false, error: passwordError };
    }

    const users = await getStorageItem<User[]>(STORAGE_KEYS.USERS);
    const existingUsers = users ?? [];

    const user = existingUsers.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );

    if (!user) {
      return { success: false, error: 'Invalid username or password.' };
    }

    const passwordHash = await hashPassword(password);

    if (user.passwordHash !== passwordHash) {
      return { success: false, error: 'Invalid username or password.' };
    }

    const session: Session = {
      username: user.username,
      token: generateToken(),
      timestamp: Date.now(),
    };

    await setStorageItem(STORAGE_KEYS.SESSION, session);

    return { success: true, session };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred during login.';
    return { success: false, error: `Storage error: ${message}` };
  }
}

export async function logout(): Promise<void> {
  removeStorageItem(STORAGE_KEYS.SESSION);
}

export async function getSession(): Promise<Session | null> {
  try {
    const session = await getStorageItem<Session>(STORAGE_KEYS.SESSION);
    return session;
  } catch {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}