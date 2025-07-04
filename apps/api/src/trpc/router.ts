import * as authProcedures from '../domain/auth/procedures'
import * as usersProcedures from '../domain/users/procedures'
import { router } from './procedures'

// Sub-router para autenticação
const authRouter = router({
  sendVerificationCode: authProcedures.sendVerificationCode,
  verifyCode: authProcedures.verifyCode,
  refreshToken: authProcedures.refreshToken,
  logout: authProcedures.logout,
})

// Sub-router para utilizadores
const usersRouter = router({
  me: usersProcedures.me,
})

// Note: businesses and agents routers removed temporarily until their Convex functions are implemented

// Router principal com namespaces
export const appRouter = router({
  auth: authRouter,
  users: usersRouter,
})

// Exportar tipo para o frontend
export type AppRouter = typeof appRouter
