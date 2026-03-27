import React, { useState, useEffect } from 'react';
import { Utensils, Search, Plus, Edit2, Trash2, Copy, Flame, Eye } from 'lucide-react';
import { dishesApi } from '../../lib/dishes';
import DishSelectorSidebar from './DishSelectorSidebar';
import DishViewModal from './DishViewModal';

const MEAL_TIMES = {
  breakfast: 'Desayuno',
  morning_snack: 'Colación Matutina',
  lunch: 'Almuerzo',
  afternoon_snack: 'Colación Vespertina',
  dinner: 'Cena'
};

export default function DishesTable({ foodGroups }) {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [mealTimeFilter, setMealTimeFilter] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [viewingDish, setViewingDish] = useState(null);

  useEffect(() => {
    loadDishes();
  }, [mealTimeFilter]);

  const loadDishes = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (mealTimeFilter) filters.meal_time = mealTimeFilter;
      if (searchTerm) filters.search = searchTerm;

      const data = await dishesApi.getDishes(filters);
      setDishes(data);
    } catch (error) {
      console.error('Error loading dishes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadDishes();
  };

  const handleDelete = async (dishId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este plato?')) {
      try {
        await dishesApi.deleteDish(dishId);
        loadDishes();
      } catch (error) {
        console.error('Error deleting dish:', error);
        alert('Error al eliminar el plato');
      }
    }
  };

  const handleDuplicate = async (dish) => {
    try {
      const newName = prompt('Nombre del nuevo plato:', `${dish.name} (Copia)`);
      if (newName) {
        await dishesApi.duplicateDish(dish.id, newName);
        loadDishes();
      }
    } catch (error) {
      console.error('Error duplicating dish:', error);
      alert('Error al duplicar el plato');
    }
  };

  const handleCloseSidebar = () => {
    setShowSidebar(false);
    loadDishes();
  };

  const calculateDishNutrition = (dish) => {
    return dishesApi.calculateDishNutrition(dish.food_group_portions || {}, foodGroups);
  };

  const filteredDishes = dishes.filter(dish =>
    dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dish.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Utensils className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">Platos</h1>
          </div>
          <button
            onClick={() => setShowSidebar(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nuevo Plato
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar platos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
            />
          </div>
          <select
            value={mealTimeFilter}
            onChange={(e) => setMealTimeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
          >
            <option value="">Todos los tiempos de comida</option>
            {Object.entries(MEAL_TIMES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : filteredDishes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No se encontraron platos</p>
          <button
            onClick={() => setShowSidebar(true)}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Crear primer plato
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiempo de Comida
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingredientes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calorías
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Macros (P/C/G)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDishes.map((dish) => {
                const nutrition = calculateDishNutrition(dish);
                const ingredientCount = dish.ingredients?.length || 0;

                return (
                  <tr key={dish.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{dish.name}</div>
                        {dish.description && (
                          <div className="text-sm text-gray-500 line-clamp-1">{dish.description}</div>
                        )}
                        {dish.is_public && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded mt-1">
                            Público
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {MEAL_TIMES[dish.meal_time] || dish.meal_time || 'No especificado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {ingredientCount} {ingredientCount === 1 ? 'ingrediente' : 'ingredientes'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <Flame className="h-4 w-4 text-orange-500" />
                        {nutrition.totalCalories.toFixed(0)} kcal
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {nutrition.totalProtein.toFixed(0)}g / {nutrition.totalCarbs.toFixed(0)}g / {nutrition.totalFat.toFixed(0)}g
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewingDish(dish)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(dish)}
                          className="text-green-600 hover:text-green-900"
                          title="Duplicar"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(dish.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Sidebar for creating/editing */}
      <DishSelectorSidebar
        mealTime={mealTimeFilter}
        selectedDish={null}
        onDishSelect={() => {}}
        foodGroups={foodGroups}
        targetPortions={{}}
        isOpen={showSidebar}
        onClose={handleCloseSidebar}
        initialView="new-dish"
      />

      {/* View Dish Modal */}
      <DishViewModal
        dish={viewingDish}
        foodGroups={foodGroups}
        isOpen={!!viewingDish}
        onClose={() => setViewingDish(null)}
      />
    </div>
  );
}
