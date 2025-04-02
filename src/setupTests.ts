import '@testing-library/jest-dom';

// Configuração global para testes
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}; 