import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/ui/base/sidebar"
import { Archive, LayoutGrid, StarIcon } from "lucide-react"

const items = [
  {
    title: "Feed",
    url: "#",
    icon: LayoutGrid,
  },
  {
    title: "Favorites",
    url: "#",
    icon: StarIcon,
  },
  {
    title: "Archive",
    url: "#",
    icon: Archive,
  },
]

export function NavMain() {
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
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
