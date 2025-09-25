import { Heart, Trash2, Plus } from 'lucide-react'
import DiseaseAutocomplete from '../../../ui/autocomplete/DiseaseAutocomplete'
import SectionHeader from './SectionHeader'
import { commonPersonalDiseases, timeUnits, medicationFrequencies } from '../../../../data/clinicalHistoryStructure'

export default function PersonalPathologicalHistorySection({
  formData,
  onPersonalHistoryChange,
  onAddPersonalHistoryDisease,
  onRemovePersonalHistoryDisease,
  onAddMedicationDetail,
  onRemoveMedicationDetail,
  onUpdateMedicationDetail,
  activeSection,
  sections,
  loading,
  onSaveCurrentSection,
  onGoToNextSection
}) {
  return (
    <div>
      <SectionHeader
        icon={Heart}
        title="Antecedentes Personales Patológicos"
        activeSection={activeSection}
        sections={sections}
        loading={loading}
        onSaveCurrentSection={onSaveCurrentSection}
        onGoToNextSection={onGoToNextSection}
      />

      <div className="space-y-6">
        {formData.personal_pathological_history.map((item, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium text-gray-900">Enfermedad {index + 1}</h4>
              <button
                type="button"
                onClick={() => onRemovePersonalHistoryDisease(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enfermedad
                </label>
                <DiseaseAutocomplete
                  value={item.disease}
                  onChange={(value) => onPersonalHistoryChange(index, 'disease', value)}
                  suggestions={commonPersonalDiseases}
                  placeholder="Escriba el nombre de la enfermedad..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiempo que tiene
                </label>
                <input
                  type="number"
                  value={item.duration_value}
                  onChange={(e) => onPersonalHistoryChange(index, 'duration_value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Cantidad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidad de tiempo
                </label>
                <select
                  value={item.duration_unit}
                  onChange={(e) => onPersonalHistoryChange(index, 'duration_unit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  {timeUnits.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <h5 className="font-medium text-gray-700">Medicamentos</h5>
                <button
                  type="button"
                  onClick={() => onAddMedicationDetail(index)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  <Plus className="h-4 w-4 inline mr-1" />
                  Agregar medicamento
                </button>
              </div>

              {item.medication_details?.map((med, medIndex) => (
                <div key={medIndex} className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-700">Medicamento {medIndex + 1}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveMedicationDetail(index, medIndex)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => onUpdateMedicationDetail(index, medIndex, 'name', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Nombre del medicamento"
                      />
                    </div>
                    <div>
                      <select
                        value={med.frequency}
                        onChange={(e) => onUpdateMedicationDetail(index, medIndex, 'frequency', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="">Frecuencia</option>
                        {medicationFrequencies.map(freq => (
                          <option key={freq} value={freq}>{freq}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={med.notes}
                        onChange={(e) => onUpdateMedicationDetail(index, medIndex, 'notes', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Notas adicionales"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={onAddPersonalHistoryDisease}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar enfermedad personal
        </button>
      </div>
    </div>
  )
}