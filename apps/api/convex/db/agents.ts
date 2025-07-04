import { v } from 'convex/values'
import { mutation, query } from '../_generated/server'

// ============== QUERIES ==============

export const getAgentById = query({
  args: { agentId: v.id('agents') },
  handler: async (ctx, { agentId }) => {
    return await ctx.db.get(agentId)
  },
})

export const getAgentsByBusiness = query({
  args: { businessId: v.id('businesses') },
  handler: async (ctx, { businessId }) => {
    return await ctx.db
      .query('agents')
      .withIndex('by_business', q => q.eq('businessId', businessId))
      .collect()
  },
})

export const getMyAgentsByBusiness = query({
  args: { businessId: v.id('businesses'), userId: v.id('users') },
  handler: async (ctx, { businessId, userId }) => {
    return await ctx.db
      .query('agents')
      .withIndex('by_business_user', q => q.eq('businessId', businessId).eq('userId', userId))
      .collect()
  },
})

export const getAgentsByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query('agents')
      .withIndex('by_user', q => q.eq('userId', userId))
      .collect()
  },
})

export const listAgents = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 50 }) => {
    return await ctx.db.query('agents').order('desc').take(limit)
  },
})

// ============== MUTATIONS ==============

export const createAgent = mutation({
  args: {
    businessId: v.id('businesses'),
    userId: v.optional(v.id('users')),
    configuration: v.object({
      tone: v.union(v.literal('casual'), v.literal('professional'), v.literal('friendly')),
      voice: v.union(v.literal('ana'), v.literal('david')),
    }),
  },
  handler: async (ctx, args) => {
    const business = await ctx.db.get(args.businessId)
    if (!business) {
      throw new Error('Business não encontrado')
    }

    const agentId = await ctx.db.insert('agents', {
      businessId: args.businessId,
      userId: args.userId,
      configuration: args.configuration,
      createdAt: Date.now(),
    })

    return agentId
  },
})
export const updateMyAgent = mutation({
  args: {
    userId: v.id('users'),
    agentId: v.id('agents'),
    updates: v.object({
      configuration: v.optional(
        v.object({
          tone: v.optional(
            v.union(v.literal('casual'), v.literal('professional'), v.literal('friendly'))
          ),
          voice: v.optional(v.union(v.literal('ana'), v.literal('david'))),
        })
      ),
    }),
  },
  handler: async (ctx, { userId, agentId, updates }) => {
    // Verificar se o agent existe e pertence ao utilizador
    const agent = await ctx.db
      .query('agents')
      .withIndex('by_user', q => q.eq('userId', userId))
      .filter(q => q.eq(q.field('_id'), agentId))
      .first()

    if (!agent) {
      throw new Error('Agent não encontrado ou não pertence ao utilizador')
    }

    const updateData: any = {
      updatedAt: Date.now(),
    }

    if (updates.configuration !== undefined) {
      updateData.configuration = { ...agent.configuration, ...updates.configuration }
    }

    await ctx.db.patch(agentId, updateData)
    return { success: true }
  },
})
