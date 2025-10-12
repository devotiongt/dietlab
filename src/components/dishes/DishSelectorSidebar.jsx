import React, { useState, useEffect } from 'react';
import { Search, Plus, Utensils, ChefHat, Target, Clock, Users, Copy, Trash2, Edit, Filter, X, ChevronRight, ArrowLeft, Save, Info, ChevronLeft } from 'lucide-react';
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

export default function DishSelectorSidebar({
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

  // View states - 'list', 'details', 'new-dish', 'edit-dish', 'edit-recipe'
  const [currentView, setCurrentView] = useState('list');
  const [showRecipeForm, setShowRecipeForm] = useState(false); // Show recipe form within dish form
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

  // Load dishes when opening
  useEffect(() => {
    if (isOpen) {
      loadDishes();
      loadRecipes();
      setCurrentView('list');
    }
  }, [isOpen]);

  // Block body scroll when sidebar is open
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

  const changeView = (view, data = null) => {
    setCurrentView(view);
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
    } else if (view === 'list') {
      // Reset forms when going back to list
      setSelectedDishForDetails(null);
      setEditingItem(null);
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
    }
  };

  const handleSelectDish = (dish) => {
    onDishSelect(dish);
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

      // Reload dishes and go back to list
      await loadDishes();
      changeView('list');
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

        // If creating from within dish form, add to dish
        if (showRecipeForm && currentView === 'new-dish') {
          addRecipeToDish(savedRecipe);
        }
      }

      // Reload recipes
      await loadRecipes();

      // If in dish form, go back to dish form, otherwise go to list
      if (showRecipeForm && currentView === 'new-dish') {
        setShowRecipeForm(false);
        // Reset recipe form
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
      } else {
        changeView('list');
      }
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
      setNewDishForm(prev => ({
        ...prev,
        recipes: prev.recipes.map((r, i) =>
          i === existingIndex ? { ...r, servings: r.servings + 1 } : r
        )
      }));
    } else {
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

  // Render header based on current view
  const renderHeader = () => {
    const titles = {
      'list': 'Seleccionar Plato',
      'details': 'Detalles del Plato',
      'new-dish': showRecipeForm ? 'Nueva Receta' : 'Nuevo Plato',
      'edit-dish': 'Editar Plato',
      'edit-recipe': 'Editar Receta'
    };

    const icons = {
      'list': <Utensils className="h-5 w-5" />,
      'details': <Info className="h-5 w-5" />,
      'new-dish': showRecipeForm ? <ChefHat className="h-5 w-5" /> : <Utensils className="h-5 w-5" />,
      'edit-dish': <Edit className="h-5 w-5" />,
      'edit-recipe': <Edit className="h-5 w-5" />
    };

    return (
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(currentView !== 'list' || showRecipeForm) && (
              <button
                onClick={() => {
                  if (showRecipeForm) {
                    setShowRecipeForm(false);
                    // Reset recipe form
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
                  } else {
                    changeView('list');
                  }
                }}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {icons[currentView]}
            <h3 className="text-lg font-semibold">{titles[currentView]}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {currentView === 'list' && mealTime && (
          <p className="text-purple-100 text-sm mt-2">
            {MEAL_TIMES.find(t => t.id === mealTime)?.name}
          </p>
        )}
      </div>
    );
  };

  // Render list view
  const renderListView = () => (
    <div className="flex flex-col h-full">
      {/* Search and Filters */}
      <div className="p-4 border-b bg-gray-50">
        <div className="space-y-3">
          {/* Search Bar */}
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

          {/* Meal Time Filter */}
          <select
            value={filterMealTime}
            onChange={(e) => setFilterMealTime(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400"
          >
            <option value="">Todos los tiempos</option>
            {MEAL_TIMES.map(time => (
              <option key={time.id} value={time.id}>{time.name}</option>
            ))}
          </select>

          {/* Action Button */}
          <button
            onClick={() => changeView('new-dish')}
            className="w-full px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            Nuevo Plato
          </button>
        </div>
      </div>

      {/* Dishes List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredDishes.length > 0 ? (
          <div className="space-y-3">
            {filteredDishes.map(dish => {
              const nutrition = calculateNutrition(dish.total_food_group_portions);
              const isSelected = selectedDish?.id === dish.id;

              return (
                <div
                  key={dish.id}
                  className={`border rounded-lg p-3 hover:shadow-md transition-all cursor-pointer ${
                    isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => changeView('details', dish)}
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
                        handleSelectDish(dish);
                      }}
                      className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-xs font-medium"
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

  // Render details view
  const renderDetailsView = () => {
    if (!selectedDishForDetails) return null;
    const nutrition = calculateNutrition(selectedDishForDetails.total_food_group_portions);

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Dish Info */}
            <div>
              <h4 className="font-semibold text-gray-900 text-lg">{selectedDishForDetails.name}</h4>
              {selectedDishForDetails.description && (
                <p className="text-gray-600 mt-1">{selectedDishForDetails.description}</p>
              )}
            </div>

            {/* Nutrition Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-3">Información Nutricional</h5>
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
          </div>
        </div>

        {/* Actions */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex gap-2">
            <button
              onClick={() => handleSelectDish(selectedDishForDetails)}
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Seleccionar
            </button>
            <button
              onClick={() => changeView('edit-dish', selectedDishForDetails)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render dish form
  const renderDishForm = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
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
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Recetas *
              </label>
              <button
                type="button"
                onClick={() => setShowRecipeForm(true)}
                className="text-sm text-purple-500 hover:text-purple-600 font-medium flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Crear Nueva Receta
              </button>
            </div>

            {/* Recipe Search */}
            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={recipeSearch}
                  onChange={(e) => setRecipeSearch(e.target.value)}
                  placeholder="Buscar recetas existentes..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>

            {/* Available Recipes */}
            <div className="max-h-32 overflow-y-auto border rounded-lg mb-3">
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
        </div>
      </div>

      {/* Save Button */}
      <div className="border-t p-4 bg-gray-50">
        <button
          onClick={handleSaveDish}
          disabled={saving || !newDishForm.name || newDishForm.recipes.length === 0}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Guardando...' : (editingItem ? 'Actualizar Plato' : 'Guardar Plato')}
        </button>
      </div>
    </div>
  );

  // Render recipe form
  const renderRecipeForm = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
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
        </div>
      </div>

      {/* Save Button */}
      <div className="border-t p-4 bg-gray-50">
        <button
          onClick={handleSaveRecipe}
          disabled={saving || !newRecipeForm.name}
          className="w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Guardando...' : (editingItem ? 'Actualizar Receta' : 'Guardar Receta')}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {renderHeader()}

        <div className="flex-1 overflow-hidden">
          {currentView === 'list' && renderListView()}
          {currentView === 'details' && renderDetailsView()}
          {(currentView === 'new-dish' || currentView === 'edit-dish') && !showRecipeForm && renderDishForm()}
          {(currentView === 'new-dish' && showRecipeForm) && renderRecipeForm()}
          {currentView === 'edit-recipe' && renderRecipeForm()}
        </div>
      </div>
    </>
  );
}