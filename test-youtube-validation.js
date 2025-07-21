// Test YouTube URL validation with parameters
const extractYouTubeVideoId = url => {
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

const validateYouTubeUrl = url => {
  return extractYouTubeVideoId(url) !== null
}

// Test URLs
const testUrls = [
  'https://www.youtube.com/watch?v=thak5ej5SCI&t=1s', // The problematic URL
  'https://www.youtube.com/watch?v=thak5ej5SCI', // Same without parameters
  'https://youtu.be/thak5ej5SCI',
  'https://www.youtube.com/watch?v=thak5ej5SCI&list=PLrj7P7YpUV3g3UZqWwl_gFdKl_uWVuYd',
  'https://www.youtube.com/embed/thak5ej5SCI',
  'invalid-url',
]

console.log('Testing YouTube URL validation:')
testUrls.forEach(url => {
  const isValid = validateYouTubeUrl(url)
  const videoId = extractYouTubeVideoId(url)
  console.log(`${isValid ? '✅' : '❌'} ${url} -> ID: ${videoId}`)
})
