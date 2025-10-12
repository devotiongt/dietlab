import React, { useState, useMemo, useEffect } from 'react';
import { Clock, Utensils, AlertCircle, CheckCircle, Copy, Calendar, Coffee, Sun, Moon, Sandwich } from 'lucide-react';

const MEAL_TIMES = [
  { id: 'breakfast', name: 'Desayuno', shortName: 'Des', icon: Sun, color: 'bg-orange-100 text-orange-600', gradient: 'from-orange-50 to-yellow-50' },
  { id: 'morning_snack', name: 'Colación Matutina', shortName: 'C.M.', icon: Coffee, color: 'bg-amber-100 text-amber-600', gradient: 'from-amber-50 to-orange-50' },
  { id: 'lunch', name: 'Almuerzo', shortName: 'Alm', icon: Utensils, color: 'bg-emerald-100 text-emerald-600', gradient: 'from-emerald-50 to-green-50' },
  { id: 'afternoon_snack', name: 'Colación Vespertina', shortName: 'C.V.', icon: Sandwich, color: 'bg-blue-100 text-blue-600', gradient: 'from-blue-50 to-indigo-50' },
  { id: 'dinner', name: 'Cena', shortName: 'Cena', icon: Moon, color: 'bg-purple-100 text-purple-600', gradient: 'from-purple-50 to-indigo-50' }
];

