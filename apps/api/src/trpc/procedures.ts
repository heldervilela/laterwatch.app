import { initTRPC, TRPCError } from '@trpc/server'
import type { Context } from './context.js'

// Inicializar tRPC com context
const t = initTRPC.context<Context>().create()

// Middleware para rotas protegidas
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: ctx.t('auth.errors.unauthorized'),
    })
  }
  return next({ ctx: { user: ctx.user } })
})

// Procedures
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(isAuthed)
export const router = t.router
