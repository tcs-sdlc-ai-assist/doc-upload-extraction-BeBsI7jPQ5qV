import { encryptData, decryptData } from './encryption';
import { STORAGE_KEYS } from '../constants';

export async function getStorageItem<T>(key: string): Promise<T | null> {
  try {
    if (!isStorageAvailable()) {
      console.warn('localStorage is not available');
      return null;
    }

    const encryptedData = localStorage.getItem(key);
    if (encryptedData === null) {
      return null;
    }

    try {
      const decryptedString = await decryptData(encryptedData);
      return JSON.parse(decryptedString) as T;
    } catch (decryptError) {
      // If decryption fails, the data may be corrupted or the key changed.
      // Remove the corrupted entry and return null for error recovery.
      console.warn(`Failed to decrypt data for key "${key}". Removing corrupted entry.`, decryptError);
      localStorage.removeItem(key);
      return null;
    }
  } catch (error) {
    console.error(`Error reading from storage for key "${key}":`, error);
    return null;
  }
}

export async function setStorageItem<T>(key: string, value: T): Promise<void> {
  try {
    if (!isStorageAvailable()) {
      throw new Error('localStorage is not available');
    }

    const jsonString = JSON.stringify(value);
    const encryptedData = await encryptData(jsonString);

    try {
      localStorage.setItem(key, encryptedData);
    } catch (storageError) {
      // Handle quota exceeded error
      if (storageError instanceof DOMException && (
        storageError.code === 22 ||
        storageError.code === 1014 ||
        storageError.name === 'QuotaExceededError' ||
        storageError.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      )) {
        console.warn('localStorage quota exceeded. Attempting to free space...');

        // Try to free space by removing document data first (largest data)
        // Only remove documents if we're not trying to store documents themselves
        if (key !== STORAGE_KEYS.DOCUMENTS) {
          localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
          console.warn('Removed stored documents to free space.');
        }

        // Retry the write after freeing space
        try {
          localStorage.setItem(key, encryptedData);
        } catch (retryError) {
          throw new Error(
            `localStorage quota exceeded and recovery failed. Unable to store data for key "${key}".`
          );
        }
      } else {
        throw storageError;
      }
    }
  } catch (error) {
    console.error(`Error writing to storage for key "${key}":`, error);
    throw error;
  }
}

export function removeStorageItem(key: string): void {
  try {
    if (isStorageAvailable()) {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error(`Error removing storage item for key "${key}":`, error);
  }
}

export function clearStorage(): void {
  try {
    if (isStorageAvailable()) {
      // Only clear application-specific keys to avoid removing other apps' data
      const appKeys = Object.values(STORAGE_KEYS);
      for (const key of appKeys) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}

export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_availability_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function getStorageUsage(): { used: number; available: boolean } {
  if (!isStorageAvailable()) {
    return { used: 0, available: false };
  }

  try {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null) {
        const value = localStorage.getItem(key);
        if (value !== null) {
          // Approximate size in bytes (each char is ~2 bytes in UTF-16)
          totalSize += (key.length + value.length) * 2;
        }
      }
    }

    return {
      used: totalSize,
      available: true,
    };
  } catch (error) {
    console.error('Error calculating storage usage:', error);
    return { used: 0, available: false };
  }
}