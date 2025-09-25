import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Eye } from 'lucide-react'
import { patientsService } from '../services/patientsService'
import { clinicalHistoryService } from '../services/clinicalHistoryService'
import ClinicalHistoryForm from '../components/patients/clinical-history/ClinicalHistoryForm'

export default function ClinicalHistoryEditPage() {
  const { patientId, section } = useParams()
  const navigate = useNavigate()

  const [patient, setPatient] = useState(null)
  const [clinicalHistory, setClinicalHistory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  const handleSaveClinicalHistory = async (clinicalHistoryData, navigationAction = 'navigate') => {
    try {
      await clinicalHistoryService.saveClinicalHistory(clinicalHistoryData)

      // Actualizar el estado local con los nuevos datos
      setClinicalHistory(clinicalHistoryData)

      if (navigationAction === 'navigate') {
        // Navegar de vuelta al paciente (al completar todo el historial)
        navigate(`/dashboard/patients/${patientId}`)
      } else if (navigationAction === 'summary') {
        // Ir a la vista de resumen
        navigate(`/dashboard/patients/${patientId}/clinical-history`)
      }
      // Si navigationAction === 'stay', no hacer nada (mantener la sección actual)
    } catch (error) {
      console.error('Error saving clinical history:', error)
      throw error
    }
  }

  const handleBack = () => {
    navigate(`/dashboard/patients/${patientId}`)
  }

  const handleCancel = () => {
    navigate(`/dashboard/patients/${patientId}/clinical-history`)
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
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header para modo edición */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Editando Historial - {patient.first_name} {patient.last_name}
                </h1>
                <p className="text-gray-600">
                  {patient.gender} • {patientsService.calculateAge(patient.date_of_birth)} años
                  {patient.occupation && ` • ${patient.occupation}`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate(`/dashboard/patients/${patientId}/clinical-history`)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Dashboard
              </button>

              <button
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Paciente
              </button>
            </div>
          </div>
        </div>

        <ClinicalHistoryForm
          patient={patient}
          clinicalHistory={clinicalHistory}
          onSave={handleSaveClinicalHistory}
          onCancel={handleCancel}
          initialActiveSection={section || 'family_history'}
        />
      </div>
    </div>
  )
}