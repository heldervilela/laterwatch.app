import { TRPCError } from '@trpc/server'
import type { Id } from '../../lib/convex'
import { api, convexClient } from '../../lib/convex'
import { protectedProcedure } from '../../trpc/procedures'

// Obter dados do utilizador logado
export const me = protectedProcedure.query(({ ctx }) => {
  return {
    success: true,
    message: ctx.t('user.success.profileLoaded'),
    user: ctx.user,
  }
})

// Verificar status de onboarding do utilizador
export const onboardingStatus = protectedProcedure.query(async ({ ctx }) => {
  try {
    const userId = ctx.user.id as Id<'users'>

    // Verificar se o utilizador tem business
    const business = await convexClient.query(api.db.businesses.getBusinessByUserId, {
      userId,
    })

    // Verificar se o utilizador tem agents - usar casting para contornar o erro de tipo
    const agents = await convexClient.query(api.db.agents.getAgentsByUser, {
      userId,
    })
    const hasAgent = agents && agents.length > 0

    const hasCompletedOnboarding = !!business && hasAgent

    return {
      hasCompletedOnboarding,
      hasBusiness: !!business,
      hasAgent,
    }
  } catch (error) {
    console.error('[Error][Users][OnboardingStatus] Details:', error)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'user.error.onboardingStatus',
    })
  }
})
