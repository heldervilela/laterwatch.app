import { usePinStore } from "@/stores/pin-store"
import { useVideoPlayerStore } from "@/stores/video-player-store"
import { Maximize2, Pin, PinOff, X } from "lucide-react"
import { memo, useCallback, useEffect, useRef, useState } from "react"

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
  onPlayStateChange?: (isPlaying: boolean) => void
  className?: string
}

// Memoized YouTubePlayer component to prevent unnecessary re-renders
const YouTubePlayer = memo(function YouTubePlayer({
  videoId,
  startSeconds = 0,
  onTimeUpdate,
  onEnd,
  onPlayStateChange,
  className,
}: YouTubePlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null)
  const ytPlayerRef = useRef<any>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout>()
  const [apiLoaded, setApiLoaded] = useState(false)

  // Use refs to store stable callback references
  const onTimeUpdateRef = useRef(onTimeUpdate)
  const onEndRef = useRef(onEnd)
  const onPlayStateChangeRef = useRef(onPlayStateChange)

  // Update refs when callbacks change
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate
    onEndRef.current = onEnd
    onPlayStateChangeRef.current = onPlayStateChange
  }, [onTimeUpdate, onEnd, onPlayStateChange])

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
    console.log("🔄 YouTubePlayer useEffect triggered", {
      apiLoaded,
      videoId,
      startSeconds,
      timestamp: Date.now(),
    })

    if (!apiLoaded || !playerRef.current) return

    const playerId = `youtube-player-${videoId}-${Date.now()}`
    playerRef.current.id = playerId

    console.log("🎬 Creating new YouTube player", {
      playerId,
      videoId,
      startSeconds,
      timestamp: Date.now(),
    })

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
        showinfo: 0,
        iv_load_policy: 3,
        disablekb: 1,
        controls: 1,
        autohide: 1,
        playsinline: 1,
        widget_referrer: window.location.origin,
      },
      events: {
        onReady: () => {
          console.log("✅ YouTube player ready - NO MORE RELOADS EXPECTED", {
            videoId,
            startSeconds,
            timestamp: Date.now(),
          })
          // Start progress tracking
          progressIntervalRef.current = setInterval(() => {
            if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
              try {
                const currentTime = ytPlayerRef.current.getCurrentTime()
                if (currentTime > 0) {
                  onTimeUpdateRef.current?.(currentTime)
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
          console.log("🎵 YouTube player state changed:", event.data)

          if (event.data === 0) {
            // Video ended
            onEndRef.current?.()
            onPlayStateChangeRef.current?.(false)
          } else if (event.data === 1) {
            // Playing
            onPlayStateChangeRef.current?.(true)
          } else if (event.data === 2) {
            // Paused
            onPlayStateChangeRef.current?.(false)
          }
        },
        onError: (event: any) => {
          console.error("YouTube player error:", event.data)
        },
      },
    })

    return () => {
      console.log(
        "🧹 Cleaning up YouTube player - THIS SHOULD NOT HAPPEN DURING PLAYBACK",
        {
          videoId,
          timestamp: Date.now(),
        }
      )
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
        ytPlayerRef.current.destroy()
      }
    }
  }, [apiLoaded, videoId, startSeconds]) // These should be stable now

  // Add styles to hide YouTube player elements and maximize video area
  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
      /* Hide ALL YouTube UI elements except basic video controls */
      .ytp-chrome-top,
      .ytp-show-cards-title,
      .ytp-title,
      .ytp-title-text,
      .ytp-title-link,
      .ytp-chrome-top-buttons,
      .ytp-watch-later-button,
      .ytp-share-button,
      .ytp-overflow-button,
      .ytp-cards-button,
      .ytp-miniplayer-button,
      .ytp-remote-button,
      .ytp-size-button,
      .ytp-subtitles-button,
      .ytp-settings-button,
      .ytp-pip-button,
      .ytp-fullscreen-button,
      .ytp-watermark,
      .ytp-endscreen-element,
      .ytp-ce-element,
      .ytp-cards-teaser,
      .ytp-anno,
      .ytp-anno-list,
      .ytp-suggestion-set,
      .ytp-videowall-still,
      .ytp-pause-overlay,
      .ytp-scroll-min,
      .ytp-chapter-container,
      .ytp-tooltip,
      .ytp-bezel,
      .ytp-gradient-top,
      .ytp-gradient-bottom {
        display: none !important;
        visibility: hidden !important;
      }
      
      /* Ensure video fills entire space */
      .ytp-player-content {
        background: black !important;
      }
      
      /* Keep only essential playback controls */
      .ytp-left-controls,
      .ytp-right-controls {
        display: flex !important;
      }
      
      .ytp-play-button,
      .ytp-time-display,
      .ytp-progress-bar-container,
      .ytp-volume-slider-container,
      .ytp-mute-button {
        display: block !important;
      }
      
      /* Hide control bar after inactivity - cleaner full-screen experience */
      .ytp-autohide .ytp-chrome-bottom {
        opacity: 0 !important;
        transition: opacity 0.3s ease !important;
      }
      
      .ytp-autohide:hover .ytp-chrome-bottom {
        opacity: 1 !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div
      ref={playerRef}
      className={cn("h-full w-full", className)}
      style={{ height: "100vh", width: "100vw" }}
    ></div>
  )
})

