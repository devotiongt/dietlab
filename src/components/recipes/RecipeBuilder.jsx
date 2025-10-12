import React, { useState, useEffect } from 'react';
import { Plus, Minus, ChefHat, Clock, Users, Target, Save, X } from 'lucide-react';
import { recipesApi } from '../../lib/recipes';

const RECIPE_CATEGORIES = [
  { id: 'breakfast', name: 'Desayuno' },
  { id: 'lunch', name: 'Almuerzo' },
  { id: 'dinner', name: 'Cena' },
  { id: 'snack', name: 'Colación' },
  { id: 'beverage', name: 'Bebida' }
];

const DIFFICULTY_LEVELS = [
  { id: 'easy', name: 'Fácil' },
  { id: 'medium', name: 'Intermedio' },
  { id: 'hard', name: 'Difícil' }
];

export default function RecipeBuilder({ recipe = null, foodGroups, onSave, onCancel, isOpen }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'breakfast',
    difficulty: 'easy',
    prep_time_minutes: 0,
    cook_time_minutes: 0,
    servings: 1,
    food_group_portions: {},
    ingredients: [{ ingredient: '', amount: '', notes: '' }],
    instructions: [{ step: 1, instruction: '' }],
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

  // Initialize form data when recipe changes
  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name || '',
        description: recipe.description || '',
        category: recipe.category || 'breakfast',
        difficulty: recipe.difficulty || 'easy',
        prep_time_minutes: recipe.prep_time_minutes || 0,
        cook_time_minutes: recipe.cook_time_minutes || 0,
        servings: recipe.servings || 1,
        food_group_portions: recipe.food_group_portions || {},
        ingredients: recipe.ingredients?.length > 0 ? recipe.ingredients : [{ ingredient: '', amount: '', notes: '' }],
        instructions: recipe.instructions?.length > 0 ? recipe.instructions : [{ step: 1, instruction: '' }],
        is_public: recipe.is_public || false
      });
    } else {
      // Reset form for new recipe
      setFormData({
        name: '',
        description: '',
        category: 'breakfast',
        difficulty: 'easy',
        prep_time_minutes: 0,
        cook_time_minutes: 0,
        servings: 1,
        food_group_portions: {},
        ingredients: [{ ingredient: '', amount: '', notes: '' }],
        instructions: [{ step: 1, instruction: '' }],
        is_public: false
      });
    }
    setErrors({});
  }, [recipe]);

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

  const updateIngredient = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ingredient: '', amount: '', notes: '' }]
    }));
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }));
    }
  };

  const updateInstruction = (index, value) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) =>
        i === index ? { ...inst, instruction: value } : inst
      )
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, { step: prev.instructions.length + 1, instruction: '' }]
    }));
  };

  const removeInstruction = (index) => {
    if (formData.instructions.length > 1) {
      setFormData(prev => ({
        ...prev,
        instructions: prev.instructions
          .filter((_, i) => i !== index)
          .map((inst, i) => ({ ...inst, step: i + 1 }))
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    // Validate
    const validation = recipesApi.validateRecipe(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setSaving(false);
      return;
    }

    try {
      let savedRecipe;
      if (recipe) {
        // Update existing recipe
        savedRecipe = await recipesApi.updateRecipe(recipe.id, formData);
      } else {
        // Create new recipe
        savedRecipe = await recipesApi.createRecipe(formData);
      }

      onSave(savedRecipe);
    } catch (error) {
      console.error('Error saving recipe:', error);
      setErrors({ general: 'Error al guardar la receta' });
    } finally {
      setSaving(false);
    }
  };

  const calculateNutrition = () => {
    return recipesApi.calculateRecipeNutrition(formData.food_group_portions, foodGroups);
  };

  const nutrition = calculateNutrition();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ChefHat className="h-6 w-6" />
                <h2 className="text-xl font-bold">
                  {recipe ? 'Editar Receta' : 'Nueva Receta'}
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
                        Nombre de la receta *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                        placeholder="Ej: Avena con frutas"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                        placeholder="Descripción breve de la receta"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Categoría
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => updateField('category', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                        >
                          {RECIPE_CATEGORIES.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dificultad
                        </label>
                        <select
                          value={formData.difficulty}
                          onChange={(e) => updateField('difficulty', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                        >
                          {DIFFICULTY_LEVELS.map(level => (
                            <option key={level.id} value={level.id}>{level.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Clock className="h-4 w-4 inline mr-1" />
                          Prep (min)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.prep_time_minutes}
                          onChange={(e) => updateField('prep_time_minutes', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Clock className="h-4 w-4 inline mr-1" />
                          Cocción (min)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.cook_time_minutes}
                          onChange={(e) => updateField('cook_time_minutes', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Users className="h-4 w-4 inline mr-1" />
                          Porciones
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.servings}
                          onChange={(e) => updateField('servings', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Food Group Portions */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-600" />
                    Grupos Alimentarios *
                  </h3>

                  <div className="space-y-3">
                    {foodGroups.map(group => (
                      <div key={group.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: group.color || '#6B7280' }}
                          />
                          <span className="font-medium text-gray-900">{group.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={formData.food_group_portions[group.id] || ''}
                            onChange={(e) => updateFoodGroupPortion(group.id, e.target.value)}
                            className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                            placeholder="0"
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

                {/* Nutrition Summary */}
                {nutrition.totalCalories > 0 && (
                  <div className="bg-green-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Nutricional</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Calorías:</span>
                        <span className="font-semibold text-gray-900 ml-2">{nutrition.totalCalories.toFixed(0)} kcal</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Proteína:</span>
                        <span className="font-semibold text-gray-900 ml-2">{nutrition.totalProtein.toFixed(1)} g</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Carbohidratos:</span>
                        <span className="font-semibold text-gray-900 ml-2">{nutrition.totalCarbs.toFixed(1)} g</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Grasas:</span>
                        <span className="font-semibold text-gray-900 ml-2">{nutrition.totalFat.toFixed(1)} g</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Ingredients & Instructions */}
              <div className="space-y-6">
                {/* Ingredients */}
                <div className="bg-yellow-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Ingredientes *</h3>
                    <button
                      type="button"
                      onClick={addIngredient}
                      className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      <Plus className="h-4 w-4 inline mr-1" />
                      Agregar
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={ingredient.ingredient}
                          onChange={(e) => updateIngredient(index, 'ingredient', e.target.value)}
                          placeholder="Ingrediente"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={ingredient.amount}
                          onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                          placeholder="Cantidad"
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                        {formData.ingredients.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeIngredient(index)}
                            className="px-2 py-2 text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {errors.ingredients && (
                    <p className="text-red-500 text-sm mt-2">{errors.ingredients}</p>
                  )}
                </div>

                {/* Instructions */}
                <div className="bg-purple-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Instrucciones</h3>
                    <button
                      type="button"
                      onClick={addInstruction}
                      className="px-3 py-1 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      <Plus className="h-4 w-4 inline mr-1" />
                      Agregar
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.instructions.map((instruction, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                          {instruction.step}
                        </div>
                        <textarea
                          value={instruction.instruction}
                          onChange={(e) => updateInstruction(index, e.target.value)}
                          placeholder={`Paso ${instruction.step}`}
                          rows={2}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
                        />
                        {formData.instructions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeInstruction(index)}
                            className="px-2 py-2 text-red-600 hover:text-red-800 transition-colors mt-1"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Settings */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración</h3>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.is_public}
                      onChange={(e) => updateField('is_public', e.target.checked)}
                      className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
                    />
                    <span className="text-gray-700">Hacer pública (visible para otros usuarios)</span>
                  </label>
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
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Guardando...' : 'Guardar Receta'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}