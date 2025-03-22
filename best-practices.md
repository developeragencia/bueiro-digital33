# Guia de Boas Práticas

## Código

### 1. Clean Code

```typescript
// ❌ Código não limpo
function p(d: any) {
  let r = 0;
  for (let i = 0; i < d.length; i++) {
    r += d[i].v;
  }
  return r / d.length;
}

// ✅ Código limpo
function calcularMediaValores(dados: Array<{ valor: number }>): number {
  const soma = dados.reduce((acc, item) => acc + item.valor, 0);
  return soma / dados.length;
}
```

### 2. SOLID

```typescript
// ❌ Violação do Single Responsibility
class ProcessadorPagamento {
  processarPagamento(pagamento: Pagamento): void {
    this.validarPagamento(pagamento);
    this.calcularImpostos(pagamento);
    this.atualizarBanco(pagamento);
    this.enviarEmail(pagamento);
  }
}

// ✅ Aplicando Single Responsibility
class ValidadorPagamento {
  validar(pagamento: Pagamento): boolean {
    // Lógica de validação
  }
}

class CalculadorImpostos {
  calcular(pagamento: Pagamento): number {
    // Lógica de cálculo
  }
}

class ProcessadorPagamento {
  constructor(
    private validador: ValidadorPagamento,
    private calculador: CalculadorImpostos,
    private repositorio: RepositorioPagamento,
    private notificador: NotificadorPagamento
  ) {}

  processarPagamento(pagamento: Pagamento): void {
    if (!this.validador.validar(pagamento)) {
      throw new Error('Pagamento inválido');
    }

    const impostos = this.calculador.calcular(pagamento);
    pagamento.valorTotal = pagamento.valor + impostos;

    await this.repositorio.salvar(pagamento);
    await this.notificador.notificar(pagamento);
  }
}
```

### 3. DRY (Don't Repeat Yourself)

```typescript
// ❌ Código duplicado
class FornecedorService {
  async validarCNPJ(cnpj: string): boolean {
    // Lógica de validação
  }
}

class ClienteService {
  async validarCNPJ(cnpj: string): boolean {
    // Mesma lógica de validação
  }
}

// ✅ Código reutilizável
class CNPJService {
  async validar(cnpj: string): boolean {
    // Lógica de validação
  }
}

class FornecedorService {
  constructor(private cnpjService: CNPJService) {}

  async validarCNPJ(cnpj: string): boolean {
    return this.cnpjService.validar(cnpj);
  }
}

class ClienteService {
  constructor(private cnpjService: CNPJService) {}

  async validarCNPJ(cnpj: string): boolean {
    return this.cnpjService.validar(cnpj);
  }
}
```

### 4. KISS (Keep It Simple, Stupid)

```typescript
// ❌ Código complexo
function processarDados(dados: any[]): any[] {
  return dados
    .filter(d => d && typeof d === 'object')
    .map(d => ({
      ...d,
      processado: true,
      timestamp: new Date().toISOString()
    }))
    .reduce((acc, curr) => {
      if (acc[curr.categoria]) {
        acc[curr.categoria].push(curr);
      } else {
        acc[curr.categoria] = [curr];
      }
      return acc;
    }, {});
}

// ✅ Código simples
function processarDados(dados: Array<Record<string, any>>): Record<string, any[]> {
  const resultado: Record<string, any[]> = {};

  for (const item of dados) {
    if (!item || typeof item !== 'object') continue;

    const categoria = item.categoria;
    if (!resultado[categoria]) {
      resultado[categoria] = [];
    }

    resultado[categoria].push({
      ...item,
      processado: true,
      timestamp: new Date().toISOString()
    });
  }

  return resultado;
}
```

## Arquitetura

### 1. Clean Architecture

```typescript
// src/domain/entities/pagamento.ts
export interface Pagamento {
  id: string;
  valor: number;
  data: Date;
  status: StatusPagamento;
}

// src/domain/repositories/pagamento-repository.ts
export interface PagamentoRepository {
  salvar(pagamento: Pagamento): Promise<void>;
  buscarPorId(id: string): Promise<Pagamento>;
}

// src/application/use-cases/processar-pagamento.ts
export class ProcessarPagamentoUseCase {
  constructor(private pagamentoRepository: PagamentoRepository) {}

  async executar(pagamento: Pagamento): Promise<void> {
    // Lógica de negócio
    await this.pagamentoRepository.salvar(pagamento);
  }
}

// src/infrastructure/repositories/postgres-pagamento-repository.ts
export class PostgresPagamentoRepository implements PagamentoRepository {
  constructor(private db: Database) {}

  async salvar(pagamento: Pagamento): Promise<void> {
    await this.db.query(
      'INSERT INTO pagamentos (id, valor, data, status) VALUES ($1, $2, $3, $4)',
      [pagamento.id, pagamento.valor, pagamento.data, pagamento.status]
    );
  }

  async buscarPorId(id: string): Promise<Pagamento> {
    const result = await this.db.query(
      'SELECT * FROM pagamentos WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }
}
```

### 2. DDD (Domain-Driven Design)

