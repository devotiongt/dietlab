import React from 'react'

export default function ToxicomaniasSummary({ data }) {
  if (data.length === 0) {
    return <p className="text-gray-500 text-sm">No se han registrado toxicomanías</p>
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="text-sm border-l-4 border-yellow-200 pl-3">
          <div className="font-medium text-yellow-800">{item.type}</div>
          <div className="text-gray-600 mt-1">
            <span className="text-xs font-medium">Frecuencia:</span> {item.frequency}
          </div>
          {item.details && (
            <div className="text-gray-600 text-xs mt-1">
              <span className="font-medium">Detalles:</span> {item.details}
            </div>
          )}
          {item.notes && (
            <div className="text-gray-600 text-xs mt-1">
              <span className="font-medium">Notas:</span> {item.notes}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}