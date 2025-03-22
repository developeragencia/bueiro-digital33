# Guia de Arquitetura

## Padrões de Arquitetura

### 1. Clean Architecture

```typescript
// Estrutura de diretórios
src/
  domain/
    entities/
    value-objects/
    repositories/
    services/
  application/
    use-cases/
    dtos/
    interfaces/
  infrastructure/
    repositories/
    services/
    config/
  presentation/
    controllers/
    middlewares/
    routes/
```

### 2. Implementação de Camadas

```typescript
// Domain Layer
// src/domain/entities/Fornecedor.ts
export class Fornecedor {
  constructor(
    private readonly id: string,
    private readonly razaoSocial: string,
    private readonly cnpj: string,
    private status: 'ATIVO' | 'INATIVO'
  ) {}

  ativar(): void {
    this.status = 'ATIVO';
  }

  desativar(): void {
    this.status = 'INATIVO';
  }

  isAtivo(): boolean {
    return this.status === 'ATIVO';
  }
}

// Application Layer
// src/application/use-cases/ProcessarPagamentoUseCase.ts
export class ProcessarPagamentoUseCase {
  constructor(
    private readonly fornecedorRepository: FornecedorRepository,
    private readonly pagamentoRepository: PagamentoRepository
  ) {}

  async execute(input: ProcessarPagamentoInput): Promise<ProcessarPagamentoOutput> {
    const fornecedor = await this.fornecedorRepository.findById(input.fornecedorId);
    if (!fornecedor) {
      throw new Error('Fornecedor não encontrado');
    }

    if (!fornecedor.isAtivo()) {
      throw new Error('Fornecedor inativo');
    }

    const pagamento = new Pagamento(
      uuidv4(),
      fornecedor.id,
      input.valor,
      input.data
    );

    await this.pagamentoRepository.save(pagamento);
    return { id: pagamento.id, status: 'APROVADO' };
  }
}

// Infrastructure Layer
// src/infrastructure/repositories/PostgresFornecedorRepository.ts
export class PostgresFornecedorRepository implements FornecedorRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<Fornecedor | null> {
    const result = await this.pool.query(
      'SELECT * FROM fornecedores WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) return null;

    const fornecedor = result.rows[0];
    return new Fornecedor(
      fornecedor.id,
      fornecedor.razao_social,
      fornecedor.cnpj,
      fornecedor.status
    );
  }
}

// Presentation Layer
// src/presentation/controllers/PagamentoController.ts
export class PagamentoController {
  constructor(
    private readonly processarPagamentoUseCase: ProcessarPagamentoUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const input = {
        fornecedorId: req.body.fornecedorId,
        valor: req.body.valor,
        data: new Date(req.body.data)
      };

      const output = await this.processarPagamentoUseCase.execute(input);
      res.status(201).json(output);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
```

## Princípios SOLID

### 1. Single Responsibility Principle (SRP)

```typescript
// ❌ Violação do SRP
class PagamentoService {
  async processarPagamento(pagamento: Pagamento): Promise<void> {
    // Validação
    this.validarPagamento(pagamento);
    
    // Processamento
    await this.processarPagamento(pagamento);
    
    // Notificação
    await this.notificarFornecedor(pagamento);
    
    // Logging
    this.logPagamento(pagamento);
  }
}

// ✅ Aplicando SRP
class PagamentoValidator {
  validar(pagamento: Pagamento): void {
    // Lógica de validação
  }
}

class PagamentoProcessor {
  async processar(pagamento: Pagamento): Promise<void> {
    // Lógica de processamento
  }
}

class Notificador {
  async notificar(pagamento: Pagamento): Promise<void> {
    // Lógica de notificação
  }
}

class PagamentoLogger {
  log(pagamento: Pagamento): void {
    // Lógica de logging
  }
}

class PagamentoService {
  constructor(
    private validator: PagamentoValidator,
    private processor: PagamentoProcessor,
    private notificador: Notificador,
    private logger: PagamentoLogger
  ) {}

  async processarPagamento(pagamento: Pagamento): Promise<void> {
    this.validator.validar(pagamento);
    await this.processor.processar(pagamento);
    await this.notificador.notificar(pagamento);
    this.logger.log(pagamento);
  }
}
```

### 2. Open/Closed Principle (OCP)

