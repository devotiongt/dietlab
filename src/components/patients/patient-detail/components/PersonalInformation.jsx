import React from 'react'
import {
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Target,
  FileText
} from 'lucide-react'

export default function PersonalInformation({ patient }) {
  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
        <div className="space-y-3">
          {patient.email && (
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-900">{patient.email}</span>
            </div>
          )}
          {patient.phone && (
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-900">{patient.phone}</span>
            </div>
          )}
          {patient.date_of_birth && (
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-900">
                {new Date(patient.date_of_birth).toLocaleDateString()}
              </span>
            </div>
          )}
          {patient.occupation && (
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-900">{patient.occupation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Goals */}
      {patient.goal && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Target className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Objetivo</h3>
          </div>
          <p className="text-sm text-gray-700">{patient.goal}</p>
        </div>
      )}

      {/* Notes */}
      {patient.notes && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <FileText className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Notas</h3>
          </div>
          <p className="text-sm text-gray-700">{patient.notes}</p>
        </div>
      )}
    </div>
  )
}