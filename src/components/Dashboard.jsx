import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import DashboardSidebar from './dashboard/DashboardSidebar'
import DashboardContent from './dashboard/DashboardContent'
import { Menu, X, Home, Users, Utensils, Calendar, FileText, ChartBar } from 'lucide-react'

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const menuItems = [
    { id: '', label: 'Inicio', icon: Home, path: '/dashboard' },
    { id: 'patients', label: 'Pacientes', icon: Users, path: '/dashboard/patients' },
    { id: 'diets', label: 'Planes Alimenticios', icon: Utensils, path: '/dashboard/diets' },
    { id: 'appointments', label: 'Citas', icon: Calendar, path: '/dashboard/appointments' },
    { id: 'reports', label: 'Reportes', icon: FileText, path: '/dashboard/reports' },
    { id: 'analytics', label: 'Análisis', icon: ChartBar, path: '/dashboard/analytics' },
  ]

  // Determine active section from current path
  const getActiveSection = () => {
    const path = location.pathname
    if (path === '/dashboard') return ''
    const section = path.split('/dashboard/')[1]?.split('/')[0]
    return section || ''
  }

  const activeSection = getActiveSection()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeSection={activeSection}
      />

      {/* Main content */}
      <DashboardContent
        activeSection={activeSection}
        menuItems={menuItems}
      />
    </div>
  )
}