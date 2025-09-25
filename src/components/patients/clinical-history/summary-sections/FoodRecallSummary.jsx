import React from 'react'

export default function FoodRecallSummary({ data }) {
  if (Object.keys(data).length === 0) {
    return <p className="text-gray-500 text-sm">No se ha registrado recordatorio de 24h</p>
  }

  return (
    <div className="space-y-3 text-sm">
      {Object.entries(data).map(([mealTime, foods], index) => (
        <div key={index}>
          <div className="font-medium text-blue-700 mb-1">{mealTime}</div>
          {Array.isArray(foods) ? (
            foods.length > 0 ? (
              <div className="ml-3 space-y-1">
                {foods.map((food, foodIndex) => (
                  <div key={foodIndex} className="text-gray-700">
                    • {typeof food === 'object' ? `${food.food} (${food.quantity || 'No especificado'})` : food}
                  </div>
                ))}
              </div>
            ) : (
              <div className="ml-3 text-gray-500">No se registraron alimentos</div>
            )
          ) : typeof foods === 'object' && foods !== null ? (
            <div className="ml-3 space-y-1">
              {foods.foods && foods.foods.trim() ? (
                <div className="text-gray-700">
                  • {foods.foods}
                </div>
              ) : (
                <div className="text-gray-500">No se registraron alimentos</div>
              )}
              {foods.time && (
                <div className="text-xs text-gray-500 mt-1">Hora: {foods.time}</div>
              )}
              {foods.location && (
                <div className="text-xs text-gray-500">Lugar: {foods.location}</div>
              )}
            </div>
          ) : (
            <div className="ml-3 text-gray-700">• {String(foods)}</div>
          )}
        </div>
      ))}
    </div>
  )
}