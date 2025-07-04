import * as agentsProcedures from '../domain/agents/procedures'
import * as authProcedures from '../domain/auth/procedures'
import * as businessesProcedures from '../domain/businesses/procedures'
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
  onboardingStatus: usersProcedures.onboardingStatus,
})

// Sub-router para businesses
const businessesRouter = router({
  createBusiness: businessesProcedures.createBusiness,
  getMyBusiness: businessesProcedures.getMyBusiness,
  updateBusiness: businessesProcedures.updateBusiness,
})

// Sub-router para agents
const agentsRouter = router({
  createAgent: agentsProcedures.createAgent,
  updateMyAgent: agentsProcedures.updateMyAgent,
  getMyAgents: agentsProcedures.getMyAgents,
  getAgentById: agentsProcedures.getAgentById,
})

// Router principal com namespaces
export const appRouter = router({
  auth: authRouter,
  users: usersRouter,
  businesses: businessesRouter,
  agents: agentsRouter,
})

// Exportar tipo para o frontend
export type AppRouter = typeof appRouter
