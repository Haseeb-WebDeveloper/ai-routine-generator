import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

console.log('🔄 MIDDLEWARE FILE LOADED at:', new Date().toISOString())

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  console.log('🚀 MIDDLEWARE TRIGGERED!')
  console.log('📍 Pathname:', url.pathname)
  console.log('🔍 Search params:', url.searchParams.toString())
  console.log('🌐 Full URL:', url.toString())
  console.log('📅 Timestamp:', new Date().toISOString())

  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      },
    }
  )

  // Try to get the session from cookies
  const { data: { session } } = await supabase.auth.getSession()

  // Only apply admin auth to admin routes
  if (url.pathname.startsWith('/admin')) {
    console.log('🔐 ADMIN ROUTE DETECTED:', url.pathname)
    
    // Skip middleware for admin login and register pages
    if (request.nextUrl.pathname === '/admin/login') {
      console.log('✅ Skipping auth for login page')
      return NextResponse.next()
    }

    // Check for valid admin session
    if (!session) {
      console.log('❌ No admin session found, redirecting to login')
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      // Check if user has admin role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()
      
      if (userError || !userData || userData.role !== 'admin') {
        console.log('❌ User is not admin, redirecting to login')
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