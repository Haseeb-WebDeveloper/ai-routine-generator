'use client'

import { Toaster } from 'react-hot-toast'
import AdminLayout from '@/components/admin/AdminLayout'
import Campaigns from '@/components/admin/Campaigns'

export default function AdminCampaignsPage() {
  return (
    <>
      <Toaster position="top-right" />
      <AdminLayout activeTab="campaigns" onTabChange={() => {}}>
        <Campaigns />
      </AdminLayout>
    </>
  )
}
