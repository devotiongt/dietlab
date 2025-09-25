// Clinical History Data Structures and Default Options

// 1.1 Antecedentes Heredofamiliares - Default diseases
export const defaultFamilyHistoryDiseases = [
  'Diabetes',
  'Cáncer', 
  'Dislipidemia',
  'Anemia',
  'Hipertensión arterial',
  'Enfermedades renales',
  'Otros'
];

// 1.2 Antecedentes Personales Patológicos - Common diseases
export const commonPersonalDiseases = [
  'Diabetes tipo 1',
  'Diabetes tipo 2',
  'Hipertensión arterial',
  'Dislipidemia',
  'Obesidad',
  'Anemia',
  'Hipotiroidismo',
  'Hipertiroidismo',
  'Asma',
  'Alergias',
  'Gastritis',
  'Colitis',
  'Migraña',
  'Depresión',
  'Ansiedad',
  'Artritis',
  'Osteoporosis',
  'Cálculos renales',
  'Infecciones urinarias recurrentes',
  'Fibromialgia',
  'Síndrome de ovario poliquístico',
  'Endometriosis',
  'Cáncer (especificar tipo)',
  'Enfermedades cardiovasculares',
  'Otras'
];

// Types of dyslipidemia
export const dyslipidemiaTypes = [
  'Hipercolesterolemia',
  'Hipertrigliceridemia',
  'Colesterol HDL bajo',
  'Dislipidemia mixta',
  'Hipercolesterolemia familiar',
  'Otro tipo (especificar)'
];

// Family members options
export const familyMembersOptions = [
  'Padre',
  'Madre',
  'Abuelo paterno',
  'Abuela paterna', 
  'Abuelo materno',
  'Abuela materna',
  'Hermano(s)',
  'Hermana(s)',
  'Tío(s)',
  'Tía(s)',
  'Primo(s)',
  'Prima(s)',
  'Otro familiar'
];

// Time units for diseases
export const timeUnits = [
  'días',
  'semanas', 
  'meses',
  'años'
];

// Medication frequencies
export const medicationFrequencies = [
  '1 vez al día',
  '2 veces al día',
  '3 veces al día',
  'Cada 8 horas',
  'Cada 12 horas',
  'Cada 24 horas',
  'Según necesidad',
  'Semanalmente',
  'Mensualmente',
  'Otro'
];

// Exercise/Sport types
export const exerciseTypes = [
  'Gimnasio',
  'Correr',
  'Caminar',
  'Natación',
  'Ciclismo',
  'Fútbol',
  'Basketball',
  'Tenis',
  'Yoga',
  'Pilates',
  'Baile',
  'Artes marciales',
  'Crossfit',
  'Otro'
];

// Exercise frequencies
export const exerciseFrequencies = [
  '1 vez por semana',
  '2 veces por semana',
  '3 veces por semana',
  '4 veces por semana',
  '5 veces por semana',
  '6 veces por semana',
  'Todos los días'
];

// Exercise schedules
export const exerciseSchedules = [
  'Mañana',
  'Tarde', 
  'Noche'
];

// Toxicomanías types
export const toxicomaniaTypes = [
  'Tabaquismo',
  'Alcoholismo',
  'Drogas recreativas',
  'Medicamentos sin prescripción',
  'Cafeína excesiva',
  'Consumo excesivo de bebidas rehidratantes',
  'Otro'
];

// Frequency options for toxicomanías
export const toxicomaniaFrequencies = [
  'Diario',
  'Fin de semana',
  'Ocasional',
  'Ex-consumidor',
  'Nunca'
];

// 3. Trastornos Gastrointestinales - Default disorders
export const defaultGastrointestinalDisorders = [
  'Vómito',
  'Diarrea', 
  'Estreñimiento',
  'Colitis',
  'Gastritis',
  'Náuseas',
  'Reflujo',
  'Disfagia',
  'Flatulencias',
  'Distensión',
  'Pirosis'
];

// Symptom frequencies
export const symptomFrequencies = [
  'Nunca',
  'Ocasionalmente',
  '1-2 veces por semana',
  '3-4 veces por semana',
  'Diario',
  'Varias veces al día'
];

