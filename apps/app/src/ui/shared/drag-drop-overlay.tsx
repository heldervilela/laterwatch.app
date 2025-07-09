"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { listen } from "@tauri-apps/api/event"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function DragDropOverlay() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const queryClient = useQueryClient()

  // Extract YouTube URL from text
  const extractYouTubeUrl = (text: string): string | null => {
    const urlPattern =
      /(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/
    const match = text.match(urlPattern)
    if (match) {
      let url = match[0]
      if (!url.startsWith("http")) {
        url = "https://" + url
      }
      return url
    }
    return null
  }

  const addVideoMutation = useMutation({
    mutationFn: async (url: string) => {
      // Temporary placeholder - replace with correct API call
      return { success: true, url }
      // return await api.videos.create.mutate({ url })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] })
      toast.success("Vídeo adicionado com sucesso!")
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar vídeo: ${error.message}`)
    },
  })

  useEffect(() => {
    const setupListeners = async () => {
      try {
        const unsubscribers = await Promise.all([
          listen("tauri://drag-enter", () => {
            setIsDragOver(true)
          }),

          listen("tauri://drag-leave", () => {
            setIsDragOver(false)
          }),

          listen("tauri://drag-drop", async (event: any) => {
            setIsDragOver(false)
            setIsProcessing(true)

            try {
              const payload = event.payload
              let url: string | null = null

              // Try to extract URL from different payload formats
              if (typeof payload === "string") {
                url = extractYouTubeUrl(payload)
              } else if (payload && typeof payload === "object") {
                // Try different possible payload structures
                const possibleTexts = [
                  payload.text,
                  payload.url,
                  payload.data,
                  payload.paths?.[0],
                  JSON.stringify(payload),
                ]

                for (const text of possibleTexts) {
                  if (text && typeof text === "string") {
                    url = extractYouTubeUrl(text)
                    if (url) break
                  }
                }
              }

              if (url) {
                await addVideoMutation.mutateAsync(url)
              } else {
                toast.error("Nenhum URL do YouTube encontrado")
              }
            } catch (error) {
              toast.error("Erro ao processar drop")
            } finally {
              setIsProcessing(false)
            }
          }),
        ])

        return () => {
          unsubscribers.forEach((unsub) => unsub())
        }
      } catch (error) {
        toast.error("Erro ao configurar drag & drop")
      }
    }

    setupListeners()
  }, [addVideoMutation])

  if (!isDragOver && !isProcessing) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {/* Subtle background overlay */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />

      {/* Clean border */}
      <div className="absolute inset-4 rounded-xl border-2 border-dashed border-blue-400/60" />

      {/* Minimal center message */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-lg bg-white/90 px-6 py-4 shadow-lg backdrop-blur-sm">
          {isProcessing ? (
            <div className="flex items-center space-x-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <span className="text-sm font-medium text-gray-700">
                A processar...
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                <svg
                  className="h-4 w-4 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">
                Soltar para adicionar vídeo
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
