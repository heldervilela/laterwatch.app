import { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"

import { ErrorPageFallback } from "./-ui/error-page-fallback"
import { WindowControls } from "./-ui/window-controls"

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
  errorComponent: ErrorPageFallback,
})

function RootComponent() {
  return (
    <div className="window-rounded min-h-screen">
      <WindowControls />

      <Outlet />
      {/* <TanStackRouterDevtools position="bottom-right" /> */}
    </div>
  )
}
