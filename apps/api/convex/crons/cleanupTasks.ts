import { internalMutation } from '../_generated/server'
import { v } from 'convex/values'

/**
 * Clean up expired authentication codes
 * Removes verification codes that have exceeded their expiration time
 */
export const cleanupExpiredAuthCodes = internalMutation({
  args: {},
  handler: async ctx => {
    const now = Date.now()

    // Get all expired auth codes
    const expiredCodes = await ctx.db
      .query('users_authCodes')
      .filter(q => q.lt(q.field('expiresAt'), now))
      .collect()

    // Delete expired codes
    for (const code of expiredCodes) {
      await ctx.db.delete(code._id)
    }

    console.log(`Cleanup: Removed ${expiredCodes.length} expired auth codes`)
    return { removed: expiredCodes.length }
  },
})

/**
 * Clean up expired refresh tokens
 * Removes refresh tokens that have exceeded their expiration time
 */
export const cleanupExpiredRefreshTokens = internalMutation({
  args: {},
  handler: async ctx => {
    const now = Date.now()

    // Get all expired refresh tokens
    const expiredTokens = await ctx.db
      .query('users_refreshTokens')
      .filter(q => q.lt(q.field('expiresAt'), now))
      .collect()

    // Delete expired tokens
    for (const token of expiredTokens) {
      await ctx.db.delete(token._id)
    }

    console.log(`Cleanup: Removed ${expiredTokens.length} expired refresh tokens`)
    return { removed: expiredTokens.length }
  },
})

/**
 * Revoke all refresh tokens for a specific user
 * Used for security purposes (e.g., password change, suspicious activity)
 */
export const revokeAllUserTokens = internalMutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    // Get all tokens for the user
    const userTokens = await ctx.db
      .query('users_refreshTokens')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .collect()

    // Delete all user tokens
    for (const token of userTokens) {
      await ctx.db.delete(token._id)
    }

    console.log(`Security: Revoked ${userTokens.length} tokens for user ${args.userId}`)
    return { revoked: userTokens.length }
  },
})

/**
 * Run all cleanup tasks
 * Comprehensive cleanup that runs both expired codes and tokens cleanup
 */
export const runAllCleanupTasks = internalMutation({
  args: {},
  handler: async ctx => {
    console.log('Starting comprehensive cleanup tasks...')

    const now = Date.now()

    // Clean up expired auth codes
    const expiredCodes = await ctx.db
      .query('users_authCodes')
      .filter(q => q.lt(q.field('expiresAt'), now))
      .collect()

    for (const code of expiredCodes) {
      await ctx.db.delete(code._id)
    }

    // Clean up expired refresh tokens
    const expiredTokens = await ctx.db
      .query('users_refreshTokens')
      .filter(q => q.lt(q.field('expiresAt'), now))
      .collect()

    for (const token of expiredTokens) {
      await ctx.db.delete(token._id)
    }

    const totalRemoved = expiredCodes.length + expiredTokens.length

    console.log(`Comprehensive cleanup completed: ${totalRemoved} items removed`)

    return {
      authCodesRemoved: expiredCodes.length,
      refreshTokensRemoved: expiredTokens.length,
      totalRemoved,
    }
  },
})
