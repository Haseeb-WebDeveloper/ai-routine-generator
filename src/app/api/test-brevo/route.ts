import { NextRequest, NextResponse } from 'next/server'

// Brevo API configuration
const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'
console.log("BREVO_API_KEY", BREVO_API_KEY)

export async function GET() {
  try {
    if (!BREVO_API_KEY) {
      return NextResponse.json({ 
        error: 'Brevo API key not configured',
        envVars: {
          BREVO_API_KEY: BREVO_API_KEY ? 'SET' : 'NOT SET',
          NODE_ENV: process.env.NODE_ENV
        }
      }, { status: 500 })
    }

    // Test multiple Brevo endpoints to diagnose the issue
    const endpoints = [
      { name: 'Account Info', url: 'https://api.brevo.com/v3/account' },
      { name: 'Senders', url: 'https://api.brevo.com/v3/senders' },
      { name: 'SMTP Status', url: 'https://api.brevo.com/v3/smtp/email' }
    ]

    const results = []

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint.name}`)
        
        const response = await fetch(endpoint.url, {
          method: 'GET',
          headers: {
            'api-key': BREVO_API_KEY,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        })

        const responseData = await response.json()
        
        results.push({
          endpoint: endpoint.name,
          url: endpoint.url,
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          data: responseData,
          headers: Object.fromEntries(response.headers.entries())
        })

        console.log(`${endpoint.name} result:`, {
          status: response.status,
          data: responseData
        })

      } catch (error) {
        results.push({
          endpoint: endpoint.name,
          url: endpoint.url,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Also test a simple SMTP email to see if it works
    let smtpTest = null
    try {
      console.log('Testing SMTP email endpoint...')
      
      const smtpResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': BREVO_API_KEY,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: [{ email: 'test@example.com' }],
          sender: {
            name: 'Test Sender',
            email: 'test@example.com'
          },
          subject: 'Test Email',
          htmlContent: '<p>This is a test email</p>'
        })
      })

      const smtpData = await smtpResponse.json()
      
      smtpTest = {
        success: smtpResponse.ok,
        status: smtpResponse.status,
        statusText: smtpResponse.statusText,
        data: smtpData
      }

      console.log('SMTP test result:', smtpTest)

    } catch (error) {
      smtpTest = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    return NextResponse.json({
      apiKeyInfo: {
        length: BREVO_API_KEY.length,
        prefix: BREVO_API_KEY.substring(0, 10) + '...',
        suffix: '...' + BREVO_API_KEY.substring(BREVO_API_KEY.length - 4),
        format: (BREVO_API_KEY.startsWith('xsmtpsib-') || BREVO_API_KEY.startsWith('xkeysib-')) ? 'Valid format' : 'Invalid format'
      },
      endpointTests: results,
      smtpTest: smtpTest,
      recommendations: getRecommendations(results, smtpTest)
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to test Brevo API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function getRecommendations(endpointTests: any[], smtpTest: any) {
  const recommendations = []
  
  // Check if API key format is correct (both xsmtpsib- and xkeysib- are valid)
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey?.startsWith('xsmtpsib-') && !apiKey?.startsWith('xkeysib-')) {
    recommendations.push('API key should start with "xsmtpsib-" or "xkeysib-"')
  }
  
  // Check if all endpoints are failing
  const allFailed = endpointTests.every(test => !test.success)
  if (allFailed) {
    recommendations.push('All endpoints are failing - API key might be invalid or expired')
    recommendations.push('Check if you copied the API key correctly')
    recommendations.push('Verify the API key has the correct permissions')
  }
  
  // Check specific error messages
  endpointTests.forEach(test => {
    if (test.data?.message === 'Key not found') {
      recommendations.push('API key not found - check if it exists in your Brevo account')
    }
    if (test.data?.code === 'unauthorized') {
      recommendations.push('Unauthorized - check API key permissions')
    }
  })
  
  // Check SMTP test
  if (smtpTest && !smtpTest.success) {
    if (smtpTest.data?.message?.includes('sender')) {
      recommendations.push('Sender email not verified - verify your sender domain in Brevo')
    }
  }
  
  return recommendations.length > 0 ? recommendations : ['API key appears to be working correctly']
}
