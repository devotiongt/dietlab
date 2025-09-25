import React, { useState } from 'react'
import {
  AlertTriangle, Shield, Pill, Activity, Apple, Users, TestTube,
  Heart, Clock, Calendar, Edit, ChevronRight, Info, Target,
  Stethoscope, Baby, Zap, TrendingUp, BarChart3, Eye,
  CheckCircle, XCircle, AlertCircle, Plus, Minus, ArrowLeft
} from 'lucide-react'
import { parseJSONField } from './summary-sections/utils'
import FoodFrequencySection from './sections/FoodFrequencySection'

// Componente para métricas rápidas
const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'blue', onClick }) => (
  <div
    className={`bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-blue-300' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {Icon && (
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          <Icon className={`h-5 w-5 text-${color}-600`} />
        </div>
      )}
    </div>
  </div>
)

// Componente para alertas críticas compactas
const CompactAlert = ({ type, title, items, severity = 'high' }) => {
  const severityStyles = {
    high: 'bg-red-500 text-white',
    medium: 'bg-yellow-500 text-white',
    low: 'bg-blue-500 text-white'
  }

  const severityIcons = {
    high: Shield,
    medium: AlertTriangle,
    low: Info
  }

  const Icon = severityIcons[severity]

  return (
    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${severityStyles[severity]} mr-3 mb-2`}>
      <Icon className="h-3 w-3 mr-1.5" />
      <span className="font-semibold mr-2">{title}:</span>
      <span className="truncate max-w-40">
        {items.length > 2 ? `${items.slice(0, 2).join(', ')}... +${items.length - 2}` : items.join(', ')}
      </span>
    </div>
  )
}

