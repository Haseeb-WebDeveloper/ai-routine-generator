'use client'

import { Toaster } from 'react-hot-toast'
import AdminLayout from '@/components/admin/AdminLayout'
import EmailTemplates from '@/components/admin/EmailTemplates'

export default function AdminTemplatesPage() {
  return (
    <>
      <Toaster position="top-right" />
      <AdminLayout activeTab="templates" onTabChange={() => {}}>
        <EmailTemplates />
      </AdminLayout>
    </>
  )
}
