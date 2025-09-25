import { useState, useEffect } from 'react'
import { Routes, Route, useParams, useNavigate } from 'react-router-dom'
import { patientsService } from '../../services/patientsService'
import PatientList from './patient-list/PatientList'
import PatientDetail from './patient-detail/PatientDetail'
import PatientForm from './patient-form/PatientForm'
import ClinicalHistoryPage from '../../pages/ClinicalHistoryPage'
import ClinicalHistoryEditPage from '../../pages/ClinicalHistoryEditPage'

// Component to handle patient detail view
function PatientDetailWrapper() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPatient()
  }, [patientId])

  const loadPatient = async () => {
    try {
      setLoading(true)
      const data = await patientsService.getPatient(patientId)
      setPatient(data)
    } catch (error) {
      setError('Error al cargar paciente: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (patient) => {
    navigate(`/dashboard/patients/${patient.id}/edit`)
  }

  const handleDelete = async (patientId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este paciente?')) {
      return
    }
    try {
      await patientsService.deletePatient(patientId)
      navigate('/dashboard/patients')
    } catch (error) {
      setError('Error al eliminar paciente: ' + error.message)
    }
  }

  const handleArchive = async (patientId) => {
    try {
      await patientsService.archivePatient(patientId)
      await loadPatient()
    } catch (error) {
      setError('Error al archivar paciente: ' + error.message)
    }
  }

  if (loading) return <div className="p-8 text-center">Cargando...</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>
  if (!patient) return <div className="p-8 text-center">Paciente no encontrado</div>

  return (
    <PatientDetail
      patient={patient}
      onBack={() => navigate('/dashboard/patients')}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onArchive={handleArchive}
      onPatientUpdate={setPatient}
    />
  )
}

// Component to handle patient edit form
function PatientEditWrapper() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPatient()
  }, [patientId])

  const loadPatient = async () => {
    try {
      setLoading(true)
      const data = await patientsService.getPatient(patientId)
      setPatient(data)
    } catch (error) {
      setError('Error al cargar paciente: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (patientData) => {
    try {
      await patientsService.updatePatient(patientId, patientData)
      navigate(`/dashboard/patients/${patientId}`)
    } catch (error) {
      setError('Error al actualizar paciente: ' + error.message)
    }
  }

  const handleCancel = () => {
    navigate(`/dashboard/patients/${patientId}`)
  }

  if (loading) return <div className="p-8 text-center">Cargando...</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>
  if (!patient) return <div className="p-8 text-center">Paciente no encontrado</div>

  return (
    <PatientForm
      patient={patient}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  )
}

// Component to handle new patient form
function PatientNewWrapper() {
  const navigate = useNavigate()

  const handleSave = async (data) => {
    try {
      // Si es un objeto con patientData e initialMeasurement
      if (data.patientData && data.initialMeasurement) {
        const newPatient = await patientsService.createPatientWithInitialMeasurement(
          data.patientData, 
          data.initialMeasurement
        )
        navigate(`/dashboard/patients/${newPatient.id}`)
      } else {
        // Fallback para compatibilidad
        const newPatient = await patientsService.createPatient(data)
        navigate(`/dashboard/patients/${newPatient.id}`)
      }
    } catch (error) {
      console.error('Error al crear paciente:', error)
    }
  }

  const handleCancel = () => {
    navigate('/dashboard/patients')
  }

  return (
    <PatientForm
      onSave={handleSave}
      onCancel={handleCancel}
    />
  )
}

export default function PatientRouter() {
  return (
    <Routes>
      <Route path="/" element={<PatientList />} />
      <Route path="/new" element={<PatientNewWrapper />} />
      <Route path="/:patientId" element={<PatientDetailWrapper />} />
      <Route path="/:patientId/edit" element={<PatientEditWrapper />} />
      <Route path="/:patientId/clinical-history" element={<ClinicalHistoryPage />} />
      <Route path="/:patientId/clinical-history/medical" element={<ClinicalHistoryPage initialTab="medical" />} />
      <Route path="/:patientId/clinical-history/nutrition" element={<ClinicalHistoryPage initialTab="nutrition" />} />
      <Route path="/:patientId/clinical-history/edit/:section" element={<ClinicalHistoryEditPage />} />
    </Routes>
  )
}