// Componente para timeline de condiciones
const ConditionTimeline = ({ conditions, medications = [] }) => (
  <div className="space-y-4">
    {conditions.map((condition, index) => (
      <div key={index} className="relative pl-8 pb-4">
        <div className="absolute left-0 top-2 h-3 w-3 bg-red-500 rounded-full border-2 border-white shadow"></div>
        <div className="absolute left-1.5 top-5 h-full w-0.5 bg-gray-200"></div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-900">{condition.disease}</h4>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              {condition.duration_value} {condition.duration_unit}
            </span>
          </div>

          {condition.medication_details && condition.medication_details.length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="text-xs font-medium text-blue-800 mb-2 flex items-center">
                <Pill className="h-3 w-3 mr-1" />
                Medicamentos
              </div>
              <div className="space-y-1">
                {condition.medication_details.map((med, idx) => (
                  <div key={idx} className="text-xs text-blue-700">
                    • {med.name} {med.frequency && `- ${med.frequency}`}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
)

// Componente para gráfico de actividad (simulado)
const ActivityChart = ({ activities }) => (
  <div className="space-y-3">
    {activities.map((activity, index) => {
      const intensity = activity.duration_minutes ? Math.min(activity.duration_minutes / 60 * 100, 100) : 50
      return (
        <div key={index} className="flex items-center space-x-3">
          <div className="w-20 text-sm font-medium text-gray-700 truncate">
            {activity.type}
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{activity.frequency}</span>
              <span>{activity.duration_minutes}min</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${intensity}%` }}
              ></div>
            </div>
          </div>
        </div>
      )
    })}
  </div>
)

// Componente para hábitos alimentarios compactos
const EatingHabitsCompact = ({ habits }) => {
  const metrics = []

  if (habits?.contexto_social?.numero_comidas_dia) {
    metrics.push({ label: 'Comidas/día', value: habits.contexto_social.numero_comidas_dia })
  }

  if (habits?.apetito_preferencias?.percepcion_apetito) {
    metrics.push({ label: 'Apetito', value: habits.apetito_preferencias.percepcion_apetito })
  }

  const snacks = habits?.colaciones?.tipos_alimentos_colaciones || []
  const preferred = habits?.preferencias_alimentarias?.alimentos_preferidos || []
  const disliked = habits?.preferencias_alimentarias?.alimentos_disgustan || []

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-700">{metric.value}</div>
            <div className="text-xs text-green-600">{metric.label}</div>
          </div>
        ))}
      </div>

      {preferred.length > 0 && (
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
            Preferidos
          </div>
          <div className="flex flex-wrap gap-1">
            {preferred.slice(0, 6).map((food, idx) => (
              <span key={idx} className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {food}
              </span>
            ))}
            {preferred.length > 6 && (
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{preferred.length - 6} más
              </span>
            )}
          </div>
        </div>
      )}

      {disliked.length > 0 && (
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <XCircle className="h-4 w-4 mr-1 text-red-500" />
            No le gustan
          </div>
          <div className="flex flex-wrap gap-1">
            {disliked.slice(0, 6).map((food, idx) => (
              <span key={idx} className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                {food}
              </span>
            ))}
            {disliked.length > 6 && (
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{disliked.length - 6} más
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Componente para lab results
const LabResultsGrid = ({ results }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {results.map((result, index) => (
      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-medium text-gray-900">{result.test}</h4>
            <p className="text-xs text-gray-500">{result.date}</p>
          </div>
          <div className="text-right">
            <div className="font-bold text-purple-700">{result.value}</div>
            {result.reference_range && (
              <div className="text-xs text-gray-500">Ref: {result.reference_range}</div>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
)

export default function ModernClinicalDashboard({
  patient,
  clinicalHistory,
  selectedTab = 'general',
  onTabChange,
  onEdit,
  onEditSection,
  onBack,
  onViewConditions,
  onViewActivities,
  onViewEatingHabits,
  onViewLabResults
}) {

  if (!patient || !clinicalHistory) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <TestTube className="h-16 w-16 mx-auto opacity-50" />
          </div>
          <p className="text-gray-500 text-lg">No hay información clínica disponible</p>
        </div>
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

  // Calcular alertas críticas
  const allergies = eatingHabits?.restricciones_suplementacion?.alergias_alimentarias || []
  const intolerances = eatingHabits?.restricciones_suplementacion?.intolerancias || []
  const currentMedications = personalHistory.reduce((acc, disease) => {
    if (disease.medication_details && disease.medication_details.length > 0) {
      return acc.concat(disease.medication_details.map(med => med.name))
    }
    return acc
  }, [])

  // Tabs para navegación
  const tabs = [
    { id: 'general', name: 'General', icon: BarChart3 },
    { id: 'medical', name: 'Historia Médica', icon: Heart },
    { id: 'nutrition', name: 'Evaluación Nutricional', icon: Apple }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fijo */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="inline-flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard Clínico</h1>
                <p className="text-xs text-gray-600">
                  {patient.first_name} {patient.last_name} •
                  {patient.gender} •
                  {new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} años
                </p>
              </div>
            </div>
            <button
              onClick={onEdit}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm shadow-sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Historial
            </button>
          </div>

          {/* Navegación por tabs */}
          <div className="mt-3">
            <nav className="flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange?.(tab.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      selectedTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        {/* Alertas críticas compactas - siempre visibles */}
        {(allergies.length > 0 || intolerances.length > 0 || currentMedications.length > 0) && (
          <div className="mb-4 bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-wrap items-center">
              <div className="flex items-center mr-4 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                <span className="font-medium text-gray-900 text-sm">Alertas Médicas:</span>
              </div>
              {allergies.length > 0 && (
                <CompactAlert
                  type="allergy"
                  title="Alergias"
                  items={allergies}
                  severity="high"
                />
              )}
              {intolerances.length > 0 && (
                <CompactAlert
                  type="intolerance"
                  title="Intolerancias"
                  items={intolerances}
                  severity="medium"
                />
              )}
              {currentMedications.length > 0 && (
                <CompactAlert
                  type="medication"
                  title="Medicamentos"
                  items={currentMedications}
                  severity="low"
                />
              )}
            </div>
          </div>
        )}

        {/* Contenido por tab */}
        {selectedTab === 'general' && (
          <div className="space-y-6">
            {/* Métricas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Condiciones Activas"
                value={personalHistory.length}
                subtitle={personalHistory.length > 0 ? personalHistory[0].disease : 'Sin condiciones'}
                icon={Heart}
                color="red"
                onClick={onViewConditions}
              />
              <MetricCard
                title="Actividades Físicas"
                value={physicalActivities.length}
                subtitle={physicalActivities.length > 0 ? `${physicalActivities[0].frequency}` : 'Sin actividad'}
                icon={Activity}
                color="green"
                onClick={onViewActivities}
              />
              <MetricCard
                title="Comidas por Día"
                value={eatingHabits?.contexto_social?.numero_comidas_dia || 'N/A'}
                subtitle={eatingHabits?.apetito_preferencias?.percepcion_apetito || 'Sin evaluar'}
                icon={Apple}
                color="orange"
                onClick={onViewEatingHabits}
              />
              <MetricCard
                title="Exámenes de Lab"
                value={biochemicalIndicators.length}
                subtitle={biochemicalIndicators.length > 0 ? 'Disponibles' : 'Sin exámenes'}
                icon={TestTube}
                color="purple"
                onClick={onViewLabResults}
              />
            </div>

            {/* Grid principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Patologías actuales - Compacto */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-red-600" />
                    Condiciones Actuales
                  </h3>
                  <button
                    onClick={() => onEditSection?.('personal_pathological_history')}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
                {personalHistory.length > 0 ? (
                  <div className="space-y-3">
                    {personalHistory.map((condition, index) => (
                      <div key={index} className="border-l-4 border-red-200 pl-4 py-3 bg-red-50 rounded-r-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-sm text-red-900">{condition.disease}</div>
                            <div className="text-xs text-red-700 mt-1">{condition.duration_value} {condition.duration_unit}</div>
                            {condition.medication_details && condition.medication_details.length > 0 && (
                              <div className="text-xs text-red-600 mt-2 flex items-center">
                                <Pill className="h-3 w-3 mr-1" />
                                {condition.medication_details.length} medicamento(s)
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Sin condiciones registradas</p>
                  </div>
                )}
              </div>

              {/* Actividad física - Gráfico */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-green-600" />
                    Actividad Física
                  </h3>
                  <button
                    onClick={() => onEditSection?.('physical_activities')}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
                {physicalActivities.length > 0 ? (
                  <ActivityChart activities={physicalActivities} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Sin actividad registrada</p>
                  </div>
                )}
              </div>

              {/* Hábitos alimentarios compactos */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Apple className="h-5 w-5 mr-2 text-orange-600" />
                    Hábitos Alimentarios
                  </h3>
                  <button
                    onClick={() => onEditSection?.('eating_habits')}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
                {Object.keys(eatingHabits).length > 0 ? (
                  <EatingHabitsCompact habits={eatingHabits} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Apple className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Sin hábitos registrados</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {selectedTab === 'medical' && (
          <div className="space-y-6">
            {/* Primera fila: Antecedentes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Antecedentes Familiares */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Antecedentes Heredofamiliares
                  </h3>
                  <button
                    onClick={() => onEditSection?.('family_history')}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
                {familyHistory.length > 0 ? (
                  <div className="space-y-4">
                    {familyHistory.map((item, index) => (
                      <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
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
                          <div className="text-right text-sm text-gray-600 ml-4">
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
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Sin antecedentes familiares registrados</p>
                  </div>
                )}
              </div>

              {/* Condiciones Personales - Timeline */}
              <div id="conditions-section" className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-red-600" />
                    Antecedentes Personales Patológicos
                  </h3>
                  <button
                    onClick={() => onEditSection?.('personal_pathological_history')}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
                {personalHistory.length > 0 ? (
                  <ConditionTimeline conditions={personalHistory} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Sin condiciones médicas registradas</p>
                  </div>
                )}
              </div>
            </div>

            {/* Segunda fila: Análisis y Gineco-obstétrico */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Análisis y Laboratorios */}
              <div id="lab-results-section" className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <TestTube className="h-5 w-5 mr-2 text-purple-600" />
                    Análisis y Laboratorios
                  </h3>
                  <button
                    onClick={() => onEditSection?.('biochemical_indicators')}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
                {biochemicalIndicators.length > 0 ? (
                  <div className="w-full">
                    <div className="grid grid-cols-1 gap-4 w-full auto-rows-fr">
                      {biochemicalIndicators.slice(0, 4).map((test, index) => (
                        <div
                          key={index}
                          className="border border-purple-200 rounded-lg p-4 bg-purple-50 flex justify-between items-center hover:bg-purple-100 cursor-pointer transition-colors"
                          onClick={() => onTabChange?.('medical')}
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-purple-900 text-sm truncate">{test.test}</h4>
                            <p className="text-xs text-purple-600">{test.date}</p>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <div className="text-2xl font-bold text-purple-700">{test.value}</div>
                            {test.reference_range && (
                              <div className="text-xs text-purple-600 mt-1">
                                <div>Ref: {test.reference_range}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {biochemicalIndicators.length > 4 && (
                      <div className="text-center pt-4 w-full">
                        <button
                          onClick={() => onTabChange?.('medical')}
                          className="text-purple-600 text-sm hover:text-purple-700"
                        >
                          Ver todos ({biochemicalIndicators.length})
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 w-full">
                    <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay resultados de laboratorio registrados</p>
                    <button
                      onClick={() => onEditSection?.('biochemical_indicators')}
                      className="mt-3 inline-flex items-center px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar análisis
                    </button>
                  </div>
                )}
              </div>

              {/* Historia Gineco-obstétrica */}
              {(patient.gender === 'female' || patient.gender === 'Femenino') && Object.keys(gynecoHistory).length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <Baby className="h-5 w-5 mr-2 text-pink-600" />
                      Historia Gineco-obstétrica
                    </h3>
                    <button
                      onClick={() => onEditSection?.('gyneco_obstetric_history')}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Contenido compacto */}
                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                    {/* Métricas principales en una fila */}
                    <div className="flex justify-between items-center mb-3">
                      {gynecoHistory.gestaciones && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-pink-700">{gynecoHistory.gestaciones}</div>
                          <div className="text-xs text-pink-600">Gestaciones</div>
                        </div>
                      )}
                      {gynecoHistory.partos && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-pink-700">{gynecoHistory.partos}</div>
                          <div className="text-xs text-pink-600">Partos</div>
                        </div>
                      )}
                      {gynecoHistory.cesareas && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-pink-700">{gynecoHistory.cesareas}</div>
                          <div className="text-xs text-pink-600">Cesáreas</div>
                        </div>
                      )}
                      {gynecoHistory.semanas_gestacion && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-pink-700">{gynecoHistory.semanas_gestacion}</div>
                          <div className="text-xs text-pink-600">Sem. Gest.</div>
                        </div>
                      )}
                    </div>

                    {/* Información adicional compacta */}
                    {(gynecoHistory.uso_anticonceptivos || gynecoHistory.fecha_ultima_menstruacion) && (
                      <div className="border-t border-pink-300 pt-3 space-y-2">
                        {gynecoHistory.uso_anticonceptivos && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-pink-700 font-medium">Anticonceptivos:</span>
                            <span className="text-pink-900">{gynecoHistory.uso_anticonceptivos}</span>
                          </div>
                        )}
                        {gynecoHistory.fecha_ultima_menstruacion && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-pink-700 font-medium relative group cursor-help">
                              FUM:
                              <span className="invisible group-hover:visible absolute left-0 bottom-full mb-2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                                Fecha Última Menstruación
                              </span>
                            </span>
                            <span className="text-pink-900">{gynecoHistory.fecha_ultima_menstruacion}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Comentarios si existen */}
                    {gynecoHistory.comentarios && (
                      <div className="border-t border-pink-300 pt-3 mt-3">
                        <div className="text-sm">
                          <span className="text-pink-700 font-medium">Obs: </span>
                          <span className="text-pink-900">{gynecoHistory.comentarios}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Otras condiciones médicas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trastornos alimentarios */}
              {eatingDisorders.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                      Trastornos Alimentarios
                    </h3>
                    <button
                      onClick={() => onEditSection?.('eating_disorders')}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {eatingDisorders.map((disorder, index) => (
                      <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-red-900">{disorder.disorder}</h4>
                            {disorder.treatment_notes && (
                              <p className="text-sm text-red-800 mt-1">{disorder.treatment_notes}</p>
                            )}
                          </div>
                          <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">
                            {disorder.duration_value} {disorder.duration_unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Toxicomanías */}
              {toxicomanias.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                      Consumo de Sustancias
                    </h3>
                    <button
                      onClick={() => onEditSection?.('toxicomanias')}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {toxicomanias.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div>
                          <span className="font-medium text-yellow-900">{item.type}</span>
                          {item.details && (
                            <div className="text-sm text-yellow-800">{item.details}</div>
                          )}
                        </div>
                        <span className="text-sm text-yellow-700">{item.frequency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trastornos GI */}
              {gastrointestinalDisorders.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <Stethoscope className="h-5 w-5 mr-2 text-purple-600" />
                      Trastornos Gastrointestinales
                    </h3>
                    <button
                      onClick={() => onEditSection?.('gastrointestinal_disorders')}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {gastrointestinalDisorders.map((disorder, index) => (
                      <div key={index} className="flex justify-between items-start p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div>
                          <span className="font-medium text-purple-900">{disorder.disorder}</span>
                          {disorder.comments && (
                            <p className="text-sm text-purple-800 mt-1">{disorder.comments}</p>
                          )}
                        </div>
                        <span className="text-sm text-purple-700">{disorder.frequency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {selectedTab === 'nutrition' && (
          <div className="space-y-6">
            {/* Recordatorio 24 horas */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-indigo-600" />
                  Recordatorio de 24 Horas
                </h3>
                <button
                  onClick={() => onEditSection?.('food_recall_24h')}
                  className="text-gray-400 hover:text-blue-600"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
              {Object.keys(foodRecall).length > 0 ? (
                <div className="pb-4">
                  <div className="relative px-8 py-6">
                    <div className="flex items-start justify-between relative">
                      {/* Continuous line across all dots */}
                      {(() => {
                        const itemCount = Object.keys(foodRecall).length;
                        if (itemCount <= 1) return null;

                        const itemWidth = 224; // 14rem = 224px (ancho fijo de cada elemento)
                        const gap = 48; // space-x-12 = 3rem = 48px
                        const totalWidth = itemCount * itemWidth + (itemCount - 1) * gap;

                        // Posición del centro del primer elemento
                        const firstDotCenter = itemWidth / 2;
                        // Posición del centro del último elemento
                        const lastDotCenter = totalWidth - (itemWidth / 2);
                        // Ancho de la línea
                        const lineWidth = lastDotCenter - firstDotCenter;

                        return (
                          <div
                            className="absolute h-0.5 bg-indigo-300"
                            style={{
                              top: '40%',
                              left: '10%',
                              right: '10%'
                            }}
                          ></div>
                        );
                      })()}

                      {Object.entries(foodRecall)
                        .sort(([, a], [, b]) => {
                          const timeA = a.time?.replace(':', '') || '0000';
                          const timeB = b.time?.replace(':', '') || '0000';
                          return timeA.localeCompare(timeB);
                        })
                        .map(([mealName, meal], index) => (
                          <div key={index} className="relative flex flex-col items-center flex-1 max-w-xs">
                            {/* Time label above */}
                            <div className="mb-3 text-center">
                              <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-bold rounded-full">
                                {meal.time}
                              </span>
                            </div>

                            {/* Timeline dot */}
                            <div className="w-4 h-4 bg-indigo-500 rounded-full border-4 border-white shadow-lg relative z-10"></div>

                            {/* Content below */}
                            <div className="mt-4 text-center min-w-48 max-w-56">
                              <h4 className="font-semibold text-gray-900 text-sm mb-2">
                                {mealName}
                              </h4>
                              <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                                {meal.foods}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay recordatorio de 24 horas registrado</p>
                  <button
                    onClick={() => onEditSection?.('food_recall_24h')}
                    className="mt-3 text-blue-600 text-sm hover:text-blue-700"
                  >
                    Agregar recordatorio
                  </button>
                </div>
              )}
            </div>

            {/* Hábitos Alimentarios Detallados */}
            <div id="eating-habits-section" className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Apple className="h-5 w-5 mr-2 text-orange-600" />
                  Hábitos de Alimentación
                </h3>
                <button
                  onClick={() => onEditSection?.('eating_habits')}
                  className="text-gray-400 hover:text-blue-600"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
              {Object.keys(eatingHabits).length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Contexto Social */}
                  {eatingHabits.contexto_social && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Contexto Social</h4>
                      <div className="space-y-3 text-sm">
                        {eatingHabits.contexto_social.numero_comidas_dia && (
                          <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                            <span className="text-gray-600">Comidas/día:</span>
                            <span className="font-medium text-green-700">{eatingHabits.contexto_social.numero_comidas_dia}</span>
                          </div>
                        )}
                        {eatingHabits.contexto_social.con_quien_come && (
                          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Come con:</span>
                            <span className="font-medium">{eatingHabits.contexto_social.con_quien_come}</span>
                          </div>
                        )}
                        {eatingHabits.contexto_social.quien_prepara_alimentos && (
                          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Prepara:</span>
                            <span className="font-medium">{eatingHabits.contexto_social.quien_prepara_alimentos}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Preferencias Alimentarias */}
                  {eatingHabits.preferencias_alimentarias && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Preferencias</h4>
                      {eatingHabits.preferencias_alimentarias.alimentos_preferidos && eatingHabits.preferencias_alimentarias.alimentos_preferidos.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm text-gray-600 mb-2 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                            Alimentos preferidos:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {eatingHabits.preferencias_alimentarias.alimentos_preferidos.map((food, idx) => (
                              <span key={idx} className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                {food}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {eatingHabits.preferencias_alimentarias.alimentos_disgustan && eatingHabits.preferencias_alimentarias.alimentos_disgustan.length > 0 && (
                        <div>
                          <div className="text-sm text-gray-600 mb-2 flex items-center">
                            <XCircle className="h-4 w-4 mr-1 text-red-500" />
                            No le gustan:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {eatingHabits.preferencias_alimentarias.alimentos_disgustan.map((food, idx) => (
                              <span key={idx} className="inline-block px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                {food}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Apple className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay hábitos alimentarios registrados</p>
                </div>
              )}
            </div>

            {/* Actividad Física */}
            <div id="activities-section" className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-green-600" />
                  Actividad Física
                </h3>
                <button
                  onClick={() => onEditSection?.('physical_activities')}
                  className="text-gray-400 hover:text-blue-600"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
              {physicalActivities.length > 0 ? (
                <ActivityChart activities={physicalActivities} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Sin actividad física registrada</p>
                </div>
              )}
            </div>

            {/* Frecuencia de consumo */}
            <FoodFrequencySection foodFrequency={foodFrequency} onEditSection={onEditSection} />

          </div>
        )}

      </div>
    </div>
  )
}