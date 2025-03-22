# Guia de Boas Práticas

## Padrões de Código

### 1. Nomenclatura

```typescript
// Variáveis
const nomeCompleto = 'João Silva';
const idade = 25;
const isAtivo = true;

// Funções
function calcularTotal(): number {
  return 0;
}

function processarPagamento(pagamento: Pagamento): void {
  // Implementação
}

// Classes
class FornecedorService {
  // Implementação
}

// Interfaces
interface PagamentoRepository {
  // Definição
}

// Tipos
type StatusPagamento = 'PENDENTE' | 'APROVADO' | 'REJEITADO';

// Enums
enum TipoPagamento {
  BOLETO = 'BOLETO',
  PIX = 'PIX',
  CARTAO = 'CARTAO'
}

// Constantes
const MAX_TENTATIVAS = 3;
const TAXA_JUROS = 0.05;
```

### 2. Organização de Arquivos

```typescript
// Estrutura de diretórios recomendada
src/
  config/
    database.ts
    redis.ts
    logger.ts
  domain/
    entities/
    value-objects/
    repositories/
  application/
    use-cases/
    dtos/
  infrastructure/
    repositories/
    services/
  presentation/
    controllers/
    middlewares/
    routes/
  shared/
    errors/
    utils/
    types/
```

### 3. Imports e Exports

```typescript
// Imports organizados
// 1. Imports de bibliotecas
import { Request, Response } from 'express';
import { Pool } from 'pg';

// 2. Imports de módulos internos
import { FornecedorRepository } from '../repositories';
import { PagamentoService } from '../services';

// 3. Imports de tipos
import { Fornecedor, Pagamento } from '../types';

// Exports organizados
export {
  FornecedorRepository,
  PagamentoRepository
};

export type {
  Fornecedor,
  Pagamento
};
```

## Documentação

### 1. JSDoc

```typescript
/**
 * Processa um pagamento para um fornecedor
 * @param {Pagamento} pagamento - O pagamento a ser processado
 * @param {string} fornecedorId - ID do fornecedor
 * @returns {Promise<ResultadoPagamento>} Resultado do processamento
 * @throws {Error} Se o fornecedor não for encontrado ou estiver inativo
 */
async function processarPagamento(
  pagamento: Pagamento,
  fornecedorId: string
): Promise<ResultadoPagamento> {
  // Implementação
}

/**
 * Classe responsável por gerenciar operações relacionadas a fornecedores
 * @class FornecedorService
 */
class FornecedorService {
  /**
   * Cria um novo fornecedor
   * @param {CriarFornecedorDTO} dados - Dados do fornecedor
   * @returns {Promise<Fornecedor>} Fornecedor criado
   */
  async criar(dados: CriarFornecedorDTO): Promise<Fornecedor> {
    // Implementação
  }
}
```

### 2. README

```markdown
# Sistema de Pagamentos

## Descrição
Sistema para gerenciamento de pagamentos a fornecedores.

## Requisitos
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

## Instalação
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Executar migrações
npm run migration:run
```

## Uso
```bash
# Iniciar em desenvolvimento
npm run dev

# Iniciar em produção
npm run start
```

## Testes
```bash
# Executar testes unitários
npm run test

# Executar testes de integração
npm run test:integration

# Executar testes e2e
npm run test:e2e
```

## Documentação
- [API](docs/api.md)
- [Arquitetura](docs/arquitetura.md)
- [Boas Práticas](docs/boas-praticas.md)
```

### 3. Comentários

```typescript
// ❌ Comentários desnecessários
const x = 5; // Define x como 5

// ✅ Comentários explicativos
// Calcula o valor total com juros compostos
const valorTotal = principal * Math.pow(1 + taxaJuros, periodo);

// ❌ Comentários de código morto
// function calcularJuros() {
//   return valor * 0.1;
// }

// ✅ TODO comments
// TODO: Implementar validação de CNPJ
function validarCnpj(cnpj: string): boolean {
  return true;
}
```

## Tratamento de Erros

### 1. Classes de Erro

```typescript
// Erros de domínio
class FornecedorNaoEncontradoError extends Error {
  constructor(fornecedorId: string) {
    super(`Fornecedor com ID ${fornecedorId} não encontrado`);
    this.name = 'FornecedorNaoEncontradoError';
  }
}

class FornecedorInativoError extends Error {
  constructor(fornecedorId: string) {
    super(`Fornecedor com ID ${fornecedorId} está inativo`);
    this.name = 'FornecedorInativoError';
  }
}

