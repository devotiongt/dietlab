import React from 'react'
import { Heart } from 'lucide-react'

export default function ClinicalHistorySummary({ clinicalHistorySummary }) {
  if (!clinicalHistorySummary) return null

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Heart className="h-5 w-5 text-red-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Historial Clínico</h3>
        </div>
        <div className="text-sm text-gray-600">
          {clinicalHistorySummary.completionPercentage}% completo
        </div>
      </div>

      <div className="space-y-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${clinicalHistorySummary.completionPercentage}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {clinicalHistorySummary.hasFamilyHistory && (
            <div className="flex items-center text-blue-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
              {clinicalHistorySummary.familyHistoryCount} antecedentes familiares
            </div>
          )}
          {clinicalHistorySummary.hasPersonalHistory && (
            <div className="flex items-center text-red-600">
              <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
              {clinicalHistorySummary.personalHistoryCount} antecedentes personales
            </div>
          )}
          {clinicalHistorySummary.hasPhysicalActivities && (
            <div className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
              {clinicalHistorySummary.physicalActivitiesCount} actividades físicas
            </div>
          )}
          {clinicalHistorySummary.hasLabResults && (
            <div className="flex items-center text-purple-600">
              <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
              {clinicalHistorySummary.labResultsCount} exámenes
            </div>
          )}
        </div>

        {clinicalHistorySummary.lastUpdated && (
          <div className="text-xs text-gray-500 pt-2 border-t">
            Actualizado: {new Date(clinicalHistorySummary.lastUpdated).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  )
}