// Contraceptive types
export const contraceptiveTypes = [
  'Ninguno',
  'Anticonceptivos orales',
  'Inyecciones anticonceptivas',
  'DIU',
  'Implante anticonceptivo',
  'Condón',
  'Métodos naturales',
  'Otro'
];

// Meal types for eating schedule
export const mealTypes = [
  'Desayuno',
  'Refacción matutina',
  'Almuerzo',
  'Refacción vespertina', 
  'Cena',
  'Colación nocturna'
];

// Snack types
export const snackTypes = [
  'Frutas',
  'Verduras',
  'Frutos secos',
  'Yogurt',
  'Galletas',
  'Dulces',
  'Bebidas azucaradas',
  'Comida chatarra',
  'Otro'
];

// Appetite perceptions
export const appetitePerceptions = [
  'Muy bajo',
  'Bajo',
  'Normal',
  'Alto',
  'Muy alto'
];

// Appetite changes
export const appetiteChanges = [
  'Sin cambios',
  'Ha aumentado',
  'Ha disminuido',
  'Variable'
];

// 6. Food groups for frequency consumption
export const foodGroups = [
  {
    name: 'Verduras',
    examples: 'Lechuga, tomate, brócoli, etc.'
  },
  {
    name: 'Frutas',
    examples: 'Manzana, banano, naranja, etc.'
  },
  {
    name: 'Cereales sin grasa',
    examples: 'Arroz, avena, pan integral, etc.'
  },
  {
    name: 'Cereales con grasa',
    examples: 'Galletas, pasteles, pan dulce, etc.'
  },
  {
    name: 'Leguminosas',
    examples: 'Frijoles, lentejas, garbanzos, etc.'
  },
  {
    name: 'Carnes (res, cerdo, pollo/pavo)',
    examples: 'Bistec, chuleta, pechuga, etc.'
  },
  {
    name: 'Pescados y mariscos',
    examples: 'Tilapia, salmón, camarones, etc.'
  },
  {
    name: 'Huevo',
    examples: 'Huevo entero, clara, etc.'
  },
  {
    name: 'Lácteos (leche, yogurt, queso)',
    examples: 'Leche, yogurt natural, queso, etc.'
  },
  {
    name: 'Embutidos',
    examples: 'Jamón, salchicha, chorizo, etc.'
  },
  {
    name: 'Bebidas',
    examples: 'Agua, refresco, té, café, jugos, etc.'
  }
];

// Food frequency options
export const foodFrequencies = [
  'Nunca',
  '1 vez al mes',
  '2-3 veces al mes',
  '1 vez por semana',
  '2-3 veces por semana',
  '4-6 veces por semana',
  'Diario',
  '2-3 veces al día',
  'Más de 3 veces al día'
];

// Meal times for 24h recall
export const mealTimes24h = [
  'Desayuno',
  'Colación matutina',
  'Comida/Almuerzo',
  'Colación vespertina',
  'Cena'
];

// Common foods for preferences
export const commonFoods = [
  // Fruits
  'Manzana', 'Banana', 'Naranja', 'Pera', 'Uvas', 'Fresa', 'Piña', 'Mango', 'Papaya', 'Melón',
  // Vegetables
  'Brócoli', 'Zanahoria', 'Tomate', 'Lechuga', 'Cebolla', 'Espinaca', 'Apio', 'Pepino', 'Pimiento',
  // Proteins
  'Pollo', 'Res', 'Cerdo', 'Pescado', 'Huevo', 'Frijoles', 'Lentejas', 'Garbanzos', 'Queso', 'Yogurt',
  // Grains
  'Arroz', 'Pan', 'Pasta', 'Avena', 'Quinoa', 'Tortilla', 'Cereal',
  // Others
  'Chocolate', 'Helado', 'Pizza', 'Hamburguesa', 'Tacos', 'Sopa', 'Ensalada', 'Café', 'Té', 'Agua'
];

// Common allergies and intolerances
export const commonAllergies = [
  'Leche de vaca',
  'Huevo',
  'Trigo/Gluten',
  'Soja',
  'Maní/Cacahuate',
  'Nueces',
  'Pescado',
  'Mariscos',
  'Sesame/Ajonjolí',
  'Mostaza',
  'Apio',
  'Sulfitos',
  'Dióxido de azufre',
  'Altramuz',
  'Moluscos'
];

