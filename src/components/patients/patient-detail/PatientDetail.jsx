import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { patientsService } from '../../../services/patientsService'
import { measurementsService } from '../../../services/measurementsService'
import { clinicalHistoryService } from '../../../services/clinicalHistoryService'
import MeasurementForm from '../measurements/MeasurementForm'
import PatientHeader from './components/PatientHeader'
import KeyMetrics from './components/KeyMetrics'
import MeasurementsHistory from './components/MeasurementsHistory'
import PersonalInformation from './components/PersonalInformation'
import ClinicalHistorySummary from './components/ClinicalHistorySummary'
import PatientStatus from './components/PatientStatus'

export default function PatientDetail({ patient, onBack, onEdit, onDelete, onArchive, onPatientUpdate }) {
  const navigate = useNavigate()
  const [measurements, setMeasurements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddMeasurement, setShowAddMeasurement] = useState(false)
  const [editingMeasurement, setEditingMeasurement] = useState(null)
  const [expandedMeasurements, setExpandedMeasurements] = useState(new Set())
  const [error, setError] = useState(null)
  const [currentPatient, setCurrentPatient] = useState(patient)
  const [clinicalHistorySummary, setClinicalHistorySummary] = useState(null)

  useEffect(() => {
    loadMeasurements()
    loadClinicalHistorySummary()
  }, [patient.id])

  useEffect(() => {
    setCurrentPatient(patient)
  }, [patient])

  const refreshPatientData = async () => {
    try {
      const updatedPatient = await patientsService.getPatient(patient.id)
      setCurrentPatient(updatedPatient)
      if (onPatientUpdate) {
        onPatientUpdate(updatedPatient)
      }
    } catch (error) {
      console.error('Error refreshing patient data:', error)
    }
  }

  const loadMeasurements = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await measurementsService.getPatientMeasurements(patient.id)
      setMeasurements(data)
    } catch (error) {
      console.error('Error loading measurements:', error)
      setError('Error al cargar las mediciones')
    } finally {
      setLoading(false)
    }
  }

  const loadClinicalHistorySummary = async () => {
    try {
      const summary = await clinicalHistoryService.getClinicalHistorySummary(patient.id)
      setClinicalHistorySummary(summary)
    } catch (error) {
      console.error('Error loading clinical history summary:', error)
    }
  }

  const handleShowClinicalHistory = () => {
    navigate(`/dashboard/patients/${patient.id}/clinical-history`)
  }

  const handleAddMeasurement = async (measurementData) => {
    try {
      await measurementsService.addMeasurement(patient.id, measurementData)
      
      // Update patient weight if the new measurement has weight data
      if (measurementData.weight) {
        await patientsService.updatePatientWeightFromMeasurements(patient.id)
        await refreshPatientData()
      }
      
      setShowAddMeasurement(false)
      loadMeasurements()
    } catch (error) {
      console.error('Error adding measurement:', error)
      setError('Error al agregar la medición')
    }
  }

  const handleUpdateMeasurement = async (measurementData) => {
    try {
      // Check if this is the most recent measurement before updating
      const isMostRecent = await measurementsService.isMostRecentMeasurement(editingMeasurement.id, patient.id)

      await measurementsService.updateMeasurement(editingMeasurement.id, measurementData)
      
      // Update patient weight if this was the most recent measurement and has weight data
      if (isMostRecent && measurementData.weight) {
        await patientsService.updatePatientWeightFromMeasurements(patient.id)
        await refreshPatientData()
      }
      
      setEditingMeasurement(null)
      loadMeasurements()
    } catch (error) {
      console.error('Error updating measurement:', error)
      setError('Error al actualizar la medición')
    }
  }

  const handleDeleteMeasurement = async (measurementId) => {
    try {
      // Check if this is the most recent measurement before deleting
      const isMostRecent = await measurementsService.isMostRecentMeasurement(measurementId, patient.id)

      await measurementsService.deleteMeasurement(measurementId)
      
      // If we deleted the most recent measurement, update patient weight with new most recent
      if (isMostRecent) {
        await patientsService.updatePatientWeightFromMeasurements(patient.id)
        await refreshPatientData()
      }
      
      loadMeasurements()
    } catch (error) {
      console.error('Error deleting measurement:', error)
      setError('Error al eliminar la medición')
    }
  }

  const toggleMeasurementExpansion = (measurementId) => {
    const newExpanded = new Set(expandedMeasurements)
    if (newExpanded.has(measurementId)) {
      newExpanded.delete(measurementId)
    } else {
      newExpanded.add(measurementId)
    }
    setExpandedMeasurements(newExpanded)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PatientHeader
        patient={currentPatient}
        onBack={onBack}
        onEdit={onEdit}
        onDelete={onDelete}
        onArchive={onArchive}
        onShowClinicalHistory={handleShowClinicalHistory}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <KeyMetrics patient={currentPatient} measurements={measurements} />

          <MeasurementsHistory
            measurements={measurements}
            loading={loading}
            error={error}
            expandedMeasurements={expandedMeasurements}
            onAddMeasurement={() => setShowAddMeasurement(true)}
            onEditMeasurement={setEditingMeasurement}
            onDeleteMeasurement={handleDeleteMeasurement}
            onToggleExpansion={toggleMeasurementExpansion}
            onClearError={() => setError(null)}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <PersonalInformation patient={currentPatient} />
          <ClinicalHistorySummary clinicalHistorySummary={clinicalHistorySummary} />
          <PatientStatus patient={currentPatient} />
        </div>
      </div>

      {/* Add/Edit Measurement Modal */}
      {(showAddMeasurement || editingMeasurement) && (
        <MeasurementForm
          measurement={editingMeasurement}
          patientId={patient.id}
          onSave={editingMeasurement ? handleUpdateMeasurement : handleAddMeasurement}
          onClose={() => {
            setShowAddMeasurement(false)
            setEditingMeasurement(null)
          }}
        />
      )}
    </div>
  )
}

