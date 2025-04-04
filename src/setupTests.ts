import '@testing-library/jest-dom';

// Mock do crypto para testes de webhook
const mockCrypto = {
  createHmac: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mocked-signature')
  })
};

jest.mock('crypto', () => mockCrypto);

// Mock do console.error para testes
console.error = jest.fn();

// Limpa todos os mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});

// Configuração global para testes
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}; 