export function VideoPlayerModal() {
  const {
    currentVideo,
    isPlayerOpen,
    closePlayer,
    updateProgress,
    getProgress,
  } = useVideoPlayerStore()
  const { isPinned, togglePin } = usePinStore()
  const [currentProgress, setCurrentProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [sizeIndex, setSizeIndex] = useState(0) // 0=800px, 1=500px, 2=300px
  const modalRef = useRef<HTMLDivElement>(null)

  // Use refs to store stable references to avoid re-creating callbacks
  const currentVideoRef = useRef(currentVideo)
  const updateProgressRef = useRef(updateProgress)
  const getProgressRef = useRef(getProgress)

  // Store initial progress to avoid re-creating player when progress is saved
  const initialProgressRef = useRef<number>(0)

  // Synchronize initial pin state when modal opens
  useEffect(() => {
    const syncPinState = async () => {
      if (isPlayerOpen) {
        try {
          const { getCurrentWindow } = await import("@tauri-apps/api/window")
          const window = getCurrentWindow()
          const isOnTop = await window.isAlwaysOnTop()

          // Update global state if it doesn't match window state
          if (isOnTop !== isPinned) {
            const { usePinStore } = await import("@/stores/pin-store")
            usePinStore.getState().setPinned(isOnTop)
          }
        } catch (error) {
          console.warn("Failed to sync pin state:", error)
        }
      }
    }

    syncPinState()
  }, [isPlayerOpen, isPinned])

  // Update refs when store values change
  useEffect(() => {
    currentVideoRef.current = currentVideo
    updateProgressRef.current = updateProgress
    getProgressRef.current = getProgress
  }, [currentVideo, updateProgress, getProgress])

  const videoId = currentVideo?.url
    ? extractYouTubeVideoId(currentVideo.url)
    : null

  // Initialize progress when video changes - but keep it stable during playback
  useEffect(() => {
    if (currentVideo) {
      const savedProgress = getProgressRef.current(currentVideo._id)
      initialProgressRef.current = savedProgress
      setCurrentProgress(savedProgress)

      console.log("🎬 Video changed, setting initial progress:", {
        videoId: currentVideo._id,
        savedProgress,
      })
    }
  }, [currentVideo]) // Only depend on currentVideo, not getProgress

  // Stable handleTimeUpdate - will NOT cause re-renders
  const handleTimeUpdate = useCallback((currentTime: number) => {
    const video = currentVideoRef.current
    if (video && currentTime > 0) {
      // Update current progress state immediately for UI responsiveness
      setCurrentProgress(currentTime)

      // Save progress every 3 seconds to balance between accuracy and performance
      // Also save when the time difference is significant (user jumped in timeline)
      const roundedTime = Math.floor(currentTime)
      const lastSavedTime = Math.floor(getProgressRef.current(video._id))
      const timeDifference = Math.abs(roundedTime - lastSavedTime)

      if (
        (roundedTime % 3 === 0 && roundedTime !== lastSavedTime) || // Every 3 seconds
        timeDifference > 10 // Or if user jumped more than 10 seconds
      ) {
        // Use async function but don't await to avoid blocking
        updateProgressRef.current(video._id, currentTime).catch((error) => {
          console.warn("Failed to save progress:", error)
        })
      }
    }
  }, []) // Empty dependencies - stable function

  // Stable handleVideoEnd - will NOT cause re-renders
  const handleVideoEnd = useCallback(() => {
    const video = currentVideoRef.current
    if (video) {
      // Reset progress when video ends completely
      // Only reset if we're near the end to avoid false positives
      const currentProgressValue = getProgressRef.current(video._id)
      if (currentProgressValue > 30) {
        // Only reset if we had significant progress
        updateProgressRef.current(video._id, 0).catch((error) => {
          console.warn("Failed to reset progress:", error)
        })
        setCurrentProgress(0)
      }
    }
  }, []) // Empty dependencies - stable function

  // Stable handlePlayStateChange - will NOT cause re-renders
  const handlePlayStateChange = useCallback((playing: boolean) => {
    setIsPlaying(playing)
    console.log("🎵 Play state changed:", playing ? "playing" : "paused")
  }, []) // Empty dependencies - stable function

  const handleClose = useCallback(() => {
    closePlayer()
    setCurrentProgress(0)
  }, [closePlayer])

  const handleStartDrag = useCallback(async (e: React.MouseEvent) => {
    try {
      // Import Tauri window API dynamically
      const { getCurrentWindow } = await import("@tauri-apps/api/window")
      const window = getCurrentWindow()

      // Start dragging the window
      await window.startDragging()

      console.log("🖱️ Window drag started")
    } catch (error) {
      console.warn("Failed to start window drag:", error)
    }
  }, [])

  const handleTogglePin = useCallback(async () => {
    await togglePin()
  }, [togglePin])

  const WINDOW_SIZES = [
    { width: 800, label: "Large" },
    { width: 500, label: "Medium" },
  ]

  const calculateHeight = useCallback((width: number) => {
    // Adjusted aspect ratio for better video proportions with black bars
    // 800px width -> 455px height, 500px -> 284px, 300px -> 171px
    const aspectRatio = 1.758 // Slightly more "cinematic" than 16:9 (1.777)
    const totalHeight = Math.round(width / aspectRatio)
    return totalHeight
  }, [])

  const toggleWindowSize = useCallback(async () => {
    try {
      // Import Tauri window API dynamically
      const { getCurrentWindow } = await import("@tauri-apps/api/window")
      const window = getCurrentWindow()

      const nextIndex = (sizeIndex + 1) % WINDOW_SIZES.length
      const { width } = WINDOW_SIZES[nextIndex]
      const height = calculateHeight(width)

      // Get current window position and size to maintain top-right corner fixed
      const currentPosition = await window.outerPosition()
      const currentSize = await window.outerSize()

      // Calculate new position to keep top-right corner in the same place
      // Window should grow/shrink towards left and bottom
      const widthDiff = currentSize.width - width
      const heightDiff = currentSize.height - height

      // Keep top-right corner fixed: adjust X by full width difference, keep Y same
      const x = currentPosition.x + widthDiff
      const y = currentPosition.y // Keep top edge in same position

      // Import Tauri types for size and position
      const { LogicalSize, LogicalPosition } = await import(
        "@tauri-apps/api/window"
      )

      await Promise.all([
        window.setSize(new LogicalSize(width, height)),
        window.setPosition(new LogicalPosition(x, y)),
      ])

      setSizeIndex(nextIndex)

      console.log("📏 Window resized:", {
        size: WINDOW_SIZES[nextIndex].label,
        width,
        height,
        currentPos: { x: currentPosition.x, y: currentPosition.y },
        newPos: { x, y },
        sizeDiff: { widthDiff, heightDiff },
      })
    } catch (error) {
      console.warn("Failed to resize window:", error)
      // Fallback - just update the index for UI feedback
      setSizeIndex((prev) => (prev + 1) % WINDOW_SIZES.length)
    }
  }, [sizeIndex, calculateHeight])

  // Reset size index when window is manually resized
  useEffect(() => {
    const handleResize = async () => {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window")
        const window = getCurrentWindow()

        // Listen for manual window resize
        const unlisten = await window.onResized(({ payload }) => {
          // Check if current size matches any of our presets
          const currentWidth = payload.width
          const matchingIndex = WINDOW_SIZES.findIndex(
            (size) => Math.abs(size.width - currentWidth) < 50 // Allow some tolerance
          )

          if (matchingIndex === -1) {
            // Manual resize detected, reset to first size for next click
            setSizeIndex(0)
            console.log(
              "🔄 Manual resize detected, reset to large size for next toggle"
            )
          }
        })

        return unlisten
      } catch (error) {
        console.warn("Failed to setup resize listener:", error)
      }
    }

    let cleanup: (() => void) | undefined

    if (isPlayerOpen) {
      handleResize().then((unlisten) => {
        cleanup = unlisten
      })
    }

    return () => {
      if (cleanup) {
        cleanup()
      }
    }
  }, [isPlayerOpen])

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

  if (!isPlayerOpen || !currentVideo || !videoId) {
    return null
  }

  console.log("🎭 VideoPlayerModal rendering", {
    isPlayerOpen,
    videoId,
    currentVideoId: currentVideo._id,
    initialProgress: initialProgressRef.current,
    currentProgress,
  })

  return (
    <div
      ref={modalRef}
      className="group fixed inset-0 z-101 bg-black"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      {/* Drag Area - Top bar for moving window */}
      <div
        className={`absolute top-0 right-20 left-0 z-40 h-12 transition-opacity duration-300 ease-in-out ${
          !isPlaying
            ? "bg-black/20 opacity-100" // Slightly visible when paused
            : "opacity-0 group-hover:bg-black/10 group-hover:opacity-100" // Transparent when playing, slightly visible on hover
        }`}
        onMouseDown={handleStartDrag}
        title="Drag to move window"
      />

      {/* Auto-hide Header Controls - Show when paused or on hover when playing */}
      <div
        className={`absolute top-0 right-0 z-50 p-4 transition-opacity duration-300 ease-in-out ${
          !isPlaying
            ? "opacity-100" // Always visible when paused
            : "opacity-0 group-hover:opacity-100" // Only on hover when playing
        }`}
      >
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/90 p-2 shadow-2xl backdrop-blur-md">
          <button
            onClick={handleTogglePin}
            className={`rounded border p-3 text-white/90 shadow-lg transition-all duration-200 hover:text-white ${
              isPinned
                ? "border-blue-500/50 bg-blue-600/80 hover:bg-blue-500/80"
                : "border-white/20 bg-black/80 hover:bg-white/20"
            }`}
            title={isPinned ? "Unpin window" : "Pin window always on top"}
          >
            {isPinned ? (
              <PinOff className="h-5 w-5" />
            ) : (
              <Pin className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={toggleWindowSize}
            className="rounded border border-white/20 bg-black/80 p-3 text-white/90 shadow-lg transition-all duration-200 hover:bg-white/20 hover:text-white"
            title={`Resize to ${WINDOW_SIZES[(sizeIndex + 1) % WINDOW_SIZES.length].label.toLowerCase()} (${WINDOW_SIZES[(sizeIndex + 1) % WINDOW_SIZES.length].width}px)`}
          >
            <Maximize2 className="h-5 w-5" />
          </button>

          <button
            onClick={handleClose}
            className="rounded border border-white/20 bg-black/80 p-3 text-white/90 shadow-lg transition-all duration-200 hover:border-red-500/50 hover:bg-red-600/80 hover:text-white"
            title="Close player"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Video Player - Full Screen */}
      <div className="h-full w-full">
        <YouTubePlayer
          videoId={videoId}
          startSeconds={initialProgressRef.current}
          onTimeUpdate={handleTimeUpdate}
          onEnd={handleVideoEnd}
          onPlayStateChange={handlePlayStateChange}
          className="h-full w-full"
        />
      </div>
    </div>
  )
}
