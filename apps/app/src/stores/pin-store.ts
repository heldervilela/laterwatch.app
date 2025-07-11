import { create } from "zustand"

interface PinState {
  // Pin state
  isPinned: boolean

  // Actions
  setPinned: (pinned: boolean) => void
  togglePin: () => Promise<void>
}

export const usePinStore = create<PinState>((set, get) => ({
  // Initial state
  isPinned: false,

  // Set pin state
  setPinned: (pinned: boolean) => {
    set({ isPinned: pinned })
  },

  // Toggle pin state with Tauri API
  togglePin: async () => {
    try {
      // Import Tauri window API dynamically
      const { getCurrentWindow } = await import("@tauri-apps/api/window")
      const window = getCurrentWindow()

      const currentState = get().isPinned
      const newState = !currentState

      await window.setAlwaysOnTop(newState)
      set({ isPinned: newState })

      console.log(
        "📌 Global pin state changed:",
        newState ? "pinned" : "unpinned"
      )
    } catch (error) {
      console.warn("Failed to toggle pin state:", error)
      // Fallback for development or if Tauri API is not available
      set((state) => ({ isPinned: !state.isPinned }))
    }
  },
}))
