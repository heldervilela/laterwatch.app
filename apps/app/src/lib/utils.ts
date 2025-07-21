import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// YouTube URL validation and ID extraction utilities
export const extractYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    // Standard youtube.com URLs with parameters
    /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
    // Short youtu.be URLs
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    // Embed URLs
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    // Standard without parameters
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})$/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

export const validateYouTubeUrl = (url: string): boolean => {
  return extractYouTubeVideoId(url) !== null
}

export const normalizeYouTubeUrl = (url: string): string | null => {
  const videoId = extractYouTubeVideoId(url)
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null
}
