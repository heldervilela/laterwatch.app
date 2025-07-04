import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/(app)/")({
  component: AppDashboard,
})

function AppDashboard() {
  return <p>Content....</p>
}
