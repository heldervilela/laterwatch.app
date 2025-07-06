"use client"

import { useVideoPlayerStore } from "@/stores/video-player-store"
import { ExternalLink, Maximize2, Minimize2, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

// Helper to extract YouTube video ID from URL
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

interface YouTubePlayerProps {
  videoId: string
  startSeconds?: number
  onTimeUpdate?: (currentTime: number) => void
  onEnd?: () => void
  className?: string
}

function YouTubePlayer({
  videoId,
  startSeconds = 0,
  onTimeUpdate,
  onEnd,
  className,
}: YouTubePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [currentTime, setCurrentTime] = useState(startSeconds)
  const progressIntervalRef = useRef<NodeJS.Timeout>()

  const embedUrl =
    `https://www.youtube.com/embed/${videoId}?` +
    `autoplay=1&` +
    `start=${Math.floor(startSeconds)}&` +
    `enablejsapi=1&` +
    `origin=${window.location.origin}&` +
    `rel=0&` +
    `modestbranding=1&` +
    `fs=1&` +
    `cc_load_policy=1`

  useEffect(() => {
    // Listen for YouTube player messages
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.youtube.com") return

      if (event.data && typeof event.data === "string") {
        try {
          const data = JSON.parse(event.data)

          if (data.event === "video-progress") {
            const time = data.info?.currentTime || 0
            setCurrentTime(time)
            onTimeUpdate?.(time)
          } else if (data.event === "video-ended") {
            onEnd?.()
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    }

    window.addEventListener("message", handleMessage)

    // Start progress tracking
    progressIntervalRef.current = setInterval(() => {
      if (iframeRef.current) {
        // Simulate progress - in a real implementation, you'd use YouTube API
        const simulatedTime = currentTime + 1
        setCurrentTime(simulatedTime)
        onTimeUpdate?.(simulatedTime)
      }
    }, 1000)

    return () => {
      window.removeEventListener("message", handleMessage)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [currentTime, onTimeUpdate, onEnd])

  return (
    <iframe
      ref={iframeRef}
      src={embedUrl}
      className={cn("h-full w-full border-0", className)}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      onLoad={() => setIsReady(true)}
    />
  )
}

export function VideoPlayerModal() {
  const {
    currentVideo,
    isPlayerOpen,
    closePlayer,
    updateProgress,
    getProgress,
  } = useVideoPlayerStore()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const videoId = currentVideo?.url
    ? extractYouTubeVideoId(currentVideo.url)
    : null
  const savedProgress = currentVideo ? getProgress(currentVideo._id) : 0

  const handleTimeUpdate = useCallback(
    (currentTime: number) => {
      if (currentVideo && currentTime > 0) {
        // Save progress every 5 seconds to avoid too many updates
        if (Math.floor(currentTime) % 5 === 0) {
          updateProgress(currentVideo._id, currentTime)
        }
      }
    },
    [currentVideo, updateProgress]
  )

  const handleVideoEnd = useCallback(() => {
    if (currentVideo) {
      // Reset progress when video ends
      updateProgress(currentVideo._id, 0)
    }
  }, [currentVideo, updateProgress])

  const handleClose = useCallback(() => {
    closePlayer()
    setIsFullscreen(false)
  }, [closePlayer])

  const toggleFullscreen = useCallback(() => {
    if (!modalRef.current) return

    if (!isFullscreen) {
      modalRef.current.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }, [isFullscreen])

  const handleOpenInYouTube = useCallback(() => {
    if (currentVideo) {
      const url =
        savedProgress > 0
          ? `${currentVideo.url}&t=${Math.floor(savedProgress)}s`
          : currentVideo.url
      window.open(url, "_blank")
    }
  }, [currentVideo, savedProgress])

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPlayerOpen) {
        handleClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isPlayerOpen, handleClose])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  if (!isPlayerOpen || !currentVideo || !videoId) {
    return null
  }

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      {/* Header Controls */}
      <div className="absolute top-4 right-4 left-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="max-w-md truncate text-lg font-medium text-white">
            {currentVideo.title || "Video"}
          </h2>
          {savedProgress > 0 && (
            <div className="rounded bg-black/50 px-2 py-1 text-sm text-white/70">
              Resuming from {Math.floor(savedProgress / 60)}:
              {(savedProgress % 60).toFixed(0).padStart(2, "0")}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenInYouTube}
            className="rounded p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            title="Open in YouTube"
          >
            <ExternalLink className="h-5 w-5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="rounded p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={handleClose}
            className="rounded p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            title="Close player"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Video Player */}
      <div className="mx-4 mt-16 mb-4 h-full max-h-[80vh] w-full max-w-7xl">
        <YouTubePlayer
          videoId={videoId}
          startSeconds={savedProgress}
          onTimeUpdate={handleTimeUpdate}
          onEnd={handleVideoEnd}
          className="overflow-hidden rounded-lg shadow-2xl"
        />
      </div>

      {/* Progress indicator */}
      {savedProgress > 0 && (
        <div className="absolute right-4 bottom-4 left-4 rounded bg-black/50 p-2 text-center text-sm text-white">
          Video will resume from {Math.floor(savedProgress / 60)}:
          {(savedProgress % 60).toFixed(0).padStart(2, "0")}
        </div>
      )}
    </div>
  )
}
