import { api } from "@/services/api"
import { Skeleton } from "@/ui/base/skeleton"
import { VideoCard } from "@/ui/shared/video-card"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Video } from "lucide-react"

import { PageContent } from "../-ui/content"

export const Route = createFileRoute("/(app)/")({
  component: AppDashboard,
})

function AppDashboard() {
  const {
    data: videosResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["videos", "user"],
    queryFn: () => api.videos.getUserVideos.query(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  if (isLoading) {
    return (
      <PageContent title="Dashboard">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg bg-white shadow-sm"
            >
              <Skeleton className="aspect-video w-full" />
              <div className="p-3">
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </PageContent>
    )
  }

  if (error) {
    return (
      <PageContent title="Dashboard">
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <Video className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">Error loading videos</h3>
          <p className="text-muted-foreground">
            An error occurred while loading your videos. Please try again.
          </p>
        </div>
      </PageContent>
    )
  }

  const videos = videosResponse?.videos || []

  return (
    <PageContent title="Dashboard">
      <div className="space-y-4">
        {videos.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-2 text-center">
            <Video className="text-muted-foreground h-16 w-16" />
            <h3 className="text-lg font-semibold">No saved videos</h3>
            <p className="text-muted-foreground">
              Add some YouTube videos to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </PageContent>
  )
}
