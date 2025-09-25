import React from 'react'

export default function PatientStatus({ patient }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Paciente</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Estado:</span>
          <span className={`text-sm font-medium ${
            patient.status === 'active' ? 'text-green-600' :
            patient.status === 'inactive' ? 'text-yellow-600' : 'text-gray-600'
          }`}>
            {patient.status === 'active' ? 'Activo' :
             patient.status === 'inactive' ? 'Inactivo' : 'Archivado'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Creado:</span>
          <span className="text-sm text-gray-900">
            {new Date(patient.created_at).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Actualizado:</span>
          <span className="text-sm text-gray-900">
            {new Date(patient.updated_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  )
}