'use client'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com'
    if (!key) return // analytics disabled if key not set

    // Only init if user accepted cookies
    const consent = localStorage.getItem('cookie-consent')
    if (consent === 'declined') return

    posthog.init(key, {
      api_host: host,
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
