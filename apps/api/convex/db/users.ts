import { v } from 'convex/values'
import { mutation, query } from '../_generated/server'

// ============== QUERIES ==============

// Buscar usuário por email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query('users')
      .withIndex('by_email', q => q.eq('email', email))
      .first()
  },
})

// Buscar usuário por ID
export const getUserById = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId)
  },
})

// Listar usuários ativos (exemplo para admin)
export const listActiveUsers = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 50 }) => {
    return await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('isActive'), true))
      .order('desc')
      .take(limit)
  },
})

// Buscar usuários por data de criação (para analytics)
export const getUsersByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, { startDate, endDate }) => {
    return await ctx.db
      .query('users')
      .withIndex('by_created_at')
      .filter(q =>
        q.and(q.gte(q.field('createdAt'), startDate), q.lte(q.field('createdAt'), endDate))
      )
      .collect()
  },
})

// ============== MUTATIONS ==============

// Criar novo usuário
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, { email, name }) => {
    // Verificar se usuário já existe
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_email', q => q.eq('email', email))
      .first()

    if (existingUser) {
      throw new Error('Usuário já existe com este email')
    }

    const userId = await ctx.db.insert('users', {
      email,
      name,
      createdAt: Date.now(),
      isActive: true,
    })

    return userId
  },
})

// Atualizar informações do usuário
export const updateUser = mutation({
  args: {
    userId: v.id('users'),
    name: v.optional(v.string()),
    profilePicture: v.optional(v.string()),
  },
  handler: async (ctx, { userId, name, profilePicture }) => {
    const updateData: any = {
      updatedAt: Date.now(),
    }

    if (name !== undefined) updateData.name = name
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture

    await ctx.db.patch(userId, updateData)
    return { success: true }
  },
})

// Atualizar último login
export const updateLastLogin = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, {
      lastLoginAt: Date.now(),
      updatedAt: Date.now(),
    })
  },
})

// Desativar usuário (soft delete)
export const deactivateUser = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, {
      isActive: false,
      updatedAt: Date.now(),
    })
    return { success: true }
  },
})

// Reativar usuário
export const reactivateUser = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, {
      isActive: true,
      updatedAt: Date.now(),
    })
    return { success: true }
  },
})
