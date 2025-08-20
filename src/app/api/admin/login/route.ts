import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 [Admin Login] Starting login process...')
    
    const { email, password } = await request.json()
    console.log('🔐 [Admin Login] Login attempt for email:', email)

    if (!email || !email.includes('@')) {
      console.log('❌ [Admin Login] Invalid email format:', email)
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    if (!password || password.length < 6) {
      console.log('❌ [Admin Login] Invalid password length:', password?.length || 0)
      return NextResponse.json(
        { error: 'Password is required (min 6 characters)' },
        { status: 400 }
      )
    }

    console.log('🔍 [Admin Login] Looking up user in database...')
    
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.log('❌ [Admin Login] User not found for email:', email)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('✅ [Admin Login] User found:', { id: user.id, email: user.email, role: user.role, isActive: user.isActive })

    if (!user.isActive) {
      console.log('❌ [Admin Login] User account is inactive:', user.id)
      return NextResponse.json(
        { error: 'User account is inactive' },
        { status: 403 }
      )
    }

    if (user.role !== 'admin') {
      console.log('❌ [Admin Login] User does not have admin role:', user.role)
      return NextResponse.json(
        { error: 'Access denied. Admin role required.' },
        { status: 403 }
      )
    }

    // Verify password
    if (!user.passwordHash) {
      console.log('❌ [Admin Login] User has no password hash:', user.id)
      return NextResponse.json(
        { error: 'Account not properly configured. Please contact administrator.' },
        { status: 500 }
      )
    }

    console.log('🔐 [Admin Login] Verifying password...')
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      console.log('❌ [Admin Login] Invalid password for user:', user.id)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    console.log('✅ [Admin Login] Password verified successfully')

    // Create a simple session token (in production, use proper JWT)
    const sessionToken = btoa(JSON.stringify({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      timestamp: Date.now()
    }))

    console.log('🔑 [Admin Login] Session token created for user:', user.id)

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

    response.cookies.set('admin-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    console.log('✅ [Admin Login] Login successful for user:', user.id)
    return response

  } catch (error) {
    console.error('❌ [Admin Login] Login error:', error)
    
    // Provide more specific error information
    let errorMessage = 'Internal server error'
    let statusCode = 500
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      // Check for specific database connection errors
      if (error.message.includes('ECONNREFUSED') || error.message.includes('Connection')) {
        errorMessage = 'Database connection failed. Please try again later.'
        statusCode = 503
      } else if (error.message.includes('Prisma')) {
        errorMessage = 'Database error. Please try again later.'
        statusCode = 503
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: statusCode }
    )
  }
}
