# Bueiro Digital

Sistema de gestão de pagamentos e integrações com plataformas de pagamento.

## Tecnologias

- React
- TypeScript
- Tailwind CSS
- Vite
- React Router DOM

## Requisitos

- Node.js 18+
- npm ou yarn

## Instalação

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/bueiro-digital.git
cd bueiro-digital
```

2. Instale as dependências
```bash
npm install
# ou
yarn
```

3. Crie um arquivo .env na raiz do projeto e configure as variáveis de ambiente
```bash
cp .env.example .env
```

4. Inicie o servidor de desenvolvimento
```bash
npm run dev
# ou
yarn dev
```

## Scripts

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera a build de produção
- `npm run lint` - Executa o linter
- `npm run preview` - Inicia o servidor de preview da build

## Estrutura do Projeto

```
src/
  ├── components/     # Componentes reutilizáveis
  ├── hooks/         # Custom hooks
  ├── pages/         # Páginas da aplicação
  ├── routes/        # Configuração de rotas
  ├── services/      # Serviços e integrações
  ├── types/         # Tipos TypeScript
  ├── utils/         # Funções utilitárias
  ├── App.tsx        # Componente principal
  └── main.tsx       # Ponto de entrada
```

## Contribuição

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 