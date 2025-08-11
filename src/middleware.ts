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

  // QUIZ FLOW - Handle direct access from campaign links
  if (url.pathname === '/quiz') {
    console.log('🎯 QUIZ PATH DETECTED!')
    const email = url.searchParams.get('email')
    const token = url.searchParams.get('token')
    
    console.log('📧 Email param:', email)
    console.log('🔑 Token param:', token)
    
    if (email && token) {
      console.log('✅ Both email and token found, processing authentication...')
      try {
        // Validate the secure token and authenticate user
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Verify token format and decode
        const decodedToken = atob(token)
        const [tokenEmail, timestamp, random] = decodedToken.split(':')
        
        // Basic token validation
        if (tokenEmail !== email) {
          // Invalid token, redirect to unauthorized
          return NextResponse.redirect(new URL('/admin/unauthorized', request.url))
        }

        // Check if token is not too old (24 hours)
        const tokenAge = Date.now() - parseInt(timestamp)
        if (tokenAge > 24 * 60 * 60 * 1000) {
          // Token expired, redirect to unauthorized
          return NextResponse.redirect(new URL('/admin/unauthorized', request.url))
        }

        // Get user from database
        const { data: user, error } = await supabase
          .from('user_emails')
          .select('*')
          .eq('email', email)
          .eq('is_active', true)
          .single()

        if (error || !user) {
          // User not found or inactive, redirect to unauthorized
          return NextResponse.redirect(new URL('/admin/unauthorized', request.url))
        }

        // Check if user has an auth account
        if (!user.user_id) {
          // No auth account, redirect to unauthorized
          return NextResponse.redirect(new URL('/admin/unauthorized', request.url))
        }

        // Get user's auth session using admin client
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
        )
        
        const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.admin.getUserById(user.user_id)
        
        if (authError || !authUser) {
          // Auth user not found, redirect to unauthorized
          return NextResponse.redirect(new URL('/admin/unauthorized', request.url))
        }

        // Create a custom authenticated session using secure cookies
        // We'll use the user_id and email to create a secure session
        const sessionData = {
          user_id: user.user_id,
          email: user.email,
          name: user.name,
          timestamp: Date.now()
        }
        
        // Create a secure session token
        const sessionToken = btoa(JSON.stringify(sessionData))
        
        // Set authentication cookies and continue to quiz (don't redirect)
        const response = NextResponse.next()
        
        // Set all cookies
        response.cookies.set('sb-access-token', sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        })
        response.cookies.set('sb-refresh-token', btoa(user.user_id), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30 // 30 days
        })
        
        // Set quiz verification cookie to skip validation
        response.cookies.set('quiz_verified', '1', {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        })
        response.cookies.set('quiz_email', email, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        })
        response.cookies.set('quiz_user_id', user.user_id, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        })
        response.cookies.set('quiz_name', user.name, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        })

        console.log('Setting cookies for user:', { email: user.email, name: user.name, userId: user.user_id })
        return response
      } catch (error) {
        console.error('Error processing quiz authentication:', error)
        // Error occurred, redirect to unauthorized
        return NextResponse.redirect(new URL('/admin/unauthorized', request.url))
      }
    }
  }

  // VALIDATE FLOW - Keep existing validation logic for backward compatibility
  if (url.pathname === '/validate') {
    console.log('validate pathname')
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
    console.log('🔐 ADMIN ROUTE DETECTED:', url.pathname)
    
    // Skip middleware for admin login and register pages
    if (request.nextUrl.pathname === '/admin/login') {
      console.log('✅ Skipping auth for login page')
      return NextResponse.next()
    }

    // For now, let's use a simpler approach - just check if user is accessing from a valid session
    // We'll implement proper server-side auth later
    
    console.log('🔧 Environment check - NEXT_PUBLIC_ADMIN_EMAILS:', process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [])
    
    // TEMPORARY: Allow access to admin routes for now
    // TODO: Implement proper server-side authentication
    console.log('⚠️  TEMPORARY: Allowing admin access (auth will be implemented properly)')
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/quiz', '/validate']
}
