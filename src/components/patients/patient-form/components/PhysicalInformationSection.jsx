import { Ruler, Weight } from 'lucide-react'

export default function PhysicalInformationSection({
  formData,
  errors,
  handleChange,
  isEditing
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-6">
        <Ruler className="h-6 w-6 text-blue-600 mr-3" />
        <h2 className="text-lg font-semibold text-gray-900">Información Física</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
            Altura (cm)
          </label>
          <div className="relative">
            <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="number"
              id="height"
              name="height"
              value={formData.height}
              onChange={handleChange}
              min="50"
              max="250"
              step="0.1"
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.height ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="170"
            />
          </div>
          {errors.height && (
            <p className="mt-1 text-sm text-red-600">{errors.height}</p>
          )}
        </div>

        {/* Peso - Solo modo lectura en edición, no mostrar en creación */}
        {isEditing && formData.weight && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Peso Actual (kg)
            </label>
            <div className="relative">
              <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={`${formData.weight} kg`}
                readOnly
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              El peso se actualiza automáticamente con las mediciones
            </p>
          </div>
        )}
      </div>
    </div>
  )
}