```typescript
// ❌ Violação do OCP
class PagamentoService {
  async processarPagamento(pagamento: Pagamento): Promise<void> {
    if (pagamento.tipo === 'BOLETO') {
      await this.processarBoleto(pagamento);
    } else if (pagamento.tipo === 'PIX') {
      await this.processarPix(pagamento);
    }
  }
}

// ✅ Aplicando OCP
interface PagamentoProcessor {
  processar(pagamento: Pagamento): Promise<void>;
}

class BoletoProcessor implements PagamentoProcessor {
  async processar(pagamento: Pagamento): Promise<void> {
    // Lógica específica para boleto
  }
}

class PixProcessor implements PagamentoProcessor {
  async processar(pagamento: Pagamento): Promise<void> {
    // Lógica específica para PIX
  }
}

class PagamentoService {
  constructor(private processors: Map<string, PagamentoProcessor>) {}

  async processarPagamento(pagamento: Pagamento): Promise<void> {
    const processor = this.processors.get(pagamento.tipo);
    if (!processor) {
      throw new Error(`Processador não encontrado para ${pagamento.tipo}`);
    }
    await processor.processar(pagamento);
  }
}
```

### 3. Liskov Substitution Principle (LSP)

```typescript
// ❌ Violação do LSP
class Fornecedor {
  calcularLimite(): number {
    return 1000;
  }
}

class FornecedorEspecial extends Fornecedor {
  calcularLimite(): number {
    return -1; // Violação do LSP
  }
}

// ✅ Aplicando LSP
interface Fornecedor {
  calcularLimite(): number;
}

class FornecedorPadrao implements Fornecedor {
  calcularLimite(): number {
    return 1000;
  }
}

class FornecedorEspecial implements Fornecedor {
  calcularLimite(): number {
    return 5000;
  }
}
```

### 4. Interface Segregation Principle (ISP)

```typescript
// ❌ Violação do ISP
interface FornecedorRepository {
  findById(id: string): Promise<Fornecedor>;
  save(fornecedor: Fornecedor): Promise<void>;
  update(fornecedor: Fornecedor): Promise<void>;
  delete(id: string): Promise<void>;
  findByCnpj(cnpj: string): Promise<Fornecedor>;
  findByRazaoSocial(razaoSocial: string): Promise<Fornecedor[]>;
}

// ✅ Aplicando ISP
interface ReadableRepository<T> {
  findById(id: string): Promise<T>;
}

interface WritableRepository<T> {
  save(entity: T): Promise<void>;
  update(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
}

interface FornecedorRepository extends ReadableRepository<Fornecedor>, WritableRepository<Fornecedor> {
  findByCnpj(cnpj: string): Promise<Fornecedor>;
  findByRazaoSocial(razaoSocial: string): Promise<Fornecedor[]>;
}
```

### 5. Dependency Inversion Principle (DIP)

```typescript
// ❌ Violação do DIP
class PagamentoService {
  private repository = new PostgresPagamentoRepository();
  private cache = new RedisCache();
}

// ✅ Aplicando DIP
interface PagamentoRepository {
  save(pagamento: Pagamento): Promise<void>;
  findById(id: string): Promise<Pagamento>;
}

interface Cache {
  set(key: string, value: any): Promise<void>;
  get(key: string): Promise<any>;
}

class PagamentoService {
  constructor(
    private repository: PagamentoRepository,
    private cache: Cache
  ) {}
}
```

## Domain-Driven Design (DDD)

### 1. Entidades e Value Objects

```typescript
// Entidade
class Fornecedor {
  private readonly id: FornecedorId;
  private razaoSocial: RazaoSocial;
  private cnpj: Cnpj;
  private status: Status;
  private endereco: Endereco;
  private contatos: Contato[];

  constructor(
    id: FornecedorId,
    razaoSocial: RazaoSocial,
    cnpj: Cnpj,
    status: Status,
    endereco: Endereco,
    contatos: Contato[]
  ) {
    this.id = id;
    this.razaoSocial = razaoSocial;
    this.cnpj = cnpj;
    this.status = status;
    this.endereco = endereco;
    this.contatos = contatos;
  }

  adicionarContato(contato: Contato): void {
    this.contatos.push(contato);
  }

  atualizarEndereco(endereco: Endereco): void {
    this.endereco = endereco;
  }
}

// Value Objects
class Cnpj {
  private readonly value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('CNPJ inválido');
    }
    this.value = value;
  }

  private isValid(value: string): boolean {
    // Implementação da validação
    return true;
  }

  toString(): string {
    return this.value;
  }
}

class Endereco {
  constructor(
    private readonly logradouro: string,
    private readonly numero: string,
    private readonly complemento: string,
    private readonly bairro: string,
    private readonly cidade: string,
    private readonly estado: string,
    private readonly cep: string
  ) {}

  toString(): string {
    return `${this.logradouro}, ${this.numero} - ${this.complemento}, ${this.bairro}, ${this.cidade}/${this.estado}, ${this.cep}`;
  }
}
```

### 2. Agregados

