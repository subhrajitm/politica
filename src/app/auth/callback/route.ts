import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const { searchParams, origin } = url
  const code = searchParams.get('code')
  const providerError = searchParams.get('error') || searchParams.get('error_description')
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) {
    // if "next" is not a relative URL, use the default
    next = '/'
  }

  // If the provider returned an error, surface it
  if (providerError) {
    const reason = encodeURIComponent(providerError)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=${reason}`)
  }

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
        const isLocalEnv = process.env.NODE_ENV === 'development'
        if (isLocalEnv) {
          // No LB locally
          return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          return NextResponse.redirect(`${origin}${next}`)
        }
      } else {
        const reason = encodeURIComponent(`${error.message || 'exchange_failed'}`)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=${reason}`)
      }
    } catch (e: any) {
      const reason = encodeURIComponent(e?.message || 'unexpected_error')
      return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=${reason}`)
    }
  }

  // no code provided
  return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=missing_code`)
}
