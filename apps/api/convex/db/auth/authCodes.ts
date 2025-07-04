import { v } from 'convex/values'
import { mutation, query } from '../../_generated/server'

// ============== QUERIES ==============

// Buscar código de verificação por email
export const getVerificationCodeByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query('users_authCodes')
      .withIndex('by_email', q => q.eq('email', email))
      .filter(q => q.eq(q.field('isUsed'), false))
      .first()
  },
})

// Contar tentativas recentes por email
export const getRecentAttempts = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000
    const recentAttempts = await ctx.db
      .query('users_authCodes')
      .withIndex('by_email', q => q.eq('email', email))
      .filter(q => q.gte(q.field('createdAt'), oneHourAgo))
      .collect()

    return recentAttempts.length
  },
})

// ============== MUTATIONS ==============

// Criar ou atualizar código de verificação
export const createVerificationCode = mutation({
  args: {
    email: v.string(),
    code: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, { email, code, expiresAt }) => {
    // Marcar códigos antigos como usados
    const existingCodes = await ctx.db
      .query('users_authCodes')
      .withIndex('by_email', q => q.eq('email', email))
      .filter(q => q.eq(q.field('isUsed'), false))
      .collect()

    for (const oldCode of existingCodes) {
      await ctx.db.patch(oldCode._id, { isUsed: true })
    }

    // Buscar tentativas recentes (última hora)
    const oneHourAgo = Date.now() - 60 * 60 * 1000
    const recentAttempts = await ctx.db
      .query('users_authCodes')
      .withIndex('by_email', q => q.eq('email', email))
      .filter(q => q.gte(q.field('createdAt'), oneHourAgo))
      .collect()

    const attempts = recentAttempts.length + 1

    // Criar novo código
    const codeId = await ctx.db.insert('users_authCodes', {
      email,
      code,
      expiresAt,
      attempts,
      createdAt: Date.now(),
      isUsed: false,
    })

    return { codeId, attempts }
  },
})

// Verificar e usar código
export const verifyAndUseCode = mutation({
  args: {
    email: v.string(),
    code: v.string(),
  },
  handler: async (ctx, { email, code }) => {
    const verificationCode = await ctx.db
      .query('users_authCodes')
      .withIndex('by_email', q => q.eq('email', email))
      .filter(q => q.and(q.eq(q.field('code'), code), q.eq(q.field('isUsed'), false)))
      .first()

    if (!verificationCode) {
      return { success: false, message: 'Código não encontrado' }
    }

    if (verificationCode.expiresAt < Date.now()) {
      // Marcar como usado mesmo se expirado
      await ctx.db.patch(verificationCode._id, { isUsed: true })
      return { success: false, message: 'Código expirado' }
    }

    // Marcar código como usado
    await ctx.db.patch(verificationCode._id, { isUsed: true })

    return { success: true, message: 'Código válido' }
  },
})

// Limpar códigos expirados (função de limpeza)
export const cleanupExpiredCodes = mutation({
  args: {},
  handler: async ctx => {
    const now = Date.now()
    const expiredCodes = await ctx.db
      .query('users_authCodes')
      .withIndex('by_expiry', q => q.lt('expiresAt', now))
      .collect()

    let cleaned = 0
    for (const code of expiredCodes) {
      await ctx.db.delete(code._id)
      cleaned++
    }

    return { cleaned }
  },
})
