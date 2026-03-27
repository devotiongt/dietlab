import React from 'react';
import { X, Clock, ChefHat, Flame, Users } from 'lucide-react';

const MEAL_TIMES = {
  breakfast: 'Desayuno',
  morning_snack: 'Colación Matutina',
  lunch: 'Almuerzo',
  afternoon_snack: 'Colación Vespertina',
  dinner: 'Cena'
};

export default function DishViewModal({ dish, foodGroups, isOpen, onClose }) {
  if (!isOpen || !dish) return null;

  // Calculate nutrition
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

    return {
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat
    };
  };

  const nutrition = calculateNutrition(dish.food_group_portions);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{dish.name}</h2>
              {dish.meal_time && (
                <span className="inline-block mt-1 px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                  {MEAL_TIMES[dish.meal_time] || dish.meal_time}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="p-6 space-y-6">
              {/* Description */}
              {dish.description && (
                <div>
                  <p className="text-gray-600">{dish.description}</p>
                </div>
              )}

              {/* Meta Info */}
              <div className="flex items-center gap-6 text-sm text-gray-600">
                {dish.servings && (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    <span><span className="font-semibold">{dish.servings}</span> {dish.servings === 1 ? 'porción' : 'porciones'}</span>
                  </div>
                )}
                {dish.prep_time_minutes > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span>Prep: <span className="font-semibold">{dish.prep_time_minutes}</span> min</span>
                  </div>
                )}
                {dish.cook_time_minutes > 0 && (
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-orange-500" />
                    <span>Cocción: <span className="font-semibold">{dish.cook_time_minutes}</span> min</span>
                  </div>
                )}
              </div>

              {/* Nutrition Info */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <h3 className="font-semibold text-gray-900">Información Nutricional</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                    <div className="text-3xl font-bold text-blue-600">{Math.round(nutrition.totalCalories)}</div>
                    <div className="text-xs text-gray-600 mt-1">Calorías</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                    <div className="text-2xl font-bold text-green-600">{Math.round(nutrition.totalProtein)}g</div>
                    <div className="text-xs text-gray-600 mt-1">Proteína</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                    <div className="text-2xl font-bold text-yellow-600">{Math.round(nutrition.totalCarbs)}g</div>
                    <div className="text-xs text-gray-600 mt-1">Carbohidratos</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                    <div className="text-2xl font-bold text-orange-600">{Math.round(nutrition.totalFat)}g</div>
                    <div className="text-xs text-gray-600 mt-1">Grasas</div>
                  </div>
                </div>
              </div>

              {/* Food Groups */}
              {dish.food_group_portions && Object.keys(dish.food_group_portions).length > 0 && (
                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Grupos Alimentarios</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(dish.food_group_portions).map(([groupId, portions]) => {
                      const group = foodGroups.find(g => g.id === groupId);
                      if (!group || portions === 0) return null;
                      return (
                        <div key={groupId} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: group.color || '#6B7280' }} />
                            <span className="text-sm font-medium text-gray-700">{group.name}</span>
                          </div>
                          <span className="text-sm font-bold text-purple-600">{portions} {portions === 1 ? 'porción' : 'porciones'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ingredients */}
              {dish.ingredients && dish.ingredients.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Ingredientes</h3>
                  <div className="space-y-3">
                    {dish.ingredients.map((ingredient, index) => {
                      const foodGroup = foodGroups.find(g => g.id === ingredient.food_group_id);
                      return (
                        <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">{ingredient.ingredient}</span>
                                {ingredient.amount && ingredient.unit && (
                                  <span className="text-sm font-medium text-blue-600">
                                    {ingredient.amount} {ingredient.unit}
                                  </span>
                                )}
                              </div>

                              {/* Food Group Info */}
                              {foodGroup && (
                                <div className="flex items-center gap-2 mt-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: foodGroup.color || '#6B7280' }}
                                  />
                                  <span className="text-xs text-gray-600">
                                    {ingredient.food_group_name || foodGroup.name}
                                  </span>
                                  {ingredient.food_group_portions && (
                                    <span className="text-xs text-purple-600 font-medium">
                                      ({ingredient.food_group_portions} {ingredient.food_group_portions === 1 ? 'porción' : 'porciones'})
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Shopping List Conversion */}
                              {ingredient.shopping_list_conversion && (
                                <div className="mt-2 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded inline-block">
                                  <span className="font-medium">Para comprar:</span>{' '}
                                  {ingredient.shopping_list_conversion.amount}{' '}
                                  {ingredient.shopping_list_conversion.unit}{' '}
                                  de {ingredient.shopping_list_conversion.name}
                                </div>
                              )}

                              {/* Notes */}
                              {ingredient.notes && (
                                <div className="text-xs text-gray-500 italic mt-2">
                                  {ingredient.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Instructions */}
              {dish.instructions && dish.instructions.length > 0 && (
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Instrucciones de Preparación</h3>
                  <ol className="space-y-4">
                    {dish.instructions.map((instruction, index) => (
                      <li key={index} className="flex gap-4">
                        <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {instruction.step}
                        </span>
                        <span className="text-sm text-gray-700 flex-1 pt-1">{instruction.instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Additional Info */}
              <div className="border-t pt-4 space-y-2 text-sm text-gray-500">
                {dish.is_public && (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      Plato Público
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
