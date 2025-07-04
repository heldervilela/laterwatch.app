import { ConvexHttpClient } from 'convex/browser'

if (!process.env.CONVEX_URL) {
  throw new Error('CONVEX_URL não está configurada nas variáveis de ambiente')
}

// Cliente Convex para usar no backend
export const convexClient = new ConvexHttpClient(process.env.CONVEX_URL)

// Exportar API para facilitar uso
export { api } from '../../convex/_generated/api'

// Tipos úteis
export type { Id } from '../../convex/_generated/dataModel'
export type { Doc } from '../../convex/_generated/dataModel'
