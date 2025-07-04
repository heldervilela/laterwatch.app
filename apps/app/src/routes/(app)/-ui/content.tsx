import { SiteHeader } from './header'

export function PageContent({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <SiteHeader title={title} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2 px-4 lg:gap-2 lg:px-6">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">{children}</div>
        </div>
      </div>
    </>
  )
}
