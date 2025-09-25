import React from 'react'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Archive,
  User,
  BookOpen
} from 'lucide-react'
import { patientsService } from '../../../../services/patientsService'

export default function PatientHeader({ patient, onBack, onEdit, onDelete, onArchive, onShowClinicalHistory }) {
  const age = patientsService.calculateAge(patient.date_of_birth)

  return (
    <div className="mb-8">
      <button
        onClick={onBack}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Volver a la lista
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          {patient.avatar_url ? (
            <img
              className="h-16 w-16 rounded-full object-cover"
              src={patient.avatar_url}
              alt={`${patient.first_name} ${patient.last_name}`}
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <User className="h-8 w-8 text-green-600" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {patient.first_name} {patient.last_name}
            </h1>
            <p className="text-gray-600">
              {age} años • {patient.gender}
              {patient.occupation && ` • ${patient.occupation}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onEdit(patient)}
            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </button>
          <button
            onClick={onShowClinicalHistory}
            className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Historial Clínico
          </button>
          {patient.status === 'active' && (
            <button
              onClick={() => onArchive(patient.id)}
              className="inline-flex items-center px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
            >
              <Archive className="h-4 w-4 mr-2" />
              Archivar
            </button>
          )}
          <button
            onClick={() => onDelete(patient.id)}
            className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}