export default function MealDistributionStep({ formData, foodGroups, errors, onChange }) {
  // Current selected week (0-indexed)
  const [selectedWeek, setSelectedWeek] = useState(0);

  // Initialize meal distribution if not exists - now structured by week
  const mealDistribution = formData.meal_distribution || {};

  // Generate weeks array based on plan duration
  const weeks = useMemo(() => {
    const weeksArray = [];
    for (let i = 0; i < (formData.weeks_duration || 1); i++) {
      const weekStart = new Date(formData.start_date);
      weekStart.setDate(weekStart.getDate() + (i * 7));
      weeksArray.push({
        index: i,
        name: `Semana ${i + 1}`,
        startDate: weekStart.toLocaleDateString('es-GT', {
          day: 'numeric',
          month: 'short'
        })
      });
    }
    return weeksArray;
  }, [formData.weeks_duration, formData.start_date]);

  // Default values for week 1 (first week)
  const getDefaultValues = () => {
    // Create a mapping from food group names to their IDs
    const groupIdMap = {};
    foodGroups.forEach(group => {
      switch (group.name) {
        case 'Leche':
          groupIdMap.leche = group.id;
          break;
        case 'Incaparina':
          groupIdMap.incaparina = group.id;
          break;
        case 'Vegetales':
          groupIdMap.vegetales = group.id;
          break;
        case 'Frutas':
          groupIdMap.frutas = group.id;
          break;
        case 'Cereales':
          groupIdMap.cereales = group.id;
          break;
        case 'Carnes':
          groupIdMap.carnes = group.id;
          break;
        case 'Grasas':
          groupIdMap.grasas = group.id;
          break;
        case 'Azúcares':
        case 'Azucares':
        case 'Azúcar':
        case 'Azucar':
          groupIdMap.azucar = group.id;
          break;
      }
    });

    return {
      breakfast: {
        [groupIdMap.leche]: 0,
        [groupIdMap.incaparina]: 0,
        [groupIdMap.vegetales]: 3,
        [groupIdMap.frutas]: 0,
        [groupIdMap.cereales]: 2,
        [groupIdMap.carnes]: 2,
        [groupIdMap.grasas]: 1,
        [groupIdMap.azucar]: 0
      },
      morning_snack: {
        [groupIdMap.leche]: 0,
        [groupIdMap.incaparina]: 1,
        [groupIdMap.vegetales]: 0,
        [groupIdMap.frutas]: 2,
        [groupIdMap.cereales]: 0,
        [groupIdMap.carnes]: 0,
        [groupIdMap.grasas]: 0,
        [groupIdMap.azucar]: 1
      },
      lunch: {
        [groupIdMap.leche]: 0,
        [groupIdMap.incaparina]: 0,
        [groupIdMap.vegetales]: 4,
        [groupIdMap.frutas]: 1,
        [groupIdMap.cereales]: 2,
        [groupIdMap.carnes]: 5,
        [groupIdMap.grasas]: 1,
        [groupIdMap.azucar]: 0
      },
      afternoon_snack: {
        [groupIdMap.leche]: 0,
        [groupIdMap.incaparina]: 1,
        [groupIdMap.vegetales]: 0,
        [groupIdMap.frutas]: 2,
        [groupIdMap.cereales]: 1,
        [groupIdMap.carnes]: 0,
        [groupIdMap.grasas]: 0,
        [groupIdMap.azucar]: 1
      },
      dinner: {
        [groupIdMap.leche]: 0,
        [groupIdMap.incaparina]: 0,
        [groupIdMap.vegetales]: 3,
        [groupIdMap.frutas]: 0,
        [groupIdMap.cereales]: 2,
        [groupIdMap.carnes]: 2,
        [groupIdMap.grasas]: 0,
        [groupIdMap.azucar]: 0
      }
    };
  };

  // Initialize week 0 with default values if empty
  useEffect(() => {
    if (foodGroups.length > 0 && (!mealDistribution[`week_0`] || Object.keys(mealDistribution[`week_0`]).length === 0)) {
      const defaultValues = getDefaultValues();
      const newDistribution = {
        ...mealDistribution,
        [`week_0`]: defaultValues
      };
      onChange({ meal_distribution: newDistribution });
    }
  }, [mealDistribution, onChange, foodGroups]);

  // Auto-clone from previous week when switching to a new week
  useEffect(() => {
    if (selectedWeek > 0 && !mealDistribution[`week_${selectedWeek}`]) {
      const previousWeekData = mealDistribution[`week_${selectedWeek - 1}`];
      if (previousWeekData) {
        const newDistribution = {
          ...mealDistribution,
          [`week_${selectedWeek}`]: { ...previousWeekData }
        };
        onChange({ meal_distribution: newDistribution });
      }
    }
  }, [selectedWeek, mealDistribution, onChange]);

  // Get current week's distribution
  const currentWeekDistribution = mealDistribution[`week_${selectedWeek}`] || {};

  // Calculate totals for each food group across all meal times for current week
  const totals = useMemo(() => {
    const calculatedTotals = {};

    foodGroups.forEach(group => {
      let total = 0;
      MEAL_TIMES.forEach(mealTime => {
        const value = currentWeekDistribution[mealTime.id]?.[group.id] || 0;
        total += parseFloat(value) || 0;
      });
      calculatedTotals[group.id] = total;
    });

    return calculatedTotals;
  }, [currentWeekDistribution, foodGroups]);

  // Check if totals match the daily portions from step 1 for current week
  const isCurrentWeekValid = useMemo(() => {
    return foodGroups.every(group => {
      const expectedPortions = formData.food_portions?.[group.id] || 0;
      const actualTotal = totals[group.id] || 0;
      return Math.abs(expectedPortions - actualTotal) < 0.1; // Allow small floating point differences
    });
  }, [totals, formData.food_portions, foodGroups]);

  // Check if ALL weeks are valid
  const isAllWeeksValid = useMemo(() => {
    return weeks.every(week => {
      const weekDistribution = mealDistribution[`week_${week.index}`] || {};
      return foodGroups.every(group => {
        const expectedPortions = formData.food_portions?.[group.id] || 0;
        let actualTotal = 0;
        MEAL_TIMES.forEach(mealTime => {
          const value = weekDistribution[mealTime.id]?.[group.id] || 0;
          actualTotal += parseFloat(value) || 0;
        });
        return Math.abs(expectedPortions - actualTotal) < 0.1;
      });
    });
  }, [weeks, mealDistribution, formData.food_portions, foodGroups]);

  const handlePortionChange = (mealTimeId, foodGroupId, value) => {
    const newWeekDistribution = {
      ...currentWeekDistribution,
      [mealTimeId]: {
        ...currentWeekDistribution[mealTimeId],
        [foodGroupId]: parseFloat(value) || 0
      }
    };

    const newDistribution = {
      ...mealDistribution,
      [`week_${selectedWeek}`]: newWeekDistribution
    };

    onChange({ meal_distribution: newDistribution });
  };

  const copyFromPreviousWeek = () => {
    if (selectedWeek > 0) {
      const previousWeekData = mealDistribution[`week_${selectedWeek - 1}`];
      if (previousWeekData) {
        const newDistribution = {
          ...mealDistribution,
          [`week_${selectedWeek}`]: { ...previousWeekData }
        };
        onChange({ meal_distribution: newDistribution });
      }
    }
  };

  const getStatusIcon = (groupId) => {
    const expected = formData.food_portions?.[groupId] || 0;
    const actual = totals[groupId] || 0;
    const isMatch = Math.abs(expected - actual) < 0.1;

    if (expected === 0 && actual === 0) {
      return <div className="w-5 h-5" />; // Empty space
    }

    return isMatch ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <AlertCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getRowStyles = (groupId) => {
    const expected = formData.food_portions?.[groupId] || 0;
    const actual = totals[groupId] || 0;
    const isMatch = Math.abs(expected - actual) < 0.1;

    if (expected === 0 && actual === 0) {
      return "bg-gray-50";
    }

    return isMatch ? "bg-green-50" : "bg-red-50";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-100 rounded-2xl p-8 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                Distribución por Tiempos de Comida
              </h3>
              <p className="text-gray-600 max-w-2xl">
                Distribuye las porciones diarias en cada tiempo de comida para cada semana del plan
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex flex-col items-end">
            <div className="text-sm text-gray-500 mb-1">Progreso total</div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                  style={{ width: `${isAllWeeksValid ? 100 : (Object.keys(mealDistribution).length / weeks.length) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {Math.round(isAllWeeksValid ? 100 : (Object.keys(mealDistribution).length / weeks.length) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Week Selector */}
        {weeks.length > 1 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-600" />
                Seleccionar Semana
              </h4>
              {selectedWeek > 0 && (
                <button
                  onClick={copyFromPreviousWeek}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-all duration-200"
                >
                  <Copy className="h-3 w-3 mr-1.5" />
                  Copiar de Semana {selectedWeek}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {weeks.map((week) => {
                const weekDistribution = mealDistribution[`week_${week.index}`] || {};
                const hasData = Object.keys(weekDistribution).length > 0;
                const isWeekValid = foodGroups.every(group => {
                  const expectedPortions = formData.food_portions?.[group.id] || 0;
                  let actualTotal = 0;
                  MEAL_TIMES.forEach(mealTime => {
                    const value = weekDistribution[mealTime.id]?.[group.id] || 0;
                    actualTotal += parseFloat(value) || 0;
                  });
                  return Math.abs(expectedPortions - actualTotal) < 0.1;
                });

                return (
                  <button
                    key={week.index}
                    onClick={() => setSelectedWeek(week.index)}
                    className={`relative px-4 py-2.5 rounded-xl border transition-all duration-200 hover:scale-102 shadow-sm hover:shadow-md ${
                      selectedWeek === week.index
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-indigo-500 shadow-md scale-102'
                        : hasData
                        ? isWeekValid
                          ? 'bg-gradient-to-br from-green-50 to-emerald-50 text-green-700 border-green-200 hover:border-green-300'
                          : 'bg-gradient-to-br from-red-50 to-rose-50 text-red-700 border-red-200 hover:border-red-300'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-sm">{week.name}</span>
                      <span className="text-xs opacity-75 mt-0.5">{week.startDate}</span>
                    </div>
                    {hasData && (
                      <div className="absolute -top-0.5 -right-0.5">
                        {isWeekValid ? (
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-2.5 w-2.5 text-white" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <AlertCircle className="h-2.5 w-2.5 text-white" />
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Compact Validation Alerts */}
        {(!isCurrentWeekValid || (!isAllWeeksValid && weeks.length > 1)) && (
          <div className="flex flex-wrap gap-3 mb-4">
            {!isCurrentWeekValid && (
              <div className="inline-flex items-center px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 text-amber-600 mr-2 flex-shrink-0" />
                <span className="text-amber-800 font-medium">
                  {weeks[selectedWeek]?.name}: Porciones no coinciden
                </span>
              </div>
            )}

            {!isAllWeeksValid && weeks.length > 1 && (
              <div className="inline-flex items-center px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 text-orange-600 mr-2 flex-shrink-0" />
                <span className="text-orange-800 font-medium">
                  Algunas semanas incompletas
                </span>
              </div>
            )}
          </div>
        )}

        {/* Distribution Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <th className="text-left py-6 px-6 font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      Grupo de Alimento
                    </div>
                  </th>
                  {MEAL_TIMES.map(mealTime => {
                    const IconComponent = mealTime.icon;
                    return (
                      <th key={mealTime.id} className="text-center py-6 px-4 font-semibold text-gray-900 align-top">
                        <div className="flex flex-col items-center gap-2 h-full">
                          <div className={`p-2 rounded-xl ${mealTime.color}`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="text-center min-h-[2.5rem] flex items-start justify-center">
                            <div className="text-sm font-semibold leading-tight">{mealTime.name}</div>
                          </div>
                        </div>
                      </th>
                    );
                  })}
                  <th className="text-center py-6 px-6 font-semibold text-gray-900">
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-sm font-semibold">Total</div>
                      <div className="text-xs text-gray-500">Distribuido</div>
                    </div>
                  </th>
                  <th className="text-center py-6 px-6 font-semibold text-gray-900">
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-sm font-semibold">Meta</div>
                      <div className="text-xs text-gray-500">Paso 1</div>
                    </div>
                  </th>
                  <th className="text-center py-6 px-6 font-semibold text-gray-900">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {foodGroups.map((group, index) => {
                  const expectedPortions = formData.food_portions?.[group.id] || 0;
                  const actualTotal = totals[group.id] || 0;
                  const isMatch = Math.abs(expectedPortions - actualTotal) < 0.1;

                  return (
                    <tr key={group.id} className={`transition-all duration-200 hover:bg-gray-50 ${
                      expectedPortions === 0 && actualTotal === 0
                        ? 'opacity-60'
                        : isMatch
                        ? 'bg-green-50/30'
                        : 'bg-red-50/30'
                    }`}>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full shadow-sm"
                            style={{ backgroundColor: group.color || '#6B7280' }}
                          />
                          <span className="font-semibold text-gray-900">{group.name}</span>
                        </div>
                      </td>

                      {/* Input cells for each meal time */}
                      {MEAL_TIMES.map(mealTime => (
                        <td key={mealTime.id} className="py-5 px-4 text-center">
                          <div className={`bg-gradient-to-br ${mealTime.gradient} rounded-xl p-1`}>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={currentWeekDistribution[mealTime.id]?.[group.id] || ''}
                              onChange={(e) => handlePortionChange(mealTime.id, group.id, e.target.value)}
                              className="w-16 px-3 py-2 border-0 bg-white/80 backdrop-blur-sm rounded-lg text-sm text-center font-semibold focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all duration-200 shadow-sm"
                              placeholder="0"
                            />
                          </div>
                        </td>
                      ))}

                      {/* Total column */}
                      <td className="py-5 px-6 text-center">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100">
                          <span className="font-bold text-gray-900 text-lg">
                            {actualTotal.toFixed(1)}
                          </span>
                        </div>
                      </td>

                      {/* Expected column */}
                      <td className="py-5 px-6 text-center">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100">
                          <span className="font-bold text-indigo-700 text-lg">
                            {expectedPortions.toFixed(1)}
                          </span>
                        </div>
                      </td>

                      {/* Status column */}
                      <td className="py-5 px-6 text-center">
                        <div className="flex justify-center">
                          {expectedPortions === 0 && actualTotal === 0 ? (
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">—</span>
                            </div>
                          ) : isMatch ? (
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                              <AlertCircle className="w-5 h-5 text-red-600" />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Resumen de {weeks[selectedWeek]?.name}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Utensils className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Grupos configurados</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {foodGroups.filter(g => (formData.food_portions?.[g.id] || 0) > 0).length}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Grupos distribuidos</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {foodGroups.filter(g => (totals[g.id] || 0) > 0).length}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isAllWeeksValid ? 'bg-green-100' : 'bg-red-100'}`}>
                  {isAllWeeksValid ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-600">Estado</div>
                  <div className={`text-2xl font-bold ${isAllWeeksValid ? 'text-green-600' : 'text-red-600'}`}>
                    {isAllWeeksValid ? 'Completo' : 'Incompleto'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}