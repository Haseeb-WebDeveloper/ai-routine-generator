import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl

  // QUIZ/VALIDATE FLOW
  if (url.pathname === '/quiz') {
    const email = url.searchParams.get('email')
    const token = url.searchParams.get('token')
    if (email && token) {
      // Normalize link target: validate first, then go to quiz
      const validateUrl = new URL('/validate', url)
      validateUrl.searchParams.set('email', email)
      validateUrl.searchParams.set('token', token)
      return NextResponse.redirect(validateUrl)
    }
  }

  if (url.pathname === '/validate') {
    const email = url.searchParams.get('email')
    const token = url.searchParams.get('token')
    // If already verified, skip validate page
    const verified = request.cookies.get('quiz_verified')?.value
    const cookieEmail = request.cookies.get('quiz_email')?.value
    if (!email || !token) {
      if (verified === '1' && cookieEmail) {
        const quizUrl = new URL('/quiz', url)
        return NextResponse.redirect(quizUrl)
      }
    }
  }

  // Only apply admin auth to admin routes
  if (url.pathname.startsWith('/admin')) {
    // Skip middleware for admin login and register pages
    if (request.nextUrl.pathname === '/admin/login' || request.nextUrl.pathname === '/admin/register') {
      return NextResponse.next()
    }

    // Get the session from the request cookies
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get the session from cookies
    const authCookie = request.cookies.get('sb-access-token')
    const refreshCookie = request.cookies.get('sb-refresh-token')

    if (!authCookie) {
      // Redirect to admin login if no session
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      // Verify the session
      const { data: { user }, error } = await supabase.auth.getUser(authCookie.value)

      if (error || !user) {
        // Clear invalid cookies and redirect to login
        const response = NextResponse.redirect(new URL('/admin/login', request.url))
        response.cookies.delete('sb-access-token')
        response.cookies.delete('sb-refresh-token')
        return response
      }

      // Check if user has admin role (you can customize this based on your needs)
      // For now, we'll check if the user's email is in a list of admin emails
      const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
      
      if (!adminEmails.includes(user.email || '')) {
        // User is not an admin, redirect to unauthorized page
        return NextResponse.redirect(new URL('/admin/unauthorized', request.url))
      }

      // User is authenticated and authorized, continue
      return NextResponse.next()
    } catch (error) {
      // Error occurred, redirect to login
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('sb-access-token')
      response.cookies.delete('sb-refresh-token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/quiz', '/validate']
}
