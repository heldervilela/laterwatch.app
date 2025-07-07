import { v } from 'convex/values'
import type { Id } from '../_generated/dataModel'
import { mutation, query } from '../_generated/server'

/*
 * Create a new video
 */
export const createVideo = mutation({
  args: {
    userId: v.id('users'),
    url: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    platform: v.optional(v.string()),
    videoId: v.optional(v.string()),
    channelTitle: v.optional(v.string()),
    duration: v.optional(v.string()),
    publishedAt: v.optional(v.string()),
    viewCount: v.optional(v.string()),
    likeCount: v.optional(v.string()),
    tagNames: v.optional(v.array(v.string())),
    isFavorite: v.optional(v.boolean()),
    isArchived: v.optional(v.boolean()),
    isWatched: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    try {
      const now = Date.now()

      // Create video first
      const videoId = await ctx.db.insert('videos', {
        userId: args.userId,
        url: args.url,
        title: args.title,
        description: args.description,
        thumbnail: args.thumbnail,
        platform: args.platform,
        videoId: args.videoId,
        channelTitle: args.channelTitle,
        duration: args.duration,
        publishedAt: args.publishedAt,
        viewCount: args.viewCount,
        likeCount: args.likeCount,
        tagIds: [], // Will be populated if tags are provided
        isFavorite: args.isFavorite || false,
        isArchived: args.isArchived || false,
        isWatched: args.isWatched || false,
        addedAt: now,
      })

      // Handle tags if provided
      if (args.tagNames && args.tagNames.length > 0) {
        const tagIds: Id<'tags'>[] = []
        const now = Date.now()

        for (const tagName of args.tagNames) {
          // Check if tag already exists
          const existingTag = await ctx.db
            .query('tags')
            .withIndex('by_user_name', q => q.eq('userId', args.userId).eq('name', tagName))
            .first()

          if (existingTag) {
            tagIds.push(existingTag._id)
          } else {
            // Create new tag
            const tagId = await ctx.db.insert('tags', {
              userId: args.userId,
              name: tagName,
              createdAt: now,
            })
            tagIds.push(tagId)
          }
        }

        // Update video with tag IDs
        await ctx.db.patch(videoId, {
          tagIds: tagIds,
        })
      }

      const video = await ctx.db.get(videoId)

      return {
        success: true,
        video,
      }
    } catch (error) {
      console.error('[Convex][CreateVideo] Error:', error)
      return {
        success: false,
        messageKey: 'videos.errors.createFailed',
      }
    }
  },
})

/*
 * Update video status
 */
export const updateVideo = mutation({
  args: {
    videoId: v.id('videos'),
    userId: v.id('users'),
    isFavorite: v.optional(v.boolean()),
    isArchived: v.optional(v.boolean()),
    isWatched: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    try {
      // Check if video exists and belongs to user
      const video = await ctx.db.get(args.videoId)
      if (!video || video.userId !== args.userId) {
        return {
          success: false,
          messageKey: 'videos.errors.notFound',
        }
      }

      const updates: any = {}

      if (args.isFavorite !== undefined) {
        updates.isFavorite = args.isFavorite
      }

      if (args.isArchived !== undefined) {
        updates.isArchived = args.isArchived
      }

      if (args.isWatched !== undefined) {
        updates.isWatched = args.isWatched
        if (args.isWatched) {
          updates.watchedAt = Date.now()
        }
      }

      await ctx.db.patch(args.videoId, updates)

      const updatedVideo = await ctx.db.get(args.videoId)

      return {
        success: true,
        video: updatedVideo,
      }
    } catch (error) {
      console.error('[Convex][UpdateVideo] Error:', error)
      return {
        success: false,
        messageKey: 'videos.errors.updateFailed',
      }
    }
  },
})

/*
 * Delete video
 */