export const commonIntolerances = [
  'Lactosa',
  'Fructosa',
  'Gluten',
  'Histamina',
  'Sorbitol',
  'Manitol',
  'Xilitol',
  'Cafeína',
  'Alcohol',
  'Salicilatos',
  'Tiramina',
  'Glutamato monosódico (MSG)',
  'Colorantes artificiales',
  'Conservadores',
  'Edulcorantes artificiales'
];

// Common supplements
export const commonSupplements = [
  'Multivitamínico',
  'Vitamina D',
  'Vitamina B12',
  'Vitamina C',
  'Calcio',
  'Hierro',
  'Magnesio',
  'Zinc',
  'Omega 3',
  'Probióticos',
  'Ácido fólico',
  'Biotina',
  'Coenzima Q10',
  'Proteína en polvo',
  'Creatina',
  'Colágeno',
  'Melatonina',
  'Glucosamina',
  'Condroitina',
  'Ginkgo biloba'
];

// Common eating disorders and psychological conditions
export const commonEatingDisorders = [
  'Anorexia nerviosa',
  'Bulimia nerviosa',
  'Trastorno por atracón',
  'Trastorno de evitación/restricción de alimentos (ARFID)',
  'Pica',
  'Trastorno de rumiación',
  'Ortorexia',
  'Vigorexia',
  'Trastorno de la imagen corporal',
  'Síndrome del comedor nocturno',
  'Trastorno obsesivo compulsivo relacionado con comida',
  'Fobia a ciertos alimentos',
  'Trastorno de ansiedad relacionado con la alimentación',
  'Depresión con síntomas alimentarios',
  'Trastorno límite de personalidad con conductas alimentarias',
  'Otros'
];

// Common lab tests
export const commonLabTests = [
  'Glucosa en ayunas',
  'Hemoglobina A1C',
  'Colesterol total',
  'HDL Colesterol',
  'LDL Colesterol',
  'Triglicéridos',
  'Hemograma completo',
  'Hemoglobina',
  'Hematocrito',
  'Hierro sérico',
  'Ferritina',
  'Vitamina D',
  'Vitamina B12',
  'Ácido fólico',
  'TSH',
  'T3 libre',
  'T4 libre',
  'Creatinina',
  'BUN/Urea',
  'Ácido úrico',
  'Proteínas totales',
  'Albúmina',
  'AST/ALT',
  'Bilirrubinas',
  'Fosfatasa alcalina'
];

// Default data structures for clinical history
export const defaultClinicalHistory = {
  family_history: [],
  personal_pathological_history: [],
  eating_disorders: [],
  physical_activities: [],
  toxicomanias: [],
  gastrointestinal_disorders: [],
  gyneco_obstetric_history: {
    gestaciones: '',
    partos: '',
    cesareas: '',
    fecha_ultima_menstruacion: '',
    fecha_ultimo_parto: '',
    semanas_gestacion: '',
    uso_anticonceptivos: '',
    comentarios: ''
  },
  eating_habits: {
    contexto_social: {
      con_quien_come: '',
      quien_prepara_alimentos: '',
      numero_comidas_dia: '',
      horarios_comida: []
    },
    colaciones: {
      realiza_colaciones: false,
      tipos_alimentos_colaciones: []
    },
    frecuencia_comidas: {
      comidas_casa_semana: '',
      comidas_fuera_casa_semana: '',
      comidas_fuera_casa_fin_semana: ''
    },
    apetito_preferencias: {
      hora_mayor_apetito: '',
      percepcion_apetito: '',
      cambios_recientes_apetito: ''
    },
    restricciones_suplementacion: {
      alergias_alimentarias: [],
      intolerancias: [],
      dietas_anteriores: '',
      medicamentos_bajar_peso: false,
      medicamentos_bajar_peso_detalles: '',
      suplementos_actuales: []
    },
    preferencias_alimentarias: {
      alimentos_preferidos: [],
      alimentos_disgustan: []
    }
  },
  food_frequency: {},
  food_recall_24h: {},
  biochemical_indicators: []
};