
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'


console.log('🔄 MIDDLEWARE FILE LOADED at:', new Date().toISOString())

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  // console.log('🚀 MIDDLEWARE TRIGGERED!')
  // console.log('📍 Pathname:', url.pathname)
  // console.log('🔍 Search params:', url.searchParams.toString())
  // console.log('🌐 Full URL:', url.toString())
  // console.log('📅 Timestamp:', new Date().toISOString())

  // Only apply admin auth to admin routes
  if (url.pathname.startsWith('/admin')) {
    console.log('🔐 ADMIN ROUTE DETECTED:', url.pathname)
    
    // Skip middleware for admin login and register pages
    if (request.nextUrl.pathname === '/admin/login') {
      console.log('✅ Skipping auth for login page')
      return NextResponse.next()
    }

    // Check for admin session cookie
    const sessionToken = request.cookies.get('admin-session')?.value
    console.log('🔍 Admin session cookie found:', !!sessionToken)

    if (!sessionToken) {
      console.log('❌ No admin session cookie found, redirecting to login')
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      // Decode and validate session token
      const sessionData = JSON.parse(atob(sessionToken))
      
      // Check if session is not expired (7 days)
      const sessionAge = Date.now() - sessionData.timestamp
      if (sessionAge > 7 * 24 * 60 * 60 * 1000) {
        console.log('❌ Session expired')
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      // Check if user has admin role
      if (sessionData.role !== 'admin') {
        console.log('❌ User is not admin, role:', sessionData.role)
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      console.log('✅ Admin session valid, allowing access')
      return NextResponse.next()
      
    } catch (error) {
      console.log('❌ Invalid admin session, redirecting to login')
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/validate']
}