'use client'

import { Toaster } from 'react-hot-toast'
import AdminLayout from '@/components/admin/AdminLayout'
import Products from '@/components/admin/Products'

export default function AdminProductsPage() {
  return (
    <>
      <Toaster position="top-right" />
      <AdminLayout activeTab="products" onTabChange={() => {}}>
        <Products />
      </AdminLayout>
    </>
  )
}
