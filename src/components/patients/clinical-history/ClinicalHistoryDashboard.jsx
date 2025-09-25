import React, { useState } from 'react'
import {
  AlertTriangle, Heart, Activity, Apple, Users, TestTube,
  Pill, Shield, Clock, Calendar, Edit, ChevronRight,
  Stethoscope, Baby, ChevronDown, ChevronUp, Plus, Minus
} from 'lucide-react'
import { parseJSONField } from './summary-sections/utils'

// Componente para secciones expandibles
const ExpandableSection = ({ title, icon: Icon, children, onEdit, sectionId, defaultExpanded = true, isEmpty = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center">
          <Icon className="h-5 w-5 text-blue-600 mr-3" />
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {isEmpty && (
            <span className="ml-2 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              Sin información
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit?.(sectionId)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Editar sección"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  )
}

export default function ClinicalHistoryDashboard({ patient, clinicalHistory, onEdit, onEditSection }) {
  if (!patient || !clinicalHistory) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">No hay información disponible</div>
      </div>
    )
  }

  // Parse los campos JSON
  const familyHistory = parseJSONField(clinicalHistory.family_history, [])
  const personalHistory = parseJSONField(clinicalHistory.personal_pathological_history, [])
  const eatingDisorders = parseJSONField(clinicalHistory.eating_disorders, [])
  const physicalActivities = parseJSONField(clinicalHistory.physical_activities, [])
  const toxicomanias = parseJSONField(clinicalHistory.toxicomanias, [])
  const gastrointestinalDisorders = parseJSONField(clinicalHistory.gastrointestinal_disorders, [])
  const gynecoHistory = parseJSONField(clinicalHistory.gyneco_obstetric_history, {})
  const eatingHabits = parseJSONField(clinicalHistory.eating_habits, {})
  const foodFrequency = parseJSONField(clinicalHistory.food_frequency, {})
  const foodRecall = parseJSONField(clinicalHistory.food_recall_24h, {})
  const biochemicalIndicators = parseJSONField(clinicalHistory.biochemical_indicators, [])

  // Función para identificar información crítica/de alerta
  const getCriticalAlerts = () => {
    const alerts = []

    // Alergias alimentarias
    const allergies = eatingHabits?.restricciones_suplementacion?.alergias_alimentarias || []
    if (allergies.length > 0) {
      alerts.push({
        type: 'critical',
        icon: Shield,
        title: 'ALERGIAS ALIMENTARIAS',
        items: allergies,
        color: 'bg-red-100 border-red-200 text-red-800'
      })
    }

    // Intolerancias
    const intolerances = eatingHabits?.restricciones_suplementacion?.intolerancias || []
    if (intolerances.length > 0) {
      alerts.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'INTOLERANCIAS',
        items: intolerances,
        color: 'bg-yellow-100 border-yellow-200 text-yellow-800'
      })
    }

    return alerts
  }

  const criticalAlerts = getCriticalAlerts()

  return (
    <div className="space-y-6">
      {/* Header con botón de edición */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Historial Clínico Completo</h2>
          <p className="text-gray-600 text-sm mt-1">Información detallada para evaluación nutricional</p>
        </div>
        <button
          onClick={onEdit}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar Historial
        </button>
      </div>

      {/* Alertas críticas */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-3">
          {criticalAlerts.map((alert, index) => {
            const Icon = alert.icon
            return (
              <div key={index} className={`p-4 rounded-lg border-2 ${alert.color}`}>
                <div className="flex items-center mb-2">
                  <Icon className="h-5 w-5 mr-2" />
                  <span className="font-bold text-sm">{alert.title}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {alert.items.map((item, idx) => (
                    <span key={idx} className="inline-block px-2 py-1 bg-white rounded text-sm font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Layout principal de 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Columna izquierda */}
        <div className="space-y-6">

          {/* Antecedentes Heredofamiliares */}
          <ExpandableSection
            title="Antecedentes Heredofamiliares"
            icon={Users}
            onEdit={onEditSection}
            sectionId="family_history"
            isEmpty={familyHistory.length === 0}
          >
            {familyHistory.length > 0 ? (
              <div className="space-y-4">
                {familyHistory.map((item, index) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium text-gray-900">{item.disease}</span>
                        {item.dyslipidemia_types && item.dyslipidemia_types.length > 0 && (
                          <div className="text-sm text-blue-700 mt-1">
                            <span className="font-medium">Tipos:</span> {item.dyslipidemia_types.join(', ')}
                          </div>
                        )}
                        {item.details && (
                          <p className="text-sm text-gray-600 mt-1">{item.details}</p>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        {item.family_members && item.family_members.length > 0 && (
                          <div>
                            {item.family_members.map((member, idx) => (
                              <div key={idx} className="whitespace-nowrap">{member}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay antecedentes familiares registrados</p>
              </div>
            )}
          </ExpandableSection>

          {/* Antecedentes Personales Patológicos */}
          <ExpandableSection
            title="Antecedentes Personales Patológicos"
            icon={Heart}
            onEdit={onEditSection}
            sectionId="personal_pathological_history"
            isEmpty={personalHistory.length === 0}
          >
            {personalHistory.length > 0 ? (
              <div className="space-y-4">
                {personalHistory.map((condition, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900">{condition.disease}</span>
                      <span className="text-sm text-gray-600">
                        {condition.duration_value} {condition.duration_unit}
                      </span>
                    </div>
                    {condition.medication_details && condition.medication_details.length > 0 && (
                      <div className="mt-2">
                        <div className="text-sm font-medium text-gray-700 mb-1">Medicamentos:</div>
                        {condition.medication_details.map((med, medIdx) => (
                          <div key={medIdx} className="text-sm text-gray-600 ml-2">
                            • {med.name} {med.frequency && `- ${med.frequency}`}
                            {med.notes && <span className="text-gray-500"> ({med.notes})</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay antecedentes personales registrados</p>
              </div>
            )}
          </ExpandableSection>

          {/* Trastornos Alimentarios */}
          <ExpandableSection
            title="Trastornos Alimentarios y Psicológicos"
            icon={Heart}
            onEdit={onEditSection}
            sectionId="eating_disorders"
            isEmpty={eatingDisorders.length === 0}
            defaultExpanded={eatingDisorders.length > 0}
          >
            {eatingDisorders.length > 0 ? (
              <div className="space-y-4">
                {eatingDisorders.map((disorder, index) => (
                  <div key={index} className="border border-red-200 rounded-lg p-3 bg-red-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-red-900">{disorder.disorder}</span>
                      <span className="text-sm text-red-700">
                        {disorder.duration_value} {disorder.duration_unit}
                      </span>
                    </div>
                    {disorder.treatment_notes && (
                      <p className="text-sm text-red-800 mb-2">{disorder.treatment_notes}</p>
                    )}
                    {disorder.medication_details && disorder.medication_details.length > 0 && (
                      <div className="mt-2">
                        <div className="text-sm font-medium text-red-700 mb-1">Medicamentos:</div>
                        {disorder.medication_details.map((med, medIdx) => (
                          <div key={medIdx} className="text-sm text-red-600 ml-2">
                            • {med.name} {med.frequency && `- ${med.frequency}`}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>No hay trastornos alimentarios registrados</p>
              </div>
            )}
          </ExpandableSection>

          {/* Actividad Física */}
          <ExpandableSection
            title="Actividad Física"
            icon={Activity}
            onEdit={onEditSection}
            sectionId="physical_activities"
            isEmpty={physicalActivities.length === 0}
          >
            {physicalActivities.length > 0 ? (
              <div className="space-y-3">
                {physicalActivities.map((activity, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <span className="font-medium text-gray-900">{activity.type}</span>
                      <div className="text-sm text-gray-600">{activity.schedule}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{activity.frequency}</div>
                      {activity.duration_minutes && (
                        <div className="text-sm text-gray-600">{activity.duration_minutes} min</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay actividad física registrada</p>
              </div>
            )}
          </ExpandableSection>

        </div>

        {/* Columna derecha */}
        <div className="space-y-6">

          {/* Hábitos de Alimentación */}
          <ExpandableSection
            title="Hábitos de Alimentación"
            icon={Apple}
            onEdit={onEditSection}
            sectionId="eating_habits"
            isEmpty={Object.keys(eatingHabits).length === 0}
          >
            {Object.keys(eatingHabits).length > 0 ? (
              <div className="space-y-4">
                {/* Contexto Social */}
                {eatingHabits.contexto_social && (
                  <div className="border-b border-gray-100 pb-4">
                    <h4 className="font-medium text-gray-900 mb-3">Contexto Social</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {eatingHabits.contexto_social.numero_comidas_dia && (
                        <div>
                          <span className="text-gray-600">Comidas/día:</span>
                          <span className="ml-2 font-medium">{eatingHabits.contexto_social.numero_comidas_dia}</span>
                        </div>
                      )}
                      {eatingHabits.contexto_social.con_quien_come && (
                        <div>
                          <span className="text-gray-600">Come con:</span>
                          <span className="ml-2 font-medium">{eatingHabits.contexto_social.con_quien_come}</span>
                        </div>
                      )}
                      {eatingHabits.contexto_social.quien_prepara_alimentos && (
                        <div>
                          <span className="text-gray-600">Prepara:</span>
                          <span className="ml-2 font-medium">{eatingHabits.contexto_social.quien_prepara_alimentos}</span>
                        </div>
                      )}
                    </div>
                    {eatingHabits.contexto_social.horarios_comida && eatingHabits.contexto_social.horarios_comida.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm text-gray-600 mb-2">Horarios:</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {eatingHabits.contexto_social.horarios_comida.map((horario, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>{horario.meal}</span>
                              <span className="font-medium">{horario.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Colaciones */}
                {eatingHabits.colaciones && (
                  <div className="border-b border-gray-100 pb-4">
                    <h4 className="font-medium text-gray-900 mb-3">Colaciones</h4>
                    <div className="text-sm">
                      <div className="mb-2">
                        <span className="text-gray-600">Realiza colaciones:</span>
                        <span className="ml-2 font-medium">
                          {eatingHabits.colaciones.realiza_colaciones ? 'Sí' : 'No'}
                        </span>
                      </div>
                      {eatingHabits.colaciones.tipos_alimentos_colaciones && eatingHabits.colaciones.tipos_alimentos_colaciones.length > 0 && (
                        <div>
                          <span className="text-gray-600">Tipos:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {eatingHabits.colaciones.tipos_alimentos_colaciones.map((tipo, idx) => (
                              <span key={idx} className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                {tipo}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Apetito y Preferencias */}
                {eatingHabits.apetito_preferencias && (
                  <div className="border-b border-gray-100 pb-4">
                    <h4 className="font-medium text-gray-900 mb-3">Apetito y Preferencias</h4>
                    <div className="space-y-2 text-sm">
                      {eatingHabits.apetito_preferencias.percepcion_apetito && (
                        <div>
                          <span className="text-gray-600">Percepción del apetito:</span>
                          <span className="ml-2 font-medium">{eatingHabits.apetito_preferencias.percepcion_apetito}</span>
                        </div>
                      )}
                      {eatingHabits.apetito_preferencias.cambios_recientes_apetito && (
                        <div>
                          <span className="text-gray-600">Cambios recientes:</span>
                          <span className="ml-2 font-medium">{eatingHabits.apetito_preferencias.cambios_recientes_apetito}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Preferencias Alimentarias */}
                {eatingHabits.preferencias_alimentarias && (
                  <div className="border-b border-gray-100 pb-4">
                    <h4 className="font-medium text-gray-900 mb-3">Preferencias Alimentarias</h4>
                    {eatingHabits.preferencias_alimentarias.alimentos_preferidos && eatingHabits.preferencias_alimentarias.alimentos_preferidos.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm text-gray-600">Preferidos:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {eatingHabits.preferencias_alimentarias.alimentos_preferidos.map((alimento, idx) => (
                            <span key={idx} className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              {alimento}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {eatingHabits.preferencias_alimentarias.alimentos_disgustan && eatingHabits.preferencias_alimentarias.alimentos_disgustan.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-600">No le gustan:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {eatingHabits.preferencias_alimentarias.alimentos_disgustan.map((alimento, idx) => (
                            <span key={idx} className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                              {alimento}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Restricciones y Suplementación */}
                {eatingHabits.restricciones_suplementacion && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Restricciones y Suplementación</h4>
                    <div className="space-y-3 text-sm">
                      {eatingHabits.restricciones_suplementacion.dietas_anteriores && (
                        <div>
                          <span className="text-gray-600">Dietas anteriores:</span>
                          <p className="mt-1 text-gray-700">{eatingHabits.restricciones_suplementacion.dietas_anteriores}</p>
                        </div>
                      )}
                      {eatingHabits.restricciones_suplementacion.medicamentos_bajar_peso && (
                        <div>
                          <span className="text-gray-600">Medicamentos para bajar peso:</span>
                          <span className="ml-2 font-medium text-orange-700">Sí</span>
                          {eatingHabits.restricciones_suplementacion.medicamentos_bajar_peso_detalles && (
                            <p className="mt-1 text-gray-700">{eatingHabits.restricciones_suplementacion.medicamentos_bajar_peso_detalles}</p>
                          )}
                        </div>
                      )}
                      {eatingHabits.restricciones_suplementacion.suplementos_actuales && eatingHabits.restricciones_suplementacion.suplementos_actuales.length > 0 && (
                        <div>
                          <span className="text-gray-600">Suplementos actuales:</span>
                          <div className="mt-2 space-y-2">
                            {eatingHabits.restricciones_suplementacion.suplementos_actuales.map((supp, idx) => (
                              <div key={idx} className="bg-blue-50 p-2 rounded">
                                <div className="font-medium text-blue-900">{supp.name}</div>
                                {supp.frequency && <div className="text-blue-700 text-xs">{supp.frequency}</div>}
                                {supp.notes && <div className="text-blue-600 text-xs">{supp.notes}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Apple className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay hábitos alimentarios registrados</p>
              </div>
            )}
          </ExpandableSection>

          {/* Toxicomanías */}
          {toxicomanias.length > 0 && (
            <ExpandableSection
              title="Toxicomanías"
              icon={AlertTriangle}
              onEdit={onEditSection}
              sectionId="toxicomanias"
              defaultExpanded={true}
            >
              <div className="space-y-3">
                {toxicomanias.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-orange-100 last:border-0">
                    <div>
                      <span className="font-medium text-orange-900">{item.type}</span>
                      {item.details && (
                        <div className="text-sm text-orange-700">{item.details}</div>
                      )}
                    </div>
                    <span className="text-sm text-orange-600">{item.frequency}</span>
                  </div>
                ))}
              </div>
            </ExpandableSection>
          )}

          {/* Trastornos Gastrointestinales */}
          {gastrointestinalDisorders.length > 0 && (
            <ExpandableSection
              title="Trastornos Gastrointestinales"
              icon={Stethoscope}
              onEdit={onEditSection}
              sectionId="gastrointestinal_disorders"
              defaultExpanded={true}
            >
              <div className="space-y-3">
                {gastrointestinalDisorders.map((disorder, index) => (
                  <div key={index} className="border-l-4 border-purple-200 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium text-gray-900">{disorder.disorder}</span>
                        {disorder.comments && (
                          <p className="text-sm text-gray-600 mt-1">{disorder.comments}</p>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">{disorder.frequency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ExpandableSection>
          )}

          {/* Antecedentes Gineco-obstétricos */}
          {(patient.gender === 'female' || patient.gender === 'Femenino') && Object.keys(gynecoHistory).length > 0 && (
            <ExpandableSection
              title="Antecedentes Gineco-obstétricos"
              icon={Baby}
              onEdit={onEditSection}
              sectionId="gyneco_obstetric_history"
            >
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  {gynecoHistory.gestaciones && (
                    <div>
                      <span className="text-gray-600">Gestaciones:</span>
                      <span className="ml-2 font-medium">{gynecoHistory.gestaciones}</span>
                    </div>
                  )}
                  {gynecoHistory.partos && (
                    <div>
                      <span className="text-gray-600">Partos:</span>
                      <span className="ml-2 font-medium">{gynecoHistory.partos}</span>
                    </div>
                  )}
                  {gynecoHistory.cesareas && (
                    <div>
                      <span className="text-gray-600">Cesáreas:</span>
                      <span className="ml-2 font-medium">{gynecoHistory.cesareas}</span>
                    </div>
                  )}
                  {gynecoHistory.semanas_gestacion && (
                    <div>
                      <span className="text-gray-600">Semanas gestación:</span>
                      <span className="ml-2 font-medium">{gynecoHistory.semanas_gestacion}</span>
                    </div>
                  )}
                </div>
                {gynecoHistory.uso_anticonceptivos && (
                  <div>
                    <span className="text-gray-600">Anticonceptivos:</span>
                    <span className="ml-2 font-medium">{gynecoHistory.uso_anticonceptivos}</span>
                  </div>
                )}
                {gynecoHistory.fecha_ultima_menstruacion && (
                  <div>
                    <span className="text-gray-600">Última menstruación:</span>
                    <span className="ml-2 font-medium">{gynecoHistory.fecha_ultima_menstruacion}</span>
                  </div>
                )}
                {gynecoHistory.comentarios && (
                  <div>
                    <span className="text-gray-600">Comentarios:</span>
                    <p className="mt-1 text-gray-700">{gynecoHistory.comentarios}</p>
                  </div>
                )}
              </div>
            </ExpandableSection>
          )}

        </div>
      </div>

      {/* Secciones de evaluación nutricional */}
      <div className="space-y-6">

        {/* Frecuencia de Consumo */}
        <ExpandableSection
          title="Frecuencia de Consumo de Alimentos"
          icon={Calendar}
          onEdit={onEditSection}
          sectionId="food_frequency"
          isEmpty={Object.keys(foodFrequency).length === 0}
          defaultExpanded={false}
        >
          {Object.keys(foodFrequency).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(foodFrequency).map(([food, frequency], index) => (
                <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-900">{food}</span>
                  <span className="text-sm text-gray-600">{frequency}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No hay frecuencia de consumo registrada</p>
            </div>
          )}
        </ExpandableSection>

        {/* Recordatorio 24h */}
        <ExpandableSection
          title="Recordatorio de 24 Horas"
          icon={Clock}
          onEdit={onEditSection}
          sectionId="food_recall_24h"
          isEmpty={Object.keys(foodRecall).length === 0}
          defaultExpanded={false}
        >
          {Object.keys(foodRecall).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(foodRecall).map(([mealName, meal], index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{mealName}</h4>
                    <div className="text-sm text-gray-600">
                      {meal.time && <span className="mr-4">🕐 {meal.time}</span>}
                      {meal.location && <span>📍 {meal.location}</span>}
                    </div>
                  </div>
                  {meal.foods && (
                    <p className="text-sm text-gray-700">{meal.foods}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No hay recordatorio de 24 horas registrado</p>
            </div>
          )}
        </ExpandableSection>

        {/* Indicadores Bioquímicos */}
        <ExpandableSection
          title="Indicadores Bioquímicos"
          icon={TestTube}
          onEdit={onEditSection}
          sectionId="biochemical_indicators"
          isEmpty={biochemicalIndicators.length === 0}
          defaultExpanded={biochemicalIndicators.length > 0}
        >
          {biochemicalIndicators.length > 0 ? (
            <div className="space-y-3">
              {biochemicalIndicators.map((test, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{test.test}</h4>
                      <p className="text-sm text-gray-600">{test.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-purple-700">{test.value}</div>
                      {test.reference_range && (
                        <div className="text-sm text-gray-500">Ref: {test.reference_range}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <TestTube className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No hay indicadores bioquímicos registrados</p>
            </div>
          )}
        </ExpandableSection>
      </div>

    </div>
  )
}