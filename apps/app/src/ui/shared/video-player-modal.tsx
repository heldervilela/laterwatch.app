import { useVideoPlayerStore } from "@/stores/video-player-store"
import { ExternalLink, Maximize2, Minimize2, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

// Declare YouTube API types
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

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
  const playerRef = useRef<HTMLDivElement>(null)
  const ytPlayerRef = useRef<any>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout>()
  const [apiLoaded, setApiLoaded] = useState(false)

  // Load YouTube API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiLoaded(true)
      return
    }

    // Load YouTube IFrame API
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    const firstScriptTag = document.getElementsByTagName("script")[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    // Set up API ready callback
    window.onYouTubeIframeAPIReady = () => {
      setApiLoaded(true)
    }

    return () => {
      // Cleanup
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  // Initialize YouTube player when API is loaded
  useEffect(() => {
    if (!apiLoaded || !playerRef.current) return

    const playerId = `youtube-player-${videoId}-${Date.now()}`
    playerRef.current.id = playerId

    ytPlayerRef.current = new window.YT.Player(playerId, {
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        start: Math.floor(startSeconds),
        enablejsapi: 1,
        rel: 0,
        modestbranding: 1,
        fs: 1,
        cc_load_policy: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: () => {
          // Start progress tracking
          progressIntervalRef.current = setInterval(() => {
            if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
              try {
                const currentTime = ytPlayerRef.current.getCurrentTime()
                if (currentTime > 0) {
                  onTimeUpdate?.(currentTime)
                }
              } catch (e) {
                console.warn("Error getting current time:", e)
              }
            }
          }, 1000)
        },
        onStateChange: (event: any) => {
          // YouTube player states:
          // -1: unstarted, 0: ended, 1: playing, 2: paused, 3: buffering, 5: video cued
          if (event.data === 0) {
            // Video ended
            onEnd?.()
          }
        },
        onError: (event: any) => {
          console.error("YouTube player error:", event.data)
        },
      },
    })

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
        ytPlayerRef.current.destroy()
      }
    }
  }, [apiLoaded, videoId, startSeconds, onTimeUpdate, onEnd])

  return (
    <div
      ref={playerRef}
      className={cn("h-full w-full", className)}
      style={{ minHeight: "400px" }}
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
  const [currentProgress, setCurrentProgress] = useState(0)
  const modalRef = useRef<HTMLDivElement>(null)

  const videoId = currentVideo?.url
    ? extractYouTubeVideoId(currentVideo.url)
    : null
  const savedProgress = currentVideo ? getProgress(currentVideo._id) : 0

  // Initialize current progress when video changes
  useEffect(() => {
    if (currentVideo) {
      setCurrentProgress(savedProgress)
    }
  }, [currentVideo, savedProgress])

  const handleTimeUpdate = useCallback(
    (currentTime: number) => {
      if (currentVideo && currentTime > 0) {
        // Update current progress state immediately for UI responsiveness
        setCurrentProgress(currentTime)

        // Save progress every 3 seconds to balance between accuracy and performance
        // Also save when the time difference is significant (user jumped in timeline)
        const roundedTime = Math.floor(currentTime)
        const lastSavedTime = Math.floor(getProgress(currentVideo._id))
        const timeDifference = Math.abs(roundedTime - lastSavedTime)

        if (
          (roundedTime % 3 === 0 && roundedTime !== lastSavedTime) || // Every 3 seconds
          timeDifference > 10 // Or if user jumped more than 10 seconds
        ) {
          updateProgress(currentVideo._id, currentTime)
        }
      }
    },
    [currentVideo, updateProgress, getProgress]
  )

  const handleVideoEnd = useCallback(() => {
    if (currentVideo) {
      // Reset progress when video ends completely
      // Only reset if we're near the end to avoid false positives
      const currentProgressValue = getProgress(currentVideo._id)
      if (currentProgressValue > 30) {
        // Only reset if we had significant progress
        updateProgress(currentVideo._id, 0)
        setCurrentProgress(0)
      }
    }
  }, [currentVideo, updateProgress, getProgress])

  const handleClose = useCallback(() => {
    closePlayer()
    setIsFullscreen(false)
    setCurrentProgress(0)
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
        currentProgress > 0
          ? `${currentVideo.url}&t=${Math.floor(currentProgress)}s`
          : currentVideo.url
      window.open(url, "_blank")
    }
  }, [currentVideo, currentProgress])

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
      className="fixed inset-0 z-101 flex items-center justify-center bg-black"
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
              Starting at {Math.floor(savedProgress / 60)}:
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
      {currentProgress > 0 && (
        <div className="absolute right-4 bottom-4 left-4 rounded bg-black/50 p-2 text-center text-sm text-white">
          Current time: {Math.floor(currentProgress / 60)}:
          {(currentProgress % 60).toFixed(0).padStart(2, "0")}
        </div>
      )}
    </div>
  )
}
