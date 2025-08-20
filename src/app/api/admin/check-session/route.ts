import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [Check Session] Starting session check...')
    
    const sessionToken = request.cookies.get('admin-session')?.value
    console.log('🔍 [Check Session] Session token found:', !!sessionToken)

    if (!sessionToken) {
      console.log('❌ [Check Session] No session token found')
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      )
    }

    // Decode and validate session token
    try {
      console.log('🔍 [Check Session] Decoding session token...')
      const sessionData = JSON.parse(atob(sessionToken))
      console.log('🔍 [Check Session] Session data decoded:', { 
        userId: sessionData.userId, 
        email: sessionData.email, 
        role: sessionData.role,
        timestamp: sessionData.timestamp 
      })
      
      // Check if session is not expired (7 days)
      const sessionAge = Date.now() - sessionData.timestamp
      console.log('🔍 [Check Session] Session age:', sessionAge, 'ms')
      
      if (sessionAge > 7 * 24 * 60 * 60 * 1000) {
        console.log('❌ [Check Session] Session expired')
        return NextResponse.json(
          { error: 'Session expired' },
          { status: 401 }
        )
      }

      // Check if user has admin role
      if (sessionData.role !== 'admin') {
        console.log('❌ [Check Session] User is not admin, role:', sessionData.role)
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 401 }
        )
      }

      console.log('✅ [Check Session] Session valid for admin user:', sessionData.email)
      return NextResponse.json({
        success: true,
        user: {
          id: sessionData.userId,
          email: sessionData.email,
          name: sessionData.name,
          role: sessionData.role
        }
      })

    } catch (error) {
      console.log('❌ [Check Session] Error parsing session token:', error)
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('❌ [Check Session] Session check error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}
