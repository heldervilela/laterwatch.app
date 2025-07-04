import { v } from 'convex/values'
import { mutation, query } from '../../_generated/server'

// ============== QUERIES ==============

// Verificar se refresh token existe e é válido
export const getRefreshToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    return await ctx.db
      .query('users_refreshTokens')
      .withIndex('by_token', q => q.eq('token', token))
      .filter(q => q.and(q.eq(q.field('isRevoked'), false), q.gt(q.field('expiresAt'), Date.now())))
      .first()
  },
})

// Listar tokens de um usuário
export const getUserRefreshTokens = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query('users_refreshTokens')
      .withIndex('by_user', q => q.eq('userId', userId))
      .filter(q => q.eq(q.field('isRevoked'), false))
      .collect()
  },
})

// ============== MUTATIONS ==============

// Criar novo refresh token
export const createRefreshToken = mutation({
  args: {
    token: v.string(),
    userId: v.id('users'),
    expiresAt: v.number(),
  },
  handler: async (ctx, { token, userId, expiresAt }) => {
    const tokenId = await ctx.db.insert('users_refreshTokens', {
      token,
      userId,
      expiresAt,
      createdAt: Date.now(),
      isRevoked: false,
    })

    return tokenId
  },
})

// Revogar refresh token
export const revokeRefreshToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const refreshToken = await ctx.db
      .query('users_refreshTokens')
      .withIndex('by_token', q => q.eq('token', token))
      .first()

    if (refreshToken) {
      await ctx.db.patch(refreshToken._id, { isRevoked: true })
      return true
    }

    return false
  },
})

// Revogar todos os tokens de um usuário
export const revokeAllUserTokens = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const userTokens = await ctx.db
      .query('users_refreshTokens')
      .withIndex('by_user', q => q.eq('userId', userId))
      .filter(q => q.eq(q.field('isRevoked'), false))
      .collect()

    let revoked = 0
    for (const token of userTokens) {
      await ctx.db.patch(token._id, { isRevoked: true })
      revoked++
    }

    return { revoked }
  },
})

// Limpar tokens expirados
export const cleanupExpiredTokens = mutation({
  args: {},
  handler: async ctx => {
    const now = Date.now()
    const expiredTokens = await ctx.db
      .query('users_refreshTokens')
      .withIndex('by_expiry', q => q.lt('expiresAt', now))
      .collect()

    let cleaned = 0
    for (const token of expiredTokens) {
      await ctx.db.delete(token._id)
      cleaned++
    }

    return { cleaned }
  },
})
