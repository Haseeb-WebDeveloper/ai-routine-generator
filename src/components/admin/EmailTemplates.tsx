'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { EmailTemplate } from '@/types/admin'

const defaultTemplates: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Skincare Quiz Invitation',
    subject: 'Your Personalized Skincare Routine Awaits!',
    content: `Hi there,

We're excited to create a custom skincare routine just for you! 

Our AI-powered system will analyze your skin type, concerns, and preferences to recommend the perfect products for your unique needs.

It takes less than a minute to complete the quiz, and the results will stay with you forever.

Click the button below to start your personalized skincare quiz:

{{LINK}}

This link is unique to you and will expire after use.

Best regards,
The AI Routine Team`
  },
  {
    name: 'Follow-up Reminder',
    subject: 'Don\'t miss out on your personalized skincare routine!',
    content: `Hi there,

We noticed you haven't completed your skincare quiz yet. 

Your personalized routine is waiting for you! It only takes a minute to complete, and you'll get:

• Custom product recommendations
• Personalized routine schedule
• Expert skincare tips
• Ongoing support

Click here to complete your quiz now:

{{LINK}}

This offer expires soon, so don't wait!

Best regards,
The AI Routine Team`
  },
  {
    name: 'Welcome Back',
    subject: 'Welcome back! Let\'s update your skincare routine',
    content: `Hi there,

Welcome back! It's been a while since you last visited us.

Your skin changes over time, and so should your skincare routine. Let's update your personalized recommendations to match your current needs.

Take our quick quiz to refresh your routine:

{{LINK}}

It only takes a minute, and you'll get updated recommendations based on your current skin condition.

Best regards,
The AI Routine Team`
  }
]

export default function EmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: ''
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/admin/email-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates)
      } else {
        // If no templates exist, create default ones
        await createDefaultTemplates()
      }
    } catch (error) {
      console.error('Error loading templates:', error)
      await createDefaultTemplates()
    } finally {
      setLoading(false)
    }
  }

  const createDefaultTemplates = async () => {
    try {
      for (const template of defaultTemplates) {
        await fetch('/api/admin/email-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(template)
        })
      }
      await loadTemplates()
    } catch (error) {
      console.error('Error creating default templates:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingTemplate 
        ? `/api/admin/email-templates/${editingTemplate.id}`
        : '/api/admin/email-templates'
      
      const method = editingTemplate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success(editingTemplate ? 'Template updated!' : 'Template created!')
        setShowForm(false)
        setEditingTemplate(null)
        resetForm()
        await loadTemplates()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Something went wrong')
      }
    } catch (error) {
      toast.error('Failed to save template')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const response = await fetch(`/api/admin/email-templates/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Template deleted!')
        await loadTemplates()
      } else {
        toast.error('Failed to delete template')
      }
    } catch (error) {
      toast.error('Failed to delete template')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', subject: '', content: '' })
    setEditingTemplate(null)
  }

  const copyTemplate = (template: EmailTemplate) => {
    setFormData({
      name: `${template.name} (Copy)`,
      subject: template.subject,
      content: template.content
    })
    setEditingTemplate(null)
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Templates</h2>
          <p className="text-gray-600">Manage email templates for your campaigns</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTemplate ? 'Edit Template' : 'Create New Template'}</CardTitle>
            <CardDescription>
              {editingTemplate ? 'Update your email template' : 'Create a new email template for campaigns'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Skincare Quiz Invitation"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Your Personalized Skincare Routine Awaits!"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Email Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter your email content here..."
                  rows={10}
                  required
                />
                <p className="text-sm text-gray-500">
                  Use <code className="bg-gray-100 px-1 rounded">LINK</code> to insert the unique quiz link
                </p>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (editingTemplate ? 'Update Template' : 'Create Template')}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.subject}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyTemplate(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-3 rounded-md">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                  {template.content}
                </pre>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Created: {new Date(template.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
