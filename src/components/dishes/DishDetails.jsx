import React from 'react';
import { Edit, Clock, ChefHat } from 'lucide-react';

export default function DishDetails({
  dish,
  foodGroups,
  calculateNutrition,
  onSelect,
  onEdit
}) {
  if (!dish) return null;

  const nutrition = calculateNutrition(dish);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Dish Info */}
          <div>
            <h4 className="font-semibold text-gray-900 text-lg">{dish.name}</h4>
            {dish.description && (
              <p className="text-gray-600 mt-1">{dish.description}</p>
            )}
            {(dish.prep_time_minutes > 0 || dish.cook_time_minutes > 0) && (
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                {dish.prep_time_minutes > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Prep: {dish.prep_time_minutes} min</span>
                  </div>
                )}
                {dish.cook_time_minutes > 0 && (
                  <div className="flex items-center gap-1">
                    <ChefHat className="h-4 w-4" />
                    <span>Cocción: {dish.cook_time_minutes} min</span>
                  </div>
                )}
              </div>
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
          {dish.food_group_portions && (
            <div className="bg-green-50 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-3">Grupos Alimentarios</h5>
              <div className="space-y-2">
                {Object.entries(dish.food_group_portions).map(([groupId, portions]) => {
                  const group = foodGroups.find(g => g.id === groupId);
                  if (!group || portions === 0) return null;
                  return (
                    <div key={groupId} className="flex items-center justify-between p-2 bg-white rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color || '#6B7280' }} />
                        <span className="text-sm font-medium text-gray-700">{group.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-green-700">{portions} porciones</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ingredients */}
          {dish.ingredients && dish.ingredients.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-3">Ingredientes</h5>
              <ul className="space-y-1">
                {dish.ingredients.map((ingredient, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    <span className="font-medium">{ingredient.ingredient}</span>
                    {ingredient.amount && <span className="text-gray-600"> - {ingredient.amount}</span>}
                    {ingredient.notes && <span className="text-gray-500 italic"> ({ingredient.notes})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Instructions */}
          {dish.instructions && dish.instructions.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-3">Instrucciones</h5>
              <ol className="space-y-2">
                {dish.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {instruction.step}
                    </span>
                    <span className="text-sm text-gray-700 flex-1">{instruction.instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="border-t p-4 bg-gray-50">
        <div className="flex gap-2">
          <button
            onClick={() => onSelect(dish)}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Seleccionar
          </button>
          <button
            onClick={() => onEdit(dish)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
