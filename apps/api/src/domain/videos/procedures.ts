import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { api, convexClient, type Id } from '../../lib/convex'
import { youtubeService } from '../../services/youtubeService'
import { protectedProcedure } from '../../trpc/procedures'

// Extended video data type for internal use
interface ExtendedVideoData {
  url: string
  title?: string
  description?: string
  thumbnail?: string
  platform?: string
  videoId?: string
  channelTitle?: string
  duration?: string
  publishedAt?: string
  viewCount?: string
  likeCount?: string
  tagNames?: string[]
  isFavorite?: boolean
  isArchived?: boolean
  isWatched?: boolean
}

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
      let videoData: ExtendedVideoData = { ...input }

      // Detect platform and fetch details for YouTube videos
      if (!videoData.platform) {
        if (youtubeService.isValidYouTubeUrl(input.url)) {
          videoData.platform = 'youtube'
        }
      }

      // Fetch YouTube video details if it's a YouTube URL
      if (videoData.platform === 'youtube' || youtubeService.isValidYouTubeUrl(input.url)) {
        try {
          console.log('[API][CreateVideo] Fetching YouTube details for:', input.url)

          const youtubeDetails = await youtubeService.getVideoDetails(input.url)

          if (youtubeDetails) {
            // Override with fetched details, but keep user-provided values if they exist
            videoData = {
              ...videoData,
              title: videoData.title || youtubeDetails.title,
              thumbnail: videoData.thumbnail || youtubeDetails.thumbnail,
              platform: 'youtube',
              videoId: youtubeDetails.id,
              description: youtubeDetails.description,
              channelTitle: youtubeDetails.channelTitle,
              duration: youtubeDetails.duration,
              publishedAt: youtubeDetails.publishedAt,
              viewCount: youtubeDetails.viewCount,
              likeCount: youtubeDetails.likeCount,
            }

            // Add tags from YouTube if no tags provided by user
            if (!videoData.tagNames && youtubeDetails.tags && youtubeDetails.tags.length > 0) {
              // Take first 3 tags to avoid too many
              videoData.tagNames = youtubeDetails.tags.slice(0, 3)
            }

            console.log('[API][CreateVideo] YouTube details fetched successfully')
          }
        } catch (youtubeError) {
          console.warn('[API][CreateVideo] Failed to fetch YouTube details:', youtubeError)

          // Fallback to basic info
          const basicInfo = youtubeService.getBasicVideoInfo(input.url)
          if (basicInfo) {
            videoData.platform = basicInfo.platform
            videoData.videoId = basicInfo.videoId
          }
        }
      }

      const result = await convexClient.mutation(api.db.videos.createVideo, {
        userId: ctx.user.id,
        url: videoData.url,
        title: videoData.title,
        description: videoData.description,
        thumbnail: videoData.thumbnail,
        platform: videoData.platform,
        videoId: videoData.videoId,
        channelTitle: videoData.channelTitle,
        duration: videoData.duration,
        publishedAt: videoData.publishedAt,
        viewCount: videoData.viewCount,
        likeCount: videoData.likeCount,
        tagNames: videoData.tagNames,
        isFavorite: videoData.isFavorite,
        isArchived: videoData.isArchived,
        isWatched: videoData.isWatched,
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

/*
 * Get user unwatched videos (query)
 */
export const getUserUnwatchedVideos = protectedProcedure.query(async ({ ctx }) => {
  try {
    const videos = await convexClient.query(api.db.videos.getUserUnwatchedVideos, {
      userId: ctx.user.id,
    })

    return {
      success: true,
      videos,
    }
  } catch (error) {
    console.error('[API][GetUserUnwatchedVideos] Error:', error)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'videos.errors.serverError',
    })
  }
})

/*
 * Mark video as watched and clear progress
 */
export const markVideoAsWatched = protectedProcedure
  .input(
    z.object({
      videoId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const result = await convexClient.mutation(api.db.videos.markVideoAsWatched, {
        videoId: input.videoId as Id<'videos'>,
        userId: ctx.user.id,
      })

      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.messageKey || 'videos.errors.markWatchedFailed',
        })
      }

      return {
        success: true,
        message: 'videos.success.markedAsWatched',
        video: result.video,
      }
    } catch (error) {
      console.error('[API][MarkVideoAsWatched] Error:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'videos.errors.serverError',
      })
    }
  })