```typescript
// Agregado
class Pagamento {
  private readonly id: PagamentoId;
  private readonly fornecedorId: FornecedorId;
  private valor: Valor;
  private data: DataPagamento;
  private status: StatusPagamento;
  private historico: HistoricoPagamento[];

  constructor(
    id: PagamentoId,
    fornecedorId: FornecedorId,
    valor: Valor,
    data: DataPagamento
  ) {
    this.id = id;
    this.fornecedorId = fornecedorId;
    this.valor = valor;
    this.data = data;
    this.status = new StatusPagamento('PENDENTE');
    this.historico = [];
  }

  aprovar(): void {
    this.status = new StatusPagamento('APROVADO');
    this.historico.push(new HistoricoPagamento(
      new Date(),
      'APROVADO',
      'Pagamento aprovado pelo sistema'
    ));
  }

  rejeitar(motivo: string): void {
    this.status = new StatusPagamento('REJEITADO');
    this.historico.push(new HistoricoPagamento(
      new Date(),
      'REJEITADO',
      motivo
    ));
  }
}
```

### 3. Serviços de Domínio

```typescript
// Serviço de Domínio
class ProcessamentoPagamentoService {
  constructor(
    private readonly pagamentoRepository: PagamentoRepository,
    private readonly fornecedorRepository: FornecedorRepository
  ) {}

  async processar(pagamento: Pagamento): Promise<void> {
    const fornecedor = await this.fornecedorRepository.findById(pagamento.fornecedorId);
    if (!fornecedor) {
      throw new Error('Fornecedor não encontrado');
    }

    if (!fornecedor.isAtivo()) {
      pagamento.rejeitar('Fornecedor inativo');
      await this.pagamentoRepository.save(pagamento);
      return;
    }

    if (pagamento.valor.isMaiorQue(fornecedor.calcularLimite())) {
      pagamento.rejeitar('Valor excede limite do fornecedor');
      await this.pagamentoRepository.save(pagamento);
      return;
    }

    pagamento.aprovar();
    await this.pagamentoRepository.save(pagamento);
  }
}
```

### 4. Eventos de Domínio

```typescript
// Evento de Domínio
class PagamentoAprovadoEvent implements DomainEvent {
  constructor(
    public readonly pagamentoId: string,
    public readonly fornecedorId: string,
    public readonly valor: number,
    public readonly data: Date
  ) {}
}

// Agregado com eventos
class Pagamento {
  private domainEvents: DomainEvent[] = [];

  aprovar(): void {
    this.status = new StatusPagamento('APROVADO');
    this.historico.push(new HistoricoPagamento(
      new Date(),
      'APROVADO',
      'Pagamento aprovado pelo sistema'
    ));

    this.domainEvents.push(new PagamentoAprovadoEvent(
      this.id.toString(),
      this.fornecedorId.toString(),
      this.valor.toNumber(),
      this.data.toDate()
    ));
  }

  getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }
}
```

## CQRS (Command Query Responsibility Segregation)

### 1. Commands e Queries

```typescript
// Commands
class CriarPagamentoCommand {
  constructor(
    public readonly fornecedorId: string,
    public readonly valor: number,
    public readonly data: Date
  ) {}
}

class AprovarPagamentoCommand {
  constructor(
    public readonly pagamentoId: string
  ) {}
}

// Queries
class BuscarPagamentoQuery {
  constructor(
    public readonly pagamentoId: string
  ) {}
}

class ListarPagamentosQuery {
  constructor(
    public readonly filtros: FiltrosPagamento
  ) {}
}
```

### 2. Handlers

```typescript
// Command Handlers
class CriarPagamentoHandler implements CommandHandler<CriarPagamentoCommand> {
  constructor(
    private readonly pagamentoRepository: PagamentoRepository,
    private readonly eventBus: EventBus
  ) {}

  async handle(command: CriarPagamentoCommand): Promise<void> {
    const pagamento = new Pagamento(
      new PagamentoId(uuidv4()),
      new FornecedorId(command.fornecedorId),
      new Valor(command.valor),
      new DataPagamento(command.data)
    );

    await this.pagamentoRepository.save(pagamento);
    await this.eventBus.publish(pagamento.getDomainEvents());
  }
}

// Query Handlers
class BuscarPagamentoHandler implements QueryHandler<BuscarPagamentoQuery> {
  constructor(
    private readonly pagamentoRepository: PagamentoRepository
  ) {}

  async handle(query: BuscarPagamentoQuery): Promise<PagamentoDTO> {
    const pagamento = await this.pagamentoRepository.findById(query.pagamentoId);
    if (!pagamento) {
      throw new Error('Pagamento não encontrado');
    }
    return this.toDTO(pagamento);
  }

  private toDTO(pagamento: Pagamento): PagamentoDTO {
    return {
      id: pagamento.id.toString(),
      fornecedorId: pagamento.fornecedorId.toString(),
      valor: pagamento.valor.toNumber(),
      data: pagamento.data.toDate(),
      status: pagamento.status.toString()
    };
  }
}
```

