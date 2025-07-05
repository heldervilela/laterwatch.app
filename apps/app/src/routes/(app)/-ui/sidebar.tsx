import { Sidebar, SidebarContent, SidebarFooter } from "@/ui/base/sidebar"
import * as React from "react"

import { NavMain } from "./navigation/main"
import { NavSecondary } from "./navigation/secondary"
import { NavTags } from "./navigation/tags"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <div>
      <Sidebar collapsible="offcanvas" {...props}>
        {/* <SidebarHeader className="bg-red-500">
        <SidebarMenu>
          <SidebarMenuItem>
            <BrandIconSmall className="ml-2 size-7" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader> */}

        <SidebarContent className="pt-8">
          <NavMain />
          <NavTags />
        </SidebarContent>

        <SidebarFooter>
          {/* <SidebarMenuItem>
            <BrandIconSmall className="ml-4 size-7" />
          </SidebarMenuItem> */}
          <NavSecondary />
        </SidebarFooter>
      </Sidebar>
    </div>
  )
}
