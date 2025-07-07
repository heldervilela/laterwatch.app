import { api } from "@/services/api"
import { create } from "zustand"

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

  // Progress tracking (cache local para performance)
  videoProgress: Record<string, number> // videoId -> progress in seconds

  // Loading states
  isLoadingProgress: boolean
  isSavingProgress: boolean

  // Actions
  openPlayer: (video: VideoPlayerState["currentVideo"]) => void
  closePlayer: () => void
  updateProgress: (videoId: string, progress: number) => Promise<void>
  getProgress: (videoId: string) => number
  loadProgressFromAPI: (videoId: string) => Promise<void>
}

export const useVideoPlayerStore = create<VideoPlayerState>((set, get) => ({
  currentVideo: null,
  isPlayerOpen: false,
  videoProgress: {},
  isLoadingProgress: false,
  isSavingProgress: false,

  openPlayer: async (video) => {
    set({
      currentVideo: video,
      isPlayerOpen: true,
    })

    // Load progress from API when opening video
    if (video?._id) {
      await get().loadProgressFromAPI(video._id)
    }
  },

  closePlayer: () => {
    set({
      currentVideo: null,
      isPlayerOpen: false,
    })
  },

  updateProgress: async (videoId: string, progress: number) => {
    // Update local cache immediately for responsiveness
    set((state) => ({
      videoProgress: {
        ...state.videoProgress,
        [videoId]: progress,
      },
    }))

    // Save to API in background
    try {
      set({ isSavingProgress: true })

      await api.videoProgress.updateVideoProgress.mutate({
        videoId,
        progressSeconds: progress,
      })
    } catch (error) {
      console.error("Failed to save progress to API:", error)
      // TODO: Implement retry logic or offline queue
    } finally {
      set({ isSavingProgress: false })
    }
  },

  getProgress: (videoId: string) => {
    const state = get()
    return state.videoProgress[videoId] || 0
  },

  loadProgressFromAPI: async (videoId: string) => {
    try {
      set({ isLoadingProgress: true })

      const result = await api.videoProgress.getVideoProgress.query({
        videoId,
      })

      if (result.success && result.progress !== undefined) {
        // Update local cache with API data
        set((state) => ({
          videoProgress: {
            ...state.videoProgress,
            [videoId]: result.progress || 0,
          },
        }))
      }
    } catch (error) {
      console.error("Failed to load progress from API:", error)
      // Fallback to local cache - no need to throw error
    } finally {
      set({ isLoadingProgress: false })
    }
  },
}))
