import { supabase } from '../lib/supabase'

export const measurementsService = {
  // Get patient measurements
  async getPatientMeasurements(patientId) {
    const { data, error } = await supabase
      .from('measurements')
      .select('*')
      .eq('patient_id', patientId)
      .order('measurement_date', { ascending: false })

    if (error) throw error
    return data
  },

  // Add new measurement
  async addMeasurement(patientId, measurementData) {
    const { data, error } = await supabase
      .from('measurements')
      .insert([{
        ...measurementData,
        patient_id: patientId
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update a measurement
  async updateMeasurement(measurementId, measurementData) {
    const { data, error } = await supabase
      .from('measurements')
      .update(measurementData)
      .eq('id', measurementId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete a measurement
  async deleteMeasurement(measurementId) {
    const { error } = await supabase
      .from('measurements')
      .delete()
      .eq('id', measurementId)

    if (error) throw error
  },

  // Get a single measurement
  async getMeasurement(measurementId) {
    const { data, error } = await supabase
      .from('measurements')
      .select('*')
      .eq('id', measurementId)
      .single()

    if (error) throw error
    return data
  },

  // Get the most recent measurement for a patient
  async getMostRecentMeasurement(patientId) {
    const { data, error } = await supabase
      .from('measurements')
      .select('*')
      .eq('patient_id', patientId)
      .order('measurement_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
    return data
  },

  // Check if a measurement is the most recent for a patient
  async isMostRecentMeasurement(measurementId, patientId) {
    try {
      const mostRecentMeasurement = await this.getMostRecentMeasurement(patientId)
      return mostRecentMeasurement && mostRecentMeasurement.id === measurementId
    } catch (error) {
      console.error('Error checking if measurement is most recent:', error)
      return false
    }
  },

  // Calculate BMI
  calculateBMI(weight, height) {
    if (!weight || !height) return null
    const heightInMeters = height / 100
    return (weight / (heightInMeters * heightInMeters)).toFixed(1)
  },

  // Get BMI category
  getBMICategory(bmi) {
    if (!bmi) return ''
    if (bmi < 18.5) return 'Bajo peso'
    if (bmi < 25) return 'Normal'
    if (bmi < 30) return 'Sobrepeso'
    return 'Obesidad'
  }
}