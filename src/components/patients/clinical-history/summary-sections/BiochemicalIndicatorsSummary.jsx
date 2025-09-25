import React from 'react'

export default function BiochemicalIndicatorsSummary({ data }) {
  if (data.length === 0) {
    return <p className="text-gray-500 text-sm">No se han registrado indicadores bioquímicos</p>
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="text-sm border-l-4 border-blue-200 pl-3">
          <div className="flex justify-between items-start">
            <span className="font-medium text-blue-800">{item.test}</span>
            <span className="text-lg font-bold text-gray-800">{item.value} {item.unit}</span>
          </div>
          {item.date && (
            <div className="text-gray-500 text-xs mt-1">Fecha: {new Date(item.date).toLocaleDateString()}</div>
          )}
          {item.reference_range && (
            <div className="text-gray-600 text-xs mt-1">Rango de referencia: {item.reference_range}</div>
          )}
          {item.notes && (
            <div className="text-gray-600 text-xs mt-1">Notas: {item.notes}</div>
          )}
        </div>
      ))}
    </div>
  )
}