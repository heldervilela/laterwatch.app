"use client"

import { listen } from "@tauri-apps/api/event"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function DragDropTest() {
  const [events, setEvents] = useState<string[]>([])

  useEffect(() => {
    const setupListeners = async () => {
      try {
        console.log("🔧 Setting up test listeners...")

        // Listen for all drag events
        const unsubscribers = await Promise.all([
          listen("tauri://drag-enter", (event) => {
            console.log("🔵 DRAG ENTER:", event)
            setEvents((prev) => [
              ...prev,
              `ENTER: ${JSON.stringify(event.payload)}`,
            ])
            toast.info("Drag Enter Detected!")
          }),

          listen("tauri://drag-over", (event) => {
            console.log("🟡 DRAG OVER:", event)
            setEvents((prev) => [
              ...prev,
              `OVER: ${JSON.stringify(event.payload)}`,
            ])
          }),

          listen("tauri://drag-leave", (event) => {
            console.log("🟠 DRAG LEAVE:", event)
            setEvents((prev) => [
              ...prev,
              `LEAVE: ${JSON.stringify(event.payload)}`,
            ])
            toast.info("Drag Leave Detected!")
          }),

          listen("tauri://drag-drop", (event) => {
            console.log("🟢 DROP:", event)
            setEvents((prev) => [
              ...prev,
              `DROP: ${JSON.stringify(event.payload)}`,
            ])
            toast.success("Drop Detected!")
          }),
        ])

        console.log("✅ Test listeners setup complete")

        return () => {
          unsubscribers.forEach((unsub) => unsub())
        }
      } catch (error) {
        console.error("❌ Failed to setup test listeners:", error)
        toast.error("Test setup failed: " + error)
      }
    }

    setupListeners()
  }, [])

  return (
    <div className="fixed right-6 bottom-20 z-50 max-w-sm">
      <div className="max-h-60 overflow-y-auto rounded-lg bg-gray-900 p-4 text-white shadow-lg">
        <h3 className="mb-2 text-sm font-bold">🧪 Drag & Drop Test</h3>
        <div className="space-y-1 text-xs">
          {events.length === 0 ? (
            <p className="text-gray-400">Waiting for drag events...</p>
          ) : (
            events.slice(-5).map((event, i) => (
              <div key={i} className="font-mono break-all text-green-400">
                {event}
              </div>
            ))
          )}
        </div>
        <button
          onClick={() => setEvents([])}
          className="mt-2 rounded bg-gray-700 px-2 py-1 text-xs"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
