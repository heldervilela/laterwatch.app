import { useAddVideoStore } from "@/stores/add-video-store"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useAddVideo() {
  const queryClient = useQueryClient()
  const store = useAddVideoStore()

  // Enhanced submit function that handles cache invalidation and notifications
  const submitVideo = async (): Promise<boolean> => {
    const success = await store.submitVideo()

    if (success) {
      // Invalidate and refetch videos on success
      queryClient.invalidateQueries({ queryKey: ["videos", "user"] })

      // Show success toast
      toast.success("Video added successfully!")
    } else {
      // Show error toast (error message is already set in store)
      toast.error("Failed to add video. Please try again.")
    }

    return success
  }

  return {
    // State
    isModalOpen: store.isModalOpen,
    url: store.url,
    isValidUrl: store.isValidUrl,
    error: store.error,
    isLoading: store.isLoading,

    // Actions
    openModal: store.openModal,
    closeModal: store.closeModal,
    setUrl: store.setUrl,
    setError: store.setError,
    clearError: store.clearError,
    validateUrl: store.validateUrl,
    submitVideo, // Enhanced version with cache invalidation
    reset: store.reset,
  }
}
