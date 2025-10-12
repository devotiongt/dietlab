import React, { useState, useEffect } from 'react';
import { Search, Plus, Utensils, ChefHat, Target, Clock, Users, Copy, Trash2, Edit, Filter, X, ChevronRight, ArrowLeft, Save, Info } from 'lucide-react';
import { dishesApi } from '../../lib/dishes';
import { recipesApi } from '../../lib/recipes';
import { useToast } from '../../hooks/useToast';

const MEAL_TIMES = [
  { id: 'breakfast', name: 'Desayuno' },
  { id: 'morning_snack', name: 'Colación Matutina' },
  { id: 'lunch', name: 'Almuerzo' },
  { id: 'afternoon_snack', name: 'Colación Vespertina' },
  { id: 'dinner', name: 'Cena' }
];

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

export default function DishSelectorWithSidebar({
  mealTime,
  selectedDish,
  onDishSelect,
  foodGroups,
  targetPortions = {},
  isOpen,
  onClose
}) {
  const { success, error } = useToast();
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMealTime, setFilterMealTime] = useState(mealTime || '');
  const [loading, setLoading] = useState(false);

  // Sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState('details'); // 'details', 'new-dish', 'new-recipe', 'edit-dish', 'edit-recipe'
  const [selectedDishForDetails, setSelectedDishForDetails] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // Form states for new dish
  const [newDishForm, setNewDishForm] = useState({
    name: '',
    description: '',
    meal_time: mealTime || 'breakfast',
    recipes: [],
    is_public: false
  });

  // Form states for new recipe
  const [newRecipeForm, setNewRecipeForm] = useState({
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

  const [availableRecipes, setAvailableRecipes] = useState([]);
  const [recipeSearch, setRecipeSearch] = useState('');
  const [saving, setSaving] = useState(false);

  // Load dishes
  useEffect(() => {
    if (isOpen) {
      loadDishes();
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

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Filter dishes
  useEffect(() => {
    let filtered = dishes;

    if (searchTerm.trim()) {
      filtered = filtered.filter(dish =>
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterMealTime) {
      filtered = filtered.filter(dish => dish.meal_time === filterMealTime);
    }

    // Sort by match score
    filtered = filtered.map(dish => ({
      ...dish,
      matchScore: calculateMatchScore(dish, targetPortions, foodGroups)
    })).sort((a, b) => b.matchScore - a.matchScore);

    setFilteredDishes(filtered);
  }, [searchTerm, filterMealTime, dishes, targetPortions, foodGroups]);

  const loadDishes = async () => {
    setLoading(true);
    try {
      const data = await dishesApi.getDishes({ meal_time: filterMealTime });
      setDishes(data);
    } catch (err) {
      console.error('Error loading dishes:', err);
      error('Error al cargar los platos');
    } finally {
      setLoading(false);
    }
  };

  const loadRecipes = async () => {
    try {
      const data = await recipesApi.getRecipes();
      setAvailableRecipes(data);
    } catch (err) {
      console.error('Error loading recipes:', err);
    }
  };

  const calculateMatchScore = (dish, targetPortions, foodGroups) => {
    if (!dish.total_food_group_portions || Object.keys(targetPortions).length === 0) return 0;

    let totalDifference = 0;
    let groupsCompared = 0;

    Object.entries(targetPortions).forEach(([groupId, targetAmount]) => {
      if (targetAmount > 0) {
        const dishAmount = dish.total_food_group_portions[groupId] || 0;
        const difference = Math.abs(dishAmount - targetAmount);
        totalDifference += difference / targetAmount;
        groupsCompared++;
      }
    });

    if (groupsCompared === 0) return 0;
    const averageDifference = totalDifference / groupsCompared;
    return Math.max(0, 100 - (averageDifference * 50));
  };

  const calculateNutrition = (foodGroupPortions) => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    Object.entries(foodGroupPortions || {}).forEach(([groupId, portions]) => {
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

  const openSidebar = (view, data = null) => {
    setSidebarView(view);
    if (view === 'details') {
      setSelectedDishForDetails(data);
    } else if (view === 'edit-dish') {
      setEditingItem(data);
      setNewDishForm({
        name: data.name || '',
        description: data.description || '',
        meal_time: data.meal_time || 'breakfast',
        recipes: data.recipes || [],
        is_public: data.is_public || false
      });
    } else if (view === 'edit-recipe') {
      setEditingItem(data);
      setNewRecipeForm({
        ...data,
        ingredients: data.ingredients?.length > 0 ? data.ingredients : [{ ingredient: '', amount: '', notes: '' }],
        instructions: data.instructions?.length > 0 ? data.instructions : [{ step: 1, instruction: '' }],
      });
    }
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setTimeout(() => {
      setSidebarView('details');
      setSelectedDishForDetails(null);
      setEditingItem(null);
      // Reset forms
      setNewDishForm({
        name: '',
        description: '',
        meal_time: mealTime || 'breakfast',
        recipes: [],
        is_public: false
      });
      setNewRecipeForm({
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
    }, 300);
  };

  const handleSelectDish = (dish) => {
    onDishSelect(dish);
    closeSidebar();
    onClose();
  };

  const handleSaveDish = async () => {
    setSaving(true);
    try {
      // Validate
      if (!newDishForm.name?.trim()) {
        error('El nombre del plato es requerido');
        setSaving(false);
        return;
      }
      if (!newDishForm.recipes || newDishForm.recipes.length === 0) {
        error('Debe incluir al menos una receta');
        setSaving(false);
        return;
      }

      // Prepare data
      const dishData = {
        ...newDishForm,
        recipes: newDishForm.recipes.map(r => ({
          recipe_id: r.recipe_id,
          servings: r.servings
        }))
      };

      let savedDish;
      if (editingItem) {
        savedDish = await dishesApi.updateDish(editingItem.id, dishData);
        success('Plato actualizado correctamente');
      } else {
        savedDish = await dishesApi.createDish(dishData);
        success('Plato creado correctamente');
      }

      // Reload dishes and close sidebar
      await loadDishes();
      closeSidebar();
    } catch (err) {
      console.error('Error saving dish:', err);
      error('Error al guardar el plato');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRecipe = async () => {
    setSaving(true);
    try {
      // Validate
      if (!newRecipeForm.name?.trim()) {
        error('El nombre de la receta es requerido');
        setSaving(false);
        return;
      }

      // Clean up empty ingredients and instructions
      const cleanedForm = {
        ...newRecipeForm,
        ingredients: newRecipeForm.ingredients.filter(i => i.ingredient.trim() !== ''),
        instructions: newRecipeForm.instructions.filter(i => i.instruction.trim() !== '')
      };

      let savedRecipe;
      if (editingItem) {
        savedRecipe = await recipesApi.updateRecipe(editingItem.id, cleanedForm);
        success('Receta actualizada correctamente');
      } else {
        savedRecipe = await recipesApi.createRecipe(cleanedForm);
        success('Receta creada correctamente');
      }

      // Reload recipes and close sidebar
      await loadRecipes();
      closeSidebar();
    } catch (err) {
      console.error('Error saving recipe:', err);
      error('Error al guardar la receta');
    } finally {
      setSaving(false);
    }
  };

  const addRecipeToDish = (recipe) => {
    const existingIndex = newDishForm.recipes.findIndex(r => r.recipe_id === recipe.id);

    if (existingIndex >= 0) {
      // Increase servings if already exists
      setNewDishForm(prev => ({
        ...prev,
        recipes: prev.recipes.map((r, i) =>
          i === existingIndex ? { ...r, servings: r.servings + 1 } : r
        )
      }));
    } else {
      // Add new recipe
      setNewDishForm(prev => ({
        ...prev,
        recipes: [
          ...prev.recipes,
          {
            recipe_id: recipe.id,
            servings: 1,
            recipe_data: recipe
          }
        ]
      }));
    }
  };

  const updateRecipeServings = (index, servings) => {
    setNewDishForm(prev => ({
      ...prev,
      recipes: prev.recipes.map((r, i) =>
        i === index ? { ...r, servings: parseFloat(servings) || 1 } : r
      )
    }));
  };

  const removeRecipeFromDish = (index) => {
    setNewDishForm(prev => ({
      ...prev,
      recipes: prev.recipes.filter((_, i) => i !== index)
    }));
  };

  const addIngredient = () => {
    setNewRecipeForm(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ingredient: '', amount: '', notes: '' }]
    }));
  };

  const updateIngredient = (index, field, value) => {
    setNewRecipeForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const removeIngredient = (index) => {
    setNewRecipeForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const addInstruction = () => {
    setNewRecipeForm(prev => ({
      ...prev,
      instructions: [...prev.instructions, { step: prev.instructions.length + 1, instruction: '' }]
    }));
  };

  const updateInstruction = (index, value) => {
    setNewRecipeForm(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) =>
        i === index ? { ...inst, instruction: value } : inst
      )
    }));
  };

  const removeInstruction = (index) => {
    setNewRecipeForm(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index).map((inst, i) => ({
        ...inst,
        step: i + 1
      }))
    }));
  };

  const updateFoodGroupPortion = (groupId, value) => {
    setNewRecipeForm(prev => ({
      ...prev,
      food_group_portions: {
        ...prev.food_group_portions,
        [groupId]: parseFloat(value) || 0
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex z-40">
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'mr-96' : ''}`}>
        <div className="h-full flex flex-col bg-white m-4 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Utensils className="h-6 w-6" />
                  Seleccionar Plato
                </h2>
                <p className="text-purple-100 mt-1">
                  {MEAL_TIMES.find(t => t.id === mealTime)?.name || 'Tiempo de comida'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="border-b bg-gray-50 p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar platos..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={filterMealTime}
                onChange={(e) => setFilterMealTime(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400"
              >
                <option value="">Todos los tiempos</option>
                {MEAL_TIMES.map(time => (
                  <option key={time.id} value={time.id}>{time.name}</option>
                ))}
              </select>
              <button
                onClick={() => openSidebar('new-dish')}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nuevo Plato
              </button>
              <button
                onClick={() => openSidebar('new-recipe')}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
              >
                <ChefHat className="h-4 w-4" />
                Nueva Receta
              </button>
            </div>
          </div>

          {/* Dishes Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : filteredDishes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDishes.map(dish => {
                  const nutrition = calculateNutrition(dish.total_food_group_portions);
                  const isSelected = selectedDish?.id === dish.id;

                  return (
                    <div
                      key={dish.id}
                      className={`border rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer ${
                        isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                      }`}
                      onClick={() => openSidebar('details', dish)}
                    >
                      {/* Dish Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{dish.name}</h3>
                          {dish.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{dish.description}</p>
                          )}
                        </div>
                        {dish.matchScore >= 80 && (
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            {Math.round(dish.matchScore)}% match
                          </span>
                        )}
                      </div>

                      {/* Nutrition Summary */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="text-lg font-semibold text-gray-900">
                            {Math.round(nutrition.totalCalories)}
                          </div>
                          <div className="text-xs text-gray-600">kcal</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="text-sm font-medium text-gray-900">
                            P: {Math.round(nutrition.totalProtein)}g
                          </div>
                          <div className="text-xs text-gray-600">Proteína</div>
                        </div>
                      </div>

                      {/* Recipe Count */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <ChefHat className="h-4 w-4" />
                          {dish.recipes?.length || 0} recetas
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectDish(dish);
                          }}
                          className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                        >
                          Seleccionar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron platos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {sidebarView === 'details' && <Info className="h-5 w-5" />}
                {sidebarView === 'new-dish' && <Utensils className="h-5 w-5" />}
                {sidebarView === 'edit-dish' && <Edit className="h-5 w-5" />}
                {sidebarView === 'new-recipe' && <ChefHat className="h-5 w-5" />}
                {sidebarView === 'edit-recipe' && <Edit className="h-5 w-5" />}
                {sidebarView === 'details' && 'Detalles del Plato'}
                {sidebarView === 'new-dish' && 'Nuevo Plato'}
                {sidebarView === 'edit-dish' && 'Editar Plato'}
                {sidebarView === 'new-recipe' && 'Nueva Receta'}
                {sidebarView === 'edit-recipe' && 'Editar Receta'}
              </h3>
              <button
                onClick={closeSidebar}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Details View */}
            {sidebarView === 'details' && selectedDishForDetails && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">{selectedDishForDetails.name}</h4>
                  {selectedDishForDetails.description && (
                    <p className="text-gray-600 mt-1">{selectedDishForDetails.description}</p>
                  )}
                </div>

                {/* Nutrition Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-3">Información Nutricional</h5>
                  {(() => {
                    const nutrition = calculateNutrition(selectedDishForDetails.total_food_group_portions);
                    return (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded text-center">
                          <div className="text-2xl font-bold text-blue-600">{Math.round(nutrition.totalCalories)}</div>
                          <div className="text-xs text-gray-600">Calorías</div>
                        </div>
                        <div className="bg-white p-3 rounded text-center">
                          <div className="text-lg font-bold text-green-600">{Math.round(nutrition.totalProtein)}g</div>
                          <div className="text-xs text-gray-600">Proteína</div>
                        </div>
                        <div className="bg-white p-3 rounded text-center">
                          <div className="text-lg font-bold text-yellow-600">{Math.round(nutrition.totalCarbs)}g</div>
                          <div className="text-xs text-gray-600">Carbohidratos</div>
                        </div>
                        <div className="bg-white p-3 rounded text-center">
                          <div className="text-lg font-bold text-orange-600">{Math.round(nutrition.totalFat)}g</div>
                          <div className="text-xs text-gray-600">Grasas</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Food Groups */}
                {selectedDishForDetails.total_food_group_portions && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-3">Grupos Alimentarios</h5>
                    <div className="space-y-2">
                      {Object.entries(selectedDishForDetails.total_food_group_portions).map(([groupId, portions]) => {
                        const group = foodGroups.find(g => g.id === groupId);
                        if (!group || portions === 0) return null;
                        return (
                          <div key={groupId} className="flex items-center justify-between p-2 bg-white rounded">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color || '#6B7280' }} />
                              <span className="text-sm font-medium text-gray-700">{group.name}</span>
                            </div>
                            <span className="text-sm font-semibold text-purple-600">{portions} porciones</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recipes */}
                {selectedDishForDetails.recipes && selectedDishForDetails.recipes.length > 0 && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-3">Recetas Incluidas</h5>
                    <div className="space-y-2">
                      {selectedDishForDetails.recipes.map((recipe, index) => (
                        <div key={index} className="p-3 bg-white rounded">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{recipe.name}</span>
                            <span className="text-sm text-orange-600 font-medium">{recipe.servings}x</span>
                          </div>
                          {recipe.description && (
                            <p className="text-sm text-gray-600 mt-1">{recipe.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => handleSelectDish(selectedDishForDetails)}
                    className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Seleccionar
                  </button>
                  <button
                    onClick={() => openSidebar('edit-dish', selectedDishForDetails)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* New/Edit Dish Form */}
            {(sidebarView === 'new-dish' || sidebarView === 'edit-dish') && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del plato *
                  </label>
                  <input
                    type="text"
                    value={newDishForm.name}
                    onChange={(e) => setNewDishForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400"
                    placeholder="Ej: Desayuno Completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={newDishForm.description}
                    onChange={(e) => setNewDishForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400"
                    placeholder="Descripción del plato"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiempo de comida
                  </label>
                  <select
                    value={newDishForm.meal_time}
                    onChange={(e) => setNewDishForm(prev => ({ ...prev, meal_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400"
                  >
                    {MEAL_TIMES.map(time => (
                      <option key={time.id} value={time.id}>{time.name}</option>
                    ))}
                  </select>
                </div>

                {/* Recipe Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recetas *
                  </label>

                  {/* Recipe Search */}
                  <div className="mb-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        value={recipeSearch}
                        onChange={(e) => setRecipeSearch(e.target.value)}
                        placeholder="Buscar recetas..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                  </div>

                  {/* Available Recipes */}
                  <div className="max-h-40 overflow-y-auto border rounded-lg mb-3">
                    {availableRecipes
                      .filter(r =>
                        !recipeSearch ||
                        r.name.toLowerCase().includes(recipeSearch.toLowerCase())
                      )
                      .map(recipe => (
                        <button
                          key={recipe.id}
                          type="button"
                          onClick={() => addRecipeToDish(recipe)}
                          className="w-full text-left p-2 hover:bg-purple-50 border-b last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">{recipe.name}</span>
                            <Plus className="h-4 w-4 text-purple-500" />
                          </div>
                        </button>
                      ))}
                  </div>

                  {/* Selected Recipes */}
                  {newDishForm.recipes.length > 0 && (
                    <div className="space-y-2">
                      {newDishForm.recipes.map((recipeItem, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                          <ChefHat className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          <span className="flex-1 text-sm font-medium text-gray-900">
                            {recipeItem.recipe_data?.name || 'Receta'}
                          </span>
                          <input
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={recipeItem.servings}
                            onChange={(e) => updateRecipeServings(index, e.target.value)}
                            className="w-16 px-2 py-1 text-center text-sm border border-gray-300 rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeRecipeFromDish(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newDishForm.is_public}
                    onChange={(e) => setNewDishForm(prev => ({ ...prev, is_public: e.target.checked }))}
                    className="w-4 h-4 text-purple-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Hacer público</span>
                </label>

                <button
                  onClick={handleSaveDish}
                  disabled={saving || !newDishForm.name || newDishForm.recipes.length === 0}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Guardando...' : (editingItem ? 'Actualizar Plato' : 'Guardar Plato')}
                </button>
              </div>
            )}

            {/* New/Edit Recipe Form */}
            {(sidebarView === 'new-recipe' || sidebarView === 'edit-recipe') && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la receta *
                  </label>
                  <input
                    type="text"
                    value={newRecipeForm.name}
                    onChange={(e) => setNewRecipeForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    placeholder="Ej: Avena con frutas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={newRecipeForm.description}
                    onChange={(e) => setNewRecipeForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    placeholder="Descripción de la receta"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <select
                      value={newRecipeForm.category}
                      onChange={(e) => setNewRecipeForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
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
                      value={newRecipeForm.difficulty}
                      onChange={(e) => setNewRecipeForm(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    >
                      {DIFFICULTY_LEVELS.map(level => (
                        <option key={level.id} value={level.id}>{level.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prep (min)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newRecipeForm.prep_time_minutes}
                      onChange={(e) => setNewRecipeForm(prev => ({ ...prev, prep_time_minutes: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cocción (min)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newRecipeForm.cook_time_minutes}
                      onChange={(e) => setNewRecipeForm(prev => ({ ...prev, cook_time_minutes: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Porciones
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newRecipeForm.servings}
                      onChange={(e) => setNewRecipeForm(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                </div>

                {/* Food Groups */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grupos Alimentarios
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-2">
                    {foodGroups.map(group => (
                      <div key={group.id} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: group.color || '#6B7280' }} />
                        <span className="flex-1 text-sm text-gray-700">{group.name}</span>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={newRecipeForm.food_group_portions[group.id] || 0}
                          onChange={(e) => updateFoodGroupPortion(group.id, e.target.value)}
                          className="w-16 px-2 py-1 text-center text-sm border border-gray-300 rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Ingredientes
                    </label>
                    <button
                      type="button"
                      onClick={addIngredient}
                      className="text-sm text-pink-500 hover:text-pink-600"
                    >
                      + Agregar
                    </button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {newRecipeForm.ingredients.map((ing, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={ing.amount}
                          onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                          placeholder="Cantidad"
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={ing.ingredient}
                          onChange={(e) => updateIngredient(index, 'ingredient', e.target.value)}
                          placeholder="Ingrediente"
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Instrucciones
                    </label>
                    <button
                      type="button"
                      onClick={addInstruction}
                      className="text-sm text-pink-500 hover:text-pink-600"
                    >
                      + Agregar
                    </button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {newRecipeForm.instructions.map((inst, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="w-8 text-sm font-medium text-gray-500">{inst.step}.</span>
                        <input
                          type="text"
                          value={inst.instruction}
                          onChange={(e) => updateInstruction(index, e.target.value)}
                          placeholder="Instrucción"
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeInstruction(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSaveRecipe}
                  disabled={saving || !newRecipeForm.name}
                  className="w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Guardando...' : (editingItem ? 'Actualizar Receta' : 'Guardar Receta')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}