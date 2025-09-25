import { Users } from 'lucide-react'
import MultiSelectChips from '../../../ui/MultiSelectChips'
import SectionHeader from './SectionHeader'
import { defaultFamilyHistoryDiseases, familyMembersOptions, dyslipidemiaTypes } from '../../../../data/clinicalHistoryStructure'

export default function FamilyHistorySection({
  formData,
  onFamilyHistoryCheck,
  onFamilyMembersChange,
  onFamilyDetailsChange,
  onDyslipidemiaTypeChange,
  activeSection,
  sections,
  loading,
  onSaveCurrentSection,
  onGoToNextSection
}) {
  const getDiseaseStatus = (disease) => {
    return formData.family_history.find(item => item.disease === disease)
  }

  return (
    <div>
      <SectionHeader
        icon={Users}
        title="Antecedentes Heredofamiliares"
        activeSection={activeSection}
        sections={sections}
        loading={loading}
        onSaveCurrentSection={onSaveCurrentSection}
        onGoToNextSection={onGoToNextSection}
      />

      <div className="space-y-4">
        <p className="text-sm text-gray-600 mb-6">
          Marque las enfermedades que han tenido familiares del paciente e indique qué familiares fueron afectados.
        </p>

        {defaultFamilyHistoryDiseases.map((disease) => {
          const diseaseStatus = getDiseaseStatus(disease)
          const isChecked = !!diseaseStatus

          return (
            <div key={disease} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-4">
                <div className="flex items-center pt-1">
                  <input
                    type="checkbox"
                    id={`family_${disease}`}
                    checked={isChecked}
                    onChange={(e) => onFamilyHistoryCheck(disease, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex-1">
                  <label
                    htmlFor={`family_${disease}`}
                    className="block font-medium text-gray-900 mb-2 cursor-pointer"
                  >
                    {disease}
                  </label>

                  {isChecked && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Familiares afectados:
                        </label>
                        <MultiSelectChips
                          value={diseaseStatus?.family_members || []}
                          onChange={(members) => onFamilyMembersChange(disease, members)}
                          suggestions={familyMembersOptions}
                          placeholder="Seleccionar familiares afectados..."
                          allowCustom={true}
                        />
                      </div>

                      {disease === 'Dislipidemia' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de dislipidemia:
                          </label>
                          <MultiSelectChips
                            value={diseaseStatus?.dyslipidemia_types || []}
                            onChange={(types) => onDyslipidemiaTypeChange(disease, types)}
                            suggestions={dyslipidemiaTypes}
                            placeholder="Seleccionar tipo(s) de dislipidemia..."
                            allowCustom={true}
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Detalles adicionales:
                        </label>
                        <textarea
                          value={diseaseStatus?.details || ''}
                          onChange={(e) => onFamilyDetailsChange(disease, e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={disease === 'Dislipidemia'
                            ? "Edad de diagnóstico, valores de colesterol/triglicéridos, tratamientos, medicamentos (estatinas, etc.)..."
                            : "Edad de diagnóstico, tipo específico de enfermedad, etc..."
                          }
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
  )
}