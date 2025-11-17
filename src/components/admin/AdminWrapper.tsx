'use client'

import { Sidebar } from '@/components/admin/Sidebar'
import { Header } from '@/components/admin/Header'

export function AdminWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-[var(--argon-light)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(17,205,239,0.22),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(94,114,228,0.25),transparent_50%)]" />
        <div className="absolute inset-0 opacity-60">
          <svg
            className="h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern
                id="argon-grid"
                width="52"
                height="52"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M52 0H0v52"
                  fill="none"
                  stroke="rgba(94,114,228,0.08)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#argon-grid)" />
          </svg>
        </div>
      </div>
      <div className="flex min-h-screen bg-transparent">
        <Sidebar />
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="argon-admin-main relative z-10 flex-1 overflow-x-hidden overflow-y-auto px-8 py-8">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
