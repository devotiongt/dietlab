import { useState } from 'react'
import { X, Save, Calendar } from 'lucide-react'
import {
  BodyCompositionSection,
  MetabolicEvaluationSection,
  CircumferencesSection,
  NotesSection
} from './form-sections'

export default function MeasurementForm({ measurement, patientId, onSave, onClose }) {
  const [formData, setFormData] = useState({
    weight: measurement?.weight || '',
    body_fat_percentage: measurement?.body_fat_percentage || '',
    water_percentage: measurement?.water_percentage || '',
    muscle_mass: measurement?.muscle_mass || '',
    physical_rating: measurement?.physical_rating || '',
    calories_needed: measurement?.calories_needed || '',
    metabolic_age: measurement?.metabolic_age || '',
    bone_mass: measurement?.bone_mass || '',
    visceral_fat: measurement?.visceral_fat || '',
    waist_circumference: measurement?.waist_circumference || '',
    hip_circumference: measurement?.hip_circumference || '',
    chest_circumference: measurement?.chest_circumference || '',
    arm_circumference: measurement?.arm_circumference || '',
    thigh_circumference: measurement?.thigh_circumference || '',
    notes: measurement?.notes || '',
    measurement_date: measurement?.measurement_date || new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

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

    if (!formData.measurement_date) {
      newErrors.measurement_date = 'La fecha de medición es obligatoria'
    }

    // Validate that at least one measurement is provided
    const measurementFields = [
      'weight', 'body_fat_percentage', 'water_percentage', 'muscle_mass', 'physical_rating',
      'calories_needed', 'metabolic_age', 'bone_mass', 'visceral_fat', 'waist_circumference',
      'hip_circumference', 'chest_circumference', 'arm_circumference', 'thigh_circumference'
    ]
    
    const hasAnyMeasurement = measurementFields.some(field => formData[field] && formData[field] !== '')
    
    if (!hasAnyMeasurement) {
      newErrors.general = 'Debe proporcionar al menos una medición'
    }

    // Validate numeric ranges
    if (formData.weight && (formData.weight < 10 || formData.weight > 500)) {
      newErrors.weight = 'El peso debe estar entre 10 y 500 kg'
    }

    if (formData.body_fat_percentage && (formData.body_fat_percentage < 0 || formData.body_fat_percentage > 100)) {
      newErrors.body_fat_percentage = 'El porcentaje de grasa debe estar entre 0 y 100%'
    }

    if (formData.muscle_mass && (formData.muscle_mass < 5 || formData.muscle_mass > 200)) {
      newErrors.muscle_mass = 'La masa muscular debe estar entre 5 y 200 kg'
    }

    if (formData.water_percentage && (formData.water_percentage < 0 || formData.water_percentage > 100)) {
      newErrors.water_percentage = 'El porcentaje de agua debe estar entre 0 y 100%'
    }

    if (formData.physical_rating && (formData.physical_rating < 1 || formData.physical_rating > 9)) {
      newErrors.physical_rating = 'La valoración física debe estar entre 1 y 9'
    }

    if (formData.calories_needed && (formData.calories_needed < 500 || formData.calories_needed > 10000)) {
      newErrors.calories_needed = 'Las calorías deben estar entre 500 y 10000'
    }

    if (formData.metabolic_age && (formData.metabolic_age < 10 || formData.metabolic_age > 150)) {
      newErrors.metabolic_age = 'La edad metabólica debe estar entre 10 y 150 años'
    }

    if (formData.bone_mass && (formData.bone_mass < 0.5 || formData.bone_mass > 10)) {
      newErrors.bone_mass = 'La masa ósea debe estar entre 0.5 y 10 kg'
    }

    if (formData.visceral_fat && (formData.visceral_fat < 1 || formData.visceral_fat > 59)) {
      newErrors.visceral_fat = 'La grasa visceral debe estar entre 1 y 59'
    }

    // Validate circumferences
    const circumferenceFields = [
      'waist_circumference', 'hip_circumference', 'chest_circumference', 
      'arm_circumference', 'thigh_circumference'
    ]
    
    circumferenceFields.forEach(field => {
      if (formData[field] && (formData[field] < 10 || formData[field] > 300)) {
        newErrors[field] = 'Las circunferencias deben estar entre 10 y 300 cm'
      }
    })

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
      const processedData = {
        ...formData,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        body_fat_percentage: formData.body_fat_percentage ? parseFloat(formData.body_fat_percentage) : null,
        water_percentage: formData.water_percentage ? parseFloat(formData.water_percentage) : null,
        muscle_mass: formData.muscle_mass ? parseFloat(formData.muscle_mass) : null,
        physical_rating: formData.physical_rating ? parseInt(formData.physical_rating) : null,
        calories_needed: formData.calories_needed ? parseInt(formData.calories_needed) : null,
        metabolic_age: formData.metabolic_age ? parseInt(formData.metabolic_age) : null,
        bone_mass: formData.bone_mass ? parseFloat(formData.bone_mass) : null,
        visceral_fat: formData.visceral_fat ? parseInt(formData.visceral_fat) : null,
        waist_circumference: formData.waist_circumference ? parseFloat(formData.waist_circumference) : null,
        hip_circumference: formData.hip_circumference ? parseFloat(formData.hip_circumference) : null,
        chest_circumference: formData.chest_circumference ? parseFloat(formData.chest_circumference) : null,
        arm_circumference: formData.arm_circumference ? parseFloat(formData.arm_circumference) : null,
        thigh_circumference: formData.thigh_circumference ? parseFloat(formData.thigh_circumference) : null,
      }

      await onSave(processedData)
    } catch (error) {
      console.error('Error saving measurement:', error)
      setErrors({ general: 'Error al guardar la medición. Inténtalo de nuevo.' })
    } finally {
      setLoading(false)
    }
  }

  const isEditing = !!measurement

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Medición' : 'Nueva Medición'}
            </h2>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Actualiza los datos de la medición' : 'Registra las medidas del paciente'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {errors.general}
            </div>
          )}

          {/* Date */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Calendar className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Fecha de Medición</h3>
            </div>
            <div className="max-w-xs">
              <input
                type="date"
                name="measurement_date"
                value={formData.measurement_date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.measurement_date ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.measurement_date && (
                <p className="mt-1 text-sm text-red-600">{errors.measurement_date}</p>
              )}
            </div>
          </div>

          {/* Body Composition */}
          <BodyCompositionSection
            formData={formData}
            errors={errors}
            onChange={handleChange}
          />

          {/* Metabolic Assessment */}
          <MetabolicEvaluationSection
            formData={formData}
            errors={errors}
            onChange={handleChange}
          />

          {/* Circumferences */}
          <CircumferencesSection
            formData={formData}
            errors={errors}
            onChange={handleChange}
          />

          {/* Notes */}
          <NotesSection
            formData={formData}
            onChange={handleChange}
          />

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5 mr-2" />
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar Medición' : 'Guardar Medición')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}