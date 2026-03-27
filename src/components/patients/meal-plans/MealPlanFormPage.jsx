import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { mealPlansApi } from '../../../lib/meal-plans';
import { patientsService } from '../../../services/patientsService';
import { clinicalHistoryService } from '../../../services/clinicalHistoryService';
import PlanBaseStep from './steps/PlanBaseStep';
import MealDistributionStep from './steps/MealDistributionStep';
import MealPlateConfigurationStep from './steps/MealPlateConfigurationStep';
import { useToast } from '../../../hooks/useToast';
import { ToastContainer } from '../../ui/Toast';

const STEPS = [
  { id: 'base', name: 'Plan Base', description: 'Define VET y macronutrientes' },
  { id: 'distribution', name: 'Distribución', description: 'Distribuye en tiempos de comida' },
  { id: 'plates', name: 'Platos', description: 'Configura platos específicos' },
  { id: 'review', name: 'Revisión', description: 'Revisa y confirma el plan' }
];

export default function MealPlanFormPage() {
  const { patientId, planId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error, warning, toasts, removeToast } = useToast();
  const [patient, setPatient] = useState(null);
  const [plan, setPlan] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [foodGroups, setFoodGroups] = useState([]);
  const [clinicalHistory, setClinicalHistory] = useState(null);
  const [errors, setErrors] = useState({});

  // Form data
  const [formData, setFormData] = useState({
    selectedWeeks: [],
    weeks_duration: 0,
    start_date: null,
    end_date: null,

    // Plan base
    vet_calories: 1800,
    protein_percentage: 20,
    carbs_percentage: 55,
    fat_percentage: 25,
    food_portions: {},

    // Meal distribution
    meal_distribution: {},

    // Meal plates configuration
    meal_plates: {},

    notes: ''
  });

  // Generate automatic plan name
  const generatePlanName = (patient, weeks, startDate) => {
    const date = new Date(startDate);
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const duration = weeks === 1 ? '1 semana' : `${weeks} semanas`;

    return `Plan ${patient?.first_name} - ${duration} (${month} ${year})`;
  };

  useEffect(() => {
    loadInitialData();
  }, [patientId, planId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load patient data and clinical history
      const patientData = await patientsService.getPatient(patientId);
      setPatient(patientData);

      // Load clinical history (non-blocking)
      clinicalHistoryService.getClinicalHistory(patientId)
        .then(data => setClinicalHistory(data))
        .catch(() => setClinicalHistory(null));

      // Load food groups
      const groups = await mealPlansApi.getFoodGroups();
      setFoodGroups(groups);

      // Load existing plan if editing
      if (planId) {
        const planData = await mealPlansApi.getMealPlan(planId);
        setPlan(planData);

        // Populate form with existing data
        const portions = {};
        if (planData.portions) {
          planData.portions.forEach(p => {
            portions[p.food_group_id] = p.portions_count;
          });
        }

        // Generate selected weeks from existing plan using the SAME logic as WeekSelectorCalendar
        const selectedWeeks = [];

        // Fix timezone issue by parsing date correctly
        const startDate = new Date(planData.start_date + 'T12:00:00'); // Add time to avoid timezone issues

        // Use the same logic as getWeeksInView to find the Monday of the week containing startDate
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth();

        // Get first day of the month containing our start date
        const firstDayOfMonth = new Date(startYear, startMonth, 1);

        // Find the first Monday of the view (same as WeekSelectorCalendar)
        const firstMondayOfView = new Date(firstDayOfMonth);
        const dayOfWeek = firstDayOfMonth.getDay(); // 0=Sunday, 1=Monday
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        firstMondayOfView.setDate(firstDayOfMonth.getDate() - daysToSubtract);

        // Find which week contains our start date
        let currentWeek = new Date(firstMondayOfView);

        // Iterate through weeks to find the one containing our start date
        for (let i = 0; i < 10; i++) { // Limit iterations to prevent infinite loop
          const weekEnd = new Date(currentWeek);
          weekEnd.setDate(currentWeek.getDate() + 6);

          if (startDate >= currentWeek && startDate <= weekEnd) {
            // Found the week containing our start date
            for (let j = 0; j < planData.weeks_duration; j++) {
              const weekStart = new Date(currentWeek);
              weekStart.setDate(currentWeek.getDate() + (j * 7));
              const weekId = `${weekStart.getTime()}`;
              selectedWeeks.push(weekId);
            }
            break;
          }

          currentWeek.setDate(currentWeek.getDate() + 7);
        }

        setFormData({
          selectedWeeks,
          weeks_duration: planData.weeks_duration,
          start_date: new Date(planData.start_date),
          end_date: new Date(planData.end_date),
          vet_calories: planData.vet_calories,
          protein_percentage: planData.protein_percentage,
          carbs_percentage: planData.carbs_percentage,
          fat_percentage: planData.fat_percentage,
          food_portions: portions,
          meal_distribution: planData.meal_distribution || {},
          meal_plates: planData.meal_plates || {},
          notes: planData.notes || ''
        });
      } else {
        // Initialize default portions
        const portions = {};
        groups.forEach(group => {
          // Set default portions based on group name
          switch (group.name) {
            case 'Leche':
              portions[group.id] = 0;
              break;
            case 'Incaparina':
              portions[group.id] = 2;
              break;
            case 'Vegetales':
              portions[group.id] = 10;
              break;
            case 'Frutas':
              portions[group.id] = 5;
              break;
            case 'Cereales':
              portions[group.id] = 7;
              break;
            case 'Carnes':
              portions[group.id] = 9;
              break;
            case 'Grasas':
              portions[group.id] = 2;
              break;
            case 'Azúcares':
              portions[group.id] = 2;
              break;
            default:
              portions[group.id] = 0;
              break;
          }
        });
        setFormData(prev => ({ ...prev, food_portions: portions }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      error('Error al cargar los datos');
      navigate(`/dashboard/patients/${patientId}`);
    } finally {
      setLoading(false);
    }
  };

  function getNextMonday() {
    const today = new Date();
    const day = today.getDay();
    const daysUntilMonday = day === 0 ? 1 : (8 - day) % 7 || 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    return nextMonday;
  }

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Base step
        // Validar que se hayan seleccionado semanas
        if (!formData.selectedWeeks || formData.selectedWeeks.length === 0) {
          newErrors.weeks_duration = 'Debes seleccionar al menos una semana';
        }
        if (!formData.start_date) {
          newErrors.start_date = 'Debes seleccionar las semanas del plan';
        }

        // Validar VET
        if (formData.vet_calories < 500 || formData.vet_calories > 5000) {
          newErrors.vet_calories = 'Las calorías deben estar entre 500 y 5000';
        }

        // Validar que los macros sumen 100%
        const totalPercentage = formData.protein_percentage + formData.carbs_percentage + formData.fat_percentage;
        if (Math.abs(totalPercentage - 100) > 0.01) {
          newErrors.macros = 'Los porcentajes de macronutrientes deben sumar 100%';
        }

        // Validar que se hayan asignado porciones (al menos una porción > 0)
        const hasPortion = Object.values(formData.food_portions || {}).some(portion => portion > 0);
        if (!hasPortion) {
          newErrors.portions = 'Debes asignar al menos una porción de algún grupo alimenticio';
        }

        // Calcular adecuación y validar que no sea 0%
        if (hasPortion && foodGroups.length > 0) {
          const portionTotals = mealPlansApi.calculatePortionTotals(formData.food_portions, foodGroups);
          const adequacyCalories = mealPlansApi.calculateAdequacy(portionTotals.totalCalories, formData.vet_calories);

          if (adequacyCalories === 0) {
            newErrors.adequacy = 'El porcentaje de adecuación calórica no puede ser 0%';
          }
        }
        break;

      case 1: // Distribution step
        // Validar que las porciones distribuidas coincidan con el paso 1 para TODAS las semanas
        const mealDistribution = formData.meal_distribution || {};
        const mealTimes = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner'];
        const weeksDuration = formData.weeks_duration || 1;

        // Validar cada semana
        for (let weekIndex = 0; weekIndex < weeksDuration; weekIndex++) {
          const weekDistribution = mealDistribution[`week_${weekIndex}`] || {};

          foodGroups.forEach(group => {
            const expectedPortions = formData.food_portions?.[group.id] || 0;
            let actualTotal = 0;

            mealTimes.forEach(mealTime => {
              const value = weekDistribution[mealTime]?.[group.id] || 0;
              actualTotal += parseFloat(value) || 0;
            });

            if (expectedPortions > 0 && Math.abs(expectedPortions - actualTotal) > 0.1) {
              newErrors[`distribution_week${weekIndex}_${group.id}`] = `Semana ${weekIndex + 1}: Las porciones de ${group.name} no coinciden (esperado: ${expectedPortions}, distribuido: ${actualTotal.toFixed(1)})`;
            }
          });

          // Verificar que la semana tenga al menos alguna distribución si hay porciones configuradas
          const hasAnyPortions = Object.values(formData.food_portions || {}).some(portion => portion > 0);
          const hasWeekDistribution = Object.keys(weekDistribution).length > 0;

          if (hasAnyPortions && !hasWeekDistribution) {
            newErrors[`week_${weekIndex}_missing`] = `Semana ${weekIndex + 1}: Falta configurar la distribución de porciones`;
          }
        }

        break;

      case 2: // Plates configuration step
        // Validar que todos los tiempos de comida con porciones asignadas tengan platos configurados por día
        const mealPlates = formData.meal_plates || {};
        const MEAL_TIMES = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner'];
        const DAYS_OF_WEEK = [1, 2, 3, 4, 5, 6, 7]; // 1=Monday, 7=Sunday
        const weeksCount = formData.weeks_duration || 1;

        for (let weekIndex = 0; weekIndex < weeksCount; weekIndex++) {
          const weekPlates = mealPlates[`week_${weekIndex}`] || {};
          const weekDistribution = formData.meal_distribution?.[`week_${weekIndex}`] || {};

          DAYS_OF_WEEK.forEach(dayOfWeek => {
            const dayPlates = weekPlates[`day_${dayOfWeek}`] || {};

            MEAL_TIMES.forEach(mealTime => {
              const targetPortions = weekDistribution[mealTime] || {};
              const hasTargetPortions = Object.values(targetPortions).some(p => p > 0);
              const hasPlate = dayPlates[mealTime];

              if (hasTargetPortions && !hasPlate) {
                const mealTimeNames = {
                  'breakfast': 'Desayuno',
                  'morning_snack': 'Colación Matutina',
                  'lunch': 'Almuerzo',
                  'afternoon_snack': 'Colación Vespertina',
                  'dinner': 'Cena'
                };
                const dayNames = {
                  1: 'Lunes',
                  2: 'Martes',
                  3: 'Miércoles',
                  4: 'Jueves',
                  5: 'Viernes',
                  6: 'Sábado',
                  7: 'Domingo'
                };
                newErrors[`plates_week${weekIndex}_day${dayOfWeek}_${mealTime}`] =
                  `Semana ${weekIndex + 1} - ${dayNames[dayOfWeek]} - ${mealTimeNames[mealTime]}: Falta configurar el plato`;
              }
            });
          });
        }
        break;

      case 3: // Review step
        // Final validation
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleCancel = () => {
    if (confirm('¿Está seguro de cancelar? Los cambios no guardados se perderán.')) {
      navigate(`/dashboard/patients/${patientId}`);
    }
  };

  const handleSubmit = async (isDraft = false) => {
    // Para borradores, solo validar fechas y semanas
    if (isDraft) {
      if (!formData.selectedWeeks || formData.selectedWeeks.length === 0) {
        warning('Debes seleccionar al menos una semana para guardar como borrador');
        return;
      }
      if (!formData.start_date || !formData.end_date) {
        warning('Debes seleccionar las fechas del plan para guardar como borrador');
        return;
      }
    } else {
      // Para guardar como activo, validar todo
      if (!validateStep(currentStep)) return;
    }

    try {
      setSaving(true);

      // Use dates from calendar selector
      const startDate = formData.start_date.toISOString().split('T')[0];
      const endDate = formData.end_date.toISOString().split('T')[0];

      // Generate automatic name
      const planName = plan?.name || generatePlanName(patient, formData.weeks_duration, formData.start_date);

      const planData = {
        patient_id: patientId,
        name: planName + (isDraft ? ' (Borrador)' : ''),
        start_date: startDate,
        end_date: endDate,
        weeks_duration: formData.weeks_duration,
        vet_calories: formData.vet_calories,
        protein_percentage: formData.protein_percentage,
        carbs_percentage: formData.carbs_percentage,
        fat_percentage: formData.fat_percentage,
        food_portions: formData.food_portions,
        meal_distribution: formData.meal_distribution,
        notes: formData.notes,
        status: isDraft ? 'draft' : 'active'
      };

      let savedPlanId = planId;

      if (planId) {
        await mealPlansApi.updateMealPlan(planId, planData);
      } else {
        const newPlan = await mealPlansApi.createMealPlan(planData);
        savedPlanId = newPlan.id;
      }

      // Si es borrador, mostrar mensaje y actualizar la URL sin navegar
      if (isDraft) {
        success('Plan guardado como borrador exitosamente');
        // Actualizar la URL para incluir el ID del plan si es nuevo
        if (!planId && savedPlanId) {
          window.history.replaceState(null, '', `/dashboard/patients/${patientId}/meal-plans/${savedPlanId}/edit`);
        }
      } else {
        // Si es activo, navegar a la vista del paciente
        navigate(`/dashboard/patients/${patientId}`);
      }
    } catch (err) {
      console.error('Error saving meal plan:', err);
      if (err.message?.includes('solapan')) {
        error('Las fechas del plan se solapan con otro plan existente (activo o borrador)');
      } else {
        error('Error al guardar el plan alimenticio');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500">
          <p>Paciente no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={handleCancel}
                  className="mr-3 p-1.5 text-blue-100 hover:text-white hover:bg-blue-500 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {patient.first_name?.[0]}{patient.last_name?.[0]}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">
                      {planId ? 'Editar' : 'Crear'} Plan Alimenticio
                    </h1>
                    <div className="flex items-center space-x-2 text-sm">
                      <p className="text-blue-100">
                        {patient.first_name} {patient.last_name}
                      </p>
                      {formData.start_date && (
                        <>
                          <span className="text-blue-200">•</span>
                          <p className="text-blue-100 italic">
                            {generatePlanName(patient, formData.weeks_duration, formData.start_date)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-xs text-blue-100">Paso {currentStep + 1}/{STEPS.length}</p>
                  <p className="text-sm text-white font-medium">
                    {STEPS[currentStep].name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-100">VET Objetivo</p>
                  <p className="text-sm text-white font-medium">
                    {formData.vet_calories} kcal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start justify-between w-full">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-medium text-xs transition-all duration-300 relative z-10
                      ${index < currentStep ? 'bg-green-500 text-white' : ''}
                      ${index === currentStep ? 'bg-blue-600 text-white ring-2 ring-blue-100' : ''}
                      ${index > currentStep ? 'bg-gray-100 text-gray-400 border border-gray-200' : ''}
                    `}
                  >
                    {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <div className="mt-1 text-center">
                    <p className={`text-xs font-medium transition-colors ${
                      index === currentStep ? 'text-blue-600' :
                      index < currentStep ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {step.name}
                    </p>
                  </div>
                </div>

                {/* Connection line */}
                {index < STEPS.length - 1 && (
                  <div className="absolute top-4 left-1/2 w-full h-0.5 -translate-y-1/2">
                    <div className="ml-4 mr-4 relative">
                      <div className="h-0.5 bg-gray-200 rounded-full"></div>
                      <div
                        className={`
                          absolute top-0 left-0 h-0.5 rounded-full transition-all duration-500
                          ${index < currentStep ? 'bg-green-500 w-full' : 'bg-gray-200 w-0'}
                        `}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Compact Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {currentStep === 0 && (
              <PlanBaseStep
                formData={formData}
                foodGroups={foodGroups}
                patient={patient}
                errors={errors}
                onChange={updateFormData}
              />
            )}

            {currentStep === 1 && (
              <MealDistributionStep
                formData={formData}
                foodGroups={foodGroups}
                errors={errors}
                onChange={updateFormData}
              />
            )}

            {currentStep === 2 && (
              <MealPlateConfigurationStep
                formData={formData}
                foodGroups={foodGroups}
                errors={errors}
                onChange={updateFormData}
                patient={patient}
                clinicalHistory={clinicalHistory}
              />
            )}
            {currentStep === 3 && (
              <div className="text-center py-12 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                <p>Revisión final - Próximamente</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-between rounded-b-lg">
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>

              {/* Botón Guardar Borrador - En todos los pasos */}
              <button
                onClick={() => handleSubmit(true)}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
              >
                {saving ? 'Guardando...' : 'Guardar como Borrador'}
              </button>
            </div>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 inline-flex items-center"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </button>
              )}

              {currentStep < STEPS.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 inline-flex items-center"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              ) : (
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 inline-flex items-center"
                >
                  {saving ? 'Guardando...' : 'Guardar Plan Activo'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}