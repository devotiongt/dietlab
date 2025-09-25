import { Ruler } from 'lucide-react'

export default function CircumferencesSection({ formData, errors, onChange }) {
  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="flex items-center mb-6">
        <Ruler className="h-6 w-6 text-purple-600 mr-3" />
        <h3 className="text-lg font-semibold text-gray-900">Circunferencias (cm)</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cintura
          </label>
          <input
            type="number"
            name="waist_circumference"
            step="0.1"
            min="10"
            max="300"
            value={formData.waist_circumference}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.waist_circumference ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="80.5"
          />
          {errors.waist_circumference && (
            <p className="mt-1 text-sm text-red-600">{errors.waist_circumference}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cadera
          </label>
          <input
            type="number"
            name="hip_circumference"
            step="0.1"
            min="10"
            max="300"
            value={formData.hip_circumference}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.hip_circumference ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="95.0"
          />
          {errors.hip_circumference && (
            <p className="mt-1 text-sm text-red-600">{errors.hip_circumference}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pecho
          </label>
          <input
            type="number"
            name="chest_circumference"
            step="0.1"
            min="10"
            max="300"
            value={formData.chest_circumference}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.chest_circumference ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="100.0"
          />
          {errors.chest_circumference && (
            <p className="mt-1 text-sm text-red-600">{errors.chest_circumference}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brazo
          </label>
          <input
            type="number"
            name="arm_circumference"
            step="0.1"
            min="10"
            max="300"
            value={formData.arm_circumference}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.arm_circumference ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="30.0"
          />
          {errors.arm_circumference && (
            <p className="mt-1 text-sm text-red-600">{errors.arm_circumference}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Muslo
          </label>
          <input
            type="number"
            name="thigh_circumference"
            step="0.1"
            min="10"
            max="300"
            value={formData.thigh_circumference}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.thigh_circumference ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="55.0"
          />
          {errors.thigh_circumference && (
            <p className="mt-1 text-sm text-red-600">{errors.thigh_circumference}</p>
          )}
        </div>
      </div>
    </div>
  )
}