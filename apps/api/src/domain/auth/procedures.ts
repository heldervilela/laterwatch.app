import { TRPCError } from '@trpc/server'
import { authService } from '../../services/authService'
import { publicProcedure } from '../../trpc/procedures'
import { refreshTokenSchema, sendCodeSchema, verifyCodeSchema } from './schemas'

/*
 * Send verification code by email - simplified version
 */
export const sendVerificationCode = publicProcedure
  .input(sendCodeSchema)
  .mutation(async ({ input, ctx: _ctx }) => {
    console.log('[API][SendVerificationCode] Starting with input:', input.email)
    const result = await authService.sendVerificationCode(input.email)

    if (!result.success) {
      console.log('[API][SendVerificationCode] Error:', result.messageKey)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: result.messageKey,
      })
    }

    return {
      success: true,
      message: result.messageKey,
      email: input.email,
    }
  })

/*
 * Verify code and login
 */
export const verifyCode = publicProcedure
  .input(verifyCodeSchema)
  .mutation(async ({ input, ctx: _ctx }) => {
    console.log('[API][VerifyCode] Starting with input:', {
      email: input.email,
      code: input.code,
    })
    const result = await authService.verifyCodeAndLogin(input.email, input.code)

    if (!result.success) {
      console.log('[API][VerifyCode] Error:', result.messageKey)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: result.messageKey,
      })
    }

    return {
      success: true,
      message: result.messageKey,
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
  .mutation(async ({ input, ctx: _ctx }) => {
    console.log('[API][RefreshToken] Starting')
    const result = await authService.refreshAccessToken(input.refreshToken)

    if (!result.success) {
      console.log('[API][RefreshToken] Error:', result.messageKey)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: result.messageKey,
      })
    }

    return {
      success: true,
      message: result.messageKey,
      accessToken: result.accessToken,
    }
  })

/*
 * Logout
 */
export const logout = publicProcedure
  .input(refreshTokenSchema)
  .mutation(async ({ input, ctx: _ctx }) => {
    console.log('[API][Logout] Starting with input:', {
      refreshToken: input.refreshToken,
    })
    try {
      await authService.logout(input.refreshToken)

      return {
        success: true,
        message: 'auth.success.logoutSuccess',
      }
    } catch (error) {
      console.error('[API][Logout] Error:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'auth.errors.serverError',
      })
    }
  })
