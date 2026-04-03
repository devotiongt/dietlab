import React, { useState, useEffect } from 'react';
import { Search, Plus, Utensils, Target, Copy, Trash2, Edit, Filter } from 'lucide-react';
import { dishesApi } from '../../lib/dishes';
import DishBuilder from './DishBuilder';

const MEAL_TIMES = [
  { id: 'breakfast', name: 'Desayuno' },
  { id: 'morning_snack', name: 'Colación Matutina' },
  { id: 'lunch', name: 'Almuerzo' },
  { id: 'afternoon_snack', name: 'Colación Vespertina' },
  { id: 'dinner', name: 'Cena' }
];

export default function DishSelector({
  mealTime,
  selectedDish,
  onDishSelect,
  onCreateNew,
  foodGroups,
  targetPortions = {},
  isOpen,
  onClose
}) {
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMealTime, setFilterMealTime] = useState(mealTime || '');
  const [loading, setLoading] = useState(false);
  const [showDishBuilder, setShowDishBuilder] = useState(false);
  const [editingDish, setEditingDish] = useState(null);

  // Load dishes
  useEffect(() => {
    if (isOpen) {
      loadDishes();
    }
  }, [isOpen]);

  // Block body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Filter dishes when search or filter changes
  useEffect(() => {
    let filtered = dishes;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(dish =>
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by meal time
    if (filterMealTime) {
      filtered = filtered.filter(dish => dish.meal_time === filterMealTime);
    }

    setFilteredDishes(filtered);
  }, [dishes, searchTerm, filterMealTime]);

  const loadDishes = async () => {
    setLoading(true);
    try {
      const allDishes = await dishesApi.getDishes();
      setDishes(allDishes);
    } catch (error) {
      console.error('Error loading dishes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDish = (dish) => {
    onDishSelect(dish);
    onClose();
  };

  const handleCreateNewDish = () => {
    setEditingDish(null);
    setShowDishBuilder(true);
  };


  const handleEditDish = (dish, e) => {
    e.stopPropagation();
    setEditingDish(dish);
    setShowDishBuilder(true);
  };

  const handleDuplicateDish = async (dish, e) => {
    e.stopPropagation();
    try {
      const duplicated = await dishesApi.duplicateDish(dish.id, `${dish.name} (Copia)`);
      await loadDishes();
    } catch (error) {
      console.error('Error duplicating dish:', error);
    }
  };

  const handleDeleteDish = async (dish, e) => {
    e.stopPropagation();
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${dish.name}"?`)) {
      try {
        await dishesApi.deleteDish(dish.id);
        await loadDishes();
      } catch (error) {
        console.error('Error deleting dish:', error);
      }
    }
  };

  const handleDishSaved = async (dish) => {
    setShowDishBuilder(false);
    setEditingDish(null);
    await loadDishes();
  };


  const calculateDishMatch = (dish) => {
    if (!dish.total_food_group_portions || Object.keys(targetPortions).length === 0) {
      return { score: 0, matches: 0, total: 0 };
    }

    let matches = 0;
    let total = 0;

    Object.entries(targetPortions).forEach(([groupId, targetAmount]) => {
      if (targetAmount > 0) {
        total++;
        const dishAmount = dish.total_food_group_portions[groupId] || 0;
        if (Math.abs(dishAmount - targetAmount) <= 0.5) {
          matches++;
        }
      }
    });

    return {
      score: total > 0 ? (matches / total) * 100 : 0,
      matches,
      total
    };
  };

  const getDishNutrition = (dish) => dishesApi.getDishNutrition(dish, foodGroups);

  // Block body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col my-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Seleccionar Plato</h2>
                <p className="text-purple-100 mt-1">
                  {mealTime && `Para ${MEAL_TIMES.find(t => t.id === mealTime)?.name || mealTime}`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar platos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterMealTime}
                  onChange={(e) => setFilterMealTime(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                >
                  <option value="">Todos los tiempos</option>
                  {MEAL_TIMES.map(time => (
                    <option key={time.id} value={time.id}>{time.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCreateNewDish}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo Plato
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando platos...</p>
              </div>
            ) : filteredDishes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDishes.map((dish) => {
                  const match = calculateDishMatch(dish);
                  const nutrition = getDishNutrition(dish);
                  const isSelected = selectedDish?.id === dish.id;

                  return (
                    <div
                      key={dish.id}
                      className={`relative bg-white border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50'
                          : match.score > 70
                            ? 'border-green-300 hover:border-green-400'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleSelectDish(dish)}
                    >
                      {/* Match Score */}
                      {match.total > 0 && (
                        <div className="absolute top-3 right-3">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            match.score > 70
                              ? 'bg-green-100 text-green-800'
                              : match.score > 40
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {match.score.toFixed(0)}% match
                          </div>
                        </div>
                      )}

                      {/* Dish Header */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Utensils className="h-5 w-5 text-purple-500" />
                          <h3 className="font-semibold text-gray-900">{dish.name}</h3>
                        </div>

                        {dish.description && (
                          <p className="text-sm text-gray-600 mb-2">{dish.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded-full">
                            {MEAL_TIMES.find(t => t.id === dish.meal_time)?.name || dish.meal_time}
                          </span>
                        </div>
                      </div>

                      {/* Food Groups */}
                      {dish.total_food_group_portions && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Grupos Alimentarios
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(dish.total_food_group_portions)
                              .filter(([_, amount]) => amount > 0)
                              .map(([groupId, amount]) => {
                                const group = foodGroups.find(g => g.id === groupId);
                                const target = targetPortions[groupId] || 0;
                                const isMatch = target > 0 && Math.abs(amount - target) <= 0.5;

                                return (
                                  <div
                                    key={groupId}
                                    className={`flex items-center justify-between p-2 rounded ${
                                      isMatch ? 'bg-green-100' : 'bg-gray-100'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1">
                                      <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: group?.color || '#6B7280' }}
                                      />
                                      <span className="text-gray-700 truncate">
                                        {group?.name || 'Grupo'}
                                      </span>
                                    </div>
                                    <span className={`font-medium ${isMatch ? 'text-green-700' : 'text-gray-600'}`}>
                                      {amount.toFixed(1)}
                                    </span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}

                      {/* Nutrition */}
                      {nutrition && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Nutrición</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-blue-50 p-2 rounded text-center">
                              <div className="font-medium text-blue-700">{nutrition.totalCalories.toFixed(0)}</div>
                              <div className="text-blue-600">kcal</div>
                            </div>
                            <div className="bg-green-50 p-2 rounded text-center">
                              <div className="font-medium text-green-700">{nutrition.totalProtein.toFixed(1)}g</div>
                              <div className="text-green-600">proteína</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => handleEditDish(dish, e)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => handleDuplicateDish(dish, e)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Duplicar"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteDish(dish, e)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron platos</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterMealTime
                    ? 'Prueba con otros términos de búsqueda o filtros'
                    : 'Crea tu primer plato para comenzar'}
                </p>
                <button
                  onClick={handleCreateNewDish}
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-5 w-5" />
                  Crear Nuevo Plato
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <DishBuilder
        dish={editingDish}
        foodGroups={foodGroups}
        onSave={handleDishSaved}
        onCancel={() => setShowDishBuilder(false)}
        isOpen={showDishBuilder}
      />
    </>
  );
}