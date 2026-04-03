import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, Utensils, Edit, Info, X } from 'lucide-react';
import { dishesApi } from '../../lib/dishes';
import { useToast } from '../../hooks/useToast';
import DishForm from './DishForm';
import DishList from './DishList';
import DishDetails from './DishDetails';

const MEAL_TIMES = [
  { id: 'breakfast', name: 'Desayuno' },
  { id: 'morning_snack', name: 'Colación Matutina' },
  { id: 'lunch', name: 'Almuerzo' },
  { id: 'afternoon_snack', name: 'Colación Vespertina' },
  { id: 'dinner', name: 'Cena' }
];

export default function DishSelectorSidebar({
  mealTime,
  selectedDish,
  onDishSelect,
  foodGroups,
  targetPortions = {},
  isOpen,
  onClose,
  initialView = 'list', // 'list', 'new-dish'
  patientContext = null
}) {
  const { success, error } = useToast();
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMealTime, setFilterMealTime] = useState(mealTime || '');
  const [loading, setLoading] = useState(false);

  // View states - 'list', 'details', 'new-dish', 'edit-dish'
  const [currentView, setCurrentView] = useState('list');
  const [selectedDishForDetails, setSelectedDishForDetails] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // Form states for new dish
  const [newDishForm, setNewDishForm] = useState({
    name: '',
    description: '',
    meal_time: mealTime || 'breakfast',
    food_group_portions: {},
    ingredients: [{ ingredient: '', amount: '', notes: '' }],
    instructions: [{ step: 1, instruction: '' }],
    prep_time_minutes: 0,
    cook_time_minutes: 0,
    is_public: false
  });

  const [saving, setSaving] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  // Load dishes when opening
  useEffect(() => {
    if (isOpen) {
      loadDishes();
      setCurrentView(initialView);
    }
  }, [isOpen, initialView]);

  // Block body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setIsAIAssistantOpen(false);
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

  const calculateMatchScore = (dish, targetPortions, foodGroups) => {
    if (!dish.food_group_portions || Object.keys(targetPortions).length === 0) return 0;

    let totalDifference = 0;
    let groupsCompared = 0;

    Object.entries(targetPortions).forEach(([groupId, targetAmount]) => {
      if (targetAmount > 0) {
        const dishAmount = dish.food_group_portions[groupId] || 0;
        const difference = Math.abs(dishAmount - targetAmount);
        totalDifference += difference / targetAmount;
        groupsCompared++;
      }
    });

    if (groupsCompared === 0) return 0;
    const averageDifference = totalDifference / groupsCompared;
    return Math.max(0, 100 - (averageDifference * 50));
  };

  const calculateNutrition = (dish) => dishesApi.getDishNutrition(dish, foodGroups);

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
        food_group_portions: data.food_group_portions || {},
        ingredients: data.ingredients?.length > 0 ? data.ingredients : [{ ingredient: '', amount: '', notes: '' }],
        instructions: data.instructions?.length > 0 ? data.instructions : [{ step: 1, instruction: '' }],
        prep_time_minutes: data.prep_time_minutes || 0,
        cook_time_minutes: data.cook_time_minutes || 0,
        is_public: data.is_public || false
      });
    } else if (view === 'list') {
      // Reset forms when going back to list
      setSelectedDishForDetails(null);
      setEditingItem(null);
      setNewDishForm({
        name: '',
        description: '',
        meal_time: mealTime || 'breakfast',
        food_group_portions: {},
        ingredients: [{ ingredient: '', amount: '', notes: '' }],
        instructions: [{ step: 1, instruction: '' }],
        prep_time_minutes: 0,
        cook_time_minutes: 0,
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
      // Validate using the API's validation
      const validation = dishesApi.validateDish(newDishForm);
      if (!validation.isValid) {
        error(Object.values(validation.errors)[0]);
        setSaving(false);
        return;
      }

      // Clean up empty ingredients and instructions
      const cleanedForm = {
        ...newDishForm,
        ingredients: newDishForm.ingredients.filter(i => i.ingredient.trim() !== ''),
        instructions: newDishForm.instructions.filter(i => i.instruction.trim() !== '')
      };

      let savedDish;
      if (editingItem) {
        savedDish = await dishesApi.updateDish(editingItem.id, cleanedForm);
        success('Plato actualizado correctamente');
      } else {
        savedDish = await dishesApi.createDish(cleanedForm);
        success('Plato creado correctamente');
      }

      // Auto-select the saved dish if creating (not editing)
      if (!editingItem && savedDish) {
        handleSelectDish(savedDish);
      } else {
        await loadDishes();
        changeView('list');
      }
    } catch (err) {
      console.error('Error saving dish:', err);
      error('Error al guardar el plato');
    } finally {
      setSaving(false);
    }
  };

  // Render header based on current view
  const renderHeader = () => {
    const titles = {
      'list': 'Seleccionar Plato',
      'details': 'Detalles del Plato',
      'new-dish': 'Nuevo Plato',
      'edit-dish': 'Editar Plato'
    };

    const subtitles = {
      'list': 'Busca o crea un plato',
      'details': 'Información del plato',
      'new-dish': 'Completa los datos del plato',
      'edit-dish': 'Modifica los datos del plato'
    };

    const icons = {
      'list': <Utensils className="h-5 w-5" />,
      'details': <Info className="h-5 w-5" />,
      'new-dish': <Utensils className="h-5 w-5" />,
      'edit-dish': <Edit className="h-5 w-5" />
    };

    return (
      <div className="bg-white border-b border-gray-200 px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {currentView !== 'list' && currentView !== initialView && (
              <button
                onClick={() => changeView(initialView)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <div className="p-1.5 bg-green-50 rounded-lg text-green-600">
              {icons[currentView]}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{titles[currentView]}</h3>
              <p className="text-xs text-gray-500">
                {currentView === 'list' && mealTime
                  ? MEAL_TIMES.find(t => t.id === mealTime)?.name
                  : subtitles[currentView]}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };

  // Render list view
  const renderListView = () => (
    <DishList
      dishes={filteredDishes}
      loading={loading}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      filterMealTime={filterMealTime}
      onFilterChange={setFilterMealTime}
      onNewDish={() => changeView('new-dish')}
      onDishClick={(dish) => changeView('details', dish)}
      onDishSelect={handleSelectDish}
      selectedDish={selectedDish}
      calculateNutrition={calculateNutrition}
      targetPortions={targetPortions}
      foodGroups={foodGroups}
      mealTime={mealTime}
    />
  );

  // Render details view
  const renderDetailsView = () => (
    <DishDetails
      dish={selectedDishForDetails}
      foodGroups={foodGroups}
      calculateNutrition={calculateNutrition}
      onSelect={handleSelectDish}
      onEdit={(dish) => changeView('edit-dish', dish)}
    />
  );

  // Render dish form
  const renderDishForm = () => (
    <DishForm
      dishData={newDishForm}
      onUpdate={setNewDishForm}
      foodGroups={foodGroups}
      onSave={handleSaveDish}
      saving={saving}
      isEditing={!!editingItem}
      targetPortions={targetPortions}
      onAIAssistantToggle={setIsAIAssistantOpen}
      parentOpen={isOpen}
      patientContext={patientContext}
      mealTime={mealTime}
    />
  );

  return createPortal(
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[60]"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className="fixed top-0 h-full w-[680px] max-w-[90vw] bg-white shadow-2xl transition-all duration-300 ease-in-out z-[70] flex flex-col"
        style={{
          right: isOpen
            ? (isAIAssistantOpen ? '500px' : '0')
            : '-700px'
        }}
      >
        {renderHeader()}

        <div className="flex-1 overflow-hidden">
          {currentView === 'list' && renderListView()}
          {currentView === 'details' && renderDetailsView()}
          {(currentView === 'new-dish' || currentView === 'edit-dish') && renderDishForm()}
        </div>
      </div>
    </>,
    document.body
  );
}
