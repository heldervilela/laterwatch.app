# Vilela API

Servidor backend usando ElysiaJS e Bun.

## Configuração

Crie um arquivo `.env` na raiz deste diretório com as seguintes variáveis:

```
PORT=3001
NODE_ENV=development

# Convex Database
CONVEX_URL=https://your-convex-deployment.convex.cloud

# JWT Secrets
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key

# Email Service (Resend)
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL="Sua App <noreply@exemplo.com>"

# YouTube Data API v3 (optional)
YOUTUBE_API_KEY=your-youtube-api-key
```

### YouTube API (Opcional)

Para obter detalhes automáticos dos vídeos do YouTube (título, thumbnail, duração, etc.), configure a YouTube Data API v3:

1. Vá ao [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a "YouTube Data API v3"
4. Crie credenciais (API Key)
5. Adicione a chave ao ficheiro `.env` como `YOUTUBE_API_KEY`

**Nota**: Sem a API key, os vídeos ainda serão guardados, mas apenas com as informações básicas fornecidas pelo utilizador.

## Scripts

- `bun run dev` - Inicia o servidor em modo de desenvolvimento
- `bun run build` - Constrói o projeto para produção
- `bun run start` - Inicia o servidor em produção

## Endpoints

- `GET /ping` - Retorna `{ ok: true }`
- `GET /` - Retorna informações sobre o servidor
