import React, { useState, useMemo, useEffect } from 'react';
import { Utensils, Plus, Calendar, AlertCircle, CheckCircle, Clock, Search, Target, Copy } from 'lucide-react';
import { dishesApi } from '../../../../lib/dishes';
import DishSelectorSidebar from '../../../dishes/DishSelectorSidebar';

const MEAL_TIMES = [
  { id: 'breakfast', name: 'Desayuno', shortName: 'Des', icon: '🌅', color: 'bg-orange-100 text-orange-600' },
  { id: 'morning_snack', name: 'Colación Matutina', shortName: 'C.M.', icon: '☕', color: 'bg-amber-100 text-amber-600' },
  { id: 'lunch', name: 'Almuerzo', shortName: 'Alm', icon: '🍽️', color: 'bg-emerald-100 text-emerald-600' },
  { id: 'afternoon_snack', name: 'Colación Vespertina', shortName: 'C.V.', icon: '🥪', color: 'bg-blue-100 text-blue-600' },
  { id: 'dinner', name: 'Cena', shortName: 'Cena', icon: '🌙', color: 'bg-purple-100 text-purple-600' }
];

const DAYS_OF_WEEK = [
  { id: 1, name: 'Lunes', shortName: 'Lun' },
  { id: 2, name: 'Martes', shortName: 'Mar' },
  { id: 3, name: 'Miércoles', shortName: 'Mié' },
  { id: 4, name: 'Jueves', shortName: 'Jue' },
  { id: 5, name: 'Viernes', shortName: 'Vie' },
  { id: 6, name: 'Sábado', shortName: 'Sáb' },
  { id: 7, name: 'Domingo', shortName: 'Dom' }
];

