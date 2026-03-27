import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Save, Apple, Wheat, Milk, Beef, Droplet, Sparkles, Carrot, Target, Clock, X, Bot, ChefHat, Utensils, ShoppingCart, ChevronDown, AlertTriangle, User, Heart } from 'lucide-react';
import AIAssistantSidebar from './AIAssistantSidebar';
import { foodExchangesApi } from '../../lib/food-exchanges';

const MEAL_TIMES = [
  { id: 'breakfast', name: 'Desayuno' },
  { id: 'morning_snack', name: 'Colación Matutina' },
  { id: 'lunch', name: 'Almuerzo' },
  { id: 'afternoon_snack', name: 'Colación Vespertina' },
  { id: 'dinner', name: 'Cena' }
];

// Helper function to parse fractions and decimals
const parseAmount = (amount) => {
  if (!amount) return 0;

  // Handle fractions like "1/2", "1/4", etc.
  if (typeof amount === 'string' && amount.includes('/')) {
    const [numerator, denominator] = amount.split('/').map(n => parseFloat(n.trim()));
    if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
      return numerator / denominator;
    }
  }

  // Handle regular numbers
  const parsed = parseFloat(amount);
  return isNaN(parsed) ? 0 : parsed;
};

// Helper function to pluralize units
const pluralizeUnit = (unit, amount) => {
  if (!unit || !amount) return unit;

  const numAmount = parseAmount(amount);
  if (isNaN(numAmount) || numAmount <= 1) return unit;

  // Pluralization rules for Spanish units
  const pluralRules = {
    'unidad': 'unidades',
    'taza': 'tazas',
    'cucharada': 'cucharadas',
    'cucharadita': 'cucharaditas',
    'litro': 'litros',
    'mililitro': 'mililitros',
    'kilogramo': 'kilogramos',
    'gramo': 'gramos',
    'libra': 'libras',
    'lb': 'lb',
    'onza': 'onzas',
    'pizca': 'pizcas'
  };

  return pluralRules[unit] || unit;
};

// Helper function to get icon for food group
const getFoodGroupIcon = (groupName) => {
  const name = groupName.toLowerCase();
  if (name.includes('fruta')) return Apple;
  if (name.includes('verdura') || name.includes('vegetal')) return Carrot;
  if (name.includes('cereal') || name.includes('grano') || name.includes('pan')) return Wheat;
  if (name.includes('lácteo') || name.includes('leche') || name.includes('yogur')) return Milk;
  if (name.includes('carne') || name.includes('proteína') || name.includes('pollo') || name.includes('pescado') || name.includes('leguminosa')) return Beef;
  if (name.includes('grasa') || name.includes('aceite')) return Droplet;
  if (name.includes('azúcar') || name.includes('dulce')) return Sparkles;
  return Target;
};

