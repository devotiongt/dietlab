import { useState, useEffect } from 'react'
import { Plus, Trash2, Calendar, Clock, Users, Activity, Heart, Stethoscope, Apple, TestTube, AlertTriangle, ArrowLeft } from 'lucide-react'
import MultiSelectChips from '../../ui/MultiSelectChips'
import DiseaseAutocomplete from '../../ui/autocomplete/DiseaseAutocomplete'
import SupplementAutocomplete from '../../ui/autocomplete/SupplementAutocomplete'
import FamilyHistorySection from './form-sections/FamilyHistorySection'
import PersonalPathologicalHistorySection from './form-sections/PersonalPathologicalHistorySection'
import SectionHeader from './form-sections/SectionHeader'
import {
  timeUnits,
  medicationFrequencies,
  exerciseTypes,
  exerciseFrequencies,
  exerciseSchedules,
  toxicomaniaTypes,
  toxicomaniaFrequencies,
  defaultGastrointestinalDisorders,
  symptomFrequencies,
  contraceptiveTypes,
  mealTypes,
  snackTypes,
  appetitePerceptions,
  appetiteChanges,
  foodGroups,
  foodFrequencies,
  mealTimes24h,
  commonFoods,
  commonAllergies,
  commonIntolerances,
  commonSupplements,
  commonEatingDisorders,
  commonLabTests,
  defaultClinicalHistory
} from '../../../data/clinicalHistoryStructure'

// Helper function to safely parse JSON
const parseJSONField = (jsonString, defaultValue = {}) => {
  if (!jsonString) return defaultValue
  try {
    return JSON.parse(jsonString)
  } catch {
    return defaultValue
  }
}


