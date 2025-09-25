import { Plus, Heart } from 'lucide-react'
import PatientCard from './PatientCard'

export default function PatientsList({
  patients,
  loading,
  searchTerm,
  onAddPatient,
  onViewPatient,
  onEditPatient,
  onDeletePatient,
  onArchivePatient
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando pacientes...</span>
      </div>
    )
  }

  if (patients.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pacientes</h3>
        <p className="text-gray-600 mb-4">
          {searchTerm ? 'No se encontraron pacientes con ese criterio de búsqueda.' : 'Comienza agregando tu primer paciente.'}
        </p>
        {!searchTerm && (
          <button
            onClick={onAddPatient}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Agregar Primer Paciente
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {patients.map((patient) => (
        <PatientCard
          key={patient.id}
          patient={patient}
          onView={() => onViewPatient(patient.id)}
          onEdit={() => onEditPatient(patient.id)}
          onDelete={() => onDeletePatient(patient.id)}
          onArchive={() => onArchivePatient(patient.id)}
        />
      ))}
    </div>
  )
}