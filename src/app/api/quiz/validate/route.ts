import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    if (!email || !token) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Missing email or token parameters' 
      }, { status: 400 })
    }

    // Check if user exists in database
    const { data: user, error } = await supabase
      .from('user_emails')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (error || !user) {
      return NextResponse.json({ 
        valid: false, 
        error: 'User not found or inactive' 
      }, { status: 404 })
    }

    // Token validation - check if the token matches the expected format
    // Use created_at timestamp, fallback to current timestamp for consistency
    const timestamp = user.created_at || new Date().toISOString()
    const expectedToken = btoa(email + timestamp)
    
    console.log('Token validation:', {
      email,
      providedToken: token,
      expectedToken,
      userCreatedAt: user.created_at,
      usedTimestamp: timestamp,
      tokensMatch: token === expectedToken
    })
    
    if (token !== expectedToken) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid or expired token',
        debug: {
          providedToken: token,
          expectedToken: expectedToken,
          email: email,
          userCreatedAt: user.created_at
        }
      }, { status: 401 })
    }

    return NextResponse.json({
      valid: true,
      user: {
        email: user.email,
        quiz_completed: user.quiz_completed,
        created_at: user.created_at
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      valid: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
