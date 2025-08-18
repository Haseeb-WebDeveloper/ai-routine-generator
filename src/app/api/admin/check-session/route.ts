import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin-session')?.value
    console.log('🔍 Session check - Token found:', !!sessionToken)

    if (!sessionToken) {
      console.log('❌ No session token found')
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      )
    }

    // Decode and validate session token
    try {
      const sessionData = JSON.parse(atob(sessionToken))
      // console.log('🔍 Session data:', { 
      //   userId: sessionData.userId, 
      //   email: sessionData.email, 
      //   role: sessionData.role,
      //   timestamp: sessionData.timestamp 
      // })
      
      // Check if session is not expired (7 days)
      const sessionAge = Date.now() - sessionData.timestamp
      console.log('🔍 Session age:', sessionAge, 'ms')
      
      if (sessionAge > 7 * 24 * 60 * 60 * 1000) {
        console.log('❌ Session expired')
        return NextResponse.json(
          { error: 'Session expired' },
          { status: 401 }
        )
      }

      // Check if user has admin role
      if (sessionData.role !== 'admin') {
        console.log('❌ User is not admin, role:', sessionData.role)
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }

      console.log('✅ Session valid for admin user')
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
      console.log('❌ Error parsing session token:', error)
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('❌ Session check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
