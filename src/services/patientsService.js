import { supabase } from '../lib/supabase'
import { measurementsService } from './measurementsService'

export const patientsService = {
  // Get all patients for the current nutritionist
  async getPatients(searchTerm = '', status = 'active') {
    let query = supabase
      .from('patients')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (searchTerm) {
      query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Get a single patient by ID
  async getPatient(patientId) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single()

    if (error) throw error
    return data
  },

  // Create a new patient
  async createPatient(patientData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('patients')
      .insert([{
        ...patientData,
        nutritionist_id: user.id
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Create a new patient with initial measurement
  async createPatientWithInitialMeasurement(patientData, initialMeasurement) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Start a transaction by creating patient first
    const { data: newPatient, error: patientError } = await supabase
      .from('patients')
      .insert([{
        ...patientData,
        nutritionist_id: user.id
      }])
      .select()
      .single()

    if (patientError) throw patientError

    // Create initial measurement with the new patient ID using measurementsService
    try {
      await measurementsService.addMeasurement(newPatient.id, initialMeasurement)
    } catch (measurementError) {
      // If measurement creation fails, we should ideally rollback the patient creation
      // But for now, we'll just throw the error
      throw measurementError
    }

    // Update patient weight with the initial measurement weight
    if (initialMeasurement.weight) {
      await this.updatePatient(newPatient.id, { weight: initialMeasurement.weight })
    }

    return newPatient
  },

  // Update an existing patient
  async updatePatient(patientId, patientData) {
    const { data, error } = await supabase
      .from('patients')
      .update(patientData)
      .eq('id', patientId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete a patient
  async deletePatient(patientId) {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', patientId)

    if (error) throw error
  },

  // Archive a patient instead of deleting
  async archivePatient(patientId) {
    const { data, error } = await supabase
      .from('patients')
      .update({ status: 'archived' })
      .eq('id', patientId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update patient weight based on most recent measurement
  async updatePatientWeightFromMeasurements(patientId) {
    try {
      const mostRecentMeasurement = await measurementsService.getMostRecentMeasurement(patientId)

      if (mostRecentMeasurement && mostRecentMeasurement.weight) {
        await this.updatePatient(patientId, {
          weight: mostRecentMeasurement.weight
        })
        return mostRecentMeasurement.weight
      }

      return null
    } catch (error) {
      console.error('Error updating patient weight:', error)
      throw error
    }
  },

  // Calculate age from date of birth
  calculateAge(dateOfBirth) {
    if (!dateOfBirth) return null
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }
}