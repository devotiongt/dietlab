import { Routes, Route } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import PatientRouter from '../patients/PatientRouter'
import OverviewContent from './content/OverviewContent'
import DietsContent from './content/DietsContent'
import AppointmentsContent from './content/AppointmentsContent'
import ReportsContent from './content/ReportsContent'
import AnalyticsContent from './content/AnalyticsContent'
import { Bell } from 'lucide-react'

export default function DashboardContent({ activeSection, menuItems }) {
  const { user } = useAuth()

  const getPageTitle = () => {
    return menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'
  }

  return (
    <div className="lg:ml-64 flex-1">
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 pl-12 lg:pl-0">
            {getPageTitle()}
          </h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-500">
              <Bell className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user?.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<OverviewContent />} />
          <Route path="/patients/*" element={<PatientRouter />} />
          <Route path="/diets" element={<DietsContent />} />
          <Route path="/appointments" element={<AppointmentsContent />} />
          <Route path="/reports" element={<ReportsContent />} />
          <Route path="/analytics" element={<AnalyticsContent />} />
        </Routes>
      </main>
    </div>
  )
}