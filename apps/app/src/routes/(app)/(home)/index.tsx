import { api } from "@/services/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/base/card"
import { Skeleton } from "@/ui/base/skeleton"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import {
  Archive,
  Calendar,
  ExternalLink,
  Eye,
  Heart,
  Tag,
  Video,
} from "lucide-react"

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
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
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
          </div>
        ) : (
          <div className="grid gap-4">
            {videos.map((video) => (
              <Card
                key={video._id}
                className="transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base leading-snug">
                        {video.title || "Untitled video"}
                      </CardTitle>
                      <div className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(video.addedAt).toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {video.platform && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{video.platform}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      {video.isFavorite && (
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      )}
                      {video.isArchived && (
                        <Archive className="text-muted-foreground h-4 w-4" />
                      )}
                      {video.isWatched && (
                        <Eye className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Watch video
                    </a>
                    {video.tagIds && video.tagIds.length > 0 && (
                      <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <Tag className="h-3 w-3" />
                        <span>
                          {video.tagIds.length} tag
                          {video.tagIds.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContent>
  )
}