// Erros de aplicação
class ErroValidacaoError extends Error {
  constructor(public readonly erros: string[]) {
    super('Erro de validação');
    this.name = 'ErroValidacaoError';
  }
}

// Erros de infraestrutura
class ErroConexaoBancoError extends Error {
  constructor(public readonly erro: Error) {
    super('Erro ao conectar ao banco de dados');
    this.name = 'ErroConexaoBancoError';
  }
}
```

### 2. Tratamento de Erros

```typescript
// Middleware de erro
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof FornecedorNaoEncontradoError) {
    return res.status(404).json({
      error: error.message
    });
  }

  if (error instanceof ErroValidacaoError) {
    return res.status(400).json({
      error: 'Erro de validação',
      details: error.erros
    });
  }

  if (error instanceof ErroConexaoBancoError) {
    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }

  // Log do erro
  logger.error('Erro não tratado', {
    error: error.message,
    stack: error.stack
  });

  return res.status(500).json({
    error: 'Erro interno do servidor'
  });
});

// Try/Catch
async function processarPagamento(pagamento: Pagamento): Promise<void> {
  try {
    const fornecedor = await fornecedorRepository.findById(pagamento.fornecedorId);
    if (!fornecedor) {
      throw new FornecedorNaoEncontradoError(pagamento.fornecedorId);
    }

    if (!fornecedor.isAtivo()) {
      throw new FornecedorInativoError(pagamento.fornecedorId);
    }

    await pagamentoRepository.save(pagamento);
  } catch (error) {
    if (error instanceof FornecedorNaoEncontradoError) {
      throw error;
    }
    if (error instanceof FornecedorInativoError) {
      throw error;
    }
    throw new ErroProcessamentoPagamentoError(error);
  }
}
```

## Validação

### 1. Validação de Dados

```typescript
// DTOs com validação
class CriarFornecedorDTO {
  @IsString()
  @IsNotEmpty()
  razaoSocial: string;

  @IsString()
  @IsNotEmpty()
  @IsCnpj()
  cnpj: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  telefone?: string;
}

// Validação de entidades
class Fornecedor {
  constructor(
    private readonly id: string,
    private razaoSocial: string,
    private cnpj: string,
    private email: string,
    private telefone?: string
  ) {
    this.validar();
  }

  private validar(): void {
    if (!this.razaoSocial) {
      throw new Error('Razão social é obrigatória');
    }

    if (!this.cnpj) {
      throw new Error('CNPJ é obrigatório');
    }

    if (!this.isValidCnpj(this.cnpj)) {
      throw new Error('CNPJ inválido');
    }

    if (!this.email) {
      throw new Error('Email é obrigatório');
    }

    if (!this.isValidEmail(this.email)) {
      throw new Error('Email inválido');
    }
  }

  private isValidCnpj(cnpj: string): boolean {
    // Implementação da validação
    return true;
  }

  private isValidEmail(email: string): boolean {
    // Implementação da validação
    return true;
  }
}
```

### 2. Sanitização

```typescript
// Sanitização de dados
class Sanitizer {
  static sanitizeString(value: string): string {
    return value
      .trim()
      .replace(/[<>]/g, '')
      .replace(/\s+/g, ' ');
  }

  static sanitizeEmail(email: string): string {
    return email
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '');
  }

  static sanitizeCnpj(cnpj: string): string {
    return cnpj
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
}

// Uso
const dados = {
  razaoSocial: '  Fornecedor Teste  ',
  email: '  TESTE@EMAIL.COM  ',
  cnpj: '12345678901234'
};

const dadosSanitizados = {
  razaoSocial: Sanitizer.sanitizeString(dados.razaoSocial),
  email: Sanitizer.sanitizeEmail(dados.email),
  cnpj: Sanitizer.sanitizeCnpj(dados.cnpj)
};
```

## Logging

### 1. Configuração do Logger

```typescript
// Configuração do Winston
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### 2. Uso do Logger

