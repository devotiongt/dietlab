import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { patientsService } from '../../../services/patientsService'
import PatientsManagerHeader from './components/PatientsManagerHeader'
import SearchAndFilter from './components/SearchAndFilter'
import PatientsList from './components/PatientsList'

export default function PatientList() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadPatients()
  }, [searchTerm, statusFilter])

  const loadPatients = async () => {
    try {
      setLoading(true)
      const data = await patientsService.getPatients(searchTerm, statusFilter)
      setPatients(data)
    } catch (error) {
      setError('Error al cargar pacientes: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePatient = async (patientId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este paciente? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      await patientsService.deletePatient(patientId)
      loadPatients()
    } catch (error) {
      setError('Error al eliminar paciente: ' + error.message)
    }
  }

  const handleArchivePatient = async (patientId) => {
    try {
      await patientsService.archivePatient(patientId)
      loadPatients()
    } catch (error) {
      setError('Error al archivar paciente: ' + error.message)
    }
  }

  const handleAddPatient = () => {
    navigate('/dashboard/patients/new')
  }

  const handleViewPatient = (patientId) => {
    navigate(`/dashboard/patients/${patientId}`)
  }

  const handleEditPatient = (patientId) => {
    navigate(`/dashboard/patients/${patientId}/edit`)
  }

  return (
    <div className="space-y-6">
      <PatientsManagerHeader onAddPatient={handleAddPatient} />

      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        error={error}
      />

      <div className="bg-white rounded-lg shadow p-6">
        <PatientsList
          patients={patients}
          loading={loading}
          searchTerm={searchTerm}
          onAddPatient={handleAddPatient}
          onViewPatient={handleViewPatient}
          onEditPatient={handleEditPatient}
          onDeletePatient={handleDeletePatient}
          onArchivePatient={handleArchivePatient}
        />
      </div>
    </div>
  )
}