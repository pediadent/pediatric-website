'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

type AdminFetch = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>

export function useAdminApi(): AdminFetch {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return useCallback(
    async (input: RequestInfo | URL, init: RequestInit = {}) => {
      const response = await fetch(input, {
        ...init,
        credentials: 'include'
      })

      if (response.status === 401) {
        const search = searchParams?.toString()
        const targetPath =
          pathname && pathname.startsWith('/admin') ? pathname : '/admin'
        const redirectTarget = search ? `${targetPath}?${search}` : targetPath

        router.replace(
          `/admin/login?redirect=${encodeURIComponent(redirectTarget)}`
        )

        return new Response(null, { status: 401 })
      }

      return response
    },
    [pathname, router, searchParams]
  )
}
