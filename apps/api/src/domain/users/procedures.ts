import { protectedProcedure } from '../../trpc/procedures'

// Obter dados do utilizador logado
export const me = protectedProcedure.query(({ ctx }) => {
  return {
    success: true,
    message: 'user.success.profileLoaded',
    user: ctx.user,
  }
})

// Note: onboardingStatus removed temporarily until businesses and agents Convex functions are implemented