export default function ClinicalHistoryForm({ patient, clinicalHistory, onSave, onCancel, initialActiveSection }) {
  const [formData, setFormData] = useState(() => {
    if (clinicalHistory) {
      return {
        family_history: parseJSONField(clinicalHistory.family_history, []),
        personal_pathological_history: parseJSONField(clinicalHistory.personal_pathological_history, []),
        eating_disorders: parseJSONField(clinicalHistory.eating_disorders, []),
        physical_activities: parseJSONField(clinicalHistory.physical_activities, []),
        toxicomanias: parseJSONField(clinicalHistory.toxicomanias, []),
        gastrointestinal_disorders: parseJSONField(clinicalHistory.gastrointestinal_disorders, []),
        gyneco_obstetric_history: parseJSONField(clinicalHistory.gyneco_obstetric_history, defaultClinicalHistory.gyneco_obstetric_history),
        eating_habits: parseJSONField(clinicalHistory.eating_habits, defaultClinicalHistory.eating_habits),
        food_frequency: parseJSONField(clinicalHistory.food_frequency, {}),
        food_recall_24h: parseJSONField(clinicalHistory.food_recall_24h, {}),
        biochemical_indicators: parseJSONField(clinicalHistory.biochemical_indicators, [])
      }
    }
    return { ...defaultClinicalHistory }
  })

  const [loading, setLoading] = useState(false)
  const [activeSection, setActiveSection] = useState(initialActiveSection || 'family_history')

  // Update active section when initialActiveSection changes
  useEffect(() => {
    if (initialActiveSection) {
      setActiveSection(initialActiveSection)
    }
  }, [initialActiveSection])

  // 1. Antecedentes Heredofamiliares - Checklist
  const handleFamilyHistoryCheck = (disease, hasCondition) => {
    setFormData(prev => {
      const newFamilyHistory = [...prev.family_history]
      const existingIndex = newFamilyHistory.findIndex(item => item.disease === disease)
      
      if (hasCondition) {
        if (existingIndex === -1) {
          // Agregar nueva enfermedad
          newFamilyHistory.push({ disease, hasCondition: true, family_members: [], details: '' })
        } else {
          // Actualizar existente
          newFamilyHistory[existingIndex] = { ...newFamilyHistory[existingIndex], hasCondition: true }
        }
      } else {
        if (existingIndex !== -1) {
          // Remover la enfermedad si se desmarca
          newFamilyHistory.splice(existingIndex, 1)
        }
      }
      
      return { ...prev, family_history: newFamilyHistory }
    })
  }

  const handleFamilyMembersChange = (disease, familyMembers) => {
    setFormData(prev => {
      const newFamilyHistory = [...prev.family_history]
      const existingIndex = newFamilyHistory.findIndex(item => item.disease === disease)
      
      if (existingIndex !== -1) {
        newFamilyHistory[existingIndex] = { 
          ...newFamilyHistory[existingIndex], 
          family_members: familyMembers 
        }
      }
      
      return { ...prev, family_history: newFamilyHistory }
    })
  }

  const handleFamilyDetailsChange = (disease, details) => {
    setFormData(prev => {
      const newFamilyHistory = [...prev.family_history]
      const existingIndex = newFamilyHistory.findIndex(item => item.disease === disease)

      if (existingIndex !== -1) {
        newFamilyHistory[existingIndex] = {
          ...newFamilyHistory[existingIndex],
          details: details
        }
      }

      return { ...prev, family_history: newFamilyHistory }
    })
  }

  const handleDyslipidemiaTypeChange = (disease, dyslipidemiaTypes) => {
    setFormData(prev => {
      const newFamilyHistory = [...prev.family_history]
      const existingIndex = newFamilyHistory.findIndex(item => item.disease === disease)

      if (existingIndex !== -1) {
        newFamilyHistory[existingIndex] = {
          ...newFamilyHistory[existingIndex],
          dyslipidemia_types: dyslipidemiaTypes
        }
      }

      return { ...prev, family_history: newFamilyHistory }
    })
  }


  // 2. Antecedentes Personales Patológicos
  const handlePersonalHistoryChange = (diseaseIndex, field, value) => {
    setFormData(prev => {
      const newPersonalHistory = [...prev.personal_pathological_history]
      if (!newPersonalHistory[diseaseIndex]) {
        newPersonalHistory[diseaseIndex] = { 
          disease: '', 
          duration_value: '', 
          duration_unit: 'años', 
          medications: [],
          medication_details: []
        }
      }
      newPersonalHistory[diseaseIndex] = { ...newPersonalHistory[diseaseIndex], [field]: value }
      return { ...prev, personal_pathological_history: newPersonalHistory }
    })
  }

  const addPersonalHistoryDisease = () => {
    setFormData(prev => ({
      ...prev,
      personal_pathological_history: [...prev.personal_pathological_history, { 
        disease: '', 
        duration_value: '', 
        duration_unit: 'años', 
        medications: [],
        medication_details: []
      }]
    }))
  }

  const removePersonalHistoryDisease = (index) => {
    setFormData(prev => ({
      ...prev,
      personal_pathological_history: prev.personal_pathological_history.filter((_, i) => i !== index)
    }))
  }

  // Medication details for personal history
  const addMedicationDetail = (diseaseIndex) => {
    setFormData(prev => {
      const newPersonalHistory = [...prev.personal_pathological_history]
      const currentMedicationDetails = newPersonalHistory[diseaseIndex].medication_details || []
      
      newPersonalHistory[diseaseIndex] = {
        ...newPersonalHistory[diseaseIndex],
        medication_details: [
          ...currentMedicationDetails,
          {
            name: '',
            frequency: '',
            notes: ''
          }
        ]
      }
      
      return { ...prev, personal_pathological_history: newPersonalHistory }
    })
  }

  const updateMedicationDetail = (diseaseIndex, medIndex, field, value) => {
    setFormData(prev => {
      const newPersonalHistory = [...prev.personal_pathological_history]
      const currentMedicationDetails = [...newPersonalHistory[diseaseIndex].medication_details]
      
      currentMedicationDetails[medIndex] = {
        ...currentMedicationDetails[medIndex],
        [field]: value
      }
      
      newPersonalHistory[diseaseIndex] = {
        ...newPersonalHistory[diseaseIndex],
        medication_details: currentMedicationDetails
      }
      
      return { ...prev, personal_pathological_history: newPersonalHistory }
    })
  }

  const removeMedicationDetail = (diseaseIndex, medIndex) => {
    setFormData(prev => {
      const newPersonalHistory = [...prev.personal_pathological_history]
      const currentMedicationDetails = newPersonalHistory[diseaseIndex].medication_details || []
      
      newPersonalHistory[diseaseIndex] = {
        ...newPersonalHistory[diseaseIndex],
        medication_details: currentMedicationDetails.filter((_, i) => i !== medIndex)
      }
      
      return { ...prev, personal_pathological_history: newPersonalHistory }
    })
  }

  // Suplementos functions
  const addSupplement = () => {
    setFormData(prev => ({
      ...prev,
      eating_habits: {
        ...prev.eating_habits,
        restricciones_suplementacion: {
          ...prev.eating_habits.restricciones_suplementacion,
          suplementos_actuales: [
            ...prev.eating_habits.restricciones_suplementacion.suplementos_actuales,
            {
              name: '',
              frequency: '',
              notes: ''
            }
          ]
        }
      }
    }))
  }

  const updateSupplement = (suppIndex, field, value) => {
    setFormData(prev => {
      const newSupplements = [...prev.eating_habits.restricciones_suplementacion.suplementos_actuales]
      newSupplements[suppIndex] = {
        ...newSupplements[suppIndex],
        [field]: value
      }
      
      return {
        ...prev,
        eating_habits: {
          ...prev.eating_habits,
          restricciones_suplementacion: {
            ...prev.eating_habits.restricciones_suplementacion,
            suplementos_actuales: newSupplements
          }
        }
      }
    })
  }

  const removeSupplement = (suppIndex) => {
    setFormData(prev => ({
      ...prev,
      eating_habits: {
        ...prev.eating_habits,
        restricciones_suplementacion: {
          ...prev.eating_habits.restricciones_suplementacion,
          suplementos_actuales: prev.eating_habits.restricciones_suplementacion.suplementos_actuales.filter((_, i) => i !== suppIndex)
        }
      }
    }))
  }

  // Eating Disorders functions
  const handleEatingDisorderChange = (disorderIndex, field, value) => {
    setFormData(prev => {
      const newEatingDisorders = [...prev.eating_disorders]
      if (!newEatingDisorders[disorderIndex]) {
        newEatingDisorders[disorderIndex] = { 
          disorder: '', 
          duration_value: '', 
          duration_unit: 'años', 
          medications: [],
          medication_details: [],
          treatment_notes: ''
        }
      }
      newEatingDisorders[disorderIndex] = { ...newEatingDisorders[disorderIndex], [field]: value }
      return { ...prev, eating_disorders: newEatingDisorders }
    })
  }

  const addEatingDisorder = () => {
    setFormData(prev => ({
      ...prev,
      eating_disorders: [...prev.eating_disorders, { 
        disorder: '', 
        duration_value: '', 
        duration_unit: 'años', 
        medications: [],
        medication_details: [],
        treatment_notes: ''
      }]
    }))
  }

  const removeEatingDisorder = (index) => {
    setFormData(prev => ({
      ...prev,
      eating_disorders: prev.eating_disorders.filter((_, i) => i !== index)
    }))
  }

  // Medication details for eating disorders
  const addEatingDisorderMedication = (disorderIndex) => {
    setFormData(prev => {
      const newEatingDisorders = [...prev.eating_disorders]
      const currentMedicationDetails = newEatingDisorders[disorderIndex].medication_details || []
      
      newEatingDisorders[disorderIndex] = {
        ...newEatingDisorders[disorderIndex],
        medication_details: [
          ...currentMedicationDetails,
          {
            name: '',
            frequency: '',
            notes: ''
          }
        ]
      }
      
      return { ...prev, eating_disorders: newEatingDisorders }
    })
  }

  const updateEatingDisorderMedication = (disorderIndex, medIndex, field, value) => {
    setFormData(prev => {
      const newEatingDisorders = [...prev.eating_disorders]
      const currentMedicationDetails = [...newEatingDisorders[disorderIndex].medication_details]
      
      currentMedicationDetails[medIndex] = {
        ...currentMedicationDetails[medIndex],
        [field]: value
      }
      
      newEatingDisorders[disorderIndex] = {
        ...newEatingDisorders[disorderIndex],
        medication_details: currentMedicationDetails
      }
      
      return { ...prev, eating_disorders: newEatingDisorders }
    })
  }

  const removeEatingDisorderMedication = (disorderIndex, medIndex) => {
    setFormData(prev => {
      const newEatingDisorders = [...prev.eating_disorders]
      const currentMedicationDetails = newEatingDisorders[disorderIndex].medication_details || []
      
      newEatingDisorders[disorderIndex] = {
        ...newEatingDisorders[disorderIndex],
        medication_details: currentMedicationDetails.filter((_, i) => i !== medIndex)
      }
      
      return { ...prev, eating_disorders: newEatingDisorders }
    })
  }

  // 3. Actividad Física
  const handlePhysicalActivityChange = (activityIndex, field, value) => {
    setFormData(prev => {
      const newActivities = [...prev.physical_activities]
      if (!newActivities[activityIndex]) {
        newActivities[activityIndex] = { type: '', frequency: '', schedule: '', duration_minutes: '' }
      }
      newActivities[activityIndex] = { ...newActivities[activityIndex], [field]: value }
      return { ...prev, physical_activities: newActivities }
    })
  }

  const addPhysicalActivity = () => {
    setFormData(prev => ({
      ...prev,
      physical_activities: [...prev.physical_activities, { type: '', frequency: '', schedule: '', duration_minutes: '' }]
    }))
  }

  const removePhysicalActivity = (index) => {
    setFormData(prev => ({
      ...prev,
      physical_activities: prev.physical_activities.filter((_, i) => i !== index)
    }))
  }

  // 4. Toxicomanías - Checklist
  const handleToxicomaniaCheck = (type, hasCondition) => {
    setFormData(prev => {
      const newToxicomanias = [...prev.toxicomanias]
      const existingIndex = newToxicomanias.findIndex(item => item.type === type)
      
      if (hasCondition) {
        if (existingIndex === -1) {
          // Add new toxicomania
          newToxicomanias.push({
            type: type,
            frequency: '',
            details: ''
          })
        }
      } else {
        if (existingIndex !== -1) {
          // Remove toxicomania
          newToxicomanias.splice(existingIndex, 1)
        }
      }
      
      return { ...prev, toxicomanias: newToxicomanias }
    })
  }

  const getToxicomaniaStatus = (type) => {
    return formData.toxicomanias.find(item => item.type === type)
  }

  const handleToxicomaniaDetailsChange = (type, field, value) => {
    setFormData(prev => {
      const newToxicomanias = [...prev.toxicomanias]
      const existingIndex = newToxicomanias.findIndex(item => item.type === type)
      
      if (existingIndex !== -1) {
        newToxicomanias[existingIndex] = {
          ...newToxicomanias[existingIndex],
          [field]: value
        }
      }
      
      return { ...prev, toxicomanias: newToxicomanias }
    })
  }

  // 5. Trastornos Gastrointestinales - Checklist
  const handleGastrointestinalCheck = (disorder, hasCondition) => {
    setFormData(prev => {
      const newDisorders = [...prev.gastrointestinal_disorders]
      const existingIndex = newDisorders.findIndex(item => item.disorder === disorder)
      
      if (hasCondition) {
        if (existingIndex === -1) {
          // Add new disorder
          newDisorders.push({
            disorder: disorder,
            frequency: '',
            comments: ''
          })
        }
      } else {
        if (existingIndex !== -1) {
          // Remove disorder
          newDisorders.splice(existingIndex, 1)
        }
      }
      
      return { ...prev, gastrointestinal_disorders: newDisorders }
    })
  }

  const getGastrointestinalStatus = (disorder) => {
    return formData.gastrointestinal_disorders.find(item => item.disorder === disorder)
  }

  const handleGastrointestinalDetailsChange = (disorder, field, value) => {
    setFormData(prev => {
      const newDisorders = [...prev.gastrointestinal_disorders]
      const existingIndex = newDisorders.findIndex(item => item.disorder === disorder)
      
      if (existingIndex !== -1) {
        newDisorders[existingIndex] = {
          ...newDisorders[existingIndex],
          [field]: value
        }
      }
      
      return { ...prev, gastrointestinal_disorders: newDisorders }
    })
  }

  // 6. Gineco-obstétricos
  const handleGynecoObstetricChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      gyneco_obstetric_history: {
        ...prev.gyneco_obstetric_history,
        [field]: value
      }
    }))
  }

  // 7. Hábitos de Alimentación
  const handleEatingHabitsChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      eating_habits: {
        ...prev.eating_habits,
        [section]: {
          ...prev.eating_habits[section],
          [field]: value
        }
      }
    }))
  }

  // Meal schedule handlers
  const addMealTime = () => {
    setFormData(prev => ({
      ...prev,
      eating_habits: {
        ...prev.eating_habits,
        contexto_social: {
          ...prev.eating_habits.contexto_social,
          horarios_comida: [...prev.eating_habits.contexto_social.horarios_comida, { meal: '', time: '' }]
        }
      }
    }))
  }

  const updateMealTime = (index, field, value) => {
    setFormData(prev => {
      const newSchedule = [...prev.eating_habits.contexto_social.horarios_comida]
      newSchedule[index] = { ...newSchedule[index], [field]: value }
      return {
        ...prev,
        eating_habits: {
          ...prev.eating_habits,
          contexto_social: {
            ...prev.eating_habits.contexto_social,
            horarios_comida: newSchedule
          }
        }
      }
    })
  }

  const removeMealTime = (index) => {
    setFormData(prev => ({
      ...prev,
      eating_habits: {
        ...prev.eating_habits,
        contexto_social: {
          ...prev.eating_habits.contexto_social,
          horarios_comida: prev.eating_habits.contexto_social.horarios_comida.filter((_, i) => i !== index)
        }
      }
    }))
  }

  // 8. Food Frequency
  const handleFoodFrequencyChange = (foodGroupIndex, frequency) => {
    setFormData(prev => ({
      ...prev,
      food_frequency: {
        ...prev.food_frequency,
        [foodGroups[foodGroupIndex].name]: frequency
      }
    }))
  }

  // 9. 24h Food Recall
  const handleFoodRecall24hChange = (mealIndex, field, value) => {
    setFormData(prev => {
      const newRecall = { ...prev.food_recall_24h }
      const mealName = mealTimes24h[mealIndex]
      if (!newRecall[mealName]) {
        newRecall[mealName] = { foods: '', time: '', location: '' }
      }
      newRecall[mealName] = { ...newRecall[mealName], [field]: value }
      return { ...prev, food_recall_24h: newRecall }
    })
  }

  // 10. Biochemical Indicators
  const handleBiochemicalChange = (testIndex, field, value) => {
    setFormData(prev => {
      const newIndicators = [...prev.biochemical_indicators]
      if (!newIndicators[testIndex]) {
        newIndicators[testIndex] = { test: '', value: '', date: '', reference_range: '' }
      }
      newIndicators[testIndex] = { ...newIndicators[testIndex], [field]: value }
      return { ...prev, biochemical_indicators: newIndicators }
    })
  }

  const addBiochemicalTest = () => {
    setFormData(prev => ({
      ...prev,
      biochemical_indicators: [...prev.biochemical_indicators, { test: '', value: '', date: '', reference_range: '' }]
    }))
  }

  const removeBiochemicalTest = (index) => {
    setFormData(prev => ({
      ...prev,
      biochemical_indicators: prev.biochemical_indicators.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const clinicalHistoryData = {
        patient_id: patient.id,
        family_history: JSON.stringify(formData.family_history),
        personal_pathological_history: JSON.stringify(formData.personal_pathological_history),
        eating_disorders: JSON.stringify(formData.eating_disorders),
        physical_activities: JSON.stringify(formData.physical_activities),
        toxicomanias: JSON.stringify(formData.toxicomanias),
        gastrointestinal_disorders: JSON.stringify(formData.gastrointestinal_disorders),
        gyneco_obstetric_history: JSON.stringify(formData.gyneco_obstetric_history),
        eating_habits: JSON.stringify(formData.eating_habits),
        food_frequency: JSON.stringify(formData.food_frequency),
        food_recall_24h: JSON.stringify(formData.food_recall_24h),
        biochemical_indicators: JSON.stringify(formData.biochemical_indicators)
      }
      
      await onSave(clinicalHistoryData, 'navigate')
    } catch (error) {
      console.error('Error saving clinical history:', error)
    } finally {
      setLoading(false)
    }
  }


  const saveCurrentSection = async () => {
    try {
      setLoading(true)
      
      // Solo guardamos la sección específica
      const sectionData = {}
      sectionData[activeSection] = JSON.stringify(formData[activeSection])
      
      const clinicalHistoryData = {
        patient_id: patient.id,
        ...sectionData
      }
      
      await onSave(clinicalHistoryData, 'stay')
    } catch (error) {
      console.error('Error saving section:', error)
    } finally {
      setLoading(false)
    }
  }

  // Componente para botón de guardar sección
  // Helper function to get the next section
  const getNextSection = (currentSectionId) => {
    const currentIndex = sections.findIndex(section => section.id === currentSectionId)
    if (currentIndex >= 0 && currentIndex < sections.length - 1) {
      return sections[currentIndex + 1]
    }
    return null
  }

  // Helper function to navigate to next section
  const goToNextSection = async () => {
    const nextSection = getNextSection(activeSection)
    if (nextSection) {
      // Save current section first, then navigate
      await saveCurrentSection()
      setActiveSection(nextSection.id)
    }
  }


  const sections = [
    { id: 'family_history', name: '1. Antecedentes Heredofamiliares', icon: Users },
    { id: 'personal_pathological_history', name: '2. Antecedentes Personales Patológicos', icon: Heart },
    { id: 'eating_disorders', name: '3. Trastornos Alimentarios y Psicológicos', icon: Heart },
    { id: 'physical_activities', name: '4. Actividad Física', icon: Activity },
    { id: 'toxicomanias', name: '5. Toxicomanías', icon: AlertTriangle },
    { id: 'gastrointestinal_disorders', name: '6. Trastornos Gastrointestinales', icon: Stethoscope },
    { id: 'gyneco_obstetric_history', name: '7. Antecedentes Gineco-obstétricos', icon: Heart },
    { id: 'eating_habits', name: '8. Hábitos de Alimentación', icon: Apple },
    { id: 'food_frequency', name: '9. Frecuencia de Consumo', icon: Calendar },
    { id: 'food_recall_24h', name: '10. Recordatorio 24h', icon: Clock },
    { id: 'biochemical_indicators', name: '11. Indicadores Bioquímicos', icon: TestTube }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Content */}

      <div className="flex gap-8">
        {/* Navigation Sidebar */}
        <div className="w-1/4">
          <div className="bg-white rounded-lg shadow p-4 sticky top-4">
            <h3 className="font-semibold text-gray-900 mb-4">Secciones</h3>
            
            
            <nav className="space-y-2">
              {sections.map((section, index) => {
                const Icon = section.icon
                const isCurrent = section.id === activeSection
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center text-sm ${
                      isCurrent
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <span className="flex-1">{section.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg shadow p-6 pb-24 mb-8">
              
              {/* 1. Antecedentes Heredofamiliares */}
              {activeSection === 'family_history' && (
                <FamilyHistorySection
                  formData={formData}
                  onFamilyHistoryCheck={handleFamilyHistoryCheck}
                  onFamilyMembersChange={handleFamilyMembersChange}
                  onFamilyDetailsChange={handleFamilyDetailsChange}
                  onDyslipidemiaTypeChange={handleDyslipidemiaTypeChange}
                  activeSection={activeSection}
                  sections={sections}
                  loading={loading}
                  onSaveCurrentSection={saveCurrentSection}
                  onGoToNextSection={goToNextSection}
                />
              )}

              {/* 2. Antecedentes Personales Patológicos */}
              {activeSection === 'personal_pathological_history' && (
                <PersonalPathologicalHistorySection
                  formData={formData}
                  onPersonalHistoryChange={handlePersonalHistoryChange}
                  onAddPersonalHistoryDisease={addPersonalHistoryDisease}
                  onRemovePersonalHistoryDisease={removePersonalHistoryDisease}
                  onAddMedicationDetail={addMedicationDetail}
                  onRemoveMedicationDetail={removeMedicationDetail}
                  onUpdateMedicationDetail={updateMedicationDetail}
                  activeSection={activeSection}
                  sections={sections}
                  loading={loading}
                  onSaveCurrentSection={saveCurrentSection}
                  onGoToNextSection={goToNextSection}
                />
              )}

              {/* 3. Trastornos Alimentarios y Psicológicos */}
              {activeSection === 'eating_disorders' && (
                <div className="space-y-6">
                  <SectionHeader
                    icon={Heart}
                    title="Trastornos Alimentarios y Psicológicos"
                    activeSection={activeSection}
                    sections={sections}
                    loading={loading}
                    onSaveCurrentSection={saveCurrentSection}
                    onGoToNextSection={goToNextSection}
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={addEatingDisorder}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Trastorno
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.eating_disorders.map((disorder, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium text-gray-900">Trastorno {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeEatingDisorder(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Trastorno
                            </label>
                            <DiseaseAutocomplete
                              value={disorder.disorder || ''}
                              onChange={(value) => handleEatingDisorderChange(index, 'disorder', value)}
                              suggestions={commonEatingDisorders}
                              placeholder="Seleccionar trastorno..."
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Duración
                            </label>
                            <input
                              type="number"
                              value={disorder.duration_value || ''}
                              onChange={(e) => handleEatingDisorderChange(index, 'duration_value', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Ej. 2"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Unidad de tiempo
                            </label>
                            <select
                              value={disorder.duration_unit || 'años'}
                              onChange={(e) => handleEatingDisorderChange(index, 'duration_unit', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              {timeUnits.map((unit, idx) => (
                                <option key={idx} value={unit}>{unit}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notas de tratamiento
                          </label>
                          <textarea
                            value={disorder.treatment_notes || ''}
                            onChange={(e) => handleEatingDisorderChange(index, 'treatment_notes', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Tratamientos actuales, terapias, observaciones..."
                          />
                        </div>

                        {/* Medications for this disorder */}
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="text-sm font-medium text-gray-700">Medicamentos relacionados</h5>
                            <button
                              type="button"
                              onClick={() => addEatingDisorderMedication(index)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Agregar medicamento
                            </button>
                          </div>
                          
                          {disorder.medication_details && disorder.medication_details.map((medication, medIndex) => (
                            <div key={medIndex} className="bg-gray-50 p-4 rounded-lg mb-3">
                              <div className="flex justify-between items-start mb-3">
                                <h6 className="text-sm font-medium text-gray-700">Medicamento {medIndex + 1}</h6>
                                <button
                                  type="button"
                                  onClick={() => removeEatingDisorderMedication(index, medIndex)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre del medicamento
                                  </label>
                                  <input
                                    type="text"
                                    value={medication.name || ''}
                                    onChange={(e) => updateEatingDisorderMedication(index, medIndex, 'name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Ej. Fluoxetina, Sertralina..."
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Frecuencia
                                  </label>
                                  <select
                                    value={medication.frequency || ''}
                                    onChange={(e) => updateEatingDisorderMedication(index, medIndex, 'frequency', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  >
                                    <option value="">Seleccionar frecuencia</option>
                                    {medicationFrequencies.map((freq, idx) => (
                                      <option key={idx} value={freq}>{freq}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              
                              <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Notas adicionales
                                </label>
                                <textarea
                                  value={medication.notes || ''}
                                  onChange={(e) => updateEatingDisorderMedication(index, medIndex, 'notes', e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  placeholder="Dosis, efectos, observaciones..."
                                />
                              </div>
                            </div>
                          ))}
                          
                          {(!disorder.medication_details || disorder.medication_details.length === 0) && (
                            <div className="text-center py-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                              <p className="text-gray-500 text-sm">No hay medicamentos registrados</p>
                              <p className="text-gray-400 text-xs mt-1">Haz clic en "Agregar medicamento" para comenzar</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {formData.eating_disorders.length === 0 && (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay trastornos registrados</h3>
                        <p className="text-gray-600 mb-4">Agregar información sobre trastornos alimentarios o psicológicos relacionados.</p>
                        <button
                          type="button"
                          onClick={addEatingDisorder}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Primer Trastorno
                        </button>
                      </div>
                    )}
                  </div>
                  
                </div>
              )}

              {/* 4. Actividad Física */}
              {activeSection === 'physical_activities' && (
                <div>
                  <SectionHeader
                    icon={Activity}
                    title="Actividad Física"
                    activeSection={activeSection}
                    sections={sections}
                    loading={loading}
                    onSaveCurrentSection={saveCurrentSection}
                    onGoToNextSection={goToNextSection}
                  />
                  
                  <div className="space-y-4">
                    {formData.physical_activities.map((activity, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium text-gray-900">Actividad {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removePhysicalActivity(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tipo de ejercicio
                            </label>
                            <DiseaseAutocomplete
                              value={activity.type}
                              onChange={(value) => handlePhysicalActivityChange(index, 'type', value)}
                              suggestions={exerciseTypes}
                              placeholder="Escriba el tipo de ejercicio..."
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Frecuencia
                            </label>
                            <select
                              value={activity.frequency}
                              onChange={(e) => handlePhysicalActivityChange(index, 'frequency', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            >
                              <option value="">Seleccionar frecuencia</option>
                              {exerciseFrequencies.map(freq => (
                                <option key={freq} value={freq}>{freq}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Horario
                            </label>
                            <select
                              value={activity.schedule}
                              onChange={(e) => handlePhysicalActivityChange(index, 'schedule', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            >
                              <option value="">Seleccionar horario</option>
                              {exerciseSchedules.map(schedule => (
                                <option key={schedule} value={schedule}>{schedule}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Duración (minutos)
                            </label>
                            <input
                              type="number"
                              value={activity.duration_minutes}
                              onChange={(e) => handlePhysicalActivityChange(index, 'duration_minutes', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                              placeholder="60"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addPhysicalActivity}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar actividad física
                    </button>
                  </div>
                  
                </div>
              )}

              {/* 5. Toxicomanías */}
              {activeSection === 'toxicomanias' && (
                <div>
                  <SectionHeader
                    icon={AlertTriangle}
                    title="Toxicomanías"
                    activeSection={activeSection}
                    sections={sections}
                    loading={loading}
                    onSaveCurrentSection={saveCurrentSection}
                    onGoToNextSection={goToNextSection}
                  />
                  
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-6">
                      Marque las sustancias que consume o ha consumido el paciente e indique la frecuencia y detalles.
                    </p>
                    
                    {toxicomaniaTypes.map((type) => {
                      const toxicomaniaStatus = getToxicomaniaStatus(type)
                      const isChecked = !!toxicomaniaStatus
                      
                      return (
                        <div key={type} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start space-x-4">
                            {/* Checkbox */}
                            <div className="flex items-center pt-1">
                              <input
                                type="checkbox"
                                id={`toxicomania_${type}`}
                                checked={isChecked}
                                onChange={(e) => handleToxicomaniaCheck(type, e.target.checked)}
                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                              />
                            </div>
                            
                            {/* Contenido de la sustancia */}
                            <div className="flex-1">
                              <label 
                                htmlFor={`toxicomania_${type}`}
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                {type}
                              </label>
                              
                              {/* Campos adicionales cuando está marcado */}
                              {isChecked && (
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Frecuencia
                                    </label>
                                    <select
                                      value={toxicomaniaStatus?.frequency || ''}
                                      onChange={(e) => handleToxicomaniaDetailsChange(type, 'frequency', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                    >
                                      <option value="">Seleccionar frecuencia</option>
                                      {toxicomaniaFrequencies.map(freq => (
                                        <option key={freq} value={freq}>{freq}</option>
                                      ))}
                                    </select>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Detalles
                                    </label>
                                    <input
                                      type="text"
                                      value={toxicomaniaStatus?.details || ''}
                                      onChange={(e) => handleToxicomaniaDetailsChange(type, 'details', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                      placeholder="Cantidad, marcas, tiempo de consumo, etc."
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                </div>
              )}

              {/* 6. Trastornos Gastrointestinales */}
              {activeSection === 'gastrointestinal_disorders' && (
                <div>
                  <SectionHeader
                    icon={Stethoscope}
                    title="Trastornos Gastrointestinales"
                    activeSection={activeSection}
                    sections={sections}
                    loading={loading}
                    onSaveCurrentSection={saveCurrentSection}
                    onGoToNextSection={goToNextSection}
                  />
                  
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-6">
                      Marque los trastornos gastrointestinales que presenta el paciente e indique la frecuencia.
                    </p>
                    
                    {defaultGastrointestinalDisorders.map((disorder) => {
                      const disorderStatus = getGastrointestinalStatus(disorder)
                      const isChecked = !!disorderStatus
                      
                      return (
                        <div key={disorder} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start space-x-4">
                            {/* Checkbox */}
                            <div className="flex items-center pt-1">
                              <input
                                type="checkbox"
                                id={`gastrointestinal_${disorder}`}
                                checked={isChecked}
                                onChange={(e) => handleGastrointestinalCheck(disorder, e.target.checked)}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                            </div>
                            
                            {/* Contenido del trastorno */}
                            <div className="flex-1">
                              <label 
                                htmlFor={`gastrointestinal_${disorder}`}
                                className="font-medium text-gray-900 cursor-pointer"
                              >
                                {disorder}
                              </label>
                              
                              {/* Campos adicionales cuando está marcado */}
                              {isChecked && (
                                <div className="mt-4 space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Frecuencia
                                      </label>
                                      <select
                                        value={disorderStatus?.frequency || ''}
                                        onChange={(e) => handleGastrointestinalDetailsChange(disorder, 'frequency', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                      >
                                        <option value="">Seleccionar frecuencia</option>
                                        {symptomFrequencies.map(freq => (
                                          <option key={freq} value={freq}>{freq}</option>
                                        ))}
                                      </select>
                                    </div>
                                    
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Comentarios adicionales
                                      </label>
                                      <input
                                        type="text"
                                        value={disorderStatus?.comments || ''}
                                        onChange={(e) => handleGastrointestinalDetailsChange(disorder, 'comments', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        placeholder="Detalles, intensidad, medicamentos, etc."
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                </div>
              )}

              {/* 7. Antecedentes Gineco-obstétricos */}
              {activeSection === 'gyneco_obstetric_history' && (
                <div>
                  <SectionHeader
                    icon={Heart}
                    title="Antecedentes Gineco-obstétricos"
                    activeSection={activeSection}
                    sections={sections}
                    loading={loading}
                    onSaveCurrentSection={saveCurrentSection}
                    onGoToNextSection={goToNextSection}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gestaciones
                      </label>
                      <input
                        type="number"
                        value={formData.gyneco_obstetric_history.gestaciones}
                        onChange={(e) => handleGynecoObstetricChange('gestaciones', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                        placeholder="Número de gestaciones"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Partos
                      </label>
                      <input
                        type="number"
                        value={formData.gyneco_obstetric_history.partos}
                        onChange={(e) => handleGynecoObstetricChange('partos', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                        placeholder="Número de partos"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cesáreas
                      </label>
                      <input
                        type="number"
                        value={formData.gyneco_obstetric_history.cesareas}
                        onChange={(e) => handleGynecoObstetricChange('cesareas', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                        placeholder="Número de cesáreas"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha última menstruación
                      </label>
                      <input
                        type="date"
                        value={formData.gyneco_obstetric_history.fecha_ultima_menstruacion}
                        onChange={(e) => handleGynecoObstetricChange('fecha_ultima_menstruacion', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha último parto
                      </label>
                      <input
                        type="date"
                        value={formData.gyneco_obstetric_history.fecha_ultimo_parto}
                        onChange={(e) => handleGynecoObstetricChange('fecha_ultimo_parto', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Semanas de gestación actual
                      </label>
                      <input
                        type="number"
                        value={formData.gyneco_obstetric_history.semanas_gestacion}
                        onChange={(e) => handleGynecoObstetricChange('semanas_gestacion', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                        placeholder="Solo si está embarazada"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Uso de anticonceptivos
                      </label>
                      <select
                        value={formData.gyneco_obstetric_history.uso_anticonceptivos}
                        onChange={(e) => handleGynecoObstetricChange('uso_anticonceptivos', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                      >
                        <option value="">Seleccionar método</option>
                        {contraceptiveTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comentarios adicionales
                      </label>
                      <textarea
                        value={formData.gyneco_obstetric_history.comentarios}
                        onChange={(e) => handleGynecoObstetricChange('comentarios', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                        placeholder="Información adicional relevante..."
                      />
                    </div>
                  </div>
                  
                </div>
              )}

              {/* 8. Hábitos de Alimentación */}
              {activeSection === 'eating_habits' && (
                <div>
                  <SectionHeader
                    icon={Apple}
                    title="Hábitos de Alimentación"
                    activeSection={activeSection}
                    sections={sections}
                    loading={loading}
                    onSaveCurrentSection={saveCurrentSection}
                    onGoToNextSection={goToNextSection}
                  />
                  
                  <div className="space-y-8">
                    {/* Contexto Social */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Contexto Social</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ¿Con quién come generalmente?
                          </label>
                          <input
                            type="text"
                            value={formData.eating_habits.contexto_social.con_quien_come}
                            onChange={(e) => handleEatingHabitsChange('contexto_social', 'con_quien_come', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="Solo, familia, amigos, etc."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ¿Quién prepara los alimentos?
                          </label>
                          <input
                            type="text"
                            value={formData.eating_habits.contexto_social.quien_prepara_alimentos}
                            onChange={(e) => handleEatingHabitsChange('contexto_social', 'quien_prepara_alimentos', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="Yo mismo, mamá, empleada, etc."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Número de comidas al día
                          </label>
                          <select
                            value={formData.eating_habits.contexto_social.numero_comidas_dia}
                            onChange={(e) => handleEatingHabitsChange('contexto_social', 'numero_comidas_dia', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">Seleccionar</option>
                            <option value="2">2 comidas</option>
                            <option value="3">3 comidas</option>
                            <option value="4">4 comidas</option>
                            <option value="5">5 comidas</option>
                            <option value="6">6 comidas</option>
                            <option value="7+">7 o más comidas</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* Horarios de comida */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-700">Horarios de comida</h4>
                          <button
                            type="button"
                            onClick={addMealTime}
                            className="text-sm text-green-600 hover:text-green-800"
                          >
                            <Plus className="h-4 w-4 inline mr-1" />
                            Agregar horario
                          </button>
                        </div>
                        
                        {formData.eating_habits.contexto_social.horarios_comida.map((mealTime, index) => (
                          <div key={index} className="flex gap-3 mb-2">
                            <select
                              value={mealTime.meal}
                              onChange={(e) => updateMealTime(index, 'meal', e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            >
                              <option value="">Seleccionar comida</option>
                              {mealTypes.map(meal => (
                                <option key={meal} value={meal}>{meal}</option>
                              ))}
                            </select>
                            <input
                              type="time"
                              value={mealTime.time}
                              onChange={(e) => updateMealTime(index, 'time', e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeMealTime(index)}
                              className="text-red-600 hover:text-red-800 p-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Colaciones */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Colaciones</h3>
                      
                      <div className="mb-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.eating_habits.colaciones.realiza_colaciones}
                            onChange={(e) => handleEatingHabitsChange('colaciones', 'realiza_colaciones', e.target.checked)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">¿Realiza colaciones entre comidas?</span>
                        </label>
                      </div>
                      
                      {formData.eating_habits.colaciones.realiza_colaciones && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipos de alimentos en colaciones
                          </label>
                          <MultiSelectChips
                            value={formData.eating_habits.colaciones.tipos_alimentos_colaciones}
                            onChange={(snacks) => handleEatingHabitsChange('colaciones', 'tipos_alimentos_colaciones', snacks)}
                            suggestions={snackTypes}
                            placeholder="Seleccionar tipos de colaciones..."
                            allowCustom={true}
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Frecuencia de comidas */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Frecuencia de comidas</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Comidas en casa por semana
                          </label>
                          <input
                            type="number"
                            value={formData.eating_habits.frecuencia_comidas.comidas_casa_semana}
                            onChange={(e) => handleEatingHabitsChange('frecuencia_comidas', 'comidas_casa_semana', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="14"
                            min="0"
                            max="21"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Comidas fuera de casa (semana)
                          </label>
                          <input
                            type="number"
                            value={formData.eating_habits.frecuencia_comidas.comidas_fuera_casa_semana}
                            onChange={(e) => handleEatingHabitsChange('frecuencia_comidas', 'comidas_fuera_casa_semana', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="3"
                            min="0"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Comidas fuera de casa (fin de semana)
                          </label>
                          <input
                            type="number"
                            value={formData.eating_habits.frecuencia_comidas.comidas_fuera_casa_fin_semana}
                            onChange={(e) => handleEatingHabitsChange('frecuencia_comidas', 'comidas_fuera_casa_fin_semana', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="2"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Apetito y Preferencias */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Apetito y Preferencias</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Horarios de mayor apetito
                          </label>
                          <input
                            type="text"
                            value={formData.eating_habits.apetito_preferencias.hora_mayor_apetito}
                            onChange={(e) => handleEatingHabitsChange('apetito_preferencias', 'hora_mayor_apetito', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="Ej: 8:00 AM, 2:00 PM, 7:30 PM"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Percepción del apetito
                          </label>
                          <select
                            value={formData.eating_habits.apetito_preferencias.percepcion_apetito}
                            onChange={(e) => handleEatingHabitsChange('apetito_preferencias', 'percepcion_apetito', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">Seleccionar</option>
                            {appetitePerceptions.map(perception => (
                              <option key={perception} value={perception}>{perception}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cambios recientes en el apetito
                          </label>
                          <select
                            value={formData.eating_habits.apetito_preferencias.cambios_recientes_apetito}
                            onChange={(e) => handleEatingHabitsChange('apetito_preferencias', 'cambios_recientes_apetito', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">Seleccionar</option>
                            {appetiteChanges.map(change => (
                              <option key={change} value={change}>{change}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Alimentos preferidos
                          </label>
                          <MultiSelectChips
                            value={formData.eating_habits.preferencias_alimentarias.alimentos_preferidos}
                            onChange={(foods) => handleEatingHabitsChange('preferencias_alimentarias', 'alimentos_preferidos', foods)}
                            suggestions={commonFoods}
                            placeholder="Agregar alimentos preferidos..."
                            allowCustom={true}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Alimentos que disgustan
                          </label>
                          <MultiSelectChips
                            value={formData.eating_habits.preferencias_alimentarias.alimentos_disgustan}
                            onChange={(foods) => handleEatingHabitsChange('preferencias_alimentarias', 'alimentos_disgustan', foods)}
                            suggestions={commonFoods}
                            placeholder="Agregar alimentos que disgustan..."
                            allowCustom={true}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Restricciones y Suplementación */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Restricciones y Suplementación</h3>
                      
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Alergias alimentarias
                            </label>
                            <MultiSelectChips
                              value={formData.eating_habits.restricciones_suplementacion.alergias_alimentarias}
                              onChange={(allergies) => handleEatingHabitsChange('restricciones_suplementacion', 'alergias_alimentarias', allergies)}
                              suggestions={commonAllergies}
                              placeholder="Agregar alergias..."
                              allowCustom={true}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Intolerancias
                            </label>
                            <MultiSelectChips
                              value={formData.eating_habits.restricciones_suplementacion.intolerancias}
                              onChange={(intolerances) => handleEatingHabitsChange('restricciones_suplementacion', 'intolerancias', intolerances)}
                              suggestions={commonIntolerances}
                              placeholder="Agregar intolerancias..."
                              allowCustom={true}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dietas anteriores
                          </label>
                          <textarea
                            value={formData.eating_habits.restricciones_suplementacion.dietas_anteriores}
                            onChange={(e) => handleEatingHabitsChange('restricciones_suplementacion', 'dietas_anteriores', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="Describir dietas previas, resultados, duración..."
                          />
                        </div>
                        
                        <div>
                          <label className="flex items-center mb-3">
                            <input
                              type="checkbox"
                              checked={formData.eating_habits.restricciones_suplementacion.medicamentos_bajar_peso}
                              onChange={(e) => handleEatingHabitsChange('restricciones_suplementacion', 'medicamentos_bajar_peso', e.target.checked)}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">¿Ha usado medicamentos para bajar de peso?</span>
                          </label>
                          
                          {formData.eating_habits.restricciones_suplementacion.medicamentos_bajar_peso && (
                            <textarea
                              value={formData.eating_habits.restricciones_suplementacion.medicamentos_bajar_peso_detalles}
                              onChange={(e) => handleEatingHabitsChange('restricciones_suplementacion', 'medicamentos_bajar_peso_detalles', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                              placeholder="Especificar qué medicamentos y resultados..."
                            />
                          )}
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-gray-700">
                              Suplementos actuales
                            </label>
                            <button
                              type="button"
                              onClick={addSupplement}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Agregar suplemento
                            </button>
                          </div>
                          
                          {formData.eating_habits.restricciones_suplementacion.suplementos_actuales.map((supplement, suppIndex) => (
                            <div key={suppIndex} className="bg-gray-50 p-4 rounded-lg mb-3">
                              <div className="flex justify-between items-start mb-3">
                                <h4 className="text-sm font-medium text-gray-700">Suplemento {suppIndex + 1}</h4>
                                <button
                                  type="button"
                                  onClick={() => removeSupplement(suppIndex)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre del suplemento
                                  </label>
                                  <SupplementAutocomplete
                                    value={supplement.name || ''}
                                    onChange={(value) => updateSupplement(suppIndex, 'name', value)}
                                    suggestions={commonSupplements}
                                    placeholder="Ej. Vitamina D, Omega 3..."
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Frecuencia
                                  </label>
                                  <select
                                    value={supplement.frequency || ''}
                                    onChange={(e) => updateSupplement(suppIndex, 'frequency', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  >
                                    <option value="">Seleccionar frecuencia</option>
                                    {medicationFrequencies.map((freq, idx) => (
                                      <option key={idx} value={freq}>{freq}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              
                              <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Notas adicionales
                                </label>
                                <textarea
                                  value={supplement.notes || ''}
                                  onChange={(e) => updateSupplement(suppIndex, 'notes', e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  placeholder="Dosis, observaciones, etc."
                                />
                              </div>
                            </div>
                          ))}
                          
                          {formData.eating_habits.restricciones_suplementacion.suplementos_actuales.length === 0 && (
                            <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                              <p className="text-gray-500 text-sm">No hay suplementos registrados</p>
                              <p className="text-gray-400 text-xs mt-1">Haz clic en "Agregar suplemento" para comenzar</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                </div>
              )}

              {/* 9. Frecuencia de Consumo de Alimentos */}
              {activeSection === 'food_frequency' && (
                <div>
                  <SectionHeader
                    icon={Calendar}
                    title="Frecuencia de Consumo de Alimentos"
                    activeSection={activeSection}
                    sections={sections}
                    loading={loading}
                    onSaveCurrentSection={saveCurrentSection}
                    onGoToNextSection={goToNextSection}
                  />
                  
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-6">
                      Indique con qué frecuencia consume cada grupo de alimentos.
                    </p>
                    
                    {foodGroups.map((foodGroup, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                          <div>
                            <h4 className="font-medium text-gray-900">{foodGroup.name}</h4>
                            <p className="text-sm text-gray-500">{foodGroup.examples}</p>
                          </div>
                          
                          <div className="md:col-span-2">
                            <select
                              value={formData.food_frequency[foodGroup.name] || ''}
                              onChange={(e) => handleFoodFrequencyChange(index, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Seleccionar frecuencia</option>
                              {foodFrequencies.map(frequency => (
                                <option key={frequency} value={frequency}>{frequency}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                </div>
              )}

              {/* 10. Recordatorio de 24 Horas */}
              {activeSection === 'food_recall_24h' && (
                <div>
                  <SectionHeader
                    icon={Clock}
                    title="Recordatorio de 24 Horas"
                    activeSection={activeSection}
                    sections={sections}
                    loading={loading}
                    onSaveCurrentSection={saveCurrentSection}
                    onGoToNextSection={goToNextSection}
                  />
                  
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-6">
                      Describa todo lo que consumió ayer desde que se levantó hasta que se acostó.
                    </p>
                    
                    {mealTimes24h.map((mealTime, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-4">{mealTime}</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Hora
                            </label>
                            <input
                              type="time"
                              value={formData.food_recall_24h[mealTime]?.time || ''}
                              onChange={(e) => handleFoodRecall24hChange(index, 'time', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Lugar
                            </label>
                            <input
                              type="text"
                              value={formData.food_recall_24h[mealTime]?.location || ''}
                              onChange={(e) => handleFoodRecall24hChange(index, 'location', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                              placeholder="Casa, trabajo, restaurante..."
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Alimentos y cantidades
                            </label>
                            <textarea
                              value={formData.food_recall_24h[mealTime]?.foods || ''}
                              onChange={(e) => handleFoodRecall24hChange(index, 'foods', e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                              placeholder="Ej: 1 taza de arroz, 100g de pollo, 1 tortilla..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                </div>
              )}

              {/* 11. Indicadores Bioquímicos */}
              {activeSection === 'biochemical_indicators' && (
                <div>
                  <SectionHeader
                    icon={TestTube}
                    title="Indicadores Bioquímicos"
                    activeSection={activeSection}
                    sections={sections}
                    loading={loading}
                    onSaveCurrentSection={saveCurrentSection}
                    onGoToNextSection={goToNextSection}
                  />
                  
                  <div className="space-y-4">
                    {formData.biochemical_indicators.map((test, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium text-gray-900">Examen {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeBiochemicalTest(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Examen
                            </label>
                            <select
                              value={test.test}
                              onChange={(e) => handleBiochemicalChange(index, 'test', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="">Seleccionar examen</option>
                              {commonLabTests.map(labTest => (
                                <option key={labTest} value={labTest}>{labTest}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Resultado
                            </label>
                            <input
                              type="text"
                              value={test.value}
                              onChange={(e) => handleBiochemicalChange(index, 'value', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                              placeholder="Valor del resultado"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Fecha
                            </label>
                            <input
                              type="date"
                              value={test.date}
                              onChange={(e) => handleBiochemicalChange(index, 'date', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Rango de referencia
                            </label>
                            <input
                              type="text"
                              value={test.reference_range}
                              onChange={(e) => handleBiochemicalChange(index, 'reference_range', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                              placeholder="Ej: 70-100 mg/dL"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addBiochemicalTest}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar examen de laboratorio
                    </button>
                  </div>
                  
                </div>
              )}
            </div>

            {/* Section Actions */}
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Paciente
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}