import { v } from 'convex/values'
import { mutation, query } from '../_generated/server'

/*
 * Create a new tag
 */
export const createTag = mutation({
  args: {
    userId: v.id('users'),
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Check if tag already exists for this user
      const existingTag = await ctx.db
        .query('tags')
        .withIndex('by_user_name', q => q.eq('userId', args.userId).eq('name', args.name))
        .first()

      if (existingTag) {
        return {
          success: false,
          messageKey: 'tags.errors.alreadyExists',
        }
      }

      const now = Date.now()
      const tagId = await ctx.db.insert('tags', {
        userId: args.userId,
        name: args.name,
        color: args.color,
        createdAt: now,
      })

      const tag = await ctx.db.get(tagId)

      return {
        success: true,
        tag,
      }
    } catch (error) {
      console.error('[Convex][CreateTag] Error:', error)
      return {
        success: false,
        messageKey: 'tags.errors.createFailed',
      }
    }
  },
})

/*
 * Update tag
 */
export const updateTag = mutation({
  args: {
    tagId: v.id('tags'),
    userId: v.id('users'),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Check if tag exists and belongs to user
      const tag = await ctx.db.get(args.tagId)
      if (!tag || tag.userId !== args.userId) {
        return {
          success: false,
          messageKey: 'tags.errors.notFound',
        }
      }

      // Check if name already exists (if changing name)
      if (args.name && args.name !== tag.name) {
        const existingTag = await ctx.db
          .query('tags')
          .withIndex('by_user_name', q => q.eq('userId', args.userId).eq('name', args.name!))
          .first()

        if (existingTag) {
          return {
            success: false,
            messageKey: 'tags.errors.nameAlreadyExists',
          }
        }
      }

      const updates: any = {}

      if (args.name !== undefined) {
        updates.name = args.name
      }

      if (args.color !== undefined) {
        updates.color = args.color
      }

      await ctx.db.patch(args.tagId, updates)

      const updatedTag = await ctx.db.get(args.tagId)

      return {
        success: true,
        tag: updatedTag,
      }
    } catch (error) {
      console.error('[Convex][UpdateTag] Error:', error)
      return {
        success: false,
        messageKey: 'tags.errors.updateFailed',
      }
    }
  },
})

/*
 * Delete tag
 */
export const deleteTag = mutation({
  args: {
    tagId: v.id('tags'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    try {
      // Check if tag exists and belongs to user
      const tag = await ctx.db.get(args.tagId)
      if (!tag || tag.userId !== args.userId) {
        return {
          success: false,
          messageKey: 'tags.errors.notFound',
        }
      }

      // Remove tag from all videos that have it
      const videosWithTag = await ctx.db
        .query('videos')
        .withIndex('by_user', q => q.eq('userId', args.userId))
        .collect()

      for (const video of videosWithTag) {
        if (video.tagIds && video.tagIds.includes(args.tagId)) {
          const newTagIds = video.tagIds.filter(id => id !== args.tagId)
          await ctx.db.patch(video._id, { tagIds: newTagIds })
        }
      }

      await ctx.db.delete(args.tagId)

      return {
        success: true,
      }
    } catch (error) {
      console.error('[Convex][DeleteTag] Error:', error)
      return {
        success: false,
        messageKey: 'tags.errors.deleteFailed',
      }
    }
  },
})

/*
 * Get user tags
 */
export const getUserTags = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const tags = await ctx.db
      .query('tags')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .order('desc')
      .collect()

    return tags
  },
})
