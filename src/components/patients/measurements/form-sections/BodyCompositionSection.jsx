import { Weight } from 'lucide-react'

export default function BodyCompositionSection({ formData, errors, onChange }) {
  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="flex items-center mb-6">
        <Weight className="h-6 w-6 text-green-600 mr-3" />
        <h3 className="text-lg font-semibold text-gray-900">Composición Corporal</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Peso (kg)
          </label>
          <input
            type="number"
            name="weight"
            step="0.1"
            min="10"
            max="500"
            value={formData.weight}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.weight ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="70.5"
          />
          {errors.weight && (
            <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grasa Corporal (%)
          </label>
          <input
            type="number"
            name="body_fat_percentage"
            step="0.1"
            min="0"
            max="100"
            value={formData.body_fat_percentage}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.body_fat_percentage ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="20.5"
          />
          {errors.body_fat_percentage && (
            <p className="mt-1 text-sm text-red-600">{errors.body_fat_percentage}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Agua Corporal (%)
          </label>
          <input
            type="number"
            name="water_percentage"
            step="0.1"
            min="0"
            max="100"
            value={formData.water_percentage}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.water_percentage ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="60.0"
          />
          {errors.water_percentage && (
            <p className="mt-1 text-sm text-red-600">{errors.water_percentage}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Masa Muscular (kg)
          </label>
          <input
            type="number"
            name="muscle_mass"
            step="0.1"
            min="5"
            max="200"
            value={formData.muscle_mass}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.muscle_mass ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="30.2"
          />
          {errors.muscle_mass && (
            <p className="mt-1 text-sm text-red-600">{errors.muscle_mass}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Masa Ósea (kg)
          </label>
          <input
            type="number"
            name="bone_mass"
            step="0.1"
            min="0.5"
            max="10"
            value={formData.bone_mass}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.bone_mass ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="2.8"
          />
          {errors.bone_mass && (
            <p className="mt-1 text-sm text-red-600">{errors.bone_mass}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grasa Visceral (1-59)
          </label>
          <input
            type="number"
            name="visceral_fat"
            min="1"
            max="59"
            value={formData.visceral_fat}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.visceral_fat ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="8"
          />
          {errors.visceral_fat && (
            <p className="mt-1 text-sm text-red-600">{errors.visceral_fat}</p>
          )}
        </div>
      </div>
    </div>
  )
}