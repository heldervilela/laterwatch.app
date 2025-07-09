import { api } from "@/services/api"
import { create } from "zustand"
import { persist } from "zustand/middleware"

// Types
interface Video {
  _id: string
  title?: string
  url: string
  thumbnail?: string
  duration?: string
  progress?: number
}

interface VideoPlayerState {
  // Player state
  currentVideo: Video | null
  isPlayerOpen: boolean

  // Progress cache (videoId -> seconds)
  videoProgress: Record<string, number>

  // Loading states
  isLoadingProgress: boolean
  isSavingProgress: boolean

  // Actions
  openPlayer: (video: Video) => Promise<void>
  closePlayer: () => void
  updateProgress: (videoId: string, progress: number) => Promise<void>
  getProgress: (videoId: string) => number
  initializeProgress: (videos: Video[]) => void
}

// Store implementation
export const useVideoPlayerStore = create<VideoPlayerState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentVideo: null,
      isPlayerOpen: false,
      videoProgress: {},
      isLoadingProgress: false,
      isSavingProgress: false,

      // Open video player modal
      openPlayer: async (video: Video) => {
        set({
          currentVideo: video,
          isPlayerOpen: true,
        })
      },

      // Close video player modal
      closePlayer: () => {
        set({
          currentVideo: null,
          isPlayerOpen: false,
        })
      },

      // Update video progress (local + API)
      updateProgress: async (videoId: string, progress: number) => {
        // Update local cache immediately for smooth UX
        set((state) => ({
          videoProgress: {
            ...state.videoProgress,
            [videoId]: progress,
          },
        }))

        // Save to database in background
        try {
          set({ isSavingProgress: true })

          await (api.videoProgress as any).updateVideoProgress.mutate({
            videoId,
            progressSeconds: progress,
          })
        } catch (error) {
          console.error("Failed to save progress:", error)
        } finally {
          set({ isSavingProgress: false })
        }
      },

      // Get progress for a video
      getProgress: (videoId: string) => {
        return get().videoProgress[videoId] || 0
      },

      // Initialize progress from database when app loads
      initializeProgress: (videos: Video[]) => {
        const progressMap: Record<string, number> = {}

        // Extract progress from videos
        videos.forEach((video) => {
          if (video._id && video.progress && video.progress > 0) {
            progressMap[video._id] = video.progress
          }
        })

        // Update store with database progress
        if (Object.keys(progressMap).length > 0) {
          set((state) => ({
            videoProgress: {
              ...state.videoProgress,
              ...progressMap,
            },
          }))

          console.log(
            `📊 Loaded progress for ${Object.keys(progressMap).length} videos`
          )
        }
      },
    }),
    {
      name: "video-player-store",
      partialize: (state) => ({
        videoProgress: state.videoProgress,
      }),
    }
  )
)
