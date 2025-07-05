import { api } from "@/services/api"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/ui/base/sidebar"
import { useQuery } from "@tanstack/react-query"
import { Archive, LayoutGrid, StarIcon } from "lucide-react"

const items = [
  {
    title: "To Watch",
    url: "#",
    icon: LayoutGrid,
    showCounter: true,
  },
  {
    title: "Favorites",
    url: "#",
    icon: StarIcon,
  },
  {
    title: "Watched",
    url: "#",
    icon: Archive,
  },
]

export function NavMain() {
  const { data: videosResponse } = useQuery({
    queryKey: ["videos", "user"],
    queryFn: () => api.videos.getUserVideos.query(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const videos = videosResponse?.videos || []
  const unwatchedVideosCount = videos.filter((video) => !video.isWatched).length

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* Menu */}
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                className="cursor-pointer"
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                {item.showCounter && unwatchedVideosCount > 0 && (
                  <span className="bg-muted text-muted-foreground ml-auto translate-y-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium">
                    {unwatchedVideosCount}
                  </span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
