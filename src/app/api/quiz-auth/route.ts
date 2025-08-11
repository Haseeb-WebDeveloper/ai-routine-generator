import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()

    if (!email || !token) {
      return NextResponse.json({ error: 'Email and token are required' }, { status: 400 })
    }

    // Validate the secure token
    try {
      const decodedToken = atob(token)
      const [tokenEmail, timestamp, random] = decodedToken.split(':')
      
      // Basic token validation
      if (tokenEmail !== email) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }

      // Check if token is not too old (24 hours)
      const tokenAge = Date.now() - parseInt(timestamp)
      if (tokenAge > 24 * 60 * 60 * 1000) {
        return NextResponse.json({ error: 'Token expired' }, { status: 401 })
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 401 })
    }

    // Get user from database
    const { data: user, error } = await supabase
      .from('user_emails')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 404 })
    }

    // Check if user has an auth account
    if (!user.user_id) {
      return NextResponse.json({ error: 'User account not properly configured' }, { status: 400 })
    }

    // Get user's auth details
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.admin.getUserById(user.user_id)
    
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    // Create a custom session token
    const sessionData = {
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      timestamp: Date.now()
    }
    
    const sessionToken = btoa(JSON.stringify(sessionData))

    // Set authentication cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.user_id,
        email: user.email,
        name: user.name
      }
    })

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

    return response

  } catch (error) {
    console.error('Quiz authentication error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
