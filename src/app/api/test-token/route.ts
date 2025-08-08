import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email') || 'test@example.com'
    const timestamp = searchParams.get('timestamp') || new Date().toISOString()

    // Test token generation
    const generatedToken = btoa(email + timestamp)
    
    // Test token validation
    const expectedToken = btoa(email + timestamp)
    const isValid = generatedToken === expectedToken

    return NextResponse.json({
      email,
      timestamp,
      generatedToken,
      expectedToken,
      isValid,
      tokenLength: generatedToken.length,
      decodedToken: atob(generatedToken),
      test: {
        emailMatch: atob(generatedToken).startsWith(email),
        timestampMatch: atob(generatedToken).endsWith(timestamp)
      }
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to test token',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
