import { Activity } from 'lucide-react'

export default function MetabolicEvaluationSection({ formData, errors, onChange }) {
  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="flex items-center mb-6">
        <Activity className="h-6 w-6 text-blue-600 mr-3" />
        <h3 className="text-lg font-semibold text-gray-900">Evaluación Metabólica</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valoración Física (1-9)
          </label>
          <input
            type="number"
            name="physical_rating"
            min="1"
            max="9"
            value={formData.physical_rating}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.physical_rating ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="5"
          />
          {errors.physical_rating && (
            <p className="mt-1 text-sm text-red-600">{errors.physical_rating}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calorías Necesarias/día
          </label>
          <input
            type="number"
            name="calories_needed"
            min="500"
            max="10000"
            value={formData.calories_needed}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.calories_needed ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="2000"
          />
          {errors.calories_needed && (
            <p className="mt-1 text-sm text-red-600">{errors.calories_needed}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Edad Metabólica (años)
          </label>
          <input
            type="number"
            name="metabolic_age"
            min="10"
            max="150"
            value={formData.metabolic_age}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.metabolic_age ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="25"
          />
          {errors.metabolic_age && (
            <p className="mt-1 text-sm text-red-600">{errors.metabolic_age}</p>
          )}
        </div>
      </div>
    </div>
  )
}