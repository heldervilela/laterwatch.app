import { v } from 'convex/values'
import { mutation, query } from '../_generated/server'

// ============== QUERIES ==============

// Buscar business por ID
export const getBusinessById = query({
  args: { businessId: v.id('businesses') },
  handler: async (ctx, { businessId }) => {
    return await ctx.db.get(businessId)
  },
})

// Buscar business por userId (relação 1:1)
export const getBusinessByUserId = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query('businesses')
      .withIndex('by_user', q => q.eq('userId', userId))
      .first()
  },
})

// Buscar business por nome
export const getBusinessByName = query({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    return await ctx.db
      .query('businesses')
      .withIndex('by_name', q => q.eq('name', name))
      .first()
  },
})

// Listar businesses ativos
export const listActiveBusinesses = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 50 }) => {
    return await ctx.db
      .query('businesses')
      .filter(q => q.eq(q.field('active'), true))
      .order('desc')
      .take(limit)
  },
})

// Buscar businesses por data de criação
export const getBusinessesByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, { startDate, endDate }) => {
    return await ctx.db
      .query('businesses')
      .withIndex('by_created_at')
      .filter(q =>
        q.and(q.gte(q.field('createdAt'), startDate), q.lte(q.field('createdAt'), endDate))
      )
      .collect()
  },
})

// ============== MUTATIONS ==============

// Create business
export const createBusiness = mutation({
  args: {
    ownerId: v.id('users'),
    name: v.string(),
    description: v.optional(v.string()),
    industry: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, { ownerId, name, description, industry, location }) => {
    // Create new business
    const businessData = {
      userId: ownerId,
      name,
      description,
      industry,
      location,
      active: true,
      createdAt: Date.now(),
    }

    const businessId = await ctx.db.insert('businesses', businessData)
    return { businessId }
  },
})

// Update business
export const updateBusiness = mutation({
  args: {
    businessId: v.id('businesses'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      industry: v.optional(v.string()),
      location: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { businessId, updates }) => {
    const updateData = {
      ...updates,
      updatedAt: Date.now(),
    }

    await ctx.db.patch(businessId, updateData)
    return { businessId, updated: true }
  },
})
