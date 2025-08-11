'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { supabase, isUserAdmin } from '@/lib/supabase'
import { 
  Users, 
  Upload, 
  Plus, 
  BarChart3, 
  Settings,
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
  onTabChange: (tab: string) => void
}

export default function AdminLayout({ children, activeTab, onTabChange }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Get current user info from Supabase and handle authentication
    const getUserInfo = async () => {
      try {
        console.log('🔍 Starting getUserInfo...')
        
        // First, check if there's a valid session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        console.log('📋 Session check result:', { 
          hasSession: !!session, 
          sessionError: sessionError?.message,
          sessionId: session?.access_token?.substring(0, 20) + '...'
        })
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError)
          // Clear any invalid session data
          await supabase.auth.signOut()
          router.push('/admin/login')
          return
        }

        if (!session) {
          console.log('❌ No valid session found')
          // Only clear localStorage if there's no session
          localStorage.removeItem('sb-auth-token')
          localStorage.removeItem('sb-xjwisdvcvxbzzvrntcxm-auth-token')
          router.push('/admin/login')
          return
        }

        // Get user from session
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        console.log('👤 User check result:', { 
          hasUser: !!user, 
          userError: userError?.message,
          userEmail: user?.email 
        })
        
        if (userError || !user) {
          console.error('❌ User error:', userError)
          await supabase.auth.signOut()
          router.push('/admin/login')
          return
        }

        console.log('✅ Valid user session found:', user.email)
        
        // Check if user is admin
        console.log('🔐 Checking admin status for user:', user.id)
        const isAdmin = await isUserAdmin(user.id)
        console.log('👑 Admin status:', isAdmin)
        
        if (!isAdmin) {
          console.log('❌ User is not admin, signing out')
          await supabase.auth.signOut()
          router.push('/admin/login')
          return
        }

        console.log('✅ User is admin, setting user info')
        setUser(user)
        
      } catch (error) {
        console.error('❌ Error in getUserInfo:', error)
        await supabase.auth.signOut()
        router.push('/admin/login')
      }
    }

    getUserInfo()
  }, [router])

  const handleLogout = async () => {
    try {
      // Clear all Supabase session data from localStorage
      localStorage.removeItem('sb-auth-token')
      localStorage.removeItem('sb-xjwisdvcvxbzzvrntcxm-auth-token')
      
      // Clear any other potential Supabase keys
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key)
        }
      })
      
      console.log('🧹 Cleared all Supabase session data')
      
      // Sign out from Supabase
      await supabase.auth.signOut()
      
      // Redirect to login
      router.push('/admin/login')
    } catch (error) {
      console.error('❌ Error during logout:', error)
      // Force redirect even if there's an error
      router.push('/admin/login')
    }
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Manage Users', icon: Users },
    { id: 'add-users', label: 'Add Users', icon: Plus },
    { id: 'upload-csv', label: 'Upload CSV', icon: Upload },
    { id: 'campaigns', label: 'Campaigns', icon: Mail },
    { id: 'email-templates', label: 'Email Templates', icon: Edit },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'settings', label: 'Settings', icon: Settings },
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
                      onTabChange(tab.id)
                      setSidebarOpen(false)
                    }}
                    className={`
                      w-full flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors
                      ${activeTab === tab.id
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
