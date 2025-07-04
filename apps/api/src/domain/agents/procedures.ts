import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { api } from '../../../convex/_generated/api'
import { convexClient } from '../../lib/convex'
import { protectedProcedure } from '../../trpc/procedures'

/*
 * Create agent
 */
export const createAgent = protectedProcedure
  .input(
    z.object({
      businessId: z.string(),
      configuration: z.object({
        tone: z.enum(['casual', 'professional', 'friendly']),
        voice: z.enum(['ana', 'david']),
      }),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const log = '[Agents][Create]'
    console.log(`${log} Starting with input:`, input)

    try {
      const agentId = await convexClient.mutation(api.db.agents.createAgent, {
        businessId: input.businessId as any,
        userId: ctx.user.id as any,
        configuration: input.configuration,
      })

      console.log(`${log} Result:`, agentId)

      return {
        success: true,
        agentId,
        message: 'agents.created_successfully',
      }
    } catch (error: any) {
      console.error(`[Error]${log} Details:`, error)

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'agents.errors.create_failed',
      })
    }
  })

/*
 * Update agent
 */
export const updateMyAgent = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      data: z.object({
        businessId: z.string().optional(),
        configuration: z
          .object({
            tone: z.enum(['casual', 'professional', 'friendly']).optional(),
            voice: z.enum(['ana', 'david']).optional(),
          })
          .optional(),
      }),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const log = '[Agents][Update]'
    console.log(`${log} Starting with input:`, input)

    try {
      const result = await convexClient.mutation(api.db.agents.updateMyAgent, {
        userId: ctx.user.id as any,
        agentId: input.id as any,
        updates: input.data,
      })

      console.log(`${log} Result:`, result)

      return {
        success: true,
        message: 'agents.updated_successfully',
      }
    } catch (error: any) {
      console.error(`[Error]${log} Details:`, error)

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'agents.errors.update_failed',
        cause: error.message,
      })
    }
  })

/*
 * Get my agents
 */
export const getMyAgents = protectedProcedure.query(async ({ ctx }) => {
  const log = '[Agents][GetMy]'
  console.log(`${log} Starting`)

  try {
    const agents = await convexClient.query(api.db.agents.getAgentsByUser, {
      userId: ctx.user.id as any,
    })

    console.log(`${log} Found ${agents?.length || 0} agents`)

    return {
      success: true,
      agents: agents || [],
    }
  } catch (error: any) {
    console.error(`[Error]${log} Details:`, error)

    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'agents.errors.fetch_failed',
    })
  }
})

/*
 * Get my agent by business id
 */
export const getMyAgentByBusinessId = protectedProcedure
  .input(z.object({ businessId: z.string() }))
  .query(async ({ input, ctx }) => {
    const log = '[Agents][GetMyByBusinessId]'
    console.log(`${log} Starting`)

    try {
      const agents = await convexClient.query(api.db.agents.getMyAgentsByBusiness, {
        businessId: input.businessId as any,
        userId: ctx.user.id,
      })

      console.log(`${log} Found ${agents?.length || 0} agents`)

      return {
        success: true,
        agents: agents || [],
      }
    } catch (error: any) {
      console.error(`[Error]${log} Details:`, error)
    }
  })

/*
 * Get agent by ID
 */
export const getAgentById = protectedProcedure
  .input(z.object({ agentId: z.string() }))
  .query(async ({ input, ctx }) => {
    const log = '[Agents][GetById]'
    console.log(`${log} Starting with agentId:`, input.agentId)

    try {
      const agent = await convexClient.query(api.db.agents.getAgentById, {
        agentId: input.agentId as any,
      })

      if (!agent) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'agents.errors.not_found',
        })
      }

      console.log(`${log} Found agent:`, agent._id)

      return {
        success: true,
        agent,
      }
    } catch (error: any) {
      console.error(`[Error]${log} Details:`, error)

      if (error instanceof TRPCError) {
        throw error
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'agents.errors.fetch_failed',
      })
    }
  })
