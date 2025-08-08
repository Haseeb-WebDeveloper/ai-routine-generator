'use client'

import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import AdminLayout from '@/components/admin/AdminLayout'
import AddUsersForm from '@/components/admin/AddUsersForm'
import CSVUploadForm from '@/components/admin/CSVUploadForm'
import UsersTable from '@/components/admin/UsersTable'
import Campaigns from '@/components/admin/Campaigns'
import EmailTemplates from '@/components/admin/EmailTemplates'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Users, Mail, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />
      case 'users':
        return <UsersTable />
      case 'add-users':
        return <AddUsersForm />
      case 'upload-csv':
        return <CSVUploadForm />
      case 'campaigns':
        return <Campaigns />
      case 'email-templates':
        return <EmailTemplates />
      case 'settings':
        return <SettingsTab />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <>
      <Toaster position="top-right" />
      <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderTabContent()}
      </AdminLayout>
    </>
  )
}

function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to the AI Routine Admin Dashboard</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Quiz Completed</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">0%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to manage your users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Add Users</h4>
              <p className="text-sm text-gray-600">
                Add individual users or bulk import via CSV
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Manage Users</h4>
              <p className="text-sm text-gray-600">
                View, search, and manage all registered users
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Monitor Progress</h4>
              <p className="text-sm text-gray-600">
                Track quiz completion rates and user engagement
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest user registrations and quiz completions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity</p>
              <p className="text-sm">Start by adding some users to see activity here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your admin dashboard</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
          <CardDescription>
            Configure various settings for the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Settings configuration coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
