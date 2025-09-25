import { supabase } from '../lib/supabase'

export const clinicalHistoryService = {
  // Get clinical history for a patient
  async getClinicalHistory(patientId) {
    try {
      const { data, error } = await supabase
        .from('clinical_history')
        .select('*')
        .eq('patient_id', patientId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching clinical history:', error)
      throw error
    }
  },

  // Create or update clinical history
  async saveClinicalHistory(clinicalHistoryData) {
    try {
      // Check if clinical history already exists for this patient
      const existingHistory = await this.getClinicalHistory(clinicalHistoryData.patient_id)

      if (existingHistory) {
        // Update existing clinical history
        const { data, error } = await supabase
          .from('clinical_history')
          .update({
            family_history: clinicalHistoryData.family_history,
            personal_pathological_history: clinicalHistoryData.personal_pathological_history,
            eating_disorders: clinicalHistoryData.eating_disorders,
            physical_activities: clinicalHistoryData.physical_activities,
            toxicomanias: clinicalHistoryData.toxicomanias,
            gastrointestinal_disorders: clinicalHistoryData.gastrointestinal_disorders,
            gyneco_obstetric_history: clinicalHistoryData.gyneco_obstetric_history,
            eating_habits: clinicalHistoryData.eating_habits,
            food_frequency: clinicalHistoryData.food_frequency,
            food_recall_24h: clinicalHistoryData.food_recall_24h,
            biochemical_indicators: clinicalHistoryData.biochemical_indicators
          })
          .eq('patient_id', clinicalHistoryData.patient_id)
          .select()
          .single()

        if (error) throw error
        return data
      } else {
        // Create new clinical history
        const { data, error } = await supabase
          .from('clinical_history')
          .insert([clinicalHistoryData])
          .select()
          .single()

        if (error) throw error
        return data
      }
    } catch (error) {
      console.error('Error saving clinical history:', error)
      throw error
    }
  },

  // Delete clinical history
  async deleteClinicalHistory(patientId) {
    try {
      const { error } = await supabase
        .from('clinical_history')
        .delete()
        .eq('patient_id', patientId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting clinical history:', error)
      throw error
    }
  },

  // Check if clinical history exists for a patient
  async hasClinicalHistory(patientId) {
    try {
      const { data, error } = await supabase
        .from('clinical_history')
        .select('id')
        .eq('patient_id', patientId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return !!data
    } catch (error) {
      console.error('Error checking clinical history existence:', error)
      throw error
    }
  },

  // Get clinical history summary for display
  async getClinicalHistorySummary(patientId) {
    try {
      const clinicalHistory = await this.getClinicalHistory(patientId)
      
      if (!clinicalHistory) {
        return null
      }

      // Parse JSON fields and create summary
      const parseJSONField = (jsonString, defaultValue = []) => {
        if (!jsonString) return defaultValue
        try {
          return JSON.parse(jsonString)
        } catch {
          return defaultValue
        }
      }

      const familyHistory = parseJSONField(clinicalHistory.family_history, [])
      const personalHistory = parseJSONField(clinicalHistory.personal_pathological_history, [])
      const physicalActivities = parseJSONField(clinicalHistory.physical_activities, [])
      const toxicomanias = parseJSONField(clinicalHistory.toxicomanias, [])
      const gastrointestinalDisorders = parseJSONField(clinicalHistory.gastrointestinal_disorders, [])
      const biochemicalIndicators = parseJSONField(clinicalHistory.biochemical_indicators, [])

      return {
        hasFamilyHistory: familyHistory.length > 0,
        familyHistoryCount: familyHistory.length,
        hasPersonalHistory: personalHistory.length > 0,
        personalHistoryCount: personalHistory.length,
        hasPhysicalActivities: physicalActivities.length > 0,
        physicalActivitiesCount: physicalActivities.length,
        hasToxicomanias: toxicomanias.length > 0,
        toxicomaniasCount: toxicomanias.length,
        hasGIDisorders: gastrointestinalDisorders.length > 0,
        giDisordersCount: gastrointestinalDisorders.length,
        hasLabResults: biochemicalIndicators.length > 0,
        labResultsCount: biochemicalIndicators.length,
        lastUpdated: clinicalHistory.updated_at,
        completionPercentage: this.calculateCompletionPercentage(clinicalHistory)
      }
    } catch (error) {
      console.error('Error getting clinical history summary:', error)
      throw error
    }
  },

  // Calculate completion percentage based on filled sections
  calculateCompletionPercentage(clinicalHistory) {
    if (!clinicalHistory) return 0

    const parseJSONField = (jsonString, defaultValue = []) => {
      if (!jsonString) return defaultValue
      try {
        return JSON.parse(jsonString)
      } catch {
        return defaultValue
      }
    }

    const sections = [
      parseJSONField(clinicalHistory.family_history, []).length > 0,
      parseJSONField(clinicalHistory.personal_pathological_history, []).length > 0,
      parseJSONField(clinicalHistory.physical_activities, []).length > 0,
      parseJSONField(clinicalHistory.toxicomanias, []).length > 0,
      parseJSONField(clinicalHistory.gastrointestinal_disorders, []).length > 0,
      !!clinicalHistory.gyneco_obstetric_history && Object.values(parseJSONField(clinicalHistory.gyneco_obstetric_history, {})).some(val => val !== '' && val !== null),
      !!clinicalHistory.eating_habits && Object.keys(parseJSONField(clinicalHistory.eating_habits, {})).length > 0,
      !!clinicalHistory.food_frequency && Object.keys(parseJSONField(clinicalHistory.food_frequency, {})).length > 0,
      !!clinicalHistory.food_recall_24h && Object.keys(parseJSONField(clinicalHistory.food_recall_24h, {})).length > 0,
      parseJSONField(clinicalHistory.biochemical_indicators, []).length > 0
    ]

    const completedSections = sections.filter(Boolean).length
    return Math.round((completedSections / sections.length) * 100)
  }
}