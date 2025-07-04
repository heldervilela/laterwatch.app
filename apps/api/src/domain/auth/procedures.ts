import { TRPCError } from '@trpc/server'
import { publicProcedure } from '../../trpc/procedures'
import { sendCodeSchema, verifyCodeSchema, refreshTokenSchema } from './schemas'
import { authService } from '../../services/authService'

/*
 * Send verification code by email - simplified version
 */
export const sendVerificationCode = publicProcedure
  .input(sendCodeSchema)
  .mutation(async ({ input, ctx }) => {
    console.log('[API][SendVerificationCode] Starting with input:', input.email)
    const result = await authService.sendVerificationCode(input.email)

    if (!result.success) {
      console.log('[API][SendVerificationCode] Error:', result.messageKey)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: ctx.t(result.messageKey),
      })
    }

    return {
      success: true,
      message: ctx.t(result.messageKey),
      email: input.email,
    }
  })

/*
 * Verify code and login
 */
export const verifyCode = publicProcedure
  .input(verifyCodeSchema)
  .mutation(async ({ input, ctx }) => {
    console.log('[API][VerifyCode] Starting with input:', {
      email: input.email,
      code: input.code,
    })
    const result = await authService.verifyCodeAndLogin(input.email, input.code)

    if (!result.success) {
      console.log('[API][VerifyCode] Error:', result.messageKey)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: ctx.t(result.messageKey),
      })
    }

    return {
      success: true,
      message: ctx.t(result.messageKey),
      tokens: result.tokens,
      user: result.user,
      isNewUser: result.isNewUser,
    }
  })

/*
 * Refresh access token
 */
export const refreshToken = publicProcedure
  .input(refreshTokenSchema)
  .mutation(async ({ input, ctx }) => {
    console.log('[API][RefreshToken] Starting')
    const result = await authService.refreshAccessToken(input.refreshToken)

    if (!result.success) {
      console.log('[API][RefreshToken] Error:', result.messageKey)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: ctx.t(result.messageKey),
      })
    }

    return {
      success: true,
      message: ctx.t(result.messageKey),
      accessToken: result.accessToken,
    }
  })

/*
 * Logout
 */
export const logout = publicProcedure.input(refreshTokenSchema).mutation(async ({ input, ctx }) => {
  console.log('[API][Logout] Starting with input:', {
    refreshToken: input.refreshToken,
  })
  try {
    await authService.logout(input.refreshToken)

    return {
      success: true,
      message: ctx.t('auth.success.logoutSuccess'),
    }
  } catch (error) {
    console.error('[API][Logout] Error:', error)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: ctx.t('auth.errors.serverError'),
    })
  }
})
