import { Users, Plus } from 'lucide-react'

export default function PatientsManagerHeader({ onAddPatient }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center mb-4 sm:mb-0">
        <Users className="h-8 w-8 text-blue-600 mr-3" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Pacientes</h1>
          <p className="text-gray-600">Administra la información de tus pacientes</p>
        </div>
      </div>
      <button
        onClick={onAddPatient}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="h-5 w-5 mr-2" />
        Agregar Paciente
      </button>
    </div>
  )
}