'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Plus, X, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface UserInput {
  name: string
  email: string
}

export default function AddUsersForm() {
  const [users, setUsers] = useState<UserInput[]>([{ name: '', email: '' }])
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const addUserField = () => {
    setUsers([...users, { name: '', email: '' }])
  }

  const removeUserField = (index: number) => {
    if (users.length > 1) {
      const newUsers = users.filter((_, i) => i !== index)
      setUsers(newUsers)
    }
  }

  const updateUser = (index: number, field: keyof UserInput, value: string) => {
    const newUsers = [...users]
    newUsers[index][field] = value
    setUsers(newUsers)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validUsers = users.filter(user => user.name.trim() !== '' && user.email.trim() !== '')
    
    if (validUsers.length === 0) {
      toast.error('Please enter at least one user with name and email')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = validUsers.filter(user => !emailRegex.test(user.email))
    
    if (invalidEmails.length > 0) {
      toast.error(`Invalid email format: ${invalidEmails.map(u => u.email).join(', ')}`)
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ users: validUsers }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        toast.success(`Successfully added ${data.added} users`)
        setUsers([{ name: '', email: '' }]) // Reset form
      } else {
        toast.error(data.error || 'Failed to add users')
        setResult({ error: data.error })
      }
    } catch (error) {
      toast.error('An error occurred while adding users')
      setResult({ error: 'Network error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Users Manually</CardTitle>
        <CardDescription>
          Add one or multiple users with names and email addresses to invite them to take the skincare quiz.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {users.map((user, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-1">
                  <Label htmlFor={`name-${index}`} className="sr-only">
                    Name {index + 1}
                  </Label>
                  <Input
                    id={`name-${index}`}
                    type="text"
                    placeholder="Enter full name"
                    value={user.name}
                    onChange={(e) => updateUser(index, 'name', e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor={`email-${index}`} className="sr-only">
                    Email {index + 1}
                  </Label>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    placeholder="Enter email address"
                    value={user.email}
                    onChange={(e) => updateUser(index, 'email', e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                {users.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeUserField(index)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addUserField}
            disabled={isLoading}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another User
          </Button>

          <Button
            type="submit"
            disabled={isLoading || users.every(user => user.name.trim() === '' || user.email.trim() === '')}
            className="w-full"
          >
            {isLoading ? 'Adding Users...' : 'Add Users'}
          </Button>
        </form>

        {result && (
          <div className="mt-6">
            {result.error ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <div className="ml-2">
                  <h4 className="text-sm font-medium text-red-800">Error</h4>
                  <p className="text-sm text-red-700">{result.error}</p>
                </div>
              </Alert>
            ) : (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="ml-2">
                  <h4 className="text-sm font-medium text-green-800">Success</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>Added: {result.added} users</p>
                    {result.existing > 0 && (
                      <p>Already existed: {result.existing} users</p>
                    )}
                    {result.users && result.users.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium">Added users:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {result.users.map((user: any) => (
                            <li key={user.id} className="text-xs">
                              {user.name} ({user.email})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}