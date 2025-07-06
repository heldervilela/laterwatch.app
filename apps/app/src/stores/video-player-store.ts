import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface VideoPlayerState {
  // Current video being played
  currentVideo: {
    _id: string
    title?: string
    url: string
    thumbnail?: string
    duration?: string
  } | null

  // Modal state
  isPlayerOpen: boolean

  // Progress tracking
  videoProgress: Record<string, number> // videoId -> progress in seconds

  // Actions
  openPlayer: (video: VideoPlayerState["currentVideo"]) => void
  closePlayer: () => void
  updateProgress: (videoId: string, progress: number) => void
  getProgress: (videoId: string) => number
}

export const useVideoPlayerStore = create<VideoPlayerState>()(
  persist(
    (set, get) => ({
      currentVideo: null,
      isPlayerOpen: false,
      videoProgress: {},

      openPlayer: (video) => {
        set({
          currentVideo: video,
          isPlayerOpen: true,
        })
      },

      closePlayer: () => {
        set({
          currentVideo: null,
          isPlayerOpen: false,
        })
      },

      updateProgress: (videoId, progress) => {
        set((state) => ({
          videoProgress: {
            ...state.videoProgress,
            [videoId]: progress,
          },
        }))
      },

      getProgress: (videoId) => {
        const state = get()
        return state.videoProgress[videoId] || 0
      },
    }),
    {
      name: "video-player-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist video progress, not the current video or modal state
      partialize: (state) => ({
        videoProgress: state.videoProgress,
      }),
    }
  )
)
