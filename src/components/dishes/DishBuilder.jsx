import React, { useState, useEffect } from 'react';
import { Plus, Minus, Utensils, Target, Save, X } from 'lucide-react';
import { dishesApi } from '../../lib/dishes';

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
    food_group_portions: {},
    ingredients: [{ ingredient: '', amount: '', notes: '' }],
    instructions: '',
    is_public: false
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

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
        food_group_portions: dish.food_group_portions || {},
        ingredients: dish.ingredients && dish.ingredients.length > 0 ? dish.ingredients : [{ ingredient: '', amount: '', notes: '' }],
        instructions: dish.instructions || '',
        is_public: dish.is_public || false
      });
    } else {
      // Reset form for new dish
      setFormData({
        name: '',
        description: '',
        meal_time: 'breakfast',
        food_group_portions: {},
        ingredients: [{ ingredient: '', amount: '', notes: '' }],
        instructions: '',
        is_public: false
      });
    }
    setErrors({});
  }, [dish]);

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateFoodGroupPortion = (groupId, value) => {
    setFormData(prev => ({
      ...prev,
      food_group_portions: {
        ...prev.food_group_portions,
        [groupId]: parseFloat(value) || 0
      }
    }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ingredient: '', amount: '', notes: '' }]
    }));
  };

  const updateIngredient = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const calculateNutrition = () => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    Object.entries(formData.food_group_portions || {}).forEach(([groupId, portions]) => {
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
      totalFat
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    // Validate
    if (!formData.name?.trim()) {
      setErrors({ name: 'El nombre del plato es requerido' });
      setSaving(false);
      return;
    }

    if (!formData.food_group_portions || Object.keys(formData.food_group_portions).length === 0) {
      setErrors({ food_group_portions: 'Debe especificar al menos un grupo alimentario' });
      setSaving(false);
      return;
    }

    const cleanedIngredients = formData.ingredients.filter(ing => ing.ingredient.trim() !== '');
    if (cleanedIngredients.length === 0) {
      setErrors({ ingredients: 'Debe especificar al menos un ingrediente' });
      setSaving(false);
      return;
    }

    try {
      // Prepare dish data with cleaned ingredients
      const dishData = {
        ...formData,
        ingredients: cleanedIngredients,
        total_food_group_portions: formData.food_group_portions
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

                {/* Food Groups */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-600" />
                    Grupos Alimentarios *
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {foodGroups.map(group => (
                      <div key={group.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: group.color || '#6B7280' }}
                          />
                          <span className="font-medium text-gray-900">{group.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={formData.food_group_portions[group.id] || 0}
                            onChange={(e) => updateFoodGroupPortion(group.id, e.target.value)}
                            className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                          />
                          <span className="text-sm text-gray-500">porciones</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.food_group_portions && (
                    <p className="text-red-500 text-sm mt-2">{errors.food_group_portions}</p>
                  )}
                </div>

                {/* Ingredients */}
                <div className="bg-green-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Ingredientes *</h3>
                    <button
                      type="button"
                      onClick={addIngredient}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {formData.ingredients.map((ing, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={ing.amount}
                          onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                          placeholder="Cantidad"
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-400 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={ing.ingredient}
                          onChange={(e) => updateIngredient(index, 'ingredient', e.target.value)}
                          placeholder="Ingrediente"
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-400 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="text-red-500 hover:text-red-700 px-2"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {errors.ingredients && (
                    <p className="text-red-500 text-sm mt-2">{errors.ingredients}</p>
                  )}
                </div>

                {/* Instructions */}
                <div className="bg-purple-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Instrucciones de Preparación</h3>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => updateField('instructions', e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    placeholder="Describe cómo preparar el plato..."
                  />
                </div>
              </div>

              {/* Right Column - Nutrition Summary */}
              <div className="space-y-6">
                {/* Nutrition Summary */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Nutricional</h3>
                  {nutrition.totalCalories > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                        <div className="text-2xl font-bold text-green-600">
                          {nutrition.totalCalories.toFixed(0)}
                        </div>
                        <div className="text-sm text-gray-600">Calorías</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">
                          {nutrition.totalProtein.toFixed(1)}g
                        </div>
                        <div className="text-sm text-gray-600">Proteína</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                        <div className="text-2xl font-bold text-yellow-600">
                          {nutrition.totalCarbs.toFixed(1)}g
                        </div>
                        <div className="text-sm text-gray-600">Carbohidratos</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                        <div className="text-2xl font-bold text-orange-600">
                          {nutrition.totalFat.toFixed(1)}g
                        </div>
                        <div className="text-sm text-gray-600">Grasas</div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Agrega grupos alimentarios para ver la información nutricional</p>
                  )}
                </div>

                {/* Instructions Preview */}
                {formData.instructions && (
                  <div className="bg-purple-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Vista Previa de Instrucciones</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{formData.instructions}</p>
                  </div>
                )}

                {/* Tips */}
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-2">💡 Consejos</h4>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• Define las porciones de grupos alimentarios según el plan nutricional</li>
                    <li>• Lista todos los ingredientes con cantidades específicas</li>
                    <li>• Incluye instrucciones claras de preparación</li>
                  </ul>
                </div>
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
                  disabled={saving}
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