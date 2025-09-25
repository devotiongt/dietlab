import React from 'react'

export default function EatingHabitsSummary({ data }) {
  if (Object.keys(data).length === 0) {
    return <p className="text-gray-500 text-sm">No se han registrado hábitos de alimentación</p>
  }

  return (
    <div className="space-y-4 text-sm">
      {/* Contexto Social */}
      {data.contexto_social && Object.keys(data.contexto_social).some(key => data.contexto_social[key]) && (
        <div>
          <div className="font-medium mb-2 text-blue-700">Contexto Social</div>
          {data.contexto_social.con_quien_come && (
            <div className="mb-1">• Come con: <span className="font-medium">{data.contexto_social.con_quien_come}</span></div>
          )}
          {data.contexto_social.quien_prepara_alimentos && (
            <div className="mb-1">• Prepara alimentos: <span className="font-medium">{data.contexto_social.quien_prepara_alimentos}</span></div>
          )}
          {data.contexto_social.numero_comidas_dia && (
            <div className="mb-1">• Comidas al día: <span className="font-medium">{data.contexto_social.numero_comidas_dia}</span></div>
          )}
          {data.contexto_social.horarios_comida?.length > 0 && (
            <div className="mb-1">
              • Horarios:
              <div className="ml-4 mt-1">
                {data.contexto_social.horarios_comida.map((horario, idx) => (
                  <div key={idx} className="text-xs bg-gray-50 p-1 rounded mb-1">
                    <span className="font-medium">{horario.meal}</span>: {horario.time}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Colaciones */}
      {data.colaciones && (data.colaciones.realiza_colaciones || data.colaciones.tipos_alimentos_colaciones?.length > 0) && (
        <div>
          <div className="font-medium mb-2 text-green-700">Colaciones</div>
          {data.colaciones.realiza_colaciones && (
            <div className="mb-1">• Realiza colaciones: <span className="font-medium">Sí</span></div>
          )}
          {data.colaciones.tipos_alimentos_colaciones?.length > 0 && (
            <div className="mb-1">• Tipos: <span className="font-medium">{data.colaciones.tipos_alimentos_colaciones.join(', ')}</span></div>
          )}
        </div>
      )}

      {/* Frecuencia de Comidas */}
      {data.frecuencia_comidas && Object.keys(data.frecuencia_comidas).some(key => data.frecuencia_comidas[key]) && (
        <div>
          <div className="font-medium mb-2 text-purple-700">Frecuencia de Comidas</div>
          {data.frecuencia_comidas.comidas_casa_semana && (
            <div className="mb-1">• En casa (semana): <span className="font-medium">{data.frecuencia_comidas.comidas_casa_semana}</span></div>
          )}
          {data.frecuencia_comidas.comidas_fuera_casa_semana && (
            <div className="mb-1">• Fuera de casa (semana): <span className="font-medium">{data.frecuencia_comidas.comidas_fuera_casa_semana}</span></div>
          )}
          {data.frecuencia_comidas.comidas_fuera_casa_fin_semana && (
            <div className="mb-1">• Fuera de casa (fin de semana): <span className="font-medium">{data.frecuencia_comidas.comidas_fuera_casa_fin_semana}</span></div>
          )}
        </div>
      )}

      {/* Apetito y Preferencias */}
      {data.apetito_preferencias && Object.keys(data.apetito_preferencias).some(key => data.apetito_preferencias[key]) && (
        <div>
          <div className="font-medium mb-2 text-orange-700">Apetito y Preferencias</div>
          {data.apetito_preferencias.hora_mayor_apetito && (
            <div className="mb-1">• Mayor apetito: <span className="font-medium">{data.apetito_preferencias.hora_mayor_apetito}</span></div>
          )}
          {data.apetito_preferencias.percepcion_apetito && (
            <div className="mb-1">• Percepción del apetito: <span className="font-medium">{data.apetito_preferencias.percepcion_apetito}</span></div>
          )}
          {data.apetito_preferencias.cambios_recientes_apetito && (
            <div className="mb-1">• Cambios recientes: <span className="font-medium">{data.apetito_preferencias.cambios_recientes_apetito}</span></div>
          )}
        </div>
      )}

      {/* Restricciones y Suplementación */}
      {data.restricciones_suplementacion && (
        <div>
          <div className="font-medium mb-2 text-red-700">Restricciones y Suplementación</div>
          {data.restricciones_suplementacion.alergias_alimentarias?.length > 0 && (
            <div className="mb-1">• Alergias: <span className="font-medium">{data.restricciones_suplementacion.alergias_alimentarias.join(', ')}</span></div>
          )}
          {data.restricciones_suplementacion.intolerancias?.length > 0 && (
            <div className="mb-1">• Intolerancias: <span className="font-medium">{data.restricciones_suplementacion.intolerancias.join(', ')}</span></div>
          )}
          {data.restricciones_suplementacion.dietas_anteriores && (
            <div className="mb-1">• Dietas anteriores: <span className="font-medium">{data.restricciones_suplementacion.dietas_anteriores}</span></div>
          )}
          {data.restricciones_suplementacion.medicamentos_bajar_peso && (
            <div className="mb-1">• Medicamentos para bajar peso: <span className="font-medium">Sí</span></div>
          )}
          {data.restricciones_suplementacion.medicamentos_bajar_peso_detalles && (
            <div className="mb-1">• Detalles medicamentos: <span className="font-medium">{data.restricciones_suplementacion.medicamentos_bajar_peso_detalles}</span></div>
          )}
          {data.restricciones_suplementacion.suplementos_actuales?.length > 0 && (
            <div className="mb-1">
              • Suplementos actuales:
              <div className="ml-4 mt-1">
                {data.restricciones_suplementacion.suplementos_actuales.map((sup, idx) => (
                  <div key={idx} className="text-xs bg-gray-50 p-2 rounded mb-1">
                    <span className="font-medium">{sup.name}</span> - {sup.frequency}
                    {sup.notes && <div className="text-gray-600">Notas: {sup.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preferencias Alimentarias */}
      {data.preferencias_alimentarias && (
        <div>
          <div className="font-medium mb-2 text-indigo-700">Preferencias Alimentarias</div>
          {data.preferencias_alimentarias.alimentos_preferidos?.length > 0 && (
            <div className="mb-1">• Alimentos preferidos: <span className="font-medium">{data.preferencias_alimentarias.alimentos_preferidos.join(', ')}</span></div>
          )}
          {data.preferencias_alimentarias.alimentos_disgustan?.length > 0 && (
            <div className="mb-1">• Alimentos que disgustan: <span className="font-medium">{data.preferencias_alimentarias.alimentos_disgustan.join(', ')}</span></div>
          )}
        </div>
      )}
    </div>
  )
}