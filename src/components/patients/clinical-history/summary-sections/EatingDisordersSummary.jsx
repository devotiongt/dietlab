import React from 'react'

export default function EatingDisordersSummary({ data }) {
  if (data.length === 0) {
    return <p className="text-gray-500 text-sm">No se han registrado trastornos alimentarios</p>
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="text-sm border-l-4 border-purple-200 pl-3">
          <div className="font-medium text-purple-800">{item.disorder}</div>
          {item.duration_value && (
            <div className="text-gray-600 mt-1">
              <span className="text-xs font-medium">Tiempo con el trastorno:</span> {item.duration_value} {item.duration_unit}
            </div>
          )}
          {item.medication_details && item.medication_details.length > 0 && (
            <div className="mt-2">
              <div className="text-xs font-medium text-gray-700 mb-1">Medicamentos:</div>
              {item.medication_details.map((med, medIndex) => (
                <div key={medIndex} className="bg-gray-50 p-2 rounded text-xs mb-1">
                  <span className="font-medium">{med.name}</span> - {med.frequency}
                  {med.notes && <div className="text-gray-600 mt-1">Notas: {med.notes}</div>}
                </div>
              ))}
            </div>
          )}
          {item.treatment_notes && (
            <div className="text-gray-600 text-xs mt-1">
              <span className="font-medium">Notas de tratamiento:</span> {item.treatment_notes}
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