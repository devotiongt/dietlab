import React from 'react'

const getFrequencyIcon = (freq) => {
  const freqLower = freq.toLowerCase()
  if (freqLower.includes('diario')) return '🟢'
  if (freqLower.includes('semanal') || freqLower.includes('vez') && freqLower.includes('semana')) return '🔵'
  if (freqLower.includes('mensual')) return '🟡'
  if (freqLower.includes('rara vez') || freqLower.includes('ocasional')) return '⚪'
  return '🟣'
}

export default function FoodFrequencySummary({ data }) {
  if (Object.keys(data).length === 0) {
    return <p className="text-gray-500 text-sm">No se ha registrado frecuencia de consumo</p>
  }

  // Mostrar solo los más importantes en el resumen
  const importantFoods = Object.entries(data)
    .filter(([food, frequency]) => {
      const freqLower = frequency.toLowerCase()
      return freqLower.includes('diario') || freqLower.includes('semanal') || freqLower.includes('todos los días')
    })
    .slice(0, 6) // Máximo 6 elementos en el resumen

  const remainingCount = Object.keys(data).length - importantFoods.length

  return (
    <div className="space-y-3">
      {importantFoods.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {importantFoods.map(([food, frequency], index) => (
            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
              <span className="text-sm">{getFrequencyIcon(frequency)}</span>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm text-gray-900 block truncate">{food}</span>
                <span className="text-xs text-gray-600">{frequency}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-600">
          {Object.entries(data).slice(0, 3).map(([food, frequency], index) => (
            <div key={index} className="flex justify-between py-1">
              <span className="font-medium truncate">{food}</span>
              <span className="text-gray-500 ml-2">{frequency}</span>
            </div>
          ))}
        </div>
      )}

      {remainingCount > 0 && (
        <p className="text-xs text-gray-500 text-center pt-2 border-t">
          +{remainingCount} alimentos más
        </p>
      )}
    </div>
  )
}