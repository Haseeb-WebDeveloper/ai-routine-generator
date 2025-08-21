'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  BarChart3, 
  Menu,
  X,
  LogOut,
  Mail,
  Edit,
  Package
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange?: (tab: string) => void
}

export default function AdminLayout({ children, activeTab, onTabChange }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Get current user info from session cookie
    const getUserInfo = async () => {
      try {
        console.log('🔍 Getting user info from session...')
        
        const response = await fetch('/api/admin/check-session')
        if (response.ok) {
          const data = await response.json()
          console.log('✅ User session valid:', data.user)
          setUser(data.user)
        } else {
          console.log('❌ No valid session found')
          router.push('/admin/login')
        }
      } catch (error) {
        console.error('❌ Error getting user info:', error)
        router.push('/admin/login')
      }
    }

    getUserInfo()
  }, [router])

  const handleLogout = async () => {
    try {
      console.log('🧹 Logging out...')
      
      // Clear admin session cookie by calling logout API
      await fetch('/api/admin/logout', { method: 'POST' })
      
      // Redirect to login
      router.push('/admin/login')
    } catch (error) {
      console.error('❌ Error during logout:', error)
      // Force redirect even if there's an error
      router.push('/admin/login')
    }
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/admin' },
    { id: 'users', label: 'User Management', icon: Users, path: '/admin/users' },
    { id: 'campaigns', label: 'Campaigns', icon: Mail, path: '/admin/campaigns' },
    { id: 'email-templates', label: 'Email Templates', icon: Edit, path: '/admin/templates' },
    { id: 'products', label: 'Products', icon: Package, path: '/admin/products' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex-shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <h1 className="text-xl font-bold text-gray-900">AI Routine Admin</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 mt-6">
            <div className="px-3">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (onTabChange) {
                        onTabChange(tab.id)
                      }
                      if (tab.path !== pathname) {
                        router.push(tab.path)
                      }
                      setSidebarOpen(false)
                    }}
                    className={`
                      w-full flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors
                      ${(activeTab === tab.id || pathname === tab.path)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b">
          <div className="flex items-center justify-between h-16 px-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, {user?.email || 'Admin'}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}