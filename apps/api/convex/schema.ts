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

  /*
   * Business details
   */
  businesses: defineTable({
    userId: v.id('users'), // Link business to user
    name: v.string(),
    // description: v.optional(v.string()),
    // generatedPhoneNumber: v.optional(
    //   v.object({
    //     id: v.optional(v.string()),
    //     number: v.string(),
    //     providerId: v.optional(v.string()),
    //   })
    // ),
    // details: v.object({
    //   googleBusinessProfileId: v.optional(v.string()),
    //   email: v.optional(v.string()),
    //   timezone: v.string(),
    //   website: v.optional(v.string()),
    //   phoneNumbers: v.optional(v.array(v.string())),
    //   contactEmail: v.optional(v.string()),
    //   addresses: v.optional(
    //     v.array(
    //       v.object({
    //         city: v.optional(v.string()),
    //         street: v.optional(v.string()),
    //         zipCode: v.optional(v.string()),
    //       })
    //     )
    //   ),
    //   socialMedia: v.optional(
    //     v.array(
    //       v.object({
    //         platform: v.string(),
    //         url: v.string(),
    //       })
    //     )
    //   ),
    //   businessHours: v.optional(
    //     v.array(
    //       v.object({
    //         day: v.string(),
    //         open: v.string(),
    //         close: v.string(),
    //       })
    //     )
    //   ),
    // }),
    active: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_name', ['name'])
    .index('by_user', ['userId']) // Index for user-business relationship
    .index('by_created_at', ['createdAt']),

  /*
   * Agents
   */
  agents: defineTable({
    businessId: v.id('businesses'),
    userId: v.optional(v.id('users')),
    // title: v.string(),
    // externalId: v.optional(v.string()),
    configuration: v.object({
      tone: v.union(v.literal('casual'), v.literal('professional'), v.literal('friendly')),
      voice: v.union(v.literal('ana'), v.literal('david')),
      // hasLegalDisclaimerEnabled: v.boolean(),
      // hasSmartSpamDetectionEnabled: v.boolean(),
      // callFinishedNotificationChannels: v.array(v.string()), // ["sms", "email"]
    }),
    //blockedPhoneNumbers: v.array(v.string()),
    // greeting: v.object({
    //   default: v.string(),
    //   legalDisclaimer: v.optional(v.string()),
    // }),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_business', ['businessId'])
    .index('by_user', ['userId'])
    .index('by_business_user', ['businessId', 'userId'])
    .index('by_created_at', ['createdAt']),
})
