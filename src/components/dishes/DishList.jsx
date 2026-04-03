import React from 'react';
import { Search, Plus, ChefHat, Utensils, Target } from 'lucide-react';

const MEAL_TIMES = [
  { id: 'breakfast', name: 'Desayuno' },
  { id: 'morning_snack', name: 'Colación Matutina' },
  { id: 'lunch', name: 'Almuerzo' },
  { id: 'afternoon_snack', name: 'Colación Vespertina' },
  { id: 'dinner', name: 'Cena' }
];

export default function DishList({
  dishes,
  loading,
  searchTerm,
  onSearchChange,
  filterMealTime,
  onFilterChange,
  onNewDish,
  onDishClick,
  onDishSelect,
  selectedDish,
  calculateNutrition,
  targetPortions = {},
  foodGroups = [],
  mealTime
}) {
  const hasTargetPortions = Object.values(targetPortions).some(p => p > 0);
  const mealTimeName = mealTime ? MEAL_TIMES.find(t => t.id === mealTime)?.name : null;
  return (
    <div className="flex flex-col h-full">
      {/* Search and Filters */}
      <div className="px-3 py-2.5 border-b bg-gray-50 space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar platos..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
            />
          </div>
          <select
            value={filterMealTime}
            onChange={(e) => onFilterChange(e.target.value)}
            className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400"
          >
            <option value="">Todos</option>
            {MEAL_TIMES.map(time => (
              <option key={time.id} value={time.id}>{time.name}</option>
            ))}
          </select>
          <button
            onClick={onNewDish}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5 text-sm whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Nuevo
          </button>
        </div>
      </div>

      {/* Target Portions Banner */}
      {hasTargetPortions && (
        <div className="px-3 py-2 border-b bg-emerald-50">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Target className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-800">
              Porciones objetivo{mealTimeName ? ` — ${mealTimeName}` : ''}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(targetPortions)
              .filter(([, amount]) => amount > 0)
              .map(([groupId, amount]) => {
                const group = foodGroups.find(g => g.id === groupId);
                if (!group) return null;
                return (
                  <span
                    key={groupId}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-emerald-200 rounded-md text-xs"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: group.color || '#6B7280' }}
                    />
                    <span className="text-gray-700">{group.name}</span>
                    <span className="font-semibold text-emerald-700">{amount}</span>
                  </span>
                );
              })}
          </div>
        </div>
      )}

      {/* Dishes List */}
      <div className="flex-1 overflow-y-auto p-4 pb-6">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : dishes.length > 0 ? (
          <div className="space-y-3">
            {dishes.map(dish => {
              const nutrition = calculateNutrition(dish);
              const isSelected = selectedDish?.id === dish.id;

              return (
                <div
                  key={dish.id}
                  className={`border rounded-lg p-3 hover:shadow-md transition-all cursor-pointer ${
                    isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
                  }`}
                  onClick={() => onDishClick(dish)}
                >
                  {/* Dish Info */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{dish.name}</h4>
                      {dish.description && (
                        <p className="text-sm text-gray-600 line-clamp-1">{dish.description}</p>
                      )}
                    </div>
                    {dish.matchScore >= 80 && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        {Math.round(dish.matchScore)}%
                      </span>
                    )}
                  </div>

                  {/* Food Group Portions */}
                  {dish.food_group_portions && Object.keys(dish.food_group_portions).some(k => dish.food_group_portions[k] > 0) && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {Object.entries(dish.food_group_portions)
                        .filter(([, amount]) => amount > 0)
                        .map(([groupId, amount]) => {
                          const group = foodGroups.find(g => g.id === groupId);
                          if (!group) return null;
                          const target = targetPortions[groupId] || 0;
                          const hasTarget = target > 0;
                          const diff = hasTarget ? amount - target : 0;
                          const isMatch = hasTarget && Math.abs(diff) <= 0.3;
                          const isOver = hasTarget && diff > 0.3;

                          return (
                            <span
                              key={groupId}
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] ${
                                hasTarget
                                  ? isMatch
                                    ? 'bg-green-50 border border-green-200'
                                    : isOver
                                    ? 'bg-orange-50 border border-orange-200'
                                    : 'bg-yellow-50 border border-yellow-200'
                                  : 'bg-gray-50 border border-gray-200'
                              }`}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: group.color || '#6B7280' }}
                              />
                              <span className="text-gray-600 truncate max-w-[60px]">{group.name}</span>
                              <span className={`font-semibold ${
                                hasTarget
                                  ? isMatch ? 'text-green-700' : isOver ? 'text-orange-700' : 'text-yellow-700'
                                  : 'text-gray-700'
                              }`}>
                                {amount}
                              </span>
                              {hasTarget && (
                                <span className="text-gray-400">/{target}</span>
                              )}
                            </span>
                          );
                        })}
                    </div>
                  )}

                  {/* Quick Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600">
                        {Math.round(nutrition.totalCalories)} kcal
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600 flex items-center gap-1">
                        <ChefHat className="h-3 w-3" />
                        {dish.recipes?.length || 0}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDishSelect(dish);
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-medium"
                    >
                      Seleccionar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Utensils className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No se encontraron platos</p>
          </div>
        )}
      </div>
    </div>
  );
}
