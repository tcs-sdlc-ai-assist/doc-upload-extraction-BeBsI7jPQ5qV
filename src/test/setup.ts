import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem(key: string): string | null {
      return store[key] ?? null;
    },
    setItem(key: string, value: string): void {
      store[key] = String(value);
    },
    removeItem(key: string): void {
      delete store[key];
    },
    clear(): void {
      store = {};
    },
    get length(): number {
      return Object.keys(store).length;
    },
    key(index: number): string | null {
      const keys = Object.keys(store);
      return keys[index] ?? null;
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock URL.createObjectURL and URL.revokeObjectURL
if (typeof globalThis.URL.createObjectURL === 'undefined') {
  globalThis.URL.createObjectURL = (_blob: Blob): string => {
    return `blob:http://localhost:5173/${crypto.randomUUID()}`;
  };
}

if (typeof globalThis.URL.revokeObjectURL === 'undefined') {
  globalThis.URL.revokeObjectURL = (_url: string): void => {
    // no-op
  };
}

// Mock import.meta.env
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_ENCRYPTION_KEY: 'test-encryption-key-for-vitest',
    MODE: 'test',
    DEV: true,
    PROD: false,
    SSR: false,
    BASE_URL: '/',
  },
  writable: true,
});

// Mock Web Crypto API if not available in jsdom
if (!globalThis.crypto?.subtle) {
  const nodeCrypto = await import('node:crypto');
  Object.defineProperty(globalThis, 'crypto', {
    value: nodeCrypto.webcrypto,
    writable: true,
  });
}

// Ensure crypto.getRandomValues is available
if (!globalThis.crypto?.getRandomValues) {
  const nodeCrypto = await import('node:crypto');
  Object.defineProperty(globalThis.crypto, 'getRandomValues', {
    value: <T extends ArrayBufferView>(array: T): T => {
      return nodeCrypto.webcrypto.getRandomValues(array);
    },
    writable: true,
  });
}

// Ensure crypto.randomUUID is available
if (!globalThis.crypto?.randomUUID) {
  const nodeCrypto = await import('node:crypto');
  Object.defineProperty(globalThis.crypto, 'randomUUID', {
    value: (): `${string}-${string}-${string}-${string}-${string}` => {
      return nodeCrypto.webcrypto.randomUUID();
    },
    writable: true,
  });
}

// Mock matchMedia for components that may use it
Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

Object.defineProperty(globalThis, 'IntersectionObserver', {
  value: MockIntersectionObserver,
  writable: true,
});

// Mock ResizeObserver
class MockResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

Object.defineProperty(globalThis, 'ResizeObserver', {
  value: MockResizeObserver,
  writable: true,
});

// Clear localStorage before each test to ensure isolation
beforeEach(() => {
  localStorageMock.clear();
});