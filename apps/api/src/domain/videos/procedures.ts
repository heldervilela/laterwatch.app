import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { api, convexClient, type Id } from '../../lib/convex'
import { protectedProcedure } from '../../trpc/procedures'

/*
 * Create a new video
 */
export const createVideo = protectedProcedure
  .input(
    z.object({
      url: z.string().url('Invalid URL format'),
      title: z.string().optional(),
      thumbnail: z.string().optional(),
      platform: z.string().optional(),
      videoId: z.string().optional(),
      tagNames: z.array(z.string()).optional(),
      isFavorite: z.boolean().optional().default(false),
      isArchived: z.boolean().optional().default(false),
      isWatched: z.boolean().optional().default(false),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const result = await convexClient.mutation(api.db.videos.createVideo, {
        userId: ctx.user.id,
        ...input,
      })

      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.messageKey || 'videos.errors.createFailed',
        })
      }

      return {
        success: true,
        message: 'videos.success.created',
        video: result.video,
      }
    } catch (error) {
      console.error('[API][CreateVideo] Error:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'videos.errors.serverError',
      })
    }
  })

/*
 * Update video status (favorite, archived, watched)
 */
export const updateVideo = protectedProcedure
  .input(
    z.object({
      videoId: z.string(),
      isFavorite: z.boolean().optional(),
      isArchived: z.boolean().optional(),
      isWatched: z.boolean().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const result = await convexClient.mutation(api.db.videos.updateVideo, {
        videoId: input.videoId as Id<'videos'>,
        userId: ctx.user.id,
        isFavorite: input.isFavorite,
        isArchived: input.isArchived,
        isWatched: input.isWatched,
      })

      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.messageKey || 'videos.errors.updateFailed',
        })
      }

      return {
        success: true,
        message: 'videos.success.updated',
        video: result.video,
      }
    } catch (error) {
      console.error('[API][UpdateVideo] Error:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'videos.errors.serverError',
      })
    }
  })

/*
 * Delete video
 */
export const deleteVideo = protectedProcedure
  .input(
    z.object({
      videoId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const result = await convexClient.mutation(api.db.videos.deleteVideo, {
        videoId: input.videoId as Id<'videos'>,
        userId: ctx.user.id,
      })

      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.messageKey || 'videos.errors.deleteFailed',
        })
      }

      return {
        success: true,
        message: 'videos.success.deleted',
      }
    } catch (error) {
      console.error('[API][DeleteVideo] Error:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'videos.errors.serverError',
      })
    }
  })

/*
 * Add tags to video (create tags if they don't exist)
 */
export const addTagsToVideo = protectedProcedure
  .input(
    z.object({
      videoId: z.string(),
      tagNames: z.array(z.string()).min(1, 'At least one tag is required'),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const result = await convexClient.mutation(api.db.videos.addTagsToVideo, {
        videoId: input.videoId as Id<'videos'>,
        userId: ctx.user.id,
        tagNames: input.tagNames,
      })

      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.messageKey || 'videos.errors.addTagsFailed',
        })
      }

      return {
        success: true,
        message: 'videos.success.tagsAdded',
        video: result.video,
      }
    } catch (error) {
      console.error('[API][AddTagsToVideo] Error:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'videos.errors.serverError',
      })
    }
  })

/*
 * Remove tags from video
 */
export const removeTagsFromVideo = protectedProcedure
  .input(
    z.object({
      videoId: z.string(),
      tagIds: z.array(z.string()).min(1, 'At least one tag ID is required'),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const result = await convexClient.mutation(api.db.videos.removeTagsFromVideo, {
        videoId: input.videoId as Id<'videos'>,
        userId: ctx.user.id,
        tagIds: input.tagIds.map(id => id as Id<'tags'>),
      })

      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.messageKey || 'videos.errors.removeTagsFailed',
        })
      }

      return {
        success: true,
        message: 'videos.success.tagsRemoved',
        video: result.video,
      }
    } catch (error) {
      console.error('[API][RemoveTagsFromVideo] Error:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'videos.errors.serverError',
      })
    }
  })

/*
 * Get user videos (query)
 */
export const getUserVideos = protectedProcedure.query(async ({ ctx }) => {
  try {
    const videos = await convexClient.query(api.db.videos.getUserVideos, {
      userId: ctx.user.id,
    })

    return {
      success: true,
      videos,
    }
  } catch (error) {
    console.error('[API][GetUserVideos] Error:', error)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'videos.errors.serverError',
    })
  }
})
