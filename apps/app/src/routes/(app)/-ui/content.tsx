import { MainContent } from "@/ui/shared/main-content"

export function PageContent({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <MainContent>
      {/* <SiteHeader title={title} /> */}
      {children}
    </MainContent>
  )
}