export const deleteVideo = mutation({
  args: {
    videoId: v.id('videos'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    try {
      // Check if video exists and belongs to user
      const video = await ctx.db.get(args.videoId)
      if (!video || video.userId !== args.userId) {
        return {
          success: false,
          messageKey: 'videos.errors.notFound',
        }
      }

      await ctx.db.delete(args.videoId)

      return {
        success: true,
      }
    } catch (error) {
      console.error('[Convex][DeleteVideo] Error:', error)
      return {
        success: false,
        messageKey: 'videos.errors.deleteFailed',
      }
    }
  },
})

/*
 * Add tags to video (create tags if they don't exist)
 */
export const addTagsToVideo = mutation({
  args: {
    videoId: v.id('videos'),
    userId: v.id('users'),
    tagNames: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Check if video exists and belongs to user
      const video = await ctx.db.get(args.videoId)
      if (!video || video.userId !== args.userId) {
        return {
          success: false,
          messageKey: 'videos.errors.notFound',
        }
      }

      // Get or create tags
      const tagIds: Id<'tags'>[] = []
      const now = Date.now()

      for (const tagName of args.tagNames) {
        // Check if tag already exists
        const existingTag = await ctx.db
          .query('tags')
          .withIndex('by_user_name', q => q.eq('userId', args.userId).eq('name', tagName))
          .first()

        if (existingTag) {
          tagIds.push(existingTag._id)
        } else {
          // Create new tag
          const tagId = await ctx.db.insert('tags', {
            userId: args.userId,
            name: tagName,
            createdAt: now,
          })
          tagIds.push(tagId)
        }
      }

      // Merge with existing tags
      const existingTagIds = video.tagIds || []
      const newTagIds = [...new Set([...existingTagIds, ...tagIds])]

      await ctx.db.patch(args.videoId, {
        tagIds: newTagIds,
      })

      const updatedVideo = await ctx.db.get(args.videoId)

      return {
        success: true,
        video: updatedVideo,
      }
    } catch (error) {
      console.error('[Convex][AddTagsToVideo] Error:', error)
      return {
        success: false,
        messageKey: 'videos.errors.addTagsFailed',
      }
    }
  },
})

/*
 * Remove tags from video
 */
export const removeTagsFromVideo = mutation({
  args: {
    videoId: v.id('videos'),
    userId: v.id('users'),
    tagIds: v.array(v.id('tags')),
  },
  handler: async (ctx, args) => {
    try {
      // Check if video exists and belongs to user
      const video = await ctx.db.get(args.videoId)
      if (!video || video.userId !== args.userId) {
        return {
          success: false,
          messageKey: 'videos.errors.notFound',
        }
      }

      // Remove specified tags
      const existingTagIds = video.tagIds || []
      const newTagIds = existingTagIds.filter(id => !args.tagIds.includes(id))

      await ctx.db.patch(args.videoId, {
        tagIds: newTagIds,
      })

      const updatedVideo = await ctx.db.get(args.videoId)

      return {
        success: true,
        video: updatedVideo,
      }
    } catch (error) {
      console.error('[Convex][RemoveTagsFromVideo] Error:', error)
      return {
        success: false,
        messageKey: 'videos.errors.removeTagsFailed',
      }
    }
  },
})

/*
 * Get user videos
 */
export const getUserVideos = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const videos = await ctx.db
      .query('videos')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .order('desc')
      .collect()

    return videos
  },
})

/*
 * Get video with progress
 */
export const getVideoWithProgress = query({
  args: {
    videoId: v.id('videos'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    try {
      const video = await ctx.db.get(args.videoId)

      if (!video || video.userId !== args.userId) {
        return {
          success: false,
          messageKey: 'videos.errors.notFound',
        }
      }

      return {
        success: true,
        video,
        progress: video.progress || 0,
      }
    } catch (error) {
      console.error('[Convex][GetVideoWithProgress] Error:', error)
      return {
        success: false,
        messageKey: 'videos.errors.getFailed',
      }
    }
  },
})

/*
 * Update video progress
 */
export const updateVideoProgress = mutation({
  args: {
    videoId: v.id('videos'),
    userId: v.id('users'),
    progress: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      // Check if video exists and belongs to user
      const video = await ctx.db.get(args.videoId)
      if (!video || video.userId !== args.userId) {
        return {
          success: false,
          messageKey: 'videos.errors.notFound',
        }
      }

      // Update progress
      await ctx.db.patch(args.videoId, {
        progress: args.progress,
      })

      return {
        success: true,
        progress: args.progress,
      }
    } catch (error) {
      console.error('[Convex][UpdateVideoProgress] Error:', error)
      return {
        success: false,
        messageKey: 'videos.errors.updateFailed',
      }
    }
  },
})
