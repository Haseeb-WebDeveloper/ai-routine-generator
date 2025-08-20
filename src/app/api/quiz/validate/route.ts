import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // Decode and validate the token
    let tokenData
    try {
      const decodedToken = atob(token)
      tokenData = JSON.parse(decodedToken)
    } catch (error) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid token format' 
      }, { status: 400 })
    }

    // Check if token has expired
    if (Date.now() > tokenData.expiresAt) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Token has expired' 
      }, { status: 401 })
    }

    // Check if user exists in database using Prisma
    const user = await prisma.user.findUnique({
      where: { email: email }
    })

    if (!user) {
      return NextResponse.json({ 
        valid: false, 
        error: 'User not found' 
      }, { status: 404 })
    }

    // Verify token data matches user
    if (tokenData.userId !== user.id || tokenData.email !== user.email) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid token for this user' 
      }, { status: 401 })
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({ 
        valid: false, 
        error: 'User account is inactive' 
      }, { status: 403 })
    }

    console.log('Token validation successful:', {
      email: user.email,
      userId: user.id,
      tokenExpiresAt: new Date(tokenData.expiresAt).toISOString()
    })

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        quizCompleted: user.quizCompleted,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    console.error('Quiz validation error:', error)
    return NextResponse.json({ 
      valid: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
