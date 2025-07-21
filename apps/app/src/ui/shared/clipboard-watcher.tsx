"use client"

import { useEffect } from "react"
import { toast } from "sonner"

import { validateYouTubeUrl } from "@/lib/utils"
import { useAddVideo } from "@/hooks/use-add-video"

export function ClipboardWatcher() {
  const { submitVideo, setUrl, isLoading } = useAddVideo()

  // Extract URL from pasted text
  const extractUrl = (text: string): string | null => {
    // Remove whitespace
    const trimmed = text.trim()

    // Check if it's already a URL
    if (validateYouTubeUrl(trimmed)) {
      return trimmed
    }

    // Try to extract URL from text using regex
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const matches = trimmed.match(urlRegex)

    if (matches) {
      for (const match of matches) {
        if (validateYouTubeUrl(match)) {
          return match
        }
      }
    }

    return null
  }

  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      // Don't interfere if user is typing in an input field
      const target = event.target as HTMLElement
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.contentEditable === "true"
      ) {
        return
      }

      try {
        // Get clipboard text
        const clipboardText = event.clipboardData?.getData("text") || ""

        if (!clipboardText) return

        // Extract YouTube URL
        const youtubeUrl = extractUrl(clipboardText)

        if (!youtubeUrl) return

        // Don't process if already loading
        if (isLoading) {
          toast.info("Already processing a video, please wait...")
          return
        }

        // Show detection toast
        toast.info("YouTube URL detected! Adding video...", {
          duration: 2000,
        })

        // Set URL and submit automatically
        setUrl(youtubeUrl)

        // Small delay to ensure URL is set
        setTimeout(async () => {
          await submitVideo()
        }, 100)
      } catch (error) {
        console.error("Error processing clipboard:", error)
      }
    }

    // Add global paste listener
    document.addEventListener("paste", handlePaste)

    // Cleanup
    return () => {
      document.removeEventListener("paste", handlePaste)
    }
  }, [setUrl, submitVideo, isLoading])

  // This component doesn't render anything visible
  return null
}
