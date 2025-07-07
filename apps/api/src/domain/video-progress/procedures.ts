import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { api, convexClient, type Id } from '../../lib/convex'
import { protectedProcedure } from '../../trpc/procedures'

/**
 * Get video progress for a specific video
 */
export const getVideoProgress = protectedProcedure
  .input(
    z.object({
      videoId: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    try {
      const result = await convexClient.query(api.db.videos.getVideoWithProgress, {
        userId: ctx.user.id,
        videoId: input.videoId as Id<'videos'>,
      })

      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.messageKey || 'videos.errors.notFound',
        })
      }

      return {
        success: true,
        progress: result.progress,
        video: result.video,
      }
    } catch (error) {
      console.error('[API][GetVideoProgress] Error:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'videos.errors.serverError',
      })
    }
  })

/**
 * Update video progress
 */
export const updateVideoProgress = protectedProcedure
  .input(
    z.object({
      videoId: z.string(),
      progressSeconds: z.number().min(0),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const result = await convexClient.mutation(api.db.videos.updateVideoProgress, {
        userId: ctx.user.id,
        videoId: input.videoId as Id<'videos'>,
        progress: input.progressSeconds,
      })

      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.messageKey || 'videos.errors.updateFailed',
        })
      }

      return {
        success: true,
        message: 'videos.success.progressUpdated',
        progress: result.progress,
      }
    } catch (error) {
      console.error('[API][UpdateVideoProgress] Error:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'videos.errors.serverError',
      })
    }
  })