```typescript
// Logging estruturado
class PagamentoService {
  async processarPagamento(pagamento: Pagamento): Promise<void> {
    logger.info('Iniciando processamento de pagamento', {
      pagamentoId: pagamento.id,
      fornecedorId: pagamento.fornecedorId,
      valor: pagamento.valor
    });

    try {
      const fornecedor = await this.fornecedorRepository.findById(pagamento.fornecedorId);
      if (!fornecedor) {
        logger.warn('Fornecedor não encontrado', {
          pagamentoId: pagamento.id,
          fornecedorId: pagamento.fornecedorId
        });
        throw new FornecedorNaoEncontradoError(pagamento.fornecedorId);
      }

      await this.pagamentoRepository.save(pagamento);

      logger.info('Pagamento processado com sucesso', {
        pagamentoId: pagamento.id,
        fornecedorId: pagamento.fornecedorId,
        valor: pagamento.valor
      });
    } catch (error) {
      logger.error('Erro ao processar pagamento', {
        pagamentoId: pagamento.id,
        fornecedorId: pagamento.fornecedorId,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
}
```

## Segurança

### 1. Validação de Entrada

```typescript
// Middleware de validação
const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Erro de validação',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Schema de validação
const criarFornecedorSchema = Joi.object({
  razaoSocial: Joi.string().required(),
  cnpj: Joi.string().required().pattern(/^\d{14}$/),
  email: Joi.string().email().required(),
  telefone: Joi.string().pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/)
});

// Uso
router.post(
  '/fornecedores',
  validateRequest(criarFornecedorSchema),
  fornecedorController.create
);
```

### 2. Sanitização de Saída

```typescript
// Sanitização de dados sensíveis
class DadosSensiveisSanitizer {
  static sanitizeCnpj(cnpj: string): string {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.***.***/$4-**');
  }

  static sanitizeEmail(email: string): string {
    const [username, domain] = email.split('@');
    return `${username.charAt(0)}***@${domain}`;
  }

  static sanitizeTelefone(telefone: string): string {
    return telefone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) ***-$3');
  }
}

// Uso
const fornecedor = {
  razaoSocial: 'Fornecedor Teste',
  cnpj: '12345678901234',
  email: 'teste@email.com',
  telefone: '(11) 99999-9999'
};

const fornecedorSanitizado = {
  ...fornecedor,
  cnpj: DadosSensiveisSanitizer.sanitizeCnpj(fornecedor.cnpj),
  email: DadosSensiveisSanitizer.sanitizeEmail(fornecedor.email),
  telefone: DadosSensiveisSanitizer.sanitizeTelefone(fornecedor.telefone)
};
```

## Performance

### 1. Cache

```typescript
// Implementação de cache em camadas
class CacheService {
  constructor(
    private readonly memoryCache: MemoryCache,
    private readonly redisCache: RedisCache
  ) {}

  async get<T>(key: string): Promise<T | null> {
    // Tentar cache em memória
    const memoryValue = this.memoryCache.get(key);
    if (memoryValue) return memoryValue;

    // Tentar cache Redis
    const redisValue = await this.redisCache.get<T>(key);
    if (redisValue) {
      this.memoryCache.set(key, redisValue);
      return redisValue;
    }

    return null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await Promise.all([
      this.memoryCache.set(key, value, ttl),
      this.redisCache.set(key, value, ttl)
    ]);
  }
}
```

### 2. Paginação

```typescript
// Implementação de paginação
interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

class PagamentoService {
  async listarPagamentos(params: PaginationParams): Promise<PaginatedResult<Pagamento>> {
    const offset = (params.page - 1) * params.limit;
    
    const [pagamentos, total] = await Promise.all([
      this.pagamentoRepository.findAll({
        offset,
        limit: params.limit,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder
      }),
      this.pagamentoRepository.count()
    ]);

    const totalPages = Math.ceil(total / params.limit);

    return {
      data: pagamentos,
      total,
      page: params.page,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrevious: params.page > 1
    };
  }
}
```

### 3. Otimização de Queries

```typescript
// Otimização de queries
class FornecedorRepository {
  async findByIdWithPagamentos(id: string): Promise<Fornecedor> {
    // Query otimizada com JOIN
    const result = await this.pool.query(`
      SELECT 
        f.*,
        json_agg(json_build_object(
          'id', p.id,
          'valor', p.valor,
          'data', p.data_pagamento,
          'status', p.status
        )) as pagamentos
      FROM fornecedores f
      LEFT JOIN pagamentos p ON p.fornecedor_id = f.id
      WHERE f.id = $1
      GROUP BY f.id
    `, [id]);

    if (result.rows.length === 0) {
      throw new FornecedorNaoEncontradoError(id);
    }

    return this.mapToEntity(result.rows[0]);
  }

  private mapToEntity(row: any): Fornecedor {
    return new Fornecedor(
      row.id,
      row.razao_social,
      row.cnpj,
      row.status,
      row.pagamentos || []
    );
  }
}
``` 