import '@testing-library/jest-dom';

// ✅ Polyfill para TextEncoder/TextDecoder con tipo correcto
import { TextEncoder as NodeTextEncoder, TextDecoder as NodeTextDecoder } from 'util';

// @ts-ignore - Ignorar conflicto de tipos entre Node y DOM
global.TextEncoder = NodeTextEncoder;
// @ts-ignore - Ignorar conflicto de tipos entre Node y DOM
global.TextDecoder = NodeTextDecoder;

// ✅ Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// ✅ Mock de IntersectionObserver
window.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// ✅ Mock de scrollIntoView (útil para tests con scroll)
Element.prototype.scrollIntoView = jest.fn();