```typescript
// src/domain/entities/fornecedor.ts
export class Fornecedor {
  private constructor(
    private readonly id: string,
    private readonly cnpj: string,
    private readonly razaoSocial: string,
    private readonly endereco: Endereco,
    private readonly contatos: Contato[]
  ) {}

  static criar(
    cnpj: string,
    razaoSocial: string,
    endereco: Endereco,
    contatos: Contato[]
  ): Fornecedor {
    if (!this.validarCNPJ(cnpj)) {
      throw new Error('CNPJ inválido');
    }

    return new Fornecedor(
      uuidv4(),
      cnpj,
      razaoSocial,
      endereco,
      contatos
    );
  }

  private static validarCNPJ(cnpj: string): boolean {
    // Lógica de validação
  }

  adicionarContato(contato: Contato): void {
    this.contatos.push(contato);
  }

  atualizarEndereco(endereco: Endereco): void {
    this.endereco = endereco;
  }
}
```

### 3. CQRS (Command Query Responsibility Segregation)

```typescript
// src/application/commands/processar-pagamento-command.ts
export class ProcessarPagamentoCommand {
  constructor(
    public readonly id: string,
    public readonly valor: number,
    public readonly data: Date
  ) {}
}

// src/application/queries/buscar-pagamentos-query.ts
export class BuscarPagamentosQuery {
  constructor(
    public readonly dataInicio: Date,
    public readonly dataFim: Date,
    public readonly status?: StatusPagamento
  ) {}
}

// src/application/handlers/processar-pagamento-handler.ts
export class ProcessarPagamentoHandler {
  constructor(private pagamentoRepository: PagamentoRepository) {}

  async handle(command: ProcessarPagamentoCommand): Promise<void> {
    const pagamento = new Pagamento(
      command.id,
      command.valor,
      command.data
    );
    await this.pagamentoRepository.salvar(pagamento);
  }
}

// src/application/handlers/buscar-pagamentos-handler.ts
export class BuscarPagamentosHandler {
  constructor(private pagamentoRepository: PagamentoRepository) {}

  async handle(query: BuscarPagamentosQuery): Promise<Pagamento[]> {
    return this.pagamentoRepository.buscarPorPeriodo(
      query.dataInicio,
      query.dataFim,
      query.status
    );
  }
}
```

## Testes

### 1. Testes Unitários

```typescript
// src/domain/entities/fornecedor.test.ts
describe('Fornecedor', () => {
  it('deve criar um fornecedor válido', () => {
    const fornecedor = Fornecedor.criar(
      '12345678901234',
      'Empresa Teste',
      new Endereco('Rua Teste', '123', 'Centro'),
      []
    );

    expect(fornecedor).toBeDefined();
    expect(fornecedor.cnpj).toBe('12345678901234');
    expect(fornecedor.razaoSocial).toBe('Empresa Teste');
  });

  it('deve lançar erro ao criar fornecedor com CNPJ inválido', () => {
    expect(() => {
      Fornecedor.criar(
        '123',
        'Empresa Teste',
        new Endereco('Rua Teste', '123', 'Centro'),
        []
      );
    }).toThrow('CNPJ inválido');
  });
});
```

### 2. Testes de Integração

```typescript
// src/infrastructure/repositories/postgres-fornecedor-repository.test.ts
describe('PostgresFornecedorRepository', () => {
  let repository: PostgresFornecedorRepository;
  let db: Database;

  beforeAll(async () => {
    db = await Database.connect();
    repository = new PostgresFornecedorRepository(db);
  });

  afterAll(async () => {
    await db.disconnect();
  });

  beforeEach(async () => {
    await db.query('TRUNCATE TABLE fornecedores');
  });

  it('deve salvar e recuperar um fornecedor', async () => {
    const fornecedor = Fornecedor.criar(
      '12345678901234',
      'Empresa Teste',
      new Endereco('Rua Teste', '123', 'Centro'),
      []
    );

    await repository.salvar(fornecedor);
    const recuperado = await repository.buscarPorId(fornecedor.id);

    expect(recuperado).toBeDefined();
    expect(recuperado.cnpj).toBe(fornecedor.cnpj);
    expect(recuperado.razaoSocial).toBe(fornecedor.razaoSocial);
  });
});
```

### 3. Testes E2E

```typescript
// tests/e2e/fornecedor.test.ts
describe('Fornecedor API', () => {
  let app: Express;
  let server: Server;

  beforeAll(async () => {
    app = await setupApp();
    server = app.listen(3000);
  });

  afterAll(async () => {
    await server.close();
  });

  it('deve criar um fornecedor via API', async () => {
    const response = await request(app)
      .post('/api/fornecedores')
      .send({
        cnpj: '12345678901234',
        razaoSocial: 'Empresa Teste',
        endereco: {
          rua: 'Rua Teste',
          numero: '123',
          bairro: 'Centro'
        }
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.cnpj).toBe('12345678901234');
  });
});
```

## Segurança

### 1. Validação de Entrada

