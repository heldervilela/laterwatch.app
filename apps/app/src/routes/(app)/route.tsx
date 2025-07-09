import { authMiddleware } from "@/routes/-middleware/auth"
import { SidebarInset, SidebarProvider } from "@/ui/base/sidebar"
import { DragDropOverlay } from "@/ui/shared/drag-drop-overlay"
import { createFileRoute, Outlet } from "@tanstack/react-router"

import { FloatingActionButton } from "./-ui/floating-action-button"
import { AppSidebar } from "./-ui/sidebar"

export const Route = createFileRoute("/(app)")({
  beforeLoad: async ({ location }) => {
    await authMiddleware(location)
  },
  component: AppLayout,
})

function AppLayout() {
  // Temporary comment until API structure is clarified
  // const { data: userResponse } = useQuery({
  //   queryKey: ["user", "me"],
  //   queryFn: () => api.users.me.query(),
  //   staleTime: 5 * 60 * 1000,
  // })

  return (
    <div className="flex h-screen flex-col">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(190px)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>

      <FloatingActionButton />
      <DragDropOverlay />
    </div>
  )
}
