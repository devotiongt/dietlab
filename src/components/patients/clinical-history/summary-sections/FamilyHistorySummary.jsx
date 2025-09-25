import React from 'react'

export default function FamilyHistorySummary({ data }) {
  if (data.length === 0) {
    return <p className="text-gray-500 text-sm">No se han registrado antecedentes familiares</p>
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="text-sm border-l-4 border-red-200 pl-3">
          <div className="font-medium text-red-800">{item.disease}</div>
          {item.family_members?.length > 0 && (
            <div className="text-gray-600 mt-1">
              <span className="text-xs font-medium">Familiares afectados:</span> {item.family_members.join(', ')}
            </div>
          )}
          {item.details && (
            <div className="text-gray-600 text-xs mt-1">
              <span className="font-medium">Notas:</span> {item.details}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}