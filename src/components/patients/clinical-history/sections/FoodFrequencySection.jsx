import React from 'react'
import { Calendar, Edit } from 'lucide-react'

const getFrequencyColor = (freq) => {
  const freqLower = freq.toLowerCase()
  if (freqLower.includes('diario') || freqLower.includes('todos los días')) {
    return 'bg-green-500'
  }
  if (freqLower.includes('semanal') || (freqLower.includes('vez') && freqLower.includes('semana'))) {
    return 'bg-blue-500'
  }
  if (freqLower.includes('mensual') || freqLower.includes('mes')) {
    return 'bg-yellow-500'
  }
  if (freqLower.includes('nunca') || freqLower.includes('no consume')) {
    return 'bg-red-500'
  }
  if (freqLower.includes('rara vez') || freqLower.includes('ocasional')) {
    return 'bg-gray-400'
  }
  return 'bg-indigo-500'
}

const getFrequencyShortLabel = (freq) => {
  const freqLower = freq.toLowerCase()
  if (freqLower.includes('diario') || freqLower.includes('todos los días')) return 'Diario'
  if (freqLower.includes('2-3 veces por semana')) return '2-3/sem'
  if (freqLower.includes('1 vez por semana')) return '1/sem'
  if (freqLower.includes('semanal')) return 'Semanal'
  if (freqLower.includes('mensual')) return 'Mensual'
  if (freqLower.includes('nunca')) return 'Nunca'
  if (freqLower.includes('rara vez')) return 'Rara vez'
  return freq
}

const FoodFrequencyTable = ({ foodFrequency }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Alimento
            </th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Frecuencia
            </th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
              Indicador Visual
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Object.entries(foodFrequency).map(([food, frequency], index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4">
                <span className="text-sm font-medium text-gray-900">{food}</span>
              </td>
              <td className="py-3 px-4 text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {getFrequencyShortLabel(frequency)}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex justify-center">
                  <div className="w-full max-w-24 bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-300 ${getFrequencyColor(frequency)}`}
                      style={{
                        width: frequency.toLowerCase().includes('diario') ? '100%' :
                               frequency.toLowerCase().includes('2-3') ? '75%' :
                               frequency.toLowerCase().includes('1 vez') ? '50%' :
                               frequency.toLowerCase().includes('semanal') ? '60%' :
                               frequency.toLowerCase().includes('mensual') ? '25%' :
                               frequency.toLowerCase().includes('nunca') ? '0%' :
                               frequency.toLowerCase().includes('rara vez') ? '15%' : '30%'
                      }}
                    ></div>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function FoodFrequencySection({ foodFrequency, onEditSection }) {
  const hasFoodData = Object.keys(foodFrequency).length > 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
          Frecuencia de Consumo de Alimentos
          {hasFoodData && (
            <span className="ml-3 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {Object.keys(foodFrequency).length} alimentos
            </span>
          )}
        </h3>
        <button
          onClick={() => onEditSection?.('food_frequency')}
          className="text-gray-400 hover:text-blue-600 transition-colors"
          title="Editar frecuencia de consumo"
        >
          <Edit className="h-4 w-4" />
        </button>
      </div>

      {hasFoodData ? (
        <FoodFrequencyTable foodFrequency={foodFrequency} />
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No hay frecuencia de consumo registrada</p>
          <p className="text-sm mb-4 text-gray-400">
            Agrega la frecuencia con la que el paciente consume diferentes alimentos
          </p>
          <button
            onClick={() => onEditSection?.('food_frequency')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Agregar frecuencias
          </button>
        </div>
      )}
    </div>
  )
}