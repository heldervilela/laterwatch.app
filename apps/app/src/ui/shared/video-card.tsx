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
      setShowDeleteConfirm(false)
    },
    onError: (error) => {
      console.error("Error deleting video:", error)
      toast.error("Failed to delete video")
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
            className="h-full w-full object-cover"
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

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="rounded-full bg-black/60 p-3 backdrop-blur-sm">
            <Play className="h-6 w-6 fill-white text-white" />
          </div>
        </div>

        {/* Status badges */}
        <div className="absolute top-2 right-2 flex gap-1">
          {isFavorite && (
            <div className="rounded-full bg-red-500 p-1 shadow-md">
              <Heart className="h-3 w-3 fill-white text-white" />
            </div>
          )}
          {isWatched && (
            <div className="rounded-full bg-green-500 p-1 shadow-md">
              <Eye className="h-3 w-3 text-white" />
            </div>
          )}
          {isArchived && (
            <div className="rounded-full bg-gray-500 p-1 shadow-md">
              <Archive className="h-3 w-3 text-white" />
            </div>
          )}
        </div>

        {/* Progress bar */}
        {progressPercentage > 0 && (
          <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-black/30">
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="flex flex-col gap-1 p-4">
        {/* Modern Action bar on hover */}
        <div className="absolute inset-x-2 bottom-2 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex items-center justify-between rounded-lg bg-white/95 p-2 shadow-lg backdrop-blur-sm">
            {/* External link */}
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
              onClick={handleWatchClick}
            >
              <ExternalLink className="h-4 w-4" />
              <span>YouTube</span>
            </a>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              {/* Toggle Favorite */}
              <button
                onClick={handleToggleFavorite}
                disabled={toggleFavoriteMutation.isPending}
                className={`rounded-md p-2 transition-all duration-200 ${
                  isFavorite
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "text-gray-500 hover:bg-gray-100 hover:text-red-500"
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
                className={`rounded-md p-2 transition-all duration-200 ${
                  isWatched
                    ? "bg-green-50 text-green-600 hover:bg-green-100"
                    : "text-gray-500 hover:bg-gray-100 hover:text-green-500"
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
                    className="rounded-md p-2 text-gray-500 transition-all duration-200 hover:bg-red-50 hover:text-red-500"
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

        {/* Details */}
        <h3
          className={cn(
            "mb-1 line-clamp-2 text-sm leading-tight font-medium",
            "transition-all duration-300 group-hover:opacity-0"
          )}
        >
          {video.title || "Untitled video"}
        </h3>

        <div
          className={cn(
            "flex items-center gap-1 text-xs text-gray-500",
            "transition-all duration-300 group-hover:opacity-0"
          )}
        >
          <Clock className="h-3 w-3" />
          <span>{formatRelativeTime(video.addedAt)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
