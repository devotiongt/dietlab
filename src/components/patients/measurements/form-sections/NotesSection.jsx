import { FileText } from 'lucide-react'

export default function NotesSection({ formData, onChange }) {
  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="flex items-center mb-4">
        <FileText className="h-6 w-6 text-orange-600 mr-3" />
        <h3 className="text-lg font-semibold text-gray-900">Notas de la Medición</h3>
      </div>
      <textarea
        name="notes"
        value={formData.notes}
        onChange={onChange}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Observaciones, condiciones especiales, resultados de la evaluación..."
      />
    </div>
  )
}