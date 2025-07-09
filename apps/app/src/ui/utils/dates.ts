export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days > 0) {
    return `${days} day${days !== 1 ? "s" : ""} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`
  } else {
    return "Just now"
  }
}

export function durationToSeconds(duration?: string): number {
  if (!duration) return 0

  const parts = duration.split(":").map(Number)
  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1]
  } else if (parts.length === 1) {
    // SS
    return parts[0]
  }
  return 0
}
