import React from 'react'
import { TrendingUp } from 'lucide-react'
import { patientsService } from '../../../../services/patientsService'
import { measurementsService } from '../../../../services/measurementsService'

export default function KeyMetrics({ patient, measurements }) {
  const bmi = measurementsService.calculateBMI(patient.weight, patient.height)
  const bmiCategory = measurementsService.getBMICategory(bmi)

  const latestMeasurement = measurements[0]
  const previousMeasurement = measurements[1]

  const getWeightTrend = () => {
    if (!latestMeasurement || !previousMeasurement) return null
    return latestMeasurement.weight - previousMeasurement.weight
  }

  const weightTrend = getWeightTrend()

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Métricas Principales</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {patient.weight && patient.height && (
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{bmi}</div>
            <div className="text-sm text-gray-600">IMC</div>
            <div className="text-xs text-blue-500 mt-1">{bmiCategory}</div>
          </div>
        )}

        {patient.weight && (
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{patient.weight} kg</div>
            <div className="text-sm text-gray-600">Peso Actual</div>
            {weightTrend !== null && (
              <div className={`text-xs mt-1 flex items-center justify-center ${
                weightTrend > 0 ? 'text-red-500' : weightTrend < 0 ? 'text-green-500' : 'text-gray-500'
              }`}>
                <TrendingUp className={`h-3 w-3 mr-1 ${weightTrend < 0 ? 'rotate-180' : ''}`} />
                {Math.abs(weightTrend).toFixed(1)} kg
              </div>
            )}
          </div>
        )}

        {patient.height && (
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{patient.height} cm</div>
            <div className="text-sm text-gray-600">Altura</div>
          </div>
        )}
      </div>
    </div>
  )
}