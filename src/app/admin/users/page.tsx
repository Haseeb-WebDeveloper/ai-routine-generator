'use client'

import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import AdminLayout from '@/components/admin/AdminLayout'
import AddUsersForm from '@/components/admin/AddUsersForm'
import CSVUploadForm from '@/components/admin/CSVUploadForm'
import UsersTable from '@/components/admin/UsersTable'
import { Button } from '@/components/ui/button'
import { Users, Plus, Upload, List } from 'lucide-react'

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState('manage')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'manage':
        return <UsersTable />
      case 'add':
        return <AddUsersForm />
      case 'upload':
        return <CSVUploadForm />
      default:
        return <UsersTable />
    }
  }

  return (
    <>
      <Toaster position="top-right" />
      <AdminLayout activeTab="users" onTabChange={() => {}}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage all user accounts and data</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('manage')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'manage'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <List className="h-4 w-4 inline mr-2" />
                Manage Users
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'add'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Add Users
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'upload'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Upload className="h-4 w-4 inline mr-2" />
                Bulk Upload
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {renderTabContent()}
          </div>
        </div>
      </AdminLayout>
    </>
  )
}
