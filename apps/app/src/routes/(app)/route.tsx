import { authMiddleware } from "@/routes/-middleware/auth"
import { SidebarInset, SidebarProvider } from "@/ui/base/sidebar"
import { ClipboardWatcher } from "@/ui/shared/clipboard-watcher"
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
      <ClipboardWatcher />
      <SidebarProvider
        style={
          {
            "--sidebar-width": "350px",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col overflow-hidden">
          <main className="flex flex-1 flex-col overflow-hidden">
            <Outlet />
          </main>
        </SidebarInset>
        <FloatingActionButton />
      </SidebarProvider>
    </div>
  )
}
