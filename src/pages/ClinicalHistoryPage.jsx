import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { patientsService } from '../services/patientsService'
import { clinicalHistoryService } from '../services/clinicalHistoryService'
import ModernClinicalDashboard from '../components/patients/clinical-history/ModernClinicalDashboard'

export default function ClinicalHistoryPage({ initialTab = 'general' }) {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [patient, setPatient] = useState(null)
  const [clinicalHistory, setClinicalHistory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTab, setSelectedTab] = useState(initialTab)

  // Effect to update selectedTab based on current route
  useEffect(() => {
    const path = location.pathname
    if (path.includes('/medical')) {
      setSelectedTab('medical')
    } else if (path.includes('/nutrition')) {
      setSelectedTab('nutrition')
    } else {
      setSelectedTab('general')
    }
  }, [location.pathname])

  // Function to scroll to specific section
  const scrollToSection = (sectionId) => {
    // Small delay to ensure the tab content is rendered
    setTimeout(() => {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        })
      }
    }, 100)
  }

  useEffect(() => {
    loadPatientAndHistory()
  }, [patientId])

  const loadPatientAndHistory = async () => {
    try {
      setLoading(true)
      const [patientData, historyData] = await Promise.all([
        patientsService.getPatient(patientId),
        clinicalHistoryService.getClinicalHistory(patientId)
      ])

      setPatient(patientData)
      setClinicalHistory(historyData)
    } catch (error) {
      console.error('Error loading patient and clinical history:', error)
      setError('Error al cargar la información del paciente')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate(`/dashboard/patients/${patientId}`)
  }

  const handleEditSection = (sectionId) => {
    navigate(`/dashboard/patients/${patientId}/clinical-history/edit/${sectionId}`)
  }

  const handleTabChange = (tabId) => {
    if (tabId === 'general') {
      navigate(`/dashboard/patients/${patientId}/clinical-history`)
    } else {
      navigate(`/dashboard/patients/${patientId}/clinical-history/${tabId}`)
    }
  }

  // Specific handlers for different sections
  const handleViewConditions = () => {
    handleTabChange('medical')
    scrollToSection('conditions-section')
  }

  const handleViewActivities = () => {
    handleTabChange('nutrition')
    scrollToSection('activities-section')
  }

  const handleViewEatingHabits = () => {
    handleTabChange('nutrition')
    scrollToSection('eating-habits-section')
  }

  const handleViewLabResults = () => {
    handleTabChange('medical')
    scrollToSection('lab-results-section')
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando historial clínico...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error}</p>
          <button
            onClick={handleBack}
            className="mt-4 inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </button>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Paciente no encontrado</p>
          <button
            onClick={() => navigate('/dashboard/patients')}
            className="mt-4 inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a pacientes
          </button>
        </div>
      </div>
    )
  }

  return (
    <ModernClinicalDashboard
      patient={patient}
      clinicalHistory={clinicalHistory}
      selectedTab={selectedTab}
      onTabChange={handleTabChange}
      onEdit={() => navigate(`/dashboard/patients/${patientId}/clinical-history/edit/family_history`)}
      onEditSection={handleEditSection}
      onBack={handleBack}
      onViewConditions={handleViewConditions}
      onViewActivities={handleViewActivities}
      onViewEatingHabits={handleViewEatingHabits}
      onViewLabResults={handleViewLabResults}
    />
  )
}