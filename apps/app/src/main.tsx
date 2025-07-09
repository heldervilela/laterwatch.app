import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import React from "react"
import ReactDOM from "react-dom/client"

import { routeTree } from "./routeTree.gen"
import { VideoPlayerModal } from "./ui/shared/video-player-modal"

import "./ui/styles.css"

const queryClient = new QueryClient()
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <VideoPlayerModal />
    </QueryClientProvider>
  </React.StrictMode>
)