```typescript
// src/application/validators/fornecedor-validator.ts
export class FornecedorValidator {
  static validar(dados: any): ValidationResult {
    const erros: string[] = [];

    if (!dados.cnpj || !this.validarCNPJ(dados.cnpj)) {
      erros.push('CNPJ inválido');
    }

    if (!dados.razaoSocial || dados.razaoSocial.length < 3) {
      erros.push('Razão social deve ter no mínimo 3 caracteres');
    }

    if (!dados.endereco) {
      erros.push('Endereço é obrigatório');
    } else {
      if (!dados.endereco.rua) {
        erros.push('Rua é obrigatória');
      }
      if (!dados.endereco.numero) {
        erros.push('Número é obrigatório');
      }
      if (!dados.endereco.bairro) {
        erros.push('Bairro é obrigatório');
      }
    }

    return {
      valido: erros.length === 0,
      erros
    };
  }
}
```

### 2. Sanitização de Dados

```typescript
// src/application/sanitizers/fornecedor-sanitizer.ts
export class FornecedorSanitizer {
  static sanitizar(dados: any): any {
    return {
      cnpj: dados.cnpj?.replace(/\D/g, ''),
      razaoSocial: dados.razaoSocial?.trim(),
      endereco: {
        rua: dados.endereco?.rua?.trim(),
        numero: dados.endereco?.numero?.trim(),
        bairro: dados.endereco?.bairro?.trim()
      }
    };
  }
}
```

### 3. Proteção contra Ataques

```typescript
// src/middleware/security.ts
export const securityMiddleware = [
  helmet(),
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }),
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite de 100 requisições
    message: 'Muitas requisições, tente novamente mais tarde'
  }),
  xss(),
  mongoSanitize()
];
```

## Performance

### 1. Cache

```typescript
// src/infrastructure/cache/redis-cache.ts
export class RedisCache {
  constructor(private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const data = JSON.stringify(value);
    if (ttl) {
      await this.redis.setex(key, ttl, data);
    } else {
      await this.redis.set(key, data);
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
```

### 2. Paginação

```typescript
// src/application/queries/buscar-fornecedores-query.ts
export class BuscarFornecedoresQuery {
  constructor(
    public readonly pagina: number = 1,
    public readonly limite: number = 10,
    public readonly filtros?: FiltrosFornecedor
  ) {}
}

// src/infrastructure/repositories/postgres-fornecedor-repository.ts
export class PostgresFornecedorRepository {
  async buscarPaginado(
    query: BuscarFornecedoresQuery
  ): Promise<PaginatedResult<Fornecedor>> {
    const offset = (query.pagina - 1) * query.limite;
    
    const [total, itens] = await Promise.all([
      this.db.query(
        'SELECT COUNT(*) FROM fornecedores WHERE ...',
        [/* parâmetros */]
      ),
      this.db.query(
        'SELECT * FROM fornecedores WHERE ... LIMIT $1 OFFSET $2',
        [query.limite, offset]
      )
    ]);

    return {
      itens: itens.rows,
      total: parseInt(total.rows[0].count),
      pagina: query.pagina,
      limite: query.limite,
      totalPaginas: Math.ceil(parseInt(total.rows[0].count) / query.limite)
    };
  }
}
```

### 3. Otimização de Queries

```typescript
// src/infrastructure/repositories/postgres-fornecedor-repository.ts
export class PostgresFornecedorRepository {
  async buscarComRelacionamentos(id: string): Promise<Fornecedor> {
    const result = await this.db.query(
      `SELECT f.*, 
              json_agg(json_build_object(
                'id', c.id,
                'nome', c.nome,
                'email', c.email
              )) as contatos
       FROM fornecedores f
       LEFT JOIN contatos c ON c.fornecedor_id = f.id
       WHERE f.id = $1
       GROUP BY f.id`,
      [id]
    );

    return this.mapper.toEntity(result.rows[0]);
  }
}
```

## Logging

### 1. Estrutura de Logs

```typescript
// src/infrastructure/logging/logger.ts
export class Logger {
  private static instance: Logger;
  private logger: winston.Logger;

  private constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'app' },
      transports: [
        new winston.transports.File({ 
          filename: 'error.log', 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: 'combined.log' 
        }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }
}
```

### 2. Contexto de Logs

```typescript
// src/middleware/logging.ts
export const loggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  const requestId = uuidv4();

  req.logger = logger.child({ requestId });

  res.on('finish', () => {
    const duration = Date.now() - start;
    req.logger.info('Requisição HTTP', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
  });

  next();
};
```

### 3. Logs Estruturados

```typescript
// src/application/use-cases/processar-pagamento.ts
export class ProcessarPagamentoUseCase {
  constructor(
    private pagamentoRepository: PagamentoRepository,
    private logger: Logger
  ) {}

  async executar(pagamento: Pagamento): Promise<void> {
    this.logger.info('Iniciando processamento de pagamento', {
      pagamentoId: pagamento.id,
      valor: pagamento.valor,
      data: pagamento.data
    });

    try {
      await this.pagamentoRepository.salvar(pagamento);
      
      this.logger.info('Pagamento processado com sucesso', {
        pagamentoId: pagamento.id
      });
    } catch (error) {
      this.logger.error('Erro ao processar pagamento', {
        pagamentoId: pagamento.id,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
}
``` 