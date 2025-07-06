"use client"

import { api } from "@/services/api"
import { useVideoPlayerStore } from "@/stores/video-player-store"
import { Card, CardContent } from "@/ui/base/card"
import { Dialog, DialogContent, DialogTrigger } from "@/ui/base/dialog"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Archive,
  Clock,
  ExternalLink,
  Eye,
  Heart,
  Trash2,
  Video,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

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
  }
}

// Helper function to format relative time
function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days > 0) {
    return `${days} day${days !== 1 ? "s" : ""} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`
  } else {
    return "Just now"
  }
}

export function VideoCard({ video }: VideoCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const queryClient = useQueryClient()
  const { openPlayer } = useVideoPlayerStore()

  // Safe values with defaults
  const isFavorite = video.isFavorite || false
  const isWatched = video.isWatched || false
  const isArchived = video.isArchived || false

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: () => api.videos.deleteVideo.mutate({ videoId: video._id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] })
      toast.success("Video deleted successfully")
      setShowDeleteConfirm(false)
    },
    onError: (error) => {
      console.error("Error deleting video:", error)
      toast.error("Failed to delete video")
    },
  })

  const toggleFavoriteMutation = useMutation({
    mutationFn: () =>
      api.videos.updateVideo.mutate({
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
      api.videos.updateVideo.mutate({
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

  const handleDelete = () => {
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
    openPlayer({
      _id: video._id,
      title: video.title,
      url: video.url,
      thumbnail: video.thumbnail,
      duration: video.duration,
    })
  }

  const handleWatchClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    // This will open YouTube in new tab
  }

  return (
    <Card
      className="group relative cursor-pointer gap-0 overflow-hidden border-0 bg-white py-0 shadow-sm transition-all duration-200 hover:shadow-lg"
      onClick={handleCardClick}
    >
      {/* Thumbnail container */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title || "Video thumbnail"}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200">
            <Video className="h-8 w-8 text-gray-400" />
          </div>
        )}

        {/* Duration overlay */}
        {video.duration && (
          <div className="absolute right-2 bottom-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
            {video.duration}
          </div>
        )}

        {/* Status badges */}
        <div className="absolute top-2 right-2 flex gap-1">
          {isFavorite && (
            <div className="rounded-full bg-red-500 p-1">
              <Heart className="h-3 w-3 fill-white text-white" />
            </div>
          )}
          {isWatched && (
            <div className="rounded-full bg-green-500 p-1">
              <Eye className="h-3 w-3 text-white" />
            </div>
          )}
          {isArchived && (
            <div className="rounded-full bg-gray-500 p-1">
              <Archive className="h-3 w-3 text-white" />
            </div>
          )}
        </div>

        {/* Action bar on hover */}
        <div className="absolute right-0 bottom-0 left-0 translate-y-full bg-black/80 p-2 transition-transform duration-200 group-hover:translate-y-0">
          <div className="flex items-center justify-between">
            {/* External link */}
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-white transition-colors hover:text-blue-300"
              onClick={handleWatchClick}
            >
              <ExternalLink className="h-4 w-4" />
              <span className="text-sm">Watch on YouTube</span>
            </a>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {/* Toggle Favorite */}
              <button
                onClick={handleToggleFavorite}
                disabled={toggleFavoriteMutation.isPending}
                className={`rounded p-1 transition-colors ${
                  isFavorite
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
                title={
                  isFavorite ? "Remove from favorites" : "Add to favorites"
                }
              >
                <Heart
                  className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
                />
              </button>

              {/* Toggle Watched */}
              <button
                onClick={handleToggleWatched}
                disabled={toggleWatchedMutation.isPending}
                className={`rounded p-1 transition-colors ${
                  isWatched
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
                title={isWatched ? "Mark as unwatched" : "Mark as watched"}
              >
                <Eye className="h-4 w-4" />
              </button>

              {/* Delete with Dialog */}
              <Dialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
              >
                <DialogTrigger asChild>
                  <button
                    className="rounded bg-white/20 p-1 text-white transition-colors hover:bg-red-500"
                    title="Delete video"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-lg font-medium">Delete Video</h4>
                      <p className="text-muted-foreground text-sm">
                        Are you sure you want to delete this video? This action
                        cannot be undone.
                      </p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
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
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <CardContent className="flex flex-col gap-1 p-4">
        <h3 className="mb-1 line-clamp-2 text-sm leading-tight font-medium transition-colors group-hover:text-blue-600">
          {video.title || "Untitled video"}
        </h3>

        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>{formatRelativeTime(video.addedAt)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
