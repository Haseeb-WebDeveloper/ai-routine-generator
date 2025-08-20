import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 [Test DB] Testing database connection...')
    
    // Test basic database connectivity
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ [Test DB] Database query successful:', result)
    
    // Test user table access
    const userCount = await prisma.user.count()
    console.log('✅ [Test DB] User table accessible, count:', userCount)
    
    // Test admin user lookup
    const adminUsers = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true, email: true, role: true, isActive: true }
    })
    console.log('✅ [Test DB] Admin users found:', adminUsers.length)
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        connection: 'OK',
        userCount,
        adminUsersCount: adminUsers.length,
        adminUsers: adminUsers
      }
    })
    
  } catch (error) {
    console.error('❌ [Test DB] Database test failed:', error)
    
    let errorMessage = 'Database connection failed'
    let statusCode = 500
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Database connection refused - check DATABASE_URL'
        statusCode = 503
      } else if (error.message.includes('Connection')) {
        errorMessage = 'Database connection error'
        statusCode = 503
      } else if (error.message.includes('Prisma')) {
        errorMessage = 'Prisma client error'
        statusCode = 503
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: statusCode })
  }
}
