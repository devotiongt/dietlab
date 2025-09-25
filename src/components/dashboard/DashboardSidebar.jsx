import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  Apple,
  Users,
  Calendar,
  ChartBar,
  Settings,
  LogOut,
  Home,
  Utensils,
  FileText
} from 'lucide-react'

export default function DashboardSidebar({ sidebarOpen, setSidebarOpen, activeSection }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const menuItems = [
    { id: '', label: 'Inicio', icon: Home, path: '/dashboard' },
    { id: 'patients', label: 'Pacientes', icon: Users, path: '/dashboard/patients' },
    { id: 'diets', label: 'Planes Alimenticios', icon: Utensils, path: '/dashboard/diets' },
    { id: 'appointments', label: 'Citas', icon: Calendar, path: '/dashboard/appointments' },
    { id: 'reports', label: 'Reportes', icon: FileText, path: '/dashboard/reports' },
    { id: 'analytics', label: 'Análisis', icon: ChartBar, path: '/dashboard/analytics' },
  ]

  return (
    <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
      <div className="flex items-center justify-center h-16 border-b">
        <div className="flex items-center space-x-2">
          <Apple className="h-8 w-8 text-green-600" />
          <span className="text-xl font-bold text-gray-800">DietLab</span>
        </div>
      </div>

      <nav className="flex-1 px-4 pb-4 pt-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path)
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
                activeSection === item.id
                  ? 'bg-green-50 text-green-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={() => {/* TODO: Handle settings */}}
          className="w-full flex items-center px-4 py-3 mb-2 rounded-lg text-gray-600 hover:bg-gray-50"
        >
          <Settings className="h-5 w-5 mr-3" />
          <span className="font-medium">Configuración</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}