### 3. Mediator

```typescript
// Mediator
class Mediator {
  private commandHandlers: Map<string, CommandHandler<any>> = new Map();
  private queryHandlers: Map<string, QueryHandler<any>> = new Map();

  registerCommandHandler(command: string, handler: CommandHandler<any>): void {
    this.commandHandlers.set(command, handler);
  }

  registerQueryHandler(query: string, handler: QueryHandler<any>): void {
    this.queryHandlers.set(query, handler);
  }

  async sendCommand<T>(command: Command): Promise<void> {
    const handler = this.commandHandlers.get(command.constructor.name);
    if (!handler) {
      throw new Error(`Handler não encontrado para ${command.constructor.name}`);
    }
    await handler.handle(command);
  }

  async sendQuery<T>(query: Query): Promise<T> {
    const handler = this.queryHandlers.get(query.constructor.name);
    if (!handler) {
      throw new Error(`Handler não encontrado para ${query.constructor.name}`);
    }
    return handler.handle(query);
  }
}
```

## Event Sourcing

### 1. Event Store

```typescript
// Event Store
interface EventStore {
  save(aggregateId: string, events: DomainEvent[]): Promise<void>;
  get(aggregateId: string): Promise<DomainEvent[]>;
}

class PostgresEventStore implements EventStore {
  constructor(private readonly pool: Pool) {}

  async save(aggregateId: string, events: DomainEvent[]): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      for (const event of events) {
        await client.query(
          `INSERT INTO events (aggregate_id, event_type, event_data, version)
           VALUES ($1, $2, $3, $4)`,
          [
            aggregateId,
            event.constructor.name,
            JSON.stringify(event),
            event.version
          ]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async get(aggregateId: string): Promise<DomainEvent[]> {
    const result = await this.pool.query(
      `SELECT * FROM events WHERE aggregate_id = $1 ORDER BY version`,
      [aggregateId]
    );

    return result.rows.map(row => this.deserializeEvent(row));
  }

  private deserializeEvent(row: any): DomainEvent {
    const eventClass = this.getEventClass(row.event_type);
    return Object.assign(new eventClass(), JSON.parse(row.event_data));
  }

  private getEventClass(eventType: string): any {
    // Implementar mapeamento de tipos de eventos para classes
    return null;
  }
}
```

### 2. Event Sourced Aggregate

```typescript
// Event Sourced Aggregate
abstract class EventSourcedAggregate {
  private version: number = 0;
  private uncommittedEvents: DomainEvent[] = [];

  protected apply(event: DomainEvent): void {
    this.applyEvent(event);
    this.version++;
  }

  protected abstract applyEvent(event: DomainEvent): void;

  getUncommittedEvents(): DomainEvent[] {
    return [...this.uncommittedEvents];
  }

  clearUncommittedEvents(): void {
    this.uncommittedEvents = [];
  }

  getVersion(): number {
    return this.version;
  }

  protected raiseEvent(event: DomainEvent): void {
    this.apply(event);
    this.uncommittedEvents.push(event);
  }
}

// Implementação
class Pagamento extends EventSourcedAggregate {
  private id: PagamentoId;
  private status: StatusPagamento;

  constructor(id: PagamentoId) {
    super();
    this.id = id;
    this.status = new StatusPagamento('PENDENTE');
  }

  aprovar(): void {
    this.raiseEvent(new PagamentoAprovadoEvent(
      this.id.toString(),
      new Date()
    ));
  }

  protected applyEvent(event: DomainEvent): void {
    if (event instanceof PagamentoAprovadoEvent) {
      this.status = new StatusPagamento('APROVADO');
    }
  }
}
```

### 3. Repository com Event Sourcing

```typescript
// Repository com Event Sourcing
class EventSourcedRepository<T extends EventSourcedAggregate> {
  constructor(
    private readonly eventStore: EventStore,
    private readonly aggregateClass: new (id: string) => T
  ) {}

  async save(aggregate: T): Promise<void> {
    const events = aggregate.getUncommittedEvents();
    if (events.length > 0) {
      await this.eventStore.save(aggregate.id.toString(), events);
      aggregate.clearUncommittedEvents();
    }
  }

  async findById(id: string): Promise<T> {
    const events = await this.eventStore.get(id);
    const aggregate = new this.aggregateClass(id);

    for (const event of events) {
      aggregate.apply(event);
    }

    return aggregate;
  }
}
``` 