export default function DishForm({
  dishData,
  onUpdate,
  foodGroups,
  onSave,
  saving = false,
  isEditing = false,
  targetPortions = {},
  onAIAssistantToggle = null,
  parentOpen = true,
  patientContext = null,
  mealTime = null
}) {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [exchangeList, setExchangeList] = useState([]);
  const [openFoodGroupDropdown, setOpenFoodGroupDropdown] = useState(null);
  const foodGroupDropdownRef = useRef(null);

  useEffect(() => {
    foodExchangesApi.getExchanges().then(setExchangeList).catch(() => {});
  }, []);

  // Close food group dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (foodGroupDropdownRef.current && !foodGroupDropdownRef.current.contains(e.target)) {
        setOpenFoodGroupDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close AI assistant when parent sidebar closes
  useEffect(() => {
    if (!parentOpen) {
      setShowAIAssistant(false);
    }
  }, [parentOpen]);

  // Notify parent when AI assistant opens/closes
  useEffect(() => {
    if (onAIAssistantToggle) {
      onAIAssistantToggle(showAIAssistant);
    }
  }, [showAIAssistant, onAIAssistantToggle]);

  const updateField = (field, value) => {
    onUpdate({ ...dishData, [field]: value });
  };

  const updateIngredient = (index, field, value) => {
    const newIngredients = dishData.ingredients.map((ing, i) =>
      i === index ? { ...ing, [field]: value } : ing
    );
    onUpdate({ ...dishData, ingredients: newIngredients });
  };

  const addIngredient = () => {
    onUpdate({
      ...dishData,
      ingredients: [...dishData.ingredients, {
        ingredient: '',
        amount: '',
        unit: 'taza',
        food_group_id: '',
        food_group_name: '',
        food_group_portions: 0,
        shopping_list_conversion: { amount: 0, unit: 'lb', name: '' }
      }]
    });
  };

  const removeIngredient = (index) => {
    onUpdate({
      ...dishData,
      ingredients: dishData.ingredients.filter((_, i) => i !== index)
    });
  };

  const updateInstruction = (index, value) => {
    const newInstructions = dishData.instructions.map((inst, i) =>
      i === index ? { ...inst, instruction: value } : inst
    );
    onUpdate({ ...dishData, instructions: newInstructions });
  };

  const addInstruction = () => {
    onUpdate({
      ...dishData,
      instructions: [
        ...dishData.instructions,
        { step: dishData.instructions.length + 1, instruction: '' }
      ]
    });
  };

  const removeInstruction = (index) => {
    if (dishData.instructions.length > 1) {
      const newInstructions = dishData.instructions
        .filter((_, i) => i !== index)
        .map((inst, i) => ({ ...inst, step: i + 1 }));
      onUpdate({ ...dishData, instructions: newInstructions });
    }
  };

  // Calculate food group portions from embedded ingredient data
  const calculateFoodGroupPortions = () => {
    const portions = {};

    dishData.ingredients?.forEach(ingredient => {
      if (ingredient.food_group_id && ingredient.food_group_portions) {
        const groupId = ingredient.food_group_id;
        portions[groupId] = (portions[groupId] || 0) + (ingredient.food_group_portions || 0);
      }
    });

    return portions;
  };

  const calculatedPortions = calculateFoodGroupPortions();

  // Handle save - update food_group_portions with calculated values before saving
  const handleSave = () => {
    // Update the dish data with calculated portions before saving
    onUpdate({ ...dishData, food_group_portions: calculatedPortions });
    // Call the original onSave after a brief delay to ensure state is updated
    setTimeout(() => {
      onSave();
    }, 0);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top bar: subtitle + AI button */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
        <p className="text-sm text-gray-500">Completa los datos del plato</p>
        <button
          type="button"
          onClick={() => setShowAIAssistant(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
        >
          <Bot className="h-4 w-4" />
          Asistente IA
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="space-y-5">

          {/* === CONTEXTO DEL PACIENTE === */}
          {patientContext && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-200">
                <h3 className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Contexto del paciente
                </h3>
              </div>
              <div className="px-4 py-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700">{patientContext.name}</span>
                  {patientContext.vetCalories && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {patientContext.vetCalories} kcal/día
                    </span>
                  )}
                  {mealTime && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                      {MEAL_TIMES.find(t => t.id === mealTime)?.name || mealTime}
                    </span>
                  )}
                </div>
                {patientContext.diseases.length > 0 && (
                  <div className="flex items-start gap-1.5">
                    <Heart className="h-3.5 w-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {patientContext.diseases.map((d, i) => (
                        <span key={i} className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-200">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {patientContext.allergies.length > 0 && (
                  <div className="flex items-start gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {patientContext.allergies.map((a, i) => (
                        <span key={i} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* === INFORMACIÓN DEL PLATO === */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Utensils className="h-4 w-4 text-green-600" />
                Información del plato
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {/* Nombre */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={dishData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  placeholder="Ej: Desayuno Completo"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
                <input
                  type="text"
                  value={dishData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  placeholder="Descripción breve del plato"
                />
              </div>

              {/* Tiempo de comida + prep + cocción */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tiempo de comida</label>
                  <select
                    value={dishData.meal_time}
                    onChange={(e) => updateField('meal_time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  >
                    {MEAL_TIMES.map(time => (
                      <option key={time.id} value={time.id}>{time.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    <Clock className="h-3 w-3 inline mr-0.5" /> Prep (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={dishData.prep_time_minutes || 0}
                    onChange={(e) => updateField('prep_time_minutes', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    <Clock className="h-3 w-3 inline mr-0.5" /> Cocción (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={dishData.cook_time_minutes || 0}
                    onChange={(e) => updateField('cook_time_minutes', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* === INGREDIENTES === */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <ChefHat className="h-4 w-4 text-green-600" />
                Ingredientes *
                {dishData.ingredients?.length > 0 && (
                  <span className="text-xs font-normal text-gray-400">({dishData.ingredients.length})</span>
                )}
              </h3>
              <button
                type="button"
                onClick={addIngredient}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Agregar
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {dishData.ingredients?.map((ingredient, index) => {
                const IconComponent = ingredient.food_group_name ? getFoodGroupIcon(ingredient.food_group_name) : Target;
                const foodGroup = foodGroups.find(g => g.id === ingredient.food_group_id);

                return (
                  <div key={index} className="px-4 py-3">
                    {/* Row 1: Name, Amount, Unit | Food Group, Portions, Delete */}
                    <div className="flex items-center gap-2">
                      <IconComponent
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: foodGroup?.color || '#9CA3AF' }}
                      />
                      <input
                        type="text"
                        value={ingredient.ingredient}
                        onChange={(e) => updateIngredient(index, 'ingredient', e.target.value)}
                        placeholder="Nombre del ingrediente"
                        className="flex-1 min-w-0 px-2 py-1 text-sm font-medium border border-gray-200 rounded focus:ring-1 focus:ring-green-400 focus:border-green-400 placeholder-gray-400"
                      />
                      <input
                        type="text"
                        value={ingredient.amount}
                        onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                        placeholder="0.5"
                        className="w-14 px-2 py-1 text-sm text-center border border-gray-200 rounded focus:ring-1 focus:ring-green-400 focus:border-green-400"
                      />
                      <select
                        value={ingredient.unit || 'taza'}
                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                        className="w-20 px-1 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-green-400 focus:border-green-400"
                      >
                        <option value="taza">taza</option>
                        <option value="lb">lb</option>
                        <option value="unidad">unid</option>
                        <option value="cucharada">cda</option>
                        <option value="cucharadita">cdita</option>
                        <option value="onza">oz</option>
                        <option value="gramo">g</option>
                      </select>
                      <div className="w-px h-5 bg-gray-200 mx-0.5" />
                      <div className="relative" ref={openFoodGroupDropdown === index ? foodGroupDropdownRef : null}>
                        <button
                          type="button"
                          onClick={() => setOpenFoodGroupDropdown(openFoodGroupDropdown === index ? null : index)}
                          className="w-40 flex items-center gap-1.5 px-2 py-1 text-xs border border-gray-200 rounded hover:border-gray-300 focus:ring-1 focus:ring-green-400 focus:border-green-400 bg-white"
                        >
                          {foodGroup ? (
                            <>
                              <IconComponent className="h-3.5 w-3.5 flex-shrink-0" style={{ color: foodGroup.color || '#9CA3AF' }} />
                              <span className="truncate flex-1 text-left text-gray-700">{foodGroup.name}</span>
                            </>
                          ) : (
                            <span className="flex-1 text-left text-gray-400">Grupo...</span>
                          )}
                          <ChevronDown className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        </button>
                        {openFoodGroupDropdown === index && (
                          <div className="absolute z-20 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-48 overflow-y-auto">
                            <button
                              type="button"
                              onClick={() => {
                                updateIngredient(index, 'food_group_id', '');
                                updateIngredient(index, 'food_group_name', '');
                                setOpenFoodGroupDropdown(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-50"
                            >
                              Sin grupo
                            </button>
                            {foodGroups.map(group => {
                              const GroupIcon = getFoodGroupIcon(group.name);
                              return (
                                <button
                                  key={group.id}
                                  type="button"
                                  onClick={() => {
                                    updateIngredient(index, 'food_group_id', group.id);
                                    updateIngredient(index, 'food_group_name', group.name);
                                    setOpenFoodGroupDropdown(null);
                                  }}
                                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-green-50 ${
                                    ingredient.food_group_id === group.id ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
                                  }`}
                                >
                                  <GroupIcon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: group.color || '#9CA3AF' }} />
                                  {group.name}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div className="inline-flex items-center gap-0.5 px-1.5 py-1 bg-green-50 border border-green-200 rounded">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={ingredient.food_group_portions || ''}
                          onChange={(e) => updateIngredient(index, 'food_group_portions', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="w-10 text-center text-xs font-bold bg-transparent border-none outline-none focus:ring-0 text-green-700"
                        />
                        <span className="text-xs font-medium text-green-700">p</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Row 2: Shopping conversion (indented) */}
                    {ingredient.shopping_list_conversion ? (
                      <div className="flex items-center gap-2 mt-1.5 ml-6">
                        <ShoppingCart className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={ingredient.shopping_list_conversion.amount || ''}
                          onChange={(e) => {
                            updateIngredient(index, 'shopping_list_conversion', {
                              ...ingredient.shopping_list_conversion,
                              amount: parseFloat(e.target.value) || 0
                            });
                          }}
                          className="w-20 px-2 py-0.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-green-400 focus:border-green-400"
                          placeholder="0"
                        />
                        <select
                          value={ingredient.shopping_list_conversion.unit || 'lb'}
                          onChange={(e) => {
                            updateIngredient(index, 'shopping_list_conversion', {
                              ...ingredient.shopping_list_conversion,
                              unit: e.target.value
                            });
                          }}
                          className="px-1 py-0.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-green-400 focus:border-green-400"
                        >
                          <option value="lb">lb</option>
                          <option value="unidad">unid</option>
                          <option value="taza">taza</option>
                          <option value="litro">L</option>
                          <option value="onza">oz</option>
                          <option value="gramo">g</option>
                        </select>
                        <input
                          type="text"
                          value={ingredient.shopping_list_conversion.name || ''}
                          onChange={(e) => {
                            updateIngredient(index, 'shopping_list_conversion', {
                              ...ingredient.shopping_list_conversion,
                              name: e.target.value
                            });
                          }}
                          className="flex-1 min-w-0 px-2 py-0.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-green-400 focus:border-green-400"
                          placeholder="Nombre para lista de compras"
                        />
                      </div>
                    ) : (
                      <div className="ml-6 mt-1">
                        <button
                          type="button"
                          onClick={() => updateIngredient(index, 'shopping_list_conversion', { amount: 0, unit: 'lb', name: '' })}
                          className="text-xs text-gray-400 hover:text-green-600 font-medium"
                        >
                          + Agregar conversión de compra
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {(!dishData.ingredients || dishData.ingredients.length === 0) && (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  Sin ingredientes. Haz clic en "Agregar" para comenzar.
                </div>
              )}
            </div>
          </div>

          {/* === INSTRUCCIONES === */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                Instrucciones
              </h3>
              <button
                type="button"
                onClick={addInstruction}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Agregar
              </button>
            </div>
            <div className="p-4 space-y-2">
              {dishData.instructions?.map((instruction, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                    {instruction.step}
                  </div>
                  <textarea
                    value={instruction.instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    placeholder={`Paso ${instruction.step}`}
                    rows={2}
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-green-400 focus:border-green-400 resize-none"
                  />
                  {dishData.instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors mt-1"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* === PORCIONES CALCULADAS === */}
          {(Object.keys(calculatedPortions).length > 0 || Object.keys(targetPortions).length > 0) && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600" />
                  {Object.keys(targetPortions).length > 0 ? 'Porciones calculadas vs Objetivo' : 'Porciones calculadas'}
                </h3>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {foodGroups
                    .filter(group => calculatedPortions[group.id] > 0 || targetPortions[group.id] > 0)
                    .map(group => {
                      const IconComponent = getFoodGroupIcon(group.name);
                      const calculated = calculatedPortions[group.id] || 0;
                      const target = targetPortions[group.id] || 0;
                      const hasTarget = target > 0;
                      const difference = hasTarget ? calculated - target : 0;
                      const isMatch = hasTarget && Math.abs(difference) <= 0.3;
                      const isOver = hasTarget && difference > 0.3;

                      return (
                        <div
                          key={group.id}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs ${
                            hasTarget
                              ? isMatch
                                ? 'bg-green-50 border border-green-200'
                                : isOver
                                ? 'bg-orange-50 border border-orange-200'
                                : 'bg-yellow-50 border border-yellow-200'
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <IconComponent
                            className="h-3 w-3"
                            style={{ color: group.color || '#6B7280' }}
                          />
                          <span className="font-medium text-gray-700">{group.name}:</span>
                          <span className={`font-semibold ${
                            hasTarget
                              ? isMatch
                                ? 'text-green-700'
                                : isOver
                                ? 'text-orange-700'
                                : 'text-yellow-700'
                              : 'text-gray-600'
                          }`}>
                            {calculated.toFixed(1)}
                          </span>
                          {hasTarget && (
                            <>
                              <span className="text-gray-400">/</span>
                              <span className="text-gray-500">{target.toFixed(1)}</span>
                            </>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* Hacer público */}
          <label className="flex items-center gap-2 px-1">
            <input
              type="checkbox"
              checked={dishData.is_public}
              onChange={(e) => updateField('is_public', e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-400"
            />
            <span className="text-sm text-gray-600">Hacer público</span>
          </label>
        </div>
      </div>

      {/* Footer con botón de guardar */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <button
          onClick={handleSave}
          disabled={saving || !dishData.name || !dishData.ingredients?.length}
          className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Guardando...' : (isEditing ? 'Actualizar Plato' : 'Guardar Plato')}
        </button>
      </div>

      {/* AI Assistant Sidebar */}
      <AIAssistantSidebar
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        dishData={dishData}
        onUpdateDish={onUpdate}
        foodGroups={foodGroups}
        exchangeList={exchangeList}
        patientContext={patientContext}
        targetPortions={targetPortions}
        mealTime={mealTime}
      />
    </div>
  );
}
