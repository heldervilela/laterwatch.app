# Vilela API

Servidor backend usando ElysiaJS e Bun.

## Configuração

Crie um arquivo `.env` na raiz deste diretório com as seguintes variáveis:

```
PORT=3001
NODE_ENV=development
```

## Scripts

- `bun run dev` - Inicia o servidor em modo de desenvolvimento
- `bun run build` - Constrói o projeto para produção
- `bun run start` - Inicia o servidor em produção

## Endpoints

- `GET /ping` - Retorna `{ ok: true }`
- `GET /` - Retorna informações sobre o servidor
