import React from 'react'

export default function GynecoObstetricSummary({ data }) {
  if (Object.keys(data).length === 0) {
    return <p className="text-gray-500 text-sm">No se han registrado antecedentes gineco-obstétricos</p>
  }

  return (
    <div className="space-y-2 text-sm">
      {data.gestaciones && (
        <div>• Gestaciones: <span className="font-medium">{data.gestaciones}</span></div>
      )}
      {data.partos && (
        <div>• Partos: <span className="font-medium">{data.partos}</span></div>
      )}
      {data.cesareas && (
        <div>• Cesáreas: <span className="font-medium">{data.cesareas}</span></div>
      )}
      {data.fecha_ultima_menstruacion && (
        <div>• Última menstruación: <span className="font-medium">{new Date(data.fecha_ultima_menstruacion).toLocaleDateString()}</span></div>
      )}
      {data.fecha_ultimo_parto && (
        <div>• Último parto: <span className="font-medium">{new Date(data.fecha_ultimo_parto).toLocaleDateString()}</span></div>
      )}
      {data.semanas_gestacion && (
        <div>• Semanas de gestación (último embarazo): <span className="font-medium">{data.semanas_gestacion}</span></div>
      )}
      {data.uso_anticonceptivos && (
        <div>• Anticonceptivos: <span className="font-medium">{data.uso_anticonceptivos}</span></div>
      )}
      {data.comentarios && (
        <div>• Comentarios: <span className="font-medium">{data.comentarios}</span></div>
      )}
    </div>
  )
}