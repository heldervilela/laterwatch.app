import { api } from "@/services/api"
import { Button } from "@/ui/base/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/ui/base/dialog"
import { Input } from "@/ui/base/input"
import { Label } from "@/ui/base/label"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Plus } from "lucide-react"
import { useState } from "react"

interface FloatingActionButtonProps {
  onClick?: () => void
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [isValidUrl, setIsValidUrl] = useState(false)
  const [error, setError] = useState("")

  const queryClient = useQueryClient()

  const validateYouTubeUrl = (url: string): boolean => {
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}$/
    return youtubeRegex.test(url)
  }

  const addVideoMutation = useMutation({
    mutationFn: (videoUrl: string) =>
      api.videos.createVideo.mutate({
        url: videoUrl,
        platform: "youtube",
      }),
    onSuccess: () => {
      // Invalidate and refetch videos
      queryClient.invalidateQueries({ queryKey: ["videos", "user"] })

      // Close dialog and reset form
      setIsOpen(false)
      setUrl("")
      setIsValidUrl(false)
      setError("")
    },
    onError: (error: any) => {
      console.error("Error adding video:", error)
      setError(error.message || "Error adding video. Please try again.")
    },
  })

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setUrl(newUrl)
    setIsValidUrl(validateYouTubeUrl(newUrl))
    setError("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidUrl) {
      setError("Please enter a valid YouTube URL")
      return
    }

    addVideoMutation.mutate(url)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // Reset form when closing
      setUrl("")
      setIsValidUrl(false)
      setError("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          onClick={handleClick}
          className="bg-primary hover:bg-primary/90 fixed right-4 bottom-4 z-50 h-14 w-14 cursor-pointer rounded-full p-0 shadow-lg transition-all duration-200 hover:shadow-xl"
          aria-label="Add video"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="youtube-url">YouTube URL</Label>
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={handleUrlChange}
                className={`${error ? "border-red-500" : ""}`}
                disabled={addVideoMutation.isPending}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              {url && !isValidUrl && (
                <p className="text-sm text-yellow-600">
                  Please enter a valid YouTube URL
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={addVideoMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValidUrl || addVideoMutation.isPending}
            >
              {addVideoMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add video"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
