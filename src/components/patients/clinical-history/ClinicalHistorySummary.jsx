import React from 'react'
import { Users, Heart, Activity, AlertTriangle, Stethoscope, Apple, Calendar, Clock, TestTube, Edit, Plus } from 'lucide-react'
import { parseJSONField } from './summary-sections/utils'
import FamilyHistorySummary from './summary-sections/FamilyHistorySummary'
import PersonalHistorySummary from './summary-sections/PersonalHistorySummary'
import EatingDisordersSummary from './summary-sections/EatingDisordersSummary'
import PhysicalActivitiesSummary from './summary-sections/PhysicalActivitiesSummary'
import ToxicomaniasSummary from './summary-sections/ToxicomaniasSummary'
import GastrointestinalDisordersSummary from './summary-sections/GastrointestinalDisordersSummary'
import GynecoObstetricSummary from './summary-sections/GynecoObstetricSummary'
import EatingHabitsSummary from './summary-sections/EatingHabitsSummary'
import FoodFrequencySummary from './summary-sections/FoodFrequencySummary'
import FoodRecallSummary from './summary-sections/FoodRecallSummary'
import BiochemicalIndicatorsSummary from './summary-sections/BiochemicalIndicatorsSummary'

export default function ClinicalHistorySummary({ patient, clinicalHistory, onEdit, onEditSection }) {
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

  const sections = [
    {
      id: 'family_history',
      title: '1. Antecedentes Heredofamiliares',
      icon: Users,
      data: familyHistory,
      isEmpty: familyHistory.length === 0,
      renderContent: () => <FamilyHistorySummary data={familyHistory} />
    },
    {
      id: 'personal_pathological_history',
      title: '2. Antecedentes Personales Patológicos',
      icon: Heart,
      data: personalHistory,
      isEmpty: personalHistory.length === 0,
      renderContent: () => <PersonalHistorySummary data={personalHistory} />
    },
    {
      id: 'eating_disorders',
      title: '3. Trastornos Alimentarios y Psicológicos',
      icon: Heart,
      data: eatingDisorders,
      isEmpty: eatingDisorders.length === 0,
      renderContent: () => <EatingDisordersSummary data={eatingDisorders} />
    },
    {
      id: 'physical_activities',
      title: '4. Actividad Física',
      icon: Activity,
      data: physicalActivities,
      isEmpty: physicalActivities.length === 0,
      renderContent: () => <PhysicalActivitiesSummary data={physicalActivities} />
    },
    {
      id: 'toxicomanias',
      title: '5. Toxicomanías',
      icon: AlertTriangle,
      data: toxicomanias,
      isEmpty: toxicomanias.length === 0,
      renderContent: () => <ToxicomaniasSummary data={toxicomanias} />
    },
    {
      id: 'gastrointestinal_disorders',
      title: '6. Trastornos Gastrointestinales',
      icon: Stethoscope,
      data: gastrointestinalDisorders,
      isEmpty: gastrointestinalDisorders.length === 0,
      renderContent: () => <GastrointestinalDisordersSummary data={gastrointestinalDisorders} />
    },
    {
      id: 'gyneco_obstetric_history',
      title: '7. Antecedentes Gineco-obstétricos',
      icon: Heart,
      data: gynecoHistory,
      isEmpty: Object.keys(gynecoHistory).length === 0,
      renderContent: () => <GynecoObstetricSummary data={gynecoHistory} />
    },
    {
      id: 'eating_habits',
      title: '8. Hábitos de Alimentación',
      icon: Apple,
      data: eatingHabits,
      isEmpty: Object.keys(eatingHabits).length === 0,
      renderContent: () => <EatingHabitsSummary data={eatingHabits} />
    },
    {
      id: 'food_frequency',
      title: '9. Frecuencia de Consumo',
      icon: Calendar,
      data: foodFrequency,
      isEmpty: Object.keys(foodFrequency).length === 0,
      renderContent: () => <FoodFrequencySummary data={foodFrequency} />
    },
    {
      id: 'food_recall_24h',
      title: '10. Recordatorio 24h',
      icon: Clock,
      data: foodRecall,
      isEmpty: Object.keys(foodRecall).length === 0,
      renderContent: () => <FoodRecallSummary data={foodRecall} />
    },
    {
      id: 'biochemical_indicators',
      title: '11. Indicadores Bioquímicos',
      icon: TestTube,
      data: biochemicalIndicators,
      isEmpty: biochemicalIndicators.length === 0,
      renderContent: () => <BiochemicalIndicatorsSummary data={biochemicalIndicators} />
    }
  ]

  return (
    <div className="space-y-6">
      {/* Botón de edición prominente en móvil */}
      <div className="lg:hidden">
        <button
          onClick={onEdit}
          className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          <Edit className="h-5 w-5 mr-2" />
          Editar Historial Clínico
        </button>
      </div>

      {/* Diseño masonry con columnas */}
      <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
        {sections.map((section) => {
          const Icon = section.icon

          return (
            <div key={section.id} className="break-inside-avoid">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 text-blue-600 mr-3" />
                    <h3 className="text-base font-semibold text-gray-900">{section.title}</h3>
                  </div>
                  <button
                    onClick={() => onEditSection ? onEditSection(section.id) : onEdit()}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Editar sección"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-sm">
                  {section.renderContent()}
                </div>

                {section.isEmpty && (
                  <button
                    onClick={() => onEditSection ? onEditSection(section.id) : onEdit()}
                    className="mt-3 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar información
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}