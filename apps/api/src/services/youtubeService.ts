interface YouTubeVideoDetails {
  id: string
  title: string
  description: string
  thumbnail: string
  channelTitle: string
  publishedAt: string
  duration: string
  viewCount: string
  likeCount?: string
  tags?: string[]
}

interface YouTubeAPIResponse {
  items: Array<{
    id: string
    snippet: {
      title: string
      description: string
      thumbnails: {
        high: { url: string }
        medium: { url: string }
        default: { url: string }
      }
      channelTitle: string
      publishedAt: string
      tags?: string[]
    }
    contentDetails: {
      duration: string
    }
    statistics: {
      viewCount: string
      likeCount?: string
    }
  }>
}

class YouTubeService {
  private apiKey: string
  private baseUrl = 'https://www.googleapis.com/youtube/v3'

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || ''

    if (!this.apiKey) {
      console.warn(
        '[YouTubeService] YOUTUBE_API_KEY not configured - video details will not be fetched'
      )
    }
  }

  /**
   * Extract video ID from YouTube URL
   */
  extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }

    return null
  }

  /**
   * Validate YouTube URL
   */
  isValidYouTubeUrl(url: string): boolean {
    return this.extractVideoId(url) !== null
  }

  /**
   * Fetch video details from YouTube API
   */
  async getVideoDetails(url: string): Promise<YouTubeVideoDetails | null> {
    if (!this.apiKey) {
      console.warn('[YouTubeService] API key not configured, skipping video details fetch')
      return null
    }

    const videoId = this.extractVideoId(url)
    if (!videoId) {
      throw new Error('Invalid YouTube URL')
    }

    try {
      const apiUrl = `${this.baseUrl}/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${this.apiKey}`

      console.log('[YouTubeService] Fetching video details for:', videoId)

      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`)
      }

      const data: YouTubeAPIResponse = await response.json()

      if (!data.items || data.items.length === 0) {
        throw new Error('Video not found or is private/unavailable')
      }

      const video = data.items[0]

      return {
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail:
          video.snippet.thumbnails.high?.url ||
          video.snippet.thumbnails.medium?.url ||
          video.snippet.thumbnails.default?.url,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        duration: this.formatDuration(video.contentDetails.duration),
        viewCount: video.statistics.viewCount,
        likeCount: video.statistics.likeCount,
        tags: video.snippet.tags || [],
      }
    } catch (error) {
      console.error('‼️ [YouTubeService] Error fetching video details:', error)
      throw error
    }
  }

  /**
   * Format ISO 8601 duration to readable format
   */
  private formatDuration(isoDuration: string): string {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)

    if (!match) return '0:00'

    const hours = parseInt(match[1] || '0')
    const minutes = parseInt(match[2] || '0')
    const seconds = parseInt(match[3] || '0')

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  /**
   * Get basic video info without API (fallback)
   */
  getBasicVideoInfo(url: string): { videoId: string; platform: string } | null {
    const videoId = this.extractVideoId(url)

    if (!videoId) {
      return null
    }

    return {
      videoId,
      platform: 'youtube',
    }
  }
}

export const youtubeService = new YouTubeService()
export type { YouTubeVideoDetails }
