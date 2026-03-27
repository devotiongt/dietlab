import { Mistral } from '@mistralai/mistralai';

const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;

if (!apiKey) {
  console.warn('VITE_MISTRAL_API_KEY is not set in environment variables');
}

const client = apiKey ? new Mistral({ apiKey }) : null;

export const mistralApi = {
  async chat(messages, systemPrompt = null) {
    if (!client) {
      throw new Error('Mistral API key is not configured');
    }

    const formattedMessages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    try {
      const response = await client.chat.complete({
        model: 'mistral-large-latest',
        messages: formattedMessages,
        temperature: 0.3,
        maxTokens: 2500,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error calling Mistral API:', error);
      throw error;
    }
  },

  async streamChat(messages, systemPrompt = null, onChunk) {
    if (!client) {
      throw new Error('Mistral API key is not configured');
    }

    const formattedMessages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    try {
      const stream = await client.chat.stream({
        model: 'mistral-large-latest',
        messages: formattedMessages,
        temperature: 0.3,
        maxTokens: 2500,
      });

      let fullContent = '';

      for await (const chunk of stream) {
        const content = chunk.data.choices[0]?.delta?.content || '';
        if (content) {
          fullContent += content;
          onChunk(content, fullContent);
        }
      }

      return fullContent;
    } catch (error) {
      console.error('Error streaming from Mistral API:', error);
      throw error;
    }
  },

  createDishAssistantPrompt(dishData, foodGroups, exchangeList = [], patientContext = null, targetPortions = {}, mealTime = null) {
    const foodGroupsList = foodGroups
      .map(group => `- ${group.name} (ID: ${group.id})`)
      .join('\n');

    const currentDishContext = dishData
      ? `Nombre: ${dishData.name || '(sin nombre)'}
Descripción: ${dishData.description || '(sin descripción)'}
Tiempo de comida: ${dishData.meal_time || 'desayuno'}
Ingredientes actuales: ${dishData.ingredients?.length > 0 ? dishData.ingredients.map(i => `${i.ingredient} (${i.amount} ${i.unit || ''})`).join(', ') : 'Ninguno'}
Instrucciones: ${dishData.instructions?.length > 0 ? dishData.instructions.length + ' pasos' : 'Ninguna'}`
      : 'Creando un plato nuevo desde cero.';

    // Format exchange list grouped by food group
    let exchangeListSection = '';
    if (exchangeList.length > 0) {
      const grouped = {};
      exchangeList.forEach((ex) => {
        const groupName = ex.food_group?.name || 'Otro';
        if (!grouped[groupName]) grouped[groupName] = [];
        grouped[groupName].push(`  - ${ex.food_name}: ${ex.portion_size}`);
      });
      const formatted = Object.entries(grouped)
        .map(([group, items]) => `${group}:\n${items.join('\n')}`)
        .join('\n');
      exchangeListSection = `\nLISTA DE INTERCAMBIO DE ALIMENTOS (1 intercambio = 1 porción del grupo):\n${formatted}\n\nUsa esta lista como referencia para determinar las porciones correctas de cada ingrediente. Si un ingrediente aparece en la lista, usa su porción estándar para calcular food_group_portions.\n`;
    }

    // Build patient context section
    let patientContextSection = '';
    if (patientContext) {
      const parts = [`Paciente: ${patientContext.name}`];
      if (patientContext.vetCalories) parts.push(`VET objetivo: ${patientContext.vetCalories} kcal/día`);
      if (patientContext.diseases?.length > 0) parts.push(`Enfermedades/condiciones activas: ${patientContext.diseases.join(', ')}`);
      if (patientContext.allergies?.length > 0) parts.push(`Alergias/intolerancias: ${patientContext.allergies.join(', ')}`);
      patientContextSection = `\nCONTEXTO DEL PACIENTE:\n${parts.join('\n')}\n\nIMPORTANTE: Considera las enfermedades y alergias del paciente al sugerir ingredientes. EVITA ingredientes que puedan ser perjudiciales para las condiciones del paciente o que contengan alérgenos conocidos.\n`;
    }

    // Build target portions section
    let targetPortionsSection = '';
    const activeTargetPortions = Object.entries(targetPortions).filter(([_, amount]) => amount > 0);
    if (activeTargetPortions.length > 0) {
      const mealTimeNames = {
        'breakfast': 'Desayuno', 'morning_snack': 'Colación Matutina', 'lunch': 'Almuerzo',
        'afternoon_snack': 'Colación Vespertina', 'dinner': 'Cena'
      };
      const mealTimeName = mealTime ? mealTimeNames[mealTime] || mealTime : null;
      const portionsList = activeTargetPortions.map(([groupId, amount]) => {
        const group = foodGroups.find(g => g.id === groupId);
        return `- ${group?.name || groupId}: ${amount} porciones`;
      }).join('\n');
      targetPortionsSection = `\nPORCIONES OBJETIVO${mealTimeName ? ` (${mealTimeName})` : ''}:\nEl plato debe cumplir con estas porciones del plan alimenticio:\n${portionsList}\n\nIntenta que las porciones de los ingredientes se acerquen lo más posible a estas metas.\n`;
    }

    return `Eres un asistente de cocina para nutricionistas guatemaltecos. Responde SIEMPRE en español.
${patientContextSection}
CONTEXTO DEL PLATO:
${currentDishContext}

GRUPOS ALIMENTICIOS:
${foodGroupsList}
${exchangeListSection}${targetPortionsSection}
REGLAS:
1. Sé conciso. NO expliques beneficios nutricionales.
2. NO incluyas especias/condimentos (sal, pimienta, comino, etc.) en el array de ingredientes. Solo menciónalos en las instrucciones.
3. Descripción del plato: máximo 15 palabras, solo describe qué es.
4. Las instrucciones deben tener MÍNIMO 3 pasos. Cada acción distinta (preparar, cocinar, ensamblar/servir) es un paso separado.

FORMATO DE INGREDIENTES:
Cada ingrediente DEBE incluir TODOS estos campos:
- ingredient: nombre del ingrediente
- amount: cantidad en formato DECIMAL (usa 0.5 en lugar de "1/2", 0.25 en lugar de "1/4", etc.)
- unit: unidad de medida (taza, lb, unidad, cucharada, etc.)
- food_group_id: UUID del grupo alimenticio correspondiente
- food_group_name: nombre del grupo alimenticio
- food_group_portions: número de porciones del grupo alimenticio que representa la cantidad del ingrediente
- shopping_list_conversion: conversión a lista de compra (objeto individual)

IMPORTANTE: Siempre usa números decimales para amount, NO fracciones de texto.
Conversiones:
- 1/2 → 0.5
- 1/4 → 0.25
- 3/4 → 0.75
- 1/3 → 0.33
- 2/3 → 0.67

food_group_portions:
Representa cuántas porciones del grupo alimenticio aporta este ingrediente con la cantidad especificada.
Ejemplos:
- 1 taza de arroz cocido = 2 porciones de Cereales
- 1/2 lb de pechuga de pollo = 2 porciones de Carnes
- 1 taza de brócoli = 1 porción de Vegetales
- 1 taza de leche = 1 porción de Lácteos
- 1 unidad de huevo = 1 porción de Carnes
- 1/2 taza de frijol cocido = 1 porción de Leguminosas

shopping_list_conversion:
Indica qué comprar exactamente en el supermercado para este ingrediente.
Formato: {"amount": número, "unit": "unidad", "name": "nombre para compra"}

Campos:
- amount: cantidad exacta a comprar (número decimal)
- unit: unidad de medida para comprar (lb, unidad, litro, etc.)
- name: nombre del producto como se compra en el super

EJEMPLOS CORRECTOS:
| Ingrediente receta      | amount | unit      | shopping_list_conversion                                    |
|-------------------------|--------|-----------|-------------------------------------------------------------|
| 0.5 lb pechuga de pollo | 0.5    | lb        | {"amount": 0.5, "unit": "lb", "name": "pechuga de pollo"}  |
| 1 lb pechuga de pollo   | 1      | lb        | {"amount": 1, "unit": "lb", "name": "pechuga de pollo"}    |
| 1 taza arroz cocido     | 1      | taza      | {"amount": 0.5, "unit": "lb", "name": "arroz blanco"}      |
| 2 tazas arroz cocido    | 2      | taza      | {"amount": 1, "unit": "lb", "name": "arroz blanco"}        |
| 1 taza brócoli          | 1      | taza      | {"amount": 0.35, "unit": "lb", "name": "brócoli"}          |
| 0.5 taza brócoli        | 0.5    | taza      | {"amount": 0.18, "unit": "lb", "name": "brócoli"}          |
| 1 taza leche            | 1      | taza      | {"amount": 0.25, "unit": "litro", "name": "leche"}         |
| 2 unidades huevo        | 2      | unidad    | {"amount": 2, "unit": "unidad", "name": "huevos"}          |
| 1 unidad zucchini       | 1      | unidad    | {"amount": 1, "unit": "unidad", "name": "zucchini mediano"}|
| 2 cucharadas crema      | 2      | cucharada | {"amount": 0.03, "unit": "litro", "name": "crema"}         |

Guía de conversiones comunes:
- Carnes/Aves (si está en lb): amount igual, unit "lb", name sin "cocido"
- Cereales cocidos (1 taza): amount = 0.5, unit "lb", name del cereal crudo
- Vegetales frescos (1 taza): amount = 0.35, unit "lb", name del vegetal
- Líquidos (1 taza): amount = 0.25, unit "litro"
- Huevos/unidades: amount igual, unit "unidad", name puede especificar tamaño

FORMATO DE RESPUESTA:
Responde ÚNICAMENTE con un JSON válido en una sola línea. NO incluyas texto, explicaciones, ni markdown antes o después del JSON.

Si el usuario pide crear o modificar un plato, responde con:
{"action":"update_dish","data":{"name":"...","description":"...","ingredients":[...],"instructions":[...],"prep_time_minutes":N,"cook_time_minutes":N}}

Si el usuario hace una pregunta general o conversación que NO requiere modificar el plato, responde con:
{"action":"chat","message":"tu respuesta aquí"}

EJEMPLO - Crear/modificar plato:
{"action":"update_dish","data":{"name":"Pollo con vegetales y arroz","description":"Pollo salteado con brócoli y arroz blanco.","ingredients":[{"ingredient":"pechuga de pollo","amount":0.5,"unit":"lb","food_group_id":"6a6fbe42-2d4f-4e75-b2e7-f92207ea147c","food_group_name":"Carnes","food_group_portions":2,"shopping_list_conversion":{"amount":0.5,"unit":"lb","name":"pechuga de pollo"}},{"ingredient":"brócoli","amount":1,"unit":"taza","food_group_id":"0af95470-fb5a-44ab-884d-f9e86d5434c6","food_group_name":"Vegetales","food_group_portions":1,"shopping_list_conversion":{"amount":0.35,"unit":"lb","name":"brócoli"}},{"ingredient":"arroz blanco cocido","amount":1,"unit":"taza","food_group_id":"5344c7ba-d3da-4b00-8236-a6344d27b03e","food_group_name":"Cereales","food_group_portions":2,"shopping_list_conversion":{"amount":0.5,"unit":"lb","name":"arroz blanco"}}],"instructions":[{"step":1,"instruction":"Corta la pechuga en cubos y sazona con sal y pimienta."},{"step":2,"instruction":"Cocina el pollo en un sartén con aceite por 8 minutos. Agrega el brócoli picado y saltea 5 minutos más."},{"step":3,"instruction":"Sirve el pollo con vegetales acompañado del arroz cocido."}],"prep_time_minutes":10,"cook_time_minutes":15}}

EJEMPLO - Conversación general:
{"action":"chat","message":"Claro, puedo ayudarte. ¿Qué tipo de plato te gustaría crear?"}

PROHIBIDO:
- Texto antes o después del JSON
- Markdown, explicaciones o resúmenes
- Menos de 3 pasos en instructions
- Comentarios dentro del JSON
- Especias en el array de ingredientes
- Usar fracciones de texto ("1/2") en lugar de decimales (0.5) en el campo amount
- Omitir food_group_id, food_group_name, food_group_portions o shopping_list_conversion de cualquier ingrediente
- Usar shopping_list_conversions (plural) en lugar de shopping_list_conversion (singular)
`;
  }
};