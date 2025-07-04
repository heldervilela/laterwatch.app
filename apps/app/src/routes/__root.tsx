import { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"

import { ErrorPageFallback } from "./-ui/error-page-fallback"

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
  errorComponent: ErrorPageFallback,
})

function RootComponent() {
  return (
    <div className="min-h-screen">
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  )
}
