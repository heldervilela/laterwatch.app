import { Button } from "@/ui/base/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/ui/base/dialog"
import { Input } from "@/ui/base/input"
import { Label } from "@/ui/base/label"
import { Loader2, Plus } from "lucide-react"

import { useAddVideo } from "@/hooks/use-add-video"

interface FloatingActionButtonProps {
  onClick?: () => void
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  const {
    // State
    isModalOpen,
    url,
    isValidUrl,
    error,
    isLoading,
    // Actions
    openModal,
    closeModal,
    setUrl,
    submitVideo,
  } = useAddVideo()

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
    openModal()
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitVideo()
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogTrigger asChild>
        <Button
          onClick={handleClick}
          className="bg-primary hover:bg-primary/90 fixed right-4 bottom-4 z-50 h-14 w-14 cursor-pointer rounded-full p-0 shadow-lg transition-all duration-200 hover:shadow-xl"
          aria-label="Add video"
        >
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Plus className="h-6 w-6" />
          )}
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
                disabled={isLoading}
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
              onClick={closeModal}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValidUrl || isLoading}>
              {isLoading ? (
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
