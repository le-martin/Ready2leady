import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const user = process.env.BASIC_AUTH_USER
  const pass = process.env.BASIC_AUTH_PASS

  // If credentials aren't configured, leave the site open (e.g. local dev).
  if (!user || !pass) {
    return NextResponse.next()
  }

  const auth = req.headers.get('authorization')
  const expected = `Basic ${btoa(`${user}:${pass}`)}`

  if (auth !== expected) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Leady"' },
    })
  }

  return NextResponse.next()
}

// Protect everything except Next.js internals and static assets.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