export default function MealPlateConfigurationStep({ formData, foodGroups, errors, onChange, patient, clinicalHistory }) {
  // Current selected week (0-indexed)
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [showDishSelector, setShowDishSelector] = useState(false);
  const [selectorContext, setSelectorContext] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize meal plates if not exists - now structured: meal_plates[week_X][day_Y][meal_time]
  const mealPlates = formData.meal_plates || {};

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

  // Auto-clone from previous week when switching to a new week
  useEffect(() => {
    if (selectedWeek > 0 && !mealPlates[`week_${selectedWeek}`]) {
      const previousWeekData = mealPlates[`week_${selectedWeek - 1}`];
      if (previousWeekData) {
        const newMealPlates = {
          ...mealPlates,
          [`week_${selectedWeek}`]: JSON.parse(JSON.stringify(previousWeekData)) // Deep clone
        };
        onChange({ meal_plates: newMealPlates });
      }
    }
  }, [selectedWeek, mealPlates, onChange]);

  // Get current week's meal plates
  const currentWeekPlates = mealPlates[`week_${selectedWeek}`] || {};

  // Build patient context for dish creation
  const patientContext = useMemo(() => {
    if (!patient) return null;

    const parseJSON = (jsonStr, fallback = []) => {
      if (!jsonStr) return fallback;
      try { return JSON.parse(jsonStr); } catch { return fallback; }
    };

    const diseases = [];
    const allergies = [];

    if (clinicalHistory) {
      const personalHistory = parseJSON(clinicalHistory.personal_pathological_history);
      personalHistory.forEach(item => {
        if (item.disease?.toLowerCase().includes('alergia')) {
          allergies.push(item.notes || item.disease);
        } else if (item.disease) {
          diseases.push(item.disease);
        }
      });

      const giDisorders = parseJSON(clinicalHistory.gastrointestinal_disorders);
      giDisorders.forEach(item => {
        if (item.disorder || item.disease) {
          diseases.push(item.disorder || item.disease);
        }
      });

      const eatingHabits = parseJSON(clinicalHistory.eating_habits, {});
      const restricciones = eatingHabits.restricciones_suplementacion || {};
      if (restricciones.alergias_alimentarias?.length > 0) {
        allergies.push(...restricciones.alergias_alimentarias);
      }
      if (restricciones.intolerancias?.length > 0) {
        allergies.push(...restricciones.intolerancias.map(i => `Intolerancia: ${i}`));
      }
    }

    return {
      name: `${patient.first_name} ${patient.last_name}`,
      diseases: [...new Set(diseases)],
      allergies: [...new Set(allergies)],
      vetCalories: formData.vet_calories
    };
  }, [patient, clinicalHistory, formData.vet_calories]);

  // Get target portions from distribution step
  const getTargetPortions = (weekIndex, mealTimeId) => {
    const distribution = formData.meal_distribution?.[`week_${weekIndex}`]?.[mealTimeId] || {};
    return distribution;
  };

  // Check if all weeks have plates configured
  const isAllWeeksConfigured = useMemo(() => {
    return weeks.every(week => {
      const weekPlates = mealPlates[`week_${week.index}`] || {};
      return DAYS_OF_WEEK.every(day => {
        const dayPlates = weekPlates[`day_${day.id}`] || {};
        return MEAL_TIMES.every(mealTime => {
          const hasPlate = dayPlates[mealTime.id];
          const hasTargetPortions = Object.values(getTargetPortions(week.index, mealTime.id)).some(p => p > 0);
          return !hasTargetPortions || hasPlate; // If no target portions, plate not required
        });
      });
    });
  }, [weeks, mealPlates, formData.meal_distribution]);

  // Check if current week is configured
  const isCurrentWeekConfigured = useMemo(() => {
    return DAYS_OF_WEEK.every(day => {
      const dayPlates = currentWeekPlates[`day_${day.id}`] || {};
      return MEAL_TIMES.every(mealTime => {
        const hasPlate = dayPlates[mealTime.id];
        const hasTargetPortions = Object.values(getTargetPortions(selectedWeek, mealTime.id)).some(p => p > 0);
        return !hasTargetPortions || hasPlate;
      });
    });
  }, [currentWeekPlates, selectedWeek, formData.meal_distribution]);

  const handleSelectDish = (weekIndex, dayOfWeek, mealTimeId) => {
    const targetPortions = getTargetPortions(weekIndex, mealTimeId);
    setSelectorContext({ weekIndex, dayOfWeek, mealTimeId, targetPortions });
    setShowDishSelector(true);
  };

  const handleDishSelected = (dish) => {
    if (!selectorContext) return;

    const { weekIndex, dayOfWeek, mealTimeId } = selectorContext;
    const weekKey = `week_${weekIndex}`;
    const dayKey = `day_${dayOfWeek}`;

    const newMealPlates = {
      ...mealPlates,
      [weekKey]: {
        ...mealPlates[weekKey],
        [dayKey]: {
          ...mealPlates[weekKey]?.[dayKey],
          [mealTimeId]: {
            dish_id: dish.id,
            dish_data: dish,
            servings: 1,
            custom_notes: ''
          }
        }
      }
    };

    onChange({ meal_plates: newMealPlates });
    setShowDishSelector(false);
    setSelectorContext(null);
  };

  const handleRemoveDish = (weekIndex, dayOfWeek, mealTimeId) => {
    const weekKey = `week_${weekIndex}`;
    const dayKey = `day_${dayOfWeek}`;

    const newMealPlates = {
      ...mealPlates,
      [weekKey]: {
        ...mealPlates[weekKey],
        [dayKey]: {
          ...mealPlates[weekKey]?.[dayKey],
          [mealTimeId]: null
        }
      }
    };

    onChange({ meal_plates: newMealPlates });
  };

  const updateServings = (weekIndex, dayOfWeek, mealTimeId, servings) => {
    const weekKey = `week_${weekIndex}`;
    const dayKey = `day_${dayOfWeek}`;
    const currentPlate = mealPlates[weekKey]?.[dayKey]?.[mealTimeId];

    if (currentPlate) {
      const newMealPlates = {
        ...mealPlates,
        [weekKey]: {
          ...mealPlates[weekKey],
          [dayKey]: {
            ...mealPlates[weekKey][dayKey],
            [mealTimeId]: {
              ...currentPlate,
              servings: parseFloat(servings) || 1
            }
          }
        }
      };

      onChange({ meal_plates: newMealPlates });
    }
  };

  const copyFromPreviousWeek = () => {
    if (selectedWeek > 0) {
      const previousWeekData = mealPlates[`week_${selectedWeek - 1}`];
      if (previousWeekData) {
        const newMealPlates = {
          ...mealPlates,
          [`week_${selectedWeek}`]: JSON.parse(JSON.stringify(previousWeekData)) // Deep clone
        };
        onChange({ meal_plates: newMealPlates });
      }
    }
  };

  const copyDishToAllDays = (weekIndex, sourceDayOfWeek, mealTimeId) => {
    const weekKey = `week_${weekIndex}`;
    const sourceDayKey = `day_${sourceDayOfWeek}`;
    const sourceDish = mealPlates[weekKey]?.[sourceDayKey]?.[mealTimeId];

    if (!sourceDish) return;

    const weekPlates = { ...mealPlates[weekKey] };

    // Copy to all other days
    DAYS_OF_WEEK.forEach(day => {
      if (day.id !== sourceDayOfWeek) {
        const dayKey = `day_${day.id}`;
        weekPlates[dayKey] = {
          ...weekPlates[dayKey],
          [mealTimeId]: JSON.parse(JSON.stringify(sourceDish)) // Deep clone
        };
      }
    });

    const newMealPlates = {
      ...mealPlates,
      [weekKey]: weekPlates
    };

    onChange({ meal_plates: newMealPlates });
  };

  const getDishNutrition = (dish) => {
    if (!dish || !dish.total_food_group_portions) return null;

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    Object.entries(dish.total_food_group_portions).forEach(([groupId, portions]) => {
      const group = foodGroups.find(g => g.id === groupId);
      if (group && portions > 0) {
        totalCalories += group.calories_per_portion * portions;
        totalProtein += group.protein_per_portion * portions;
        totalCarbs += group.carbs_per_portion * portions;
        totalFat += group.fat_per_portion * portions;
      }
    });

    return { totalCalories, totalProtein, totalCarbs, totalFat };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 border border-purple-100 rounded-2xl p-8 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                Configuración de Platos por Día
              </h3>
              <p className="text-gray-600 max-w-2xl">
                Selecciona los platos específicos para cada día de la semana y tiempo de comida
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex flex-col items-end">
            <div className="text-sm text-gray-500 mb-1">Progreso total</div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-500"
                  style={{ width: `${isAllWeeksConfigured ? 100 : (Object.keys(mealPlates).length / weeks.length) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {Math.round(isAllWeeksConfigured ? 100 : (Object.keys(mealPlates).length / weeks.length) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Week Selector */}
        {weeks.length > 1 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                Seleccionar Semana
              </h4>
              {selectedWeek > 0 && (
                <button
                  onClick={copyFromPreviousWeek}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-all duration-200"
                >
                  <Copy className="h-3 w-3 mr-1.5" />
                  Copiar de Semana {selectedWeek}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {weeks.map((week) => {
                const weekPlates = mealPlates[`week_${week.index}`] || {};
                const hasData = Object.keys(weekPlates).length > 0;
                const isWeekConfigured = DAYS_OF_WEEK.every(day => {
                  const dayPlates = weekPlates[`day_${day.id}`] || {};
                  return MEAL_TIMES.every(mealTime => {
                    const hasPlate = dayPlates[mealTime.id];
                    const hasTargetPortions = Object.values(getTargetPortions(week.index, mealTime.id)).some(p => p > 0);
                    return !hasTargetPortions || hasPlate;
                  });
                });

                return (
                  <button
                    key={week.index}
                    onClick={() => setSelectedWeek(week.index)}
                    className={`relative px-4 py-2.5 rounded-xl border transition-all duration-200 hover:scale-102 shadow-sm hover:shadow-md ${
                      selectedWeek === week.index
                        ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white border-purple-500 shadow-md scale-102'
                        : hasData
                        ? isWeekConfigured
                          ? 'bg-gradient-to-br from-green-50 to-emerald-50 text-green-700 border-green-200 hover:border-green-300'
                          : 'bg-gradient-to-br from-yellow-50 to-orange-50 text-orange-700 border-orange-200 hover:border-orange-300'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-sm">{week.name}</span>
                      <span className="text-xs opacity-75 mt-0.5">{week.startDate}</span>
                    </div>
                    {hasData && (
                      <div className="absolute -top-0.5 -right-0.5">
                        {isWeekConfigured ? (
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-2.5 w-2.5 text-white" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                            <Clock className="h-2.5 w-2.5 text-white" />
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

        {/* Status Alerts */}
        {(!isCurrentWeekConfigured || (!isAllWeeksConfigured && weeks.length > 1)) && (
          <div className="flex flex-wrap gap-3 mb-4">
            {!isCurrentWeekConfigured && (
              <div className="inline-flex items-center px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 text-amber-600 mr-2 flex-shrink-0" />
                <span className="text-amber-800 font-medium">
                  {weeks[selectedWeek]?.name}: Faltan platos por configurar
                </span>
              </div>
            )}

            {!isAllWeeksConfigured && weeks.length > 1 && (
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                <span className="text-blue-800 font-medium">
                  Algunas semanas necesitan configuración
                </span>
              </div>
            )}
          </div>
        )}

        {/* Weekly Calendar Grid */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      Tiempo
                    </div>
                  </th>
                  {DAYS_OF_WEEK.map(day => (
                    <th key={day.id} className="text-center py-4 px-3 font-semibold text-gray-900">
                      <div className="flex flex-col items-center">
                        <span className="text-sm">{day.shortName}</span>
                        <span className="text-xs text-gray-500">{day.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MEAL_TIMES.map((mealTime) => {
                  const targetPortions = getTargetPortions(selectedWeek, mealTime.id);
                  const hasTargetPortions = Object.values(targetPortions).some(p => p > 0);

                  if (!hasTargetPortions) {
                    return (
                      <tr key={mealTime.id} className="bg-gray-50 opacity-60">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{mealTime.icon}</span>
                            <div>
                              <span className="font-medium text-gray-500 text-sm">{mealTime.shortName}</span>
                              <p className="text-xs text-gray-400">Sin porciones</p>
                            </div>
                          </div>
                        </td>
                        {DAYS_OF_WEEK.map(day => (
                          <td key={day.id} className="py-4 px-3 text-center">
                            <div className="text-gray-400 text-xs">—</div>
                          </td>
                        ))}
                      </tr>
                    );
                  }

                  return (
                    <tr key={mealTime.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{mealTime.icon}</span>
                          <div>
                            <span className="font-medium text-gray-900 text-sm">{mealTime.shortName}</span>
                            <p className="text-xs text-gray-600">
                              {Object.entries(targetPortions)
                                .filter(([_, amount]) => amount > 0)
                                .map(([groupId, amount]) => {
                                  const group = foodGroups.find(g => g.id === groupId);
                                  return `${group?.name.substring(0, 3)}: ${amount}`;
                                }).join(', ')}
                            </p>
                          </div>
                        </div>
                      </td>

                      {DAYS_OF_WEEK.map(day => {
                        const plateConfig = currentWeekPlates[`day_${day.id}`]?.[mealTime.id];
                        const dish = plateConfig?.dish_data;
                        const servings = plateConfig?.servings || 1;
                        const nutrition = dish ? getDishNutrition(dish) : null;

                        return (
                          <td key={day.id} className="py-4 px-3">
                            {plateConfig ? (
                              <div className="bg-white border rounded-lg p-2 min-h-[80px] flex flex-col justify-between">
                                <div>
                                  <h5 className="text-xs font-medium text-gray-900 leading-tight mb-1">
                                    {dish?.name}
                                  </h5>
                                  {nutrition && (
                                    <div className="text-xs text-gray-600">
                                      {(nutrition.totalCalories * servings).toFixed(0)} kcal
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                  <input
                                    type="number"
                                    min="0.5"
                                    step="0.5"
                                    value={servings}
                                    onChange={(e) => updateServings(selectedWeek, day.id, mealTime.id, e.target.value)}
                                    className="w-12 px-1 py-0.5 text-xs border border-gray-300 rounded text-center focus:ring-1 focus:ring-purple-400 focus:border-transparent"
                                  />

                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => copyDishToAllDays(selectedWeek, day.id, mealTime.id)}
                                      className="text-blue-600 hover:text-blue-800 text-xs"
                                      title="Copiar a todos los días"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleSelectDish(selectedWeek, day.id, mealTime.id)}
                                      className="text-purple-600 hover:text-purple-800 text-xs"
                                      title="Cambiar plato"
                                    >
                                      <Search className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleRemoveDish(selectedWeek, day.id, mealTime.id)}
                                      className="text-red-600 hover:text-red-800 text-xs"
                                      title="Quitar plato"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleSelectDish(selectedWeek, day.id, mealTime.id)}
                                className="w-full h-20 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors flex items-center justify-center"
                              >
                                <div className="text-center">
                                  <Plus className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                                  <span className="text-xs text-gray-500">Seleccionar</span>
                                </div>
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-6 border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Resumen de {weeks[selectedWeek]?.name}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Utensils className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Platos configurados</div>
                  <div className="text-xl font-bold text-gray-900">
                    {DAYS_OF_WEEK.reduce((total, day) => {
                      const dayPlates = currentWeekPlates[`day_${day.id}`] || {};
                      return total + Object.values(dayPlates).filter(p => p).length;
                    }, 0)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Días configurados</div>
                  <div className="text-xl font-bold text-gray-900">
                    {DAYS_OF_WEEK.filter(day => {
                      const dayPlates = currentWeekPlates[`day_${day.id}`] || {};
                      return Object.keys(dayPlates).length > 0;
                    }).length} / 7
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Tiempos requeridos</div>
                  <div className="text-xl font-bold text-gray-900">
                    {MEAL_TIMES.filter(mt =>
                      Object.values(getTargetPortions(selectedWeek, mt.id)).some(p => p > 0)
                    ).length}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isAllWeeksConfigured ? 'bg-green-100' : 'bg-orange-100'}`}>
                  {isAllWeeksConfigured ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-orange-600" />
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-600">Estado</div>
                  <div className={`text-xl font-bold ${isAllWeeksConfigured ? 'text-green-600' : 'text-orange-600'}`}>
                    {isAllWeeksConfigured ? 'Completo' : 'Pendiente'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dish Selector Sidebar */}
      <DishSelectorSidebar
        mealTime={selectorContext?.mealTimeId}
        selectedDish={null}
        onDishSelect={handleDishSelected}
        foodGroups={foodGroups}
        targetPortions={selectorContext?.targetPortions || {}}
        isOpen={showDishSelector}
        onClose={() => {
          setShowDishSelector(false);
          setSelectorContext(null);
        }}
        patientContext={patientContext}
      />
    </div>
  );
}