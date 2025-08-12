'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Send, Users, Mail, Calendar, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Campaign, EmailTemplate, UserEmail, CampaignCreateData } from '@/types/admin'

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [users, setUsers] = useState<UserEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [triggeringCampaigns, setTriggeringCampaigns] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState<CampaignCreateData>({
    name: '',
    description: '',
    template_id: '',
    selected_users: [],
    scheduled_at: ''
  })
  const [selectAll, setSelectAll] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [campaignsRes, templatesRes, usersRes] = await Promise.all([
        fetch('/api/admin/campaigns'),
        fetch('/api/admin/email-templates'),
        fetch('/api/admin/users')
      ])

      if (campaignsRes.ok) {
        const campaignsData = await campaignsRes.json()
        setCampaigns(campaignsData.campaigns || [])
      } else {
        console.error('Campaigns API error:', campaignsRes.status)
        setCampaigns([])
      }

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json()
        setTemplates(templatesData.templates || [])
      } else {
        console.error('Templates API error:', templatesRes.status)
        setTemplates([])
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      } else {
        console.error('Users API error:', usersRes.status)
        setUsers([])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
      // Set empty arrays to prevent undefined errors
      setCampaigns([])
      setTemplates([])
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingCampaign 
        ? `/api/admin/campaigns/${editingCampaign.id}`
        : '/api/admin/campaigns'
      
      const method = editingCampaign ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success(editingCampaign ? 'Campaign updated!' : 'Campaign created!')
        setShowForm(false)
        setEditingCampaign(null)
        resetForm()
        await loadData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Something went wrong')
      }
    } catch (error) {
      toast.error('Failed to save campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setFormData({
      name: campaign.name,
      description: campaign.description || '',
      template_id: campaign.template_id,
      selected_users: campaign.selected_users,
      scheduled_at: campaign.scheduled_at || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return

    try {
      const response = await fetch(`/api/admin/campaigns/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Campaign deleted!')
        await loadData()
      } else {
        toast.error('Failed to delete campaign')
      }
    } catch (error) {
      toast.error('Failed to delete campaign')
    }
  }

  const handleTrigger = async (campaign: Campaign) => {
    if (!confirm(`Are you sure you want to send this campaign to ${campaign.selected_users?.length || 0} users?`)) return

    // Add campaign to triggering set to show loading state
    setTriggeringCampaigns(prev => new Set(prev).add(campaign.id))

    try {
      const response = await fetch(`/api/admin/campaigns/${campaign.id}/trigger`, {
        method: 'POST'
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Campaign sent! ${result.sent} emails delivered`)
        await loadData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to send campaign')
      }
    } catch (error) {
      toast.error('Failed to send campaign')
    } finally {
      // Remove campaign from triggering set
      setTriggeringCampaigns(prev => {
        const newSet = new Set(prev)
        newSet.delete(campaign.id)
        return newSet
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      template_id: '',
      selected_users: [],
      scheduled_at: ''
    })
    setEditingCampaign(null)
    setSelectAll(false)
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setFormData({
        ...formData,
        selected_users: users.map(user => user.email)
      })
    } else {
      setFormData({
        ...formData,
        selected_users: []
      })
    }
  }

  const handleUserSelect = (email: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        selected_users: [...formData.selected_users, email]
      })
    } else {
      setFormData({
        ...formData,
        selected_users: formData.selected_users.filter(e => e !== email)
      })
    }
  }

  const getStatusBadge = (status: string, sentAt?: string) => {
    const variants = {
      draft: 'secondary',
      scheduled: 'default',
      sent: 'default',
      cancelled: 'destructive'
    } as const

    let statusText = status
    if (sentAt) {
      statusText = `Last sent ${new Date(sentAt).toLocaleDateString()}`
    }

    return <Badge variant={variants[status as keyof typeof variants]}>{statusText}</Badge>
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
          <h2 className="text-2xl font-bold text-gray-900">Email Campaigns</h2>
          <p className="text-gray-600">Create and manage email campaigns</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</CardTitle>
            <CardDescription>
              {editingCampaign ? 'Update your email campaign' : 'Create a new email campaign'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Skincare Quiz Launch"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Email Template</Label>
                  <Select
                    value={formData.template_id}
                    onValueChange={(value) => setFormData({ ...formData, template_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your campaign..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Select Recipients</Label>
                <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                  <div className="flex items-center space-x-2 mb-3">
                    <Checkbox
                      id="select-all"
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label htmlFor="select-all" className="font-medium">
                      Select All ({users?.length || 0} users)
                    </Label>
                  </div>
                  
                  <div className="space-y-2">
                    {users && users.length > 0 ? (
                      users.map((user) => (
                        <div key={user.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={user.id}
                            checked={formData.selected_users.includes(user.email)}
                            onCheckedChange={(checked) => handleUserSelect(user.email, checked as boolean)}
                          />
                                                   <Label htmlFor={user.id} className="text-sm">
                           {user.name || 'Unknown'} ({user.email})
                           {user.quiz_completed && (
                             <Badge variant="secondary" className="ml-2">Quiz Completed</Badge>
                           )}
                         </Label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No users available</p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Selected: {formData.selected_users.length} users
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled_at">Schedule (Optional)</Label>
                <Input
                  id="scheduled_at"
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                />
                <p className="text-sm text-gray-500">
                  Leave empty to send immediately when triggered
                </p>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (editingCampaign ? 'Update Campaign' : 'Create Campaign')}
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
        {campaigns && campaigns.length > 0 ? (
          campaigns.map((campaign) => {
            const template = templates.find(t => t.id === campaign.template_id)
            return (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <CardDescription>
                        {campaign.description || 'No description'}
                        {campaign.status === 'sent' && campaign.sent_at && (
                          <span className="block text-xs text-green-600 mt-1">
                            ✓ Sent on {new Date(campaign.sent_at).toLocaleString()}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(campaign.status, campaign.sent_at)}
                      <div className="flex space-x-1">
                        {campaign.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(campaign)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {/* Show trigger button for draft campaigns or campaigns that can be re-sent */}
                        {(campaign.status === 'draft' || campaign.sent_at) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTrigger(campaign)}
                            disabled={triggeringCampaigns.has(campaign.id)}
                          >
                            {triggeringCampaigns.has(campaign.id) ? (
                              <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 mr-2" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4" />
                                {campaign.sent_at ? 'Re-send' : 'Send'}
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(campaign.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {campaign.selected_users?.length || 0} recipients
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Template: {template?.name || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Created: {new Date(campaign.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {campaign.stats && (
                    <div className="border-t pt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Campaign Stats</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                        <div>Total: {campaign.stats.total_recipients}</div>
                        <div>Sent: {campaign.stats.sent}</div>
                        <div>Delivered: {campaign.stats.delivered}</div>
                        <div>Opened: {campaign.stats.opened}</div>
                        <div>Clicked: {campaign.stats.clicked}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-600 mb-4">Create your first email campaign to get started</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </CardContent>
          </Card>
        )}
      </div>


    </div>
  )
}
