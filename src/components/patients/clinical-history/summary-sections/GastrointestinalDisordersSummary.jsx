import React from 'react'

export default function GastrointestinalDisordersSummary({ data }) {
  if (data.length === 0) {
    return <p className="text-gray-500 text-sm">No se han registrado trastornos gastrointestinales</p>
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="text-sm border-l-4 border-orange-200 pl-3">
          <div className="font-medium text-orange-800">{item.disorder}</div>
          {item.frequency && (
            <div className="text-gray-600 mt-1">
              <span className="text-xs font-medium">Frecuencia:</span> {item.frequency}
            </div>
          )}
          {item.comments && (
            <div className="text-gray-600 text-xs mt-1">
              <span className="font-medium">Comentarios:</span> {item.comments}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}