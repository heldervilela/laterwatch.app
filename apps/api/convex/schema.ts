import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  /*
   * Users
   */
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    createdAt: v.number(), // timestamp
    updatedAt: v.optional(v.number()),
    // Campos adicionais que podem ser úteis no futuro
    isActive: v.optional(v.boolean()),
    lastLoginAt: v.optional(v.number()),
    profilePicture: v.optional(v.string()),
  })
    .index('by_email', ['email']) // Index para busca rápida por email
    .index('by_created_at', ['createdAt']), // Index para ordenação

  /*
   * Auth codes
   */
  users_authCodes: defineTable({
    email: v.string(),
    code: v.string(),
    expiresAt: v.number(), // timestamp
    attempts: v.number(),
    createdAt: v.number(), // timestamp
    isUsed: v.optional(v.boolean()), // para marcar códigos já utilizados
  })
    .index('by_email', ['email']) // Index para busca por email
    .index('by_expiry', ['expiresAt']) // Index para limpeza de códigos expirados
    .index('by_code', ['code']), // Index para busca por código (opcional)

  /*
   * Refresh tokens
   */
  users_refreshTokens: defineTable({
    token: v.string(),
    userId: v.id('users'),
    expiresAt: v.number(), // timestamp
    createdAt: v.number(), // timestamp
    isRevoked: v.optional(v.boolean()),
  })
    .index('by_token', ['token']) // Index para busca rápida por token
    .index('by_user', ['userId']) // Index para buscar tokens de um usuário
    .index('by_expiry', ['expiresAt']), // Index para limpeza de tokens expirados
})
