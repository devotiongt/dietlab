import { Target, FileText } from 'lucide-react'

export default function GoalsAndNotesSection({
  formData,
  errors,
  handleChange
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-6">
        <Target className="h-6 w-6 text-purple-600 mr-3" />
        <h2 className="text-lg font-semibold text-gray-900">Objetivos</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">
            Objetivo Principal
          </label>
          <textarea
            id="goal"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Describe el objetivo principal del paciente (ej: perder peso, ganar masa muscular, mejorar hábitos alimenticios...)"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            <FileText className="inline h-4 w-4 mr-1" />
            Notas Adicionales
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Cualquier información adicional relevante..."
          />
        </div>
      </div>
    </div>
  )
}