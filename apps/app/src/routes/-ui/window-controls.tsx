import { getCurrentWindow } from "@tauri-apps/api/window"

export function WindowControls() {
  const appWindow = getCurrentWindow()

  const handleMinimize = async () => {
    await appWindow.minimize()
  }

  const handleMaximize = async () => {
    await appWindow.toggleMaximize()
  }

  const handleClose = async () => {
    await appWindow.close()
  }

  return (
    <div
      className="bg-background fixed top-5 left-2 z-100 flex h-8"
      data-tauri-drag-region
    >
      {/* macOS-style window controls */}
      <div className="absolute left-4 flex items-center gap-2">
        <button
          onClick={handleClose}
          className="group flex h-3 w-3 items-center justify-center rounded-full border border-red-600/20 bg-red-500 transition-colors hover:bg-red-600"
        >
          <span className="text-[7px] font-bold text-red-900 opacity-0 transition-opacity group-hover:opacity-100">
            ✕
          </span>
        </button>
        <button
          onClick={handleMinimize}
          className="group flex h-3 w-3 items-center justify-center rounded-full border border-yellow-600/20 bg-yellow-500 transition-colors hover:bg-yellow-600"
        >
          <span className="text-[9px] leading-none font-bold text-yellow-900 opacity-0 transition-opacity group-hover:opacity-100">
            −
          </span>
        </button>
        <button
          onClick={handleMaximize}
          className="group flex h-3 w-3 items-center justify-center rounded-full border border-green-600/20 bg-green-500 transition-colors hover:bg-green-600"
        >
          <span className="text-[8px] font-bold text-green-900 opacity-0 transition-opacity group-hover:opacity-100">
            ⌃
          </span>
        </button>
      </div>
    </div>
  )
}
