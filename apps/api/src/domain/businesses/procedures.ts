import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { api } from '../../../convex/_generated/api'
import { convexClient } from '../../lib/convex'
import { protectedProcedure } from '../../trpc/procedures'

/*
 * Create business
 */
export const createBusiness = protectedProcedure
  .input(
    z.object({
      name: z.string().min(1, 'fields.required'),
      description: z.string().optional(),
      industry: z.string().optional(),
      location: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const log = '[Businesses][Create]'
    console.log(`${log} Starting with input:`, input)

    try {
      const result = await convexClient.mutation(api.db.businesses.createBusiness, {
        ownerId: ctx.user.id as any,
        name: input.name,
        description: input.description,
        industry: input.industry,
        location: input.location,
      })

      console.log(`${log} Result:`, result)

      return {
        success: true,
        businessId: result.businessId,
        message: 'businesses.created_successfully',
      }
    } catch (error: any) {
      console.error(`[Error]${log} Details:`, error)

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'businesses.errors.create_failed',
      })
    }
  })

/*
 * Get my business
 */
export const getMyBusiness = protectedProcedure.query(async ({ ctx }) => {
  const log = '[Businesses][GetMeBusiness]'
  console.log(`${log} Starting for user id:`, ctx.user.id)

  try {
    const result = await convexClient.query(api.db.businesses.getBusinessByUserId, {
      userId: ctx.user.id,
    })

    console.log(`${log} Result:`, result)

    return result
  } catch (error: any) {
    console.error(`[Error]${log} Details:`, error)

    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'businesses.errors.get_failed',
    })
  }
})

/*
 * Update business
 */
export const updateBusiness = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      data: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        industry: z.string().optional(),
        location: z.string().optional(),
      }),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const log = '[Businesses][Update]'
    console.log(`${log} Starting with input:`, input)

    try {
      const result = await convexClient.mutation(api.db.businesses.updateBusiness, {
        businessId: input.id as any,
        updates: input.data,
      })

      console.log(`${log} Result:`, result)

      return {
        success: true,
        message: 'businesses.updated_successfully',
      }
    } catch (error: any) {
      console.error(`[Error]${log} Details:`, error)

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'businesses.errors.update_failed',
      })
    }
  })
