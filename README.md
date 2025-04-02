# Bueiro Digital

Bueiro Digital é uma plataforma de gerenciamento de campanhas e UTMs para marketing digital.

## Funcionalidades

- Autenticação de usuários
- Gerenciamento de campanhas
- Gerador de UTMs
- Analytics de campanhas
- Integração com plataformas de pagamento

## Tecnologias

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- React Router
- React Hook Form
- Zod
- Headless UI
- Hero Icons

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase

## Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/bueiro-digital.git
cd bueiro-digital
```

2. Instale as dependências:

```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:

Crie um arquivo `.env` na raiz do projeto e adicione as seguintes variáveis:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

## Scripts

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera a build de produção
- `npm run preview` - Visualiza a build de produção localmente
- `npm run lint` - Executa o linter

## Estrutura do Projeto

```
src/
  ├── components/     # Componentes React
  ├── hooks/         # Custom hooks
  ├── services/      # Serviços e APIs
  ├── types/         # Tipos TypeScript
  ├── utils/         # Funções utilitárias
  ├── routes/        # Configuração de rotas
  ├── App.tsx        # Componente principal
  └── main.tsx       # Ponto de entrada
```

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes. 