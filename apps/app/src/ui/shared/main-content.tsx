import * as React from "react"

import { cn } from "@/lib/utils"

interface MainContentProps {
  className?: string
  children: React.ReactNode
}

function MainContent({ className, children }: MainContentProps) {
  return (
    <main className={cn("h-full w-full py-2 pr-4 pl-4", className)}>
      {children}
    </main>
  )
}

export { MainContent }
