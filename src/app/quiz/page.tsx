'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function QuizPage() {
  const searchParams = useSearchParams()
  const [isValidating, setIsValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    validateUser()
  }, [])

  const validateUser = async () => {
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    if (!email || !token) {
      setError('Invalid quiz link. Please check your email for the correct link.')
      setIsValidating(false)
      return
    }

    try {
      const response = await fetch(`/api/quiz/validate?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`)
      const data = await response.json()

      if (response.ok && data.valid) {
        setIsValid(true)
        setUserEmail(email)
      } else {
        setError(data.error || 'Invalid or expired quiz link.')
      }
    } catch (error) {
      setError('An error occurred while validating your link.')
    } finally {
      setIsValidating(false)
    }
  }

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Validating your quiz link...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <XCircle className="h-6 w-6 text-red-500" />
              <span>Invalid Link</span>
            </CardTitle>
            <CardDescription>
              We couldn't validate your quiz link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Please check your email for the correct link or contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Personalized Skincare Routine
          </h1>
          <p className="text-gray-600">
            Welcome! Let's create a custom skincare routine just for you.
          </p>
          <div className="mt-4 inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Verified: {userEmail}</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Skincare Quiz</CardTitle>
            <CardDescription>
              Answer a few questions to get your personalized skincare routine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                Quiz interface coming soon...
              </p>
              <p className="text-sm text-gray-400">
                This is where users will answer questions about their skin type, concerns, budget, etc.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
