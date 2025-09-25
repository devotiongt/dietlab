import React from 'react'

export default function PhysicalActivitiesSummary({ data }) {
  if (data.length === 0) {
    return <p className="text-gray-500 text-sm">No se han registrado actividades físicas</p>
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="text-sm border-l-4 border-green-200 pl-3">
          <div className="font-medium text-green-800">{item.type}</div>
          <div className="text-gray-600 mt-1">
            <span className="text-xs font-medium">Frecuencia:</span> {item.frequency}
          </div>
          <div className="text-gray-600">
            <span className="text-xs font-medium">Horario:</span> {item.schedule}
          </div>
          {item.duration_minutes && (
            <div className="text-gray-600">
              <span className="text-xs font-medium">Duración:</span> {item.duration_minutes} minutos
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