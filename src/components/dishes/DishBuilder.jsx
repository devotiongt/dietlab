import React, { useState, useEffect } from 'react';
import { Plus, Minus, Utensils, Target, Save, X, Search, ChefHat } from 'lucide-react';
import { dishesApi } from '../../lib/dishes';
import { recipesApi } from '../../lib/recipes';

const MEAL_TIMES = [
  { id: 'breakfast', name: 'Desayuno' },
  { id: 'morning_snack', name: 'Colación Matutina' },
  { id: 'lunch', name: 'Almuerzo' },
  { id: 'afternoon_snack', name: 'Colación Vespertina' },
  { id: 'dinner', name: 'Cena' }
];

export default function DishBuilder({ dish = null, foodGroups, onSave, onCancel, isOpen }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    meal_time: 'breakfast',
    recipes: [], // [{ recipe_id, servings, recipe_data }]
    is_public: false
  });

  const [availableRecipes, setAvailableRecipes] = useState([]);
  const [recipeSearch, setRecipeSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showRecipeSearch, setShowRecipeSearch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Load available recipes
  useEffect(() => {
    if (isOpen) {
      loadRecipes();
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

  // Initialize form data when dish changes
  useEffect(() => {
    if (dish) {
      setFormData({
        name: dish.name || '',
        description: dish.description || '',
        meal_time: dish.meal_time || 'breakfast',
        recipes: dish.recipes || [],
        is_public: dish.is_public || false
      });
    } else {
      // Reset form for new dish
      setFormData({
        name: '',
        description: '',
        meal_time: 'breakfast',
        recipes: [],
        is_public: false
      });
    }
    setErrors({});
  }, [dish]);

  // Search recipes when search term changes
  useEffect(() => {
    if (recipeSearch.trim()) {
      const filtered = availableRecipes.filter(recipe =>
        recipe.name.toLowerCase().includes(recipeSearch.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(recipeSearch.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults(availableRecipes);
    }
  }, [recipeSearch, availableRecipes]);

  const loadRecipes = async () => {
    setLoading(true);
    try {
      const recipes = await recipesApi.getRecipes();
      setAvailableRecipes(recipes);
      setSearchResults(recipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addRecipe = (recipe) => {
    const existingIndex = formData.recipes.findIndex(r => r.recipe_id === recipe.id);

    if (existingIndex >= 0) {
      // If recipe already exists, increase servings
      setFormData(prev => ({
        ...prev,
        recipes: prev.recipes.map((r, i) =>
          i === existingIndex ? { ...r, servings: r.servings + 1 } : r
        )
      }));
    } else {
      // Add new recipe
      setFormData(prev => ({
        ...prev,
        recipes: [
          ...prev.recipes,
          {
            recipe_id: recipe.id,
            servings: 1,
            recipe_data: recipe // Store recipe data for display
          }
        ]
      }));
    }
    setShowRecipeSearch(false);
    setRecipeSearch('');
  };

  const updateRecipeServings = (index, servings) => {
    setFormData(prev => ({
      ...prev,
      recipes: prev.recipes.map((r, i) =>
        i === index ? { ...r, servings: parseFloat(servings) || 1 } : r
      )
    }));
  };

  const removeRecipe = (index) => {
    setFormData(prev => ({
      ...prev,
      recipes: prev.recipes.filter((_, i) => i !== index)
    }));
  };

  const calculateDishTotals = () => {
    const totals = {};

    formData.recipes.forEach(recipeItem => {
      const recipe = recipeItem.recipe_data;
      const servings = recipeItem.servings || 1;

      if (recipe && recipe.food_group_portions) {
        Object.entries(recipe.food_group_portions).forEach(([groupId, portions]) => {
          if (!totals[groupId]) {
            totals[groupId] = 0;
          }
          totals[groupId] += portions * servings;
        });
      }
    });

    return totals;
  };

  const calculateNutrition = () => {
    const dishTotals = calculateDishTotals();

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    Object.entries(dishTotals).forEach(([groupId, portions]) => {
      const group = foodGroups.find(g => g.id === groupId);
      if (group && portions > 0) {
        totalCalories += group.calories_per_portion * portions;
        totalProtein += group.protein_per_portion * portions;
        totalCarbs += group.carbs_per_portion * portions;
        totalFat += group.fat_per_portion * portions;
      }
    });

    return {
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      foodGroupTotals: dishTotals
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    // Validate
    const validation = dishesApi.validateDish(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setSaving(false);
      return;
    }

    try {
      // Prepare dish data without recipe_data for storage
      const dishData = {
        ...formData,
        recipes: formData.recipes.map(r => ({
          recipe_id: r.recipe_id,
          servings: r.servings
        }))
      };

      let savedDish;
      if (dish) {
        // Update existing dish
        savedDish = await dishesApi.updateDish(dish.id, dishData);
      } else {
        // Create new dish
        savedDish = await dishesApi.createDish(dishData);
      }

      onSave(savedDish);
    } catch (error) {
      console.error('Error saving dish:', error);
      setErrors({ general: 'Error al guardar el plato' });
    } finally {
      setSaving(false);
    }
  };

  const nutrition = calculateNutrition();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Utensils className="h-6 w-6" />
                <h2 className="text-xl font-bold">
                  {dish ? 'Editar Plato' : 'Nuevo Plato'}
                </h2>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Basic Info */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del plato *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder="Ej: Desayuno Completo"
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder="Descripción del plato"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tiempo de comida
                      </label>
                      <select
                        value={formData.meal_time}
                        onChange={(e) => updateField('meal_time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      >
                        {MEAL_TIMES.map(time => (
                          <option key={time.id} value={time.id}>{time.name}</option>
                        ))}
                      </select>
                    </div>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.is_public}
                        onChange={(e) => updateField('is_public', e.target.checked)}
                        className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                      />
                      <span className="text-gray-700">Hacer público (visible para otros usuarios)</span>
                    </label>
                  </div>
                </div>

                {/* Recipe Management */}
                <div className="bg-orange-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recetas *</h3>
                    <button
                      type="button"
                      onClick={() => setShowRecipeSearch(!showRecipeSearch)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar Receta
                    </button>
                  </div>

                  {/* Recipe Search */}
                  {showRecipeSearch && (
                    <div className="mb-4 p-4 bg-white rounded-lg border">
                      <div className="flex items-center gap-2 mb-3">
                        <Search className="h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={recipeSearch}
                          onChange={(e) => setRecipeSearch(e.target.value)}
                          placeholder="Buscar recetas..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                        />
                      </div>

                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {loading ? (
                          <p className="text-gray-500 text-center py-4">Cargando recetas...</p>
                        ) : searchResults.length > 0 ? (
                          searchResults.map(recipe => (
                            <div
                              key={recipe.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                              onClick={() => addRecipe(recipe)}
                            >
                              <div>
                                <h4 className="font-medium text-gray-900">{recipe.name}</h4>
                                <p className="text-sm text-gray-600">{recipe.description}</p>
                                <span className="inline-block px-2 py-1 bg-gray-200 text-xs text-gray-700 rounded-full mt-1">
                                  {MEAL_TIMES.find(t => t.id === recipe.category)?.name || recipe.category}
                                </span>
                              </div>
                              <Plus className="h-5 w-5 text-orange-500" />
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">No se encontraron recetas</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Selected Recipes */}
                  <div className="space-y-3">
                    {formData.recipes.length > 0 ? (
                      formData.recipes.map((recipeItem, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                          <ChefHat className="h-5 w-5 text-orange-500 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {recipeItem.recipe_data?.name || 'Receta'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {recipeItem.recipe_data?.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0.5"
                              step="0.5"
                              value={recipeItem.servings}
                              onChange={(e) => updateRecipeServings(index, e.target.value)}
                              className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                            />
                            <span className="text-sm text-gray-500">porciones</span>
                            <button
                              type="button"
                              onClick={() => removeRecipe(index)}
                              className="p-1 text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No hay recetas agregadas</p>
                    )}
                  </div>
                  {errors.recipes && (
                    <p className="text-red-500 text-sm mt-2">{errors.recipes}</p>
                  )}
                </div>
              </div>

              {/* Right Column - Nutrition Summary */}
              <div className="space-y-6">
                {/* Food Group Totals */}
                {Object.keys(nutrition.foodGroupTotals).length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Target className="h-5 w-5 mr-2 text-blue-600" />
                      Totales por Grupo Alimentario
                    </h3>

                    <div className="space-y-3">
                      {Object.entries(nutrition.foodGroupTotals).map(([groupId, total]) => {
                        const group = foodGroups.find(g => g.id === groupId);
                        if (!group || total === 0) return null;

                        return (
                          <div key={groupId} className="flex items-center justify-between p-3 bg-white rounded-lg">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: group.color || '#6B7280' }}
                              />
                              <span className="font-medium text-gray-900">{group.name}</span>
                            </div>
                            <span className="font-semibold text-blue-600">
                              {total.toFixed(1)} porciones
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Nutrition Summary */}
                {nutrition.totalCalories > 0 && (
                  <div className="bg-green-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Nutricional</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {nutrition.totalCalories.toFixed(0)}
                        </div>
                        <div className="text-sm text-gray-600">Calorías</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {nutrition.totalProtein.toFixed(1)}g
                        </div>
                        <div className="text-sm text-gray-600">Proteína</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {nutrition.totalCarbs.toFixed(1)}g
                        </div>
                        <div className="text-sm text-gray-600">Carbohidratos</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {nutrition.totalFat.toFixed(1)}g
                        </div>
                        <div className="text-sm text-gray-600">Grasas</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recipe Details */}
                {formData.recipes.length > 0 && (
                  <div className="bg-purple-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles de Recetas</h3>
                    <div className="space-y-4">
                      {formData.recipes.map((recipeItem, index) => {
                        const recipe = recipeItem.recipe_data;
                        if (!recipe) return null;

                        return (
                          <div key={index} className="bg-white p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{recipe.name}</h4>
                              <span className="text-sm text-purple-600 font-medium">
                                {recipeItem.servings}x
                              </span>
                            </div>

                            {recipe.ingredients && recipe.ingredients.length > 0 && (
                              <div className="text-sm text-gray-600">
                                <p className="font-medium mb-1">Ingredientes:</p>
                                <ul className="list-disc list-inside space-y-1">
                                  {recipe.ingredients.slice(0, 3).map((ing, i) => (
                                    <li key={i}>{ing.amount} {ing.ingredient}</li>
                                  ))}
                                  {recipe.ingredients.length > 3 && (
                                    <li className="text-gray-500">
                                      ... y {recipe.ingredients.length - 3} más
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
              {errors.general && (
                <p className="text-red-500 text-sm">{errors.general}</p>
              )}
              <div className="flex gap-3 ml-auto">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || formData.recipes.length === 0}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Guardando...' : 'Guardar Plato'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}