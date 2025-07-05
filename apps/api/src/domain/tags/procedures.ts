import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import type { Id } from '../../../convex/_generated/dataModel'
import { api, convexClient } from '../../lib/convex'
import { protectedProcedure } from '../../trpc/procedures'

/*
 * Create a new tag
 */
export const createTag = protectedProcedure
  .input(
    z.object({
      name: z.string().min(1, 'Tag name is required').max(50, 'Tag name too long'),
      color: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const result = await convexClient.mutation(api.db.tags.createTag, {
        userId: ctx.user.id,
        name: input.name,
        color: input.color,
      })

      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.messageKey || 'tags.errors.createFailed',
        })
      }

      return {
        success: true,
        message: 'tags.success.created',
        tag: result.tag,
      }
    } catch (error) {
      console.error('[API][CreateTag] Error:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'tags.errors.serverError',
      })
    }
  })

/*
 * Update tag
 */
export const updateTag = protectedProcedure
  .input(
    z.object({
      tagId: z.string(),
      name: z.string().min(1, 'Tag name is required').max(50, 'Tag name too long').optional(),
      color: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const result = await convexClient.mutation(api.db.tags.updateTag, {
        tagId: input.tagId as Id<'tags'>,
        userId: ctx.user.id,
        name: input.name,
        color: input.color,
      })

      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.messageKey || 'tags.errors.updateFailed',
        })
      }

      return {
        success: true,
        message: 'tags.success.updated',
        tag: result.tag,
      }
    } catch (error) {
      console.error('[API][UpdateTag] Error:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'tags.errors.serverError',
      })
    }
  })

/*
 * Delete tag
 */
export const deleteTag = protectedProcedure
  .input(
    z.object({
      tagId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const result = await convexClient.mutation(api.db.tags.deleteTag, {
        tagId: input.tagId as Id<'tags'>,
        userId: ctx.user.id,
      })

      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.messageKey || 'tags.errors.deleteFailed',
        })
      }

      return {
        success: true,
        message: 'tags.success.deleted',
      }
    } catch (error) {
      console.error('[API][DeleteTag] Error:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'tags.errors.serverError',
      })
    }
  })

/*
 * Get user tags (query)
 */
export const getUserTags = protectedProcedure.query(async ({ ctx }) => {
  try {
    const tags = await convexClient.query(api.db.tags.getUserTags, {
      userId: ctx.user.id,
    })

    return {
      success: true,
      tags,
    }
  } catch (error) {
    console.error('[API][GetUserTags] Error:', error)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'tags.errors.serverError',
    })
  }
})
