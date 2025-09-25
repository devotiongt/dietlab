import { Eye, Edit, Trash2, Archive } from 'lucide-react'
import { patientsService } from '../../../../services/patientsService'
import { measurementsService } from '../../../../services/measurementsService'

export default function PatientCard({ patient, onView, onEdit, onDelete, onArchive }) {
  const age = patientsService.calculateAge(patient.date_of_birth)
  const bmi = measurementsService.calculateBMI(patient.weight, patient.height)
  const bmiCategory = measurementsService.getBMICategory(bmi)

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Activo'
      case 'inactive':
        return 'Inactivo'
      case 'archived':
        return 'Archivado'
      default:
        return status
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Patient Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {patient.first_name?.[0]?.toUpperCase()}{patient.last_name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {patient.first_name} {patient.last_name}
            </h3>
            <p className="text-sm text-gray-600">{patient.email}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(patient.status)}`}>
          {getStatusText(patient.status)}
        </span>
      </div>

      {/* Patient Details */}
      <div className="space-y-2 mb-4">
        {age && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Edad:</span>
            <span className="text-gray-900">{age} años</span>
          </div>
        )}
        {patient.weight && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Peso:</span>
            <span className="text-gray-900">{patient.weight} kg</span>
          </div>
        )}
        {bmi && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">IMC:</span>
            <span className="text-gray-900">{bmi} ({bmiCategory})</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-4 border-t border-gray-100 space-y-2">
        <div className="flex justify-between">
          <button
            onClick={onView}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors mr-2"
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </button>

          <button
            onClick={onEdit}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </button>
        </div>

        <div className="flex space-x-2">
          {patient.status === 'active' && (
            <button
              onClick={onArchive}
              className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 transition-colors"
            >
              <Archive className="h-4 w-4 mr-1" />
              Archivar
            </button>
          )}

          <button
            onClick={onDelete}
            className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}