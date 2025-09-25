import { useState } from 'react'
import { ArrowLeft, Save, X } from 'lucide-react'
import PersonalInformationSection from './components/PersonalInformationSection'
import PhysicalInformationSection from './components/PhysicalInformationSection'
import GoalsAndNotesSection from './components/GoalsAndNotesSection'
import InitialMeasurementsSection from './components/InitialMeasurementsSection'

// Helper function to safely parse JSON arrays
const parseJSONArray = (jsonString) => {
  if (!jsonString) return []
  try {
    const parsed = JSON.parse(jsonString)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function PatientForm({ patient, onSave, onCancel }) {
  const isEditing = !!patient
  
  const [formData, setFormData] = useState({
    first_name: patient?.first_name || '',
    last_name: patient?.last_name || '',
    email: patient?.email || '',
    phone: patient?.phone || '',
    phone_country_code: patient?.phone_country_code || '+502',
    date_of_birth: patient?.date_of_birth || '',
    gender: patient?.gender || '',
    occupation: patient?.occupation || '',
    height: patient?.height || '',
    weight: isEditing ? patient?.weight || '' : '', // Solo mostrar peso en edición
    goal: patient?.goal || '',
    notes: patient?.notes || '',
    // Campos de medición inicial (solo para pacientes nuevos)
    initial_weight: !isEditing ? '' : undefined,
    initial_body_fat_percentage: !isEditing ? '' : undefined,
    initial_water_percentage: !isEditing ? '' : undefined,
    initial_muscle_mass: !isEditing ? '' : undefined,
    initial_physical_rating: !isEditing ? '' : undefined,
    initial_calories_needed: !isEditing ? '' : undefined,
    initial_metabolic_age: !isEditing ? '' : undefined,
    initial_bone_mass: !isEditing ? '' : undefined,
    initial_visceral_fat: !isEditing ? '' : undefined,
    initial_waist_circumference: !isEditing ? '' : undefined,
    initial_hip_circumference: !isEditing ? '' : undefined,
    initial_chest_circumference: !isEditing ? '' : undefined,
    initial_arm_circumference: !isEditing ? '' : undefined,
    initial_thigh_circumference: !isEditing ? '' : undefined
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es obligatorio'
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es obligatorio'
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido'
    }

    if (formData.phone && !/^\+?[\d\s-()]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'El teléfono no tiene un formato válido'
    }

    if (formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth)
      const today = new Date()
      if (birthDate > today) {
        newErrors.date_of_birth = 'La fecha de nacimiento no puede ser futura'
      }
    }

    if (formData.height && (formData.height < 50 || formData.height > 250)) {
      newErrors.height = 'La altura debe estar entre 50 y 250 cm'
    }

    if (formData.weight && (formData.weight < 10 || formData.weight > 500)) {
      newErrors.weight = 'El peso debe estar entre 10 y 500 kg'
    }

    // Validaciones para medición inicial (solo para pacientes nuevos)
    if (!isEditing) {
      const initialMeasurementFields = [
        'initial_weight', 'initial_body_fat_percentage', 'initial_water_percentage', 
        'initial_muscle_mass', 'initial_physical_rating', 'initial_calories_needed',
        'initial_metabolic_age', 'initial_bone_mass', 'initial_visceral_fat',
        'initial_waist_circumference', 'initial_hip_circumference', 'initial_chest_circumference',
        'initial_arm_circumference', 'initial_thigh_circumference'
      ]
      
      const hasAnyInitialMeasurement = initialMeasurementFields.some(field => 
        formData[field] && formData[field] !== ''
      )
      
      if (!hasAnyInitialMeasurement) {
        newErrors.initial_measurement = 'Debe proporcionar al menos una medición inicial'
      }

      // Validar rangos de mediciones iniciales
      if (formData.initial_weight && (formData.initial_weight < 10 || formData.initial_weight > 500)) {
        newErrors.initial_weight = 'El peso debe estar entre 10 y 500 kg'
      }
      
      if (formData.initial_body_fat_percentage && (formData.initial_body_fat_percentage < 0 || formData.initial_body_fat_percentage > 100)) {
        newErrors.initial_body_fat_percentage = 'El porcentaje de grasa debe estar entre 0 y 100%'
      }
      
      if (formData.initial_physical_rating && (formData.initial_physical_rating < 1 || formData.initial_physical_rating > 9)) {
        newErrors.initial_physical_rating = 'La valoración física debe estar entre 1 y 9'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      // Separar datos del paciente y datos de medición inicial
      const patientData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        phone_country_code: formData.phone_country_code,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender,
        occupation: formData.occupation,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: isEditing ? (formData.weight ? parseFloat(formData.weight) : null) : null,
        goal: formData.goal,
        notes: formData.notes
      }

      // Si es creación de paciente nuevo, incluir medición inicial
      if (!isEditing) {
        const initialMeasurement = {
          weight: formData.initial_weight ? parseFloat(formData.initial_weight) : null,
          body_fat_percentage: formData.initial_body_fat_percentage ? parseFloat(formData.initial_body_fat_percentage) : null,
          water_percentage: formData.initial_water_percentage ? parseFloat(formData.initial_water_percentage) : null,
          muscle_mass: formData.initial_muscle_mass ? parseFloat(formData.initial_muscle_mass) : null,
          physical_rating: formData.initial_physical_rating ? parseInt(formData.initial_physical_rating) : null,
          calories_needed: formData.initial_calories_needed ? parseInt(formData.initial_calories_needed) : null,
          metabolic_age: formData.initial_metabolic_age ? parseInt(formData.initial_metabolic_age) : null,
          bone_mass: formData.initial_bone_mass ? parseFloat(formData.initial_bone_mass) : null,
          visceral_fat: formData.initial_visceral_fat ? parseInt(formData.initial_visceral_fat) : null,
          waist_circumference: formData.initial_waist_circumference ? parseFloat(formData.initial_waist_circumference) : null,
          hip_circumference: formData.initial_hip_circumference ? parseFloat(formData.initial_hip_circumference) : null,
          chest_circumference: formData.initial_chest_circumference ? parseFloat(formData.initial_chest_circumference) : null,
          arm_circumference: formData.initial_arm_circumference ? parseFloat(formData.initial_arm_circumference) : null,
          thigh_circumference: formData.initial_thigh_circumference ? parseFloat(formData.initial_thigh_circumference) : null,
          measurement_date: new Date().toISOString().split('T')[0],
          is_initial_measurement: true
        }
        
        await onSave({ patientData, initialMeasurement })
      } else {
        await onSave(patientData)
      }
    } catch (error) {
      console.error('Error saving patient:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onCancel}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver a la lista
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
        </h1>
        <p className="text-gray-600">
          {isEditing ? 'Actualiza la información del paciente' : 'Completa la información del nuevo paciente'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information Section */}
        <PersonalInformationSection
          formData={formData}
          errors={errors}
          handleChange={handleChange}
          setFormData={setFormData}
        />

        {/* Physical Information Section */}
        <PhysicalInformationSection
          formData={formData}
          errors={errors}
          handleChange={handleChange}
          isEditing={isEditing}
        />

        {/* Goals and Notes Section */}
        <GoalsAndNotesSection
          formData={formData}
          errors={errors}
          handleChange={handleChange}
        />

        {/* Initial Measurements Section - Only for new patients */}
        {!isEditing && (
          <div className="bg-white rounded-lg shadow p-6">
            <InitialMeasurementsSection
              formData={formData}
              errors={errors}
              handleChange={handleChange}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium"
          >
            <X className="h-5 w-5 mr-2" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5 mr-2" />
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Paciente')}
          </button>
        </div>
      </form>
    </div>
  )
}