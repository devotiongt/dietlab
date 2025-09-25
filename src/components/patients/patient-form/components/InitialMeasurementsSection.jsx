import { Weight } from 'lucide-react'

export default function InitialMeasurementsSection({
  formData,
  errors,
  handleChange
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Weight className="h-5 w-5 mr-2" />
        Medición Inicial
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Registra las medidas iniciales del paciente. Esto se guardará como su primera medición.
      </p>

      {/* Error general de medición inicial */}
      {errors.initial_measurement && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {errors.initial_measurement}
        </div>
      )}

      <div className="space-y-6">
        {/* Composición Corporal Inicial */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Composición Corporal</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso (kg)
              </label>
              <input
                type="number"
                name="initial_weight"
                step="0.1"
                min="10"
                max="500"
                value={formData.initial_weight}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.initial_weight ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="70.5"
              />
              {errors.initial_weight && (
                <p className="mt-1 text-sm text-red-600">{errors.initial_weight}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grasa Corporal (%)
              </label>
              <input
                type="number"
                name="initial_body_fat_percentage"
                step="0.1"
                min="0"
                max="100"
                value={formData.initial_body_fat_percentage}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.initial_body_fat_percentage ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="20.5"
              />
              {errors.initial_body_fat_percentage && (
                <p className="mt-1 text-sm text-red-600">{errors.initial_body_fat_percentage}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agua Corporal (%)
              </label>
              <input
                type="number"
                name="initial_water_percentage"
                step="0.1"
                min="0"
                max="100"
                value={formData.initial_water_percentage}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="60.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Masa Muscular (kg)
              </label>
              <input
                type="number"
                name="initial_muscle_mass"
                step="0.1"
                min="5"
                max="200"
                value={formData.initial_muscle_mass}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="30.2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Masa Ósea (kg)
              </label>
              <input
                type="number"
                name="initial_bone_mass"
                step="0.1"
                min="0.5"
                max="10"
                value={formData.initial_bone_mass}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2.8"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grasa Visceral (1-59)
              </label>
              <input
                type="number"
                name="initial_visceral_fat"
                min="1"
                max="59"
                value={formData.initial_visceral_fat}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="8"
              />
            </div>
          </div>
        </div>

        {/* Evaluación Metabólica Inicial */}
        <div className="bg-green-50 rounded-xl p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Evaluación Metabólica</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valoración Física (1-9)
              </label>
              <input
                type="number"
                name="initial_physical_rating"
                min="1"
                max="9"
                value={formData.initial_physical_rating}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.initial_physical_rating ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="5"
              />
              {errors.initial_physical_rating && (
                <p className="mt-1 text-sm text-red-600">{errors.initial_physical_rating}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calorías Necesarias/día
              </label>
              <input
                type="number"
                name="initial_calories_needed"
                min="500"
                max="10000"
                value={formData.initial_calories_needed}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edad Metabólica (años)
              </label>
              <input
                type="number"
                name="initial_metabolic_age"
                min="10"
                max="150"
                value={formData.initial_metabolic_age}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="25"
              />
            </div>
          </div>
        </div>

        {/* Circunferencias Corporales */}
        <div className="bg-purple-50 rounded-xl p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Circunferencias Corporales</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cintura (cm)
              </label>
              <input
                type="number"
                name="initial_waist_circumference"
                step="0.1"
                min="30"
                max="200"
                value={formData.initial_waist_circumference}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="75.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cadera (cm)
              </label>
              <input
                type="number"
                name="initial_hip_circumference"
                step="0.1"
                min="40"
                max="200"
                value={formData.initial_hip_circumference}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="95.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pecho (cm)
              </label>
              <input
                type="number"
                name="initial_chest_circumference"
                step="0.1"
                min="40"
                max="200"
                value={formData.initial_chest_circumference}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="90.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brazo (cm)
              </label>
              <input
                type="number"
                name="initial_arm_circumference"
                step="0.1"
                min="15"
                max="60"
                value={formData.initial_arm_circumference}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="28.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Muslo (cm)
              </label>
              <input
                type="number"
                name="initial_thigh_circumference"
                step="0.1"
                min="30"
                max="100"
                value={formData.initial_thigh_circumference}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="55.0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}