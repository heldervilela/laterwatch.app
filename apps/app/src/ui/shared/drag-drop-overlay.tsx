"use client"

import { api } from "@/services/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { listen } from "@tauri-apps/api/event"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function DragDropOverlay() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const queryClient = useQueryClient()

  // Extract YouTube URL from text
  const extractYouTubeUrl = (text: string): string | null => {
    const urlPattern =
      /(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/
    const match = text.match(urlPattern)
    if (match) {
      let url = match[0]
      // Ensure URL has protocol
      if (!url.startsWith("http")) {
        url = "https://" + url
      }
      return url
    }
    return null
  }

  const validateYouTubeUrl = (url: string): boolean => {
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}$/
    return youtubeRegex.test(url)
  }

  const addVideoMutation = useMutation({
    mutationFn: (videoUrl: string) =>
      (api.videos as any).createVideo.mutate({
        url: videoUrl,
        platform: "youtube",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos", "user"] })
      toast.success("🎬 Video added successfully via drag & drop!")
      setIsProcessing(false)
    },
    onError: (error: any) => {
      console.error("Error adding video:", error)
      toast.error("Failed to add video. Please try again.")
      setIsProcessing(false)
    },
  })

  const processDroppedContent = async (paths: string[]) => {
    console.log("🎬 Processing dropped content:", paths)
    setIsProcessing(true)

    // For now, we'll handle this differently since we're looking for URLs, not files
    // In a real scenario, you might read file contents or handle differently
    toast.info(
      "Drag & drop detected! However, URL extraction from external sources requires different handling in Tauri v2."
    )
    setIsProcessing(false)
  }

  // Set up Tauri drag & drop listeners
  useEffect(() => {
    let unsubscribeDragEnter: (() => void) | null = null
    let unsubscribeDragLeave: (() => void) | null = null
    let unsubscribeDrop: (() => void) | null = null

    const setupListeners = async () => {
      try {
        console.log("🚀 Setting up Tauri drag & drop listeners")

        // Listen for drag enter
        unsubscribeDragEnter = await listen("tauri://drag-enter", (event) => {
          console.log("🔵 Tauri drag enter:", event)
          setIsDragOver(true)
        })

        // Listen for drag leave
        unsubscribeDragLeave = await listen("tauri://drag-leave", (event) => {
          console.log("🟡 Tauri drag leave:", event)
          setIsDragOver(false)
        })

        // Listen for drop
        unsubscribeDrop = await listen("tauri://drag-drop", (event) => {
          console.log("🟢 Tauri drop:", event)
          setIsDragOver(false)

          if (event.payload && Array.isArray(event.payload)) {
            processDroppedContent(event.payload)
          }
        })

        console.log("✅ Tauri drag & drop listeners setup complete")
      } catch (error) {
        console.error("❌ Failed to setup Tauri listeners:", error)
        toast.error(
          "Drag & drop setup failed. Please check console for details."
        )
      }
    }

    setupListeners()

    return () => {
      console.log("🧹 Cleaning up Tauri listeners")
      if (unsubscribeDragEnter) unsubscribeDragEnter()
      if (unsubscribeDragLeave) unsubscribeDragLeave()
      if (unsubscribeDrop) unsubscribeDrop()
    }
  }, [])

  // Alternative: Set up a simple input for URLs with instructions
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualUrl, setManualUrl] = useState("")

  const handleManualSubmit = () => {
    if (!manualUrl.trim()) return

    const youtubeUrl = extractYouTubeUrl(manualUrl)
    if (!youtubeUrl || !validateYouTubeUrl(youtubeUrl)) {
      toast.error("Please enter a valid YouTube URL")
      return
    }

    console.log("🎬 Adding video manually:", youtubeUrl)
    addVideoMutation.mutate(youtubeUrl)
    setManualUrl("")
    setShowManualInput(false)
  }

  // Show drag overlay when dragging
  if (isDragOver) {
    return (
      <>
        {/* Blue border overlay */}
        <div className="pointer-events-none fixed inset-0 z-[9998]">
          <div className="h-full w-full border-4 border-dashed border-blue-500 bg-blue-50/20 backdrop-blur-sm"></div>
        </div>

        {/* Central drop zone */}
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="rounded-2xl border-2 border-blue-500 bg-white p-8 shadow-2xl">
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-full bg-blue-100 p-6">
                <svg
                  className="h-12 w-12 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  Drop Content Here
                </h3>
                <p className="text-gray-600">Release to process content</p>
              </div>
              {isProcessing && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                  <span>Processing...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    )
  }

  // Show manual input modal
  if (showManualInput) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Add YouTube URL
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            Due to Tauri v2 security restrictions, please paste the YouTube URL
            directly:
          </p>
          <input
            type="text"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
            autoFocus
          />
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => setShowManualInput(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleManualSubmit}
              disabled={addVideoMutation.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {addVideoMutation.isPending ? "Adding..." : "Add Video"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show floating help button
  return (
    <div className="fixed right-6 bottom-6 z-50">
      <button
        onClick={() => setShowManualInput(true)}
        className="rounded-full bg-blue-600 p-3 text-white shadow-lg transition-colors hover:bg-blue-700"
        title="Add YouTube URL"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>
  )
}
