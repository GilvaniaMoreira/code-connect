import type { ReactNode } from 'react'

type AuthLayoutProps = {
  banner: {
    src: string
    alt: string
  }
  children: ReactNode
}

export function AuthLayout({ banner, children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="grid w-full max-w-4xl gap-8 rounded-2xl bg-surface p-8 shadow-2xl md:grid-cols-2">
        <div className="hidden overflow-hidden rounded-xl md:block">
          <img
            src={banner.src}
            alt={banner.alt}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex items-center justify-center px-2 py-4 md:px-6">
          {children}
        </div>
      </div>
    </main>
  )
}
