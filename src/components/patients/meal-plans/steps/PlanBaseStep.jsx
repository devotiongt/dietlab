import React, { useMemo, useState } from 'react';
import { Calendar, Calculator, AlertCircle, Info, BookOpen } from 'lucide-react';
import { mealPlansApi } from '../../../../lib/meal-plans';
import WeekSelectorCalendar from '../components/WeekSelectorCalendar';

export default function PlanBaseStep({ formData, foodGroups, patient, errors, onChange }) {
  const [showReference, setShowReference] = useState(false);

  // Calculate macros in grams and calories
  const macroTargets = useMemo(() => {
    return mealPlansApi.calculateMacros(
      formData.vet_calories,
      formData.protein_percentage,
      formData.carbs_percentage,
      formData.fat_percentage
    );
  }, [formData.vet_calories, formData.protein_percentage, formData.carbs_percentage, formData.fat_percentage]);

  // Calculate totals from selected portions
  const portionTotals = useMemo(() => {
    return mealPlansApi.calculatePortionTotals(formData.food_portions, foodGroups);
  }, [formData.food_portions, foodGroups]);

  // Calculate adequacy percentages
  const adequacy = useMemo(() => {
    return {
      calories: mealPlansApi.calculateAdequacy(portionTotals.totalCalories, formData.vet_calories),
      protein: mealPlansApi.calculateAdequacy(portionTotals.totalProtein, macroTargets.protein.grams),
      carbs: mealPlansApi.calculateAdequacy(portionTotals.totalCarbs, macroTargets.carbs.grams),
      fat: mealPlansApi.calculateAdequacy(portionTotals.totalFat, macroTargets.fat.grams)
    };
  }, [portionTotals, formData.vet_calories, macroTargets]);

  const handleMacroChange = (macro, value) => {
    const numValue = parseFloat(value) || 0;
    const updates = { [`${macro}_percentage`]: numValue };
    onChange(updates);
  };

  const handlePortionChange = (groupId, value) => {
    const numValue = parseFloat(value) || 0;
    onChange({
      food_portions: {
        ...formData.food_portions,
        [groupId]: numValue
      }
    });
  };

  const getAdequacyColor = (percentage) => {
    if (percentage >= 95 && percentage <= 105) return 'text-green-600 bg-green-50';
    if (percentage >= 90 && percentage <= 110) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-8">
      {/* General Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-gray-500" />
          Duración del Plan
        </h3>

        {/* Week Selector Calendar */}
        <WeekSelectorCalendar
          selectedWeeks={formData.selectedWeeks || []}
          startDate={formData.start_date}
          onWeeksChange={(weeks, startDate, endDate, duration) => {
            onChange({
              selectedWeeks: weeks,
              start_date: startDate,
              end_date: endDate,
              weeks_duration: duration
            });
          }}
          errors={errors}
        />
      </div>

      {/* VET and Macros */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Calculator className="h-5 w-5 mr-2 text-gray-500" />
          Valor Energético Total y Macronutrientes
        </h3>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <div className="flex items-center">
            <Info className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <span className="font-medium">Configuración:</span> Define VET y porcentajes de macros. Los gramos se calculan automáticamente según el peso del paciente.
            </div>
          </div>
        </div>

        {/* VET and Patient Weight */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* VET Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor Energético Total (VET) *
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                min="500"
                max="5000"
                step="50"
                value={formData.vet_calories}
                onChange={(e) => onChange({ vet_calories: parseInt(e.target.value) || 0 })}
                className={`w-32 px-3 py-2 border rounded-md text-center font-medium ${errors.vet_calories ? 'border-red-500' : 'border-gray-300'}`}
              />
              <span className="text-sm text-gray-600">kcal/día</span>
            </div>
            {errors.vet_calories && <p className="text-red-500 text-xs mt-1">{errors.vet_calories}</p>}
          </div>

          {/* Patient Weight Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Peso del Paciente
            </label>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-blue-600">
                    {patient?.weight ? `${patient.weight} kg` : 'No registrado'}
                  </span>
                </div>
                {!patient?.weight && (
                  <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    <AlertCircle className="h-3 w-3 inline mr-1" />
                    Sin peso
                  </div>
                )}
              </div>
            </div>
            {!patient?.weight && (
              <p className="text-xs text-gray-500 mt-1">Los cálculos g/kg no estarán disponibles en la tabla</p>
            )}
          </div>
        </div>

        {/* Macronutrients Table */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Macronutriente
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Porcentaje (%)
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calorías (kcal)
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gramos (g)
                  </th>
                  {patient?.weight && (
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      g/kg peso
                      <div className="text-xs normal-case text-gray-400 font-normal">
                        (Base: {patient.weight} kg)
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Proteínas */}
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-red-500 rounded-full mr-3"></div>
                      <div className="text-sm font-medium text-gray-900">Proteínas</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formData.protein_percentage}
                      onChange={(e) => handleMacroChange('protein', e.target.value)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                    {macroTargets.protein.calories.toFixed(0)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                    {macroTargets.protein.grams.toFixed(1)}
                  </td>
                  {patient?.weight && (
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                      {(macroTargets.protein.grams / patient.weight).toFixed(2)}
                    </td>
                  )}
                </tr>

                {/* Carbohidratos */}
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-green-500 rounded-full mr-3"></div>
                      <div className="text-sm font-medium text-gray-900">Carbohidratos</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formData.carbs_percentage}
                      onChange={(e) => handleMacroChange('carbs', e.target.value)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                    {macroTargets.carbs.calories.toFixed(0)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                    {macroTargets.carbs.grams.toFixed(1)}
                  </td>
                  {patient?.weight && (
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                      {(macroTargets.carbs.grams / patient.weight).toFixed(2)}
                    </td>
                  )}
                </tr>

                {/* Grasas */}
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-yellow-500 rounded-full mr-3"></div>
                      <div className="text-sm font-medium text-gray-900">Grasas</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formData.fat_percentage}
                      onChange={(e) => handleMacroChange('fat', e.target.value)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                    {macroTargets.fat.calories.toFixed(0)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                    {macroTargets.fat.grams.toFixed(1)}
                  </td>
                  {patient?.weight && (
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                      {(macroTargets.fat.grams / patient.weight).toFixed(2)}
                    </td>
                  )}
                </tr>

                {/* Total Row */}
                <tr className="bg-gray-50 font-medium">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">TOTAL</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className={`text-sm font-bold ${
                      Math.abs((formData.protein_percentage + formData.carbs_percentage + formData.fat_percentage) - 100) < 0.1
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {(formData.protein_percentage + formData.carbs_percentage + formData.fat_percentage).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">
                    {formData.vet_calories}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">
                    {(macroTargets.protein.grams + macroTargets.carbs.grams + macroTargets.fat.grams).toFixed(1)}
                  </td>
                  {patient?.weight && (
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-600">
                      {((macroTargets.protein.grams + macroTargets.carbs.grams + macroTargets.fat.grams) / patient.weight).toFixed(2)}
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Validation Messages */}
        <div className="mt-4 space-y-2">
          {errors.macros && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              {errors.macros}
            </div>
          )}

          {Math.abs((formData.protein_percentage + formData.carbs_percentage + formData.fat_percentage) - 100) < 0.1 && (
            <div className="flex items-center text-green-600 text-sm">
              <div className="h-4 w-4 mr-2 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-green-600"></div>
              </div>
              Los porcentajes suman correctamente 100%
            </div>
          )}
        </div>
      </div>

      {/* Food Groups Portions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-gray-500" />
            Asignación de Porciones Diarias
          </h3>
          <button
            type="button"
            onClick={() => setShowReference(!showReference)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <BookOpen className="h-4 w-4 mr-1.5" />
            {showReference ? 'Ocultar' : 'Mostrar'} Ref
          </button>
        </div>

        {/* Warning if macros don't sum to 100% */}
        {Math.abs((formData.protein_percentage + formData.carbs_percentage + formData.fat_percentage) - 100) > 0.1 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  No puedes asignar porciones aún
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Los porcentajes de macronutrientes deben sumar exactamente 100%.
                  Actualmente suman {(formData.protein_percentage + formData.carbs_percentage + formData.fat_percentage).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}

        <div className={`overflow-x-auto ${
          Math.abs((formData.protein_percentage + formData.carbs_percentage + formData.fat_percentage) - 100) > 0.1
            ? 'opacity-50'
            : ''
        }`}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grupo</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Porciones</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total kcal</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Proteína (g)</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Carbs (g)</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Grasa (g)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {foodGroups.map(group => {
                const portions = formData.food_portions[group.id] || 0;
                const totalCalories = portions * group.calories_per_portion;
                const totalProtein = portions * group.protein_per_portion;
                const totalCarbs = portions * group.carbs_per_portion;
                const totalFat = portions * group.fat_per_portion;

                return (
                  <tr key={group.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{group.name}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={portions}
                        onChange={(e) => handlePortionChange(group.id, e.target.value)}
                        disabled={Math.abs((formData.protein_percentage + formData.carbs_percentage + formData.fat_percentage) - 100) > 0.1}
                        className={`w-20 px-2 py-1 border rounded text-sm text-center ${
                          Math.abs((formData.protein_percentage + formData.carbs_percentage + formData.fat_percentage) - 100) > 0.1
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        }`}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-medium">
                          {totalCalories.toFixed(0)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 transition-all duration-300 ease-in-out transform ${
                          showReference ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-75 -translate-x-2 w-0'
                        }`}>
                          {group.calories_per_portion}/p
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-gray-600">
                          {totalProtein.toFixed(1)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 transition-all duration-300 ease-in-out transform ${
                          showReference ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-75 -translate-x-2 w-0'
                        }`}>
                          {group.protein_per_portion}/p
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-gray-600">
                          {totalCarbs.toFixed(1)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 transition-all duration-300 ease-in-out transform ${
                          showReference ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-75 -translate-x-2 w-0'
                        }`}>
                          {group.carbs_per_portion}/p
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-gray-600">
                          {totalFat.toFixed(1)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 transition-all duration-300 ease-in-out transform ${
                          showReference ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-75 -translate-x-2 w-0'
                        }`}>
                          {group.fat_per_portion}/p
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                  <td colSpan="2" className="px-4 py-3 text-sm font-medium text-gray-900">
                    TOTALES
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-sm font-bold ${
                        adequacy.calories >= 95 && adequacy.calories <= 105 ? 'text-green-600' :
                        adequacy.calories >= 90 && adequacy.calories <= 110 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {portionTotals.totalCalories.toFixed(0)}
                      </span>
                      <span className={`text-xs font-medium ${
                        adequacy.calories >= 95 && adequacy.calories <= 105 ? 'text-green-600' :
                        adequacy.calories >= 90 && adequacy.calories <= 110 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        ({adequacy.calories.toFixed(0)}%)
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-sm font-bold ${
                        adequacy.protein >= 95 && adequacy.protein <= 105 ? 'text-green-600' :
                        adequacy.protein >= 90 && adequacy.protein <= 110 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {portionTotals.totalProtein.toFixed(1)}
                      </span>
                      <span className={`text-xs font-medium ${
                        adequacy.protein >= 95 && adequacy.protein <= 105 ? 'text-green-600' :
                        adequacy.protein >= 90 && adequacy.protein <= 110 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        ({adequacy.protein.toFixed(0)}%)
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-sm font-bold ${
                        adequacy.carbs >= 95 && adequacy.carbs <= 105 ? 'text-green-600' :
                        adequacy.carbs >= 90 && adequacy.carbs <= 110 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {portionTotals.totalCarbs.toFixed(1)}
                      </span>
                      <span className={`text-xs font-medium ${
                        adequacy.carbs >= 95 && adequacy.carbs <= 105 ? 'text-green-600' :
                        adequacy.carbs >= 90 && adequacy.carbs <= 110 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        ({adequacy.carbs.toFixed(0)}%)
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-sm font-bold ${
                        adequacy.fat >= 95 && adequacy.fat <= 105 ? 'text-green-600' :
                        adequacy.fat >= 90 && adequacy.fat <= 110 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {portionTotals.totalFat.toFixed(1)}
                      </span>
                      <span className={`text-xs font-medium ${
                        adequacy.fat >= 95 && adequacy.fat <= 105 ? 'text-green-600' :
                        adequacy.fat >= 90 && adequacy.fat <= 110 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        ({adequacy.fat.toFixed(0)}%)
                      </span>
                    </div>
                  </td>
                </tr>
              </tfoot>
          </table>
        </div>

        {/* Additional Validation Messages */}
        <div className="mt-4 space-y-2">
          {errors.portions && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              {errors.portions}
            </div>
          )}
          {errors.adequacy && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              {errors.adequacy}
            </div>
          )}
        </div>
      </div>

      {/* Adequacy Legend */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-amber-900 mb-2 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          Leyenda de Adecuación
        </h4>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <p className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            95-105% = Óptimo
          </p>
          <p className="flex items-center">
            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            90-110% = Aceptable
          </p>
          <p className="flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            &lt;90% o &gt;110% = Requiere ajuste
          </p>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Info className="h-4 w-4 mr-2 text-gray-500" />
          Notas Adicionales (opcional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Notas adicionales sobre el plan, consideraciones especiales, objetivos..."
        />
      </div>
    </div>
  );
}