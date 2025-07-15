import { usePinStore } from "@/stores/pin-store"
import { Button } from "@/ui/base/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/ui/base/dialog"
import { Input } from "@/ui/base/input"
import { Label } from "@/ui/base/label"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { Filter, Loader2, Pin, PinOff, Plus } from "lucide-react"
import { useEffect, useState } from "react"

import { useAddVideo } from "@/hooks/use-add-video"

interface FloatingActionButtonProps {
  onClick?: () => void
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  const { isPinned, setPinned, togglePin } = usePinStore()
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
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

  // Initialize always on top state from Tauri
  useEffect(() => {
    const initAlwaysOnTop = async () => {
      try {
        const appWindow = getCurrentWindow()
        const isOnTop = await appWindow.isAlwaysOnTop()
        setPinned(isOnTop)
      } catch (error) {
        console.error("Failed to get always on top state:", error)
      }
    }
    initAlwaysOnTop()
  }, [setPinned])

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

  const handleTogglePin = async () => {
    await togglePin()
  }

  const handleToggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen)
  }

  return (
    <>
      {/* Tags and Filters button */}
      <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={handleToggleFilters}
            className="fixed right-4 bottom-36 z-50 h-12 w-12 cursor-pointer rounded-full bg-purple-500 p-0 text-white shadow-lg transition-all duration-200 hover:bg-purple-600 hover:shadow-xl"
            aria-label="Tags and Filters"
            title="Tags and Filters"
          >
            <Filter className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tags & Filters</h3>

              {/* Tags section */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="text-sm text-gray-600">
                  Tags functionality coming soon...
                </div>
              </div>

              {/* Filters section */}
              <div className="space-y-2">
                <Label>Filters</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="favorites" className="rounded" />
                    <label htmlFor="favorites" className="text-sm">
                      Show only favorites
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="unwatched" className="rounded" />
                    <label htmlFor="unwatched" className="text-sm">
                      Show only unwatched
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="watched" className="rounded" />
                    <label htmlFor="watched" className="text-sm">
                      Show only watched
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFiltersOpen(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                // TODO: Apply filters
                setIsFiltersOpen(false)
              }}
            >
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Always on top toggle button */}
      <Button
        onClick={handleTogglePin}
        className={`fixed right-4 bottom-20 z-50 h-12 w-12 cursor-pointer rounded-full p-0 shadow-lg transition-all duration-200 hover:shadow-xl ${
          isPinned
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
        aria-label={isPinned ? "Disable always on top" : "Enable always on top"}
        title={isPinned ? "Disable always on top" : "Enable always on top"}
      >
        {isPinned ? (
          <Pin className="h-5 w-5" />
        ) : (
          <PinOff className="h-5 w-5" />
        )}
      </Button>

      {/* Add video button */}
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
    </>
  )
}
