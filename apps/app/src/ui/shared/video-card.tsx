"use client"

import { api } from "@/services/api"
import { useVideoPlayerStore } from "@/stores/video-player-store"
import { Card } from "@/ui/base/card"
import { Dialog, DialogContent } from "@/ui/base/dialog"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Archive,
  Clock,
  ExternalLink,
  Eye,
  Heart,
  Play,
  Trash2,
  Video,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"

import { durationToSeconds, formatRelativeTime } from "../utils/dates"

interface VideoCardProps {
  video: {
    _id: string
    title?: string | undefined
    url: string
    thumbnail?: string | undefined
    duration?: string | undefined
    addedAt: number
    isFavorite?: boolean
    isWatched?: boolean
    isArchived?: boolean
    progress?: number
  }
}

export function VideoCard({ video }: VideoCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const queryClient = useQueryClient()
  const { openPlayer, videoProgress } = useVideoPlayerStore()

  // Safe values with defaults
  const isFavorite = video.isFavorite || false
  const isWatched = video.isWatched || false
  const isArchived = video.isArchived || false

  // Get progress - use store progress or video progress from database
  const storeProgress = videoProgress[video._id] || 0
  const videoProgress_db = video.progress || 0
  const currentProgress = Math.max(storeProgress, videoProgress_db)

  // Calculate progress percentage
  const totalDuration = durationToSeconds(video.duration)
  const progressPercentage =
    totalDuration > 0 && currentProgress > 0
      ? (currentProgress / totalDuration) * 100
      : 0

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: () =>
      (api.videos as any).deleteVideo.mutate({ videoId: video._id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] })
      toast.success("Video deleted successfully")
      // Close dialog with a small delay to prevent event issues
      setTimeout(() => {
        setShowDeleteConfirm(false)
      }, 100)
    },
    onError: (error) => {
      console.error("Error deleting video:", error)
      toast.error("Failed to delete video")
      setShowDeleteConfirm(false)
    },
  })

  const toggleFavoriteMutation = useMutation({
    mutationFn: () =>
      (api.videos as any).updateVideo.mutate({
        videoId: video._id,
        isFavorite: !isFavorite,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] })
      toast.success(
        isFavorite ? "Removed from favorites" : "Added to favorites"
      )
    },
    onError: (error) => {
      console.error("Error updating favorite:", error)
      toast.error("Failed to update favorite status")
    },
  })

  const toggleWatchedMutation = useMutation({
    mutationFn: () =>
      (api.videos as any).updateVideo.mutate({
        videoId: video._id,
        isWatched: !isWatched,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] })
      toast.success(isWatched ? "Marked as unwatched" : "Marked as watched")
    },
    onError: (error) => {
      console.error("Error updating watched status:", error)
      toast.error("Failed to update watched status")
    },
  })

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    deleteMutation.mutate()
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    toggleFavoriteMutation.mutate()
  }

  const handleToggleWatched = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    toggleWatchedMutation.mutate()
  }

  const handleCardClick = () => {
    // Don't open player if delete is in progress or dialog is open
    if (deleteMutation.isPending || showDeleteConfirm) {
      return
    }

    openPlayer({
      _id: video._id,
      title: video.title,
      url: video.url,
      thumbnail: video.thumbnail,
      duration: video.duration,
    })
  }

  const handleExternalLink = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    window.open(video.url, "_blank", "noopener,noreferrer")
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    setShowDeleteConfirm(true)
  }

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    setShowDeleteConfirm(false)
  }

  return (
    <>
      <Card
        className="group relative cursor-pointer overflow-hidden border-0 bg-transparent p-0 shadow-sm transition-all duration-300 hover:shadow-xl"
        onClick={handleCardClick}
      >
        {/* Main image container with overlay content */}
        <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
          {/* Background image */}
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.title || "Video thumbnail"}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200">
              <Video className="h-8 w-8 text-gray-400" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Duration and added time badges - hidden on hover */}
          <div className="absolute top-3 left-3 flex gap-2 transition-all duration-300 group-hover:opacity-0">
            {video.duration && (
              <div className="rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {video.duration}
              </div>
            )}
            <div className="flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <Clock className="h-3 w-3" />
              <span>{formatRelativeTime(video.addedAt)}</span>
            </div>
          </div>

          {/* Status indicators */}
          <div className="absolute top-3 left-1/2 flex -translate-x-1/2 gap-1">
            {isArchived && (
              <div className="rounded-full bg-gray-500/80 p-1 backdrop-blur-sm">
                <Archive className="h-3 w-3 text-white" />
              </div>
            )}
          </div>

          {/* Bottom controls - Play button and Action buttons */}
          <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between opacity-0 transition-all duration-300 group-hover:opacity-100">
            {/* Play button */}
            <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
              <Play className="h-6 w-6 fill-white text-white" />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              {/* Favorite button */}
              <button
                onClick={handleToggleFavorite}
                disabled={toggleFavoriteMutation.isPending}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200",
                  isFavorite
                    ? "bg-red-500/90 text-white hover:bg-red-600/90"
                    : "bg-white/20 text-white hover:bg-white/30"
                )}
                title={
                  isFavorite ? "Remove from favorites" : "Add to favorites"
                }
              >
                <Heart
                  className={cn("h-4 w-4", isFavorite && "fill-current")}
                />
              </button>

              {/* Watched button */}
              <button
                onClick={handleToggleWatched}
                disabled={toggleWatchedMutation.isPending}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200",
                  isWatched
                    ? "bg-green-500/90 text-white hover:bg-green-600/90"
                    : "bg-white/20 text-white hover:bg-white/30"
                )}
                title={isWatched ? "Mark as unwatched" : "Mark as watched"}
              >
                <Eye className="h-4 w-4" />
              </button>

              {/* External link button */}
              <button
                onClick={handleExternalLink}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/30"
                title="Open in YouTube"
              >
                <ExternalLink className="h-4 w-4" />
              </button>

              {/* Delete button */}
              <button
                onClick={handleDeleteClick}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all duration-200 hover:bg-red-500/90"
                title="Delete video"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {progressPercentage > 0 && (
            <div className="absolute right-0 bottom-0 left-0 h-1 bg-white/20">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          )}

          {/* Content overlay at bottom - hidden on hover */}
          <div className="absolute right-0 bottom-0 left-0 p-4 transition-all duration-300 group-hover:opacity-0">
            <h3 className="truncate text-sm leading-tight font-semibold text-white drop-shadow-md">
              {video.title || "Untitled video"}
            </h3>
          </div>
        </div>
      </Card>

      {/* Delete confirmation dialog - outside Card to prevent event bubbling */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent
          className="max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-lg font-medium">Delete Video</h4>
              <p className="text-muted-foreground text-sm">
                Are you sure you want to delete this video? This action cannot
                be undone.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelDelete}
                className="rounded bg-gray-200 px-4 py-2 text-sm transition-colors hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="rounded bg-red-500 px-4 py-2 text-sm text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
