import { cors } from '@elysiajs/cors'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { Elysia } from 'elysia'
import { createContext } from './trpc/context'
import { appRouter } from './trpc/router'

// Carregar variáveis de ambiente
const env = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
}

const app = new Elysia()
  .use(
    cors({
      origin: env.NODE_ENV === 'development' ? true : ['https://app.vilela.ai'],
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )
  .all('/rpc/*', async opts => {
    const res = await fetchRequestHandler({
      endpoint: '/rpc',
      router: appRouter,
      req: opts.request,
      createContext: ({ req }) => createContext({ req }),
    })

    return res
  })
  .get('/ping', () => ({ ok: true }))
  .get('/', () => ({
    message: 'Vilela API Server',
    status: 'running',
    environment: env.NODE_ENV,
  }))

app.listen(env.PORT)

console.log(`🦊 Elysia server is running at http://localhost:${env.PORT}`)
console.log(`🔗 tRPC endpoint: http://localhost:${env.PORT}/rpc`)
