import { api } from "@/services/api"
import { create } from "zustand"

import { validateYouTubeUrl } from "@/lib/utils"

// Types
interface AddVideoState {
  // Modal state
  isModalOpen: boolean

  // Form state
  url: string
  isValidUrl: boolean
  error: string

  // Loading states
  isLoading: boolean

  // Actions
  openModal: () => void
  closeModal: () => void
  setUrl: (url: string) => void
  setError: (error: string) => void
  clearError: () => void
  validateUrl: (url: string) => boolean
  submitVideo: () => Promise<boolean>
  reset: () => void
}

// Store implementation
export const useAddVideoStore = create<AddVideoState>((set, get) => ({
  // Initial state
  isModalOpen: false,
  url: "",
  isValidUrl: false,
  error: "",
  isLoading: false,

  // Open modal
  openModal: () => {
    set({ isModalOpen: true })
  },

  // Close modal and reset form
  closeModal: () => {
    const { reset } = get()
    reset()
    set({ isModalOpen: false })
  },

  // Set URL and validate
  setUrl: (url: string) => {
    const isValid = validateYouTubeUrl(url)
    set({
      url,
      isValidUrl: isValid,
      error: "", // Clear error when typing
    })
  },

  // Set error message
  setError: (error: string) => {
    set({ error })
  },

  // Clear error
  clearError: () => {
    set({ error: "" })
  },

  // Validate URL
  validateUrl: (url: string) => {
    return validateYouTubeUrl(url)
  },

  // Submit video
  submitVideo: async (): Promise<boolean> => {
    const { url, isValidUrl, setError } = get()

    if (!isValidUrl) {
      setError("Please enter a valid YouTube URL")
      return false
    }

    try {
      set({ isLoading: true, error: "" })

      // Close modal immediately when process starts for better UX
      set({ isModalOpen: false })

      await (api.videos as any).createVideo.mutate({
        url,
        platform: "youtube",
      })

      // Success - reset form (modal is already closed)
      get().reset()
      return true
    } catch (error: any) {
      console.error("Error adding video:", error)
      setError(error.message || "Error adding video. Please try again.")
      // Reopen modal on error so user can see the error and retry
      set({ isModalOpen: true })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  // Reset form state
  reset: () => {
    set({
      url: "",
      isValidUrl: false,
      error: "",
      isLoading: false,
    })
  },
}))
