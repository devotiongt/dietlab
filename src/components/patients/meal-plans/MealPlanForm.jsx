import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';
import { mealPlansApi } from '../../../lib/meal-plans';
import PlanBaseStep from './steps/PlanBaseStep';

const STEPS = [
  { id: 'base', name: 'Plan Base', description: 'Define VET y macronutrientes' },
  { id: 'distribution', name: 'Distribución', description: 'Distribuye en tiempos de comida' },
  { id: 'review', name: 'Revisión', description: 'Revisa y confirma el plan' }
];

export default function MealPlanForm({ patient, plan, onSave, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [foodGroups, setFoodGroups] = useState([]);
  const [errors, setErrors] = useState({});

  // Form data
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    weeks_duration: plan?.weeks_duration || 1,
    start_date: plan?.start_date ? new Date(plan.start_date) : getNextMonday(),

    // Plan base
    vet_calories: plan?.vet_calories || 1800,
    protein_percentage: plan?.protein_percentage || 20,
    carbs_percentage: plan?.carbs_percentage || 55,
    fat_percentage: plan?.fat_percentage || 25,
    food_portions: {},

    notes: plan?.notes || ''
  });

  useEffect(() => {
    loadFoodGroups();
  }, []);

  useEffect(() => {
    // Initialize food portions
    if (plan?.portions) {
      const portions = {};
      plan.portions.forEach(p => {
        portions[p.food_group_id] = p.portions_count;
      });
      setFormData(prev => ({ ...prev, food_portions: portions }));
    } else if (foodGroups.length > 0) {
      const portions = {};
      foodGroups.forEach(group => {
        portions[group.id] = 0;
      });
      setFormData(prev => ({ ...prev, food_portions: portions }));
    }
  }, [foodGroups, plan]);

  const loadFoodGroups = async () => {
    try {
      const groups = await mealPlansApi.getFoodGroups();
      setFoodGroups(groups);
    } catch (error) {
      console.error('Error loading food groups:', error);
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
        if (!formData.name.trim()) {
          newErrors.name = 'El nombre es requerido';
        }
        if (formData.weeks_duration < 1) {
          newErrors.weeks_duration = 'La duración debe ser al menos 1 semana';
        }
        if (formData.vet_calories < 500 || formData.vet_calories > 5000) {
          newErrors.vet_calories = 'Las calorías deben estar entre 500 y 5000';
        }
        const totalPercentage = formData.protein_percentage + formData.carbs_percentage + formData.fat_percentage;
        if (Math.abs(totalPercentage - 100) > 0.01) {
          newErrors.macros = 'Los porcentajes de macronutrientes deben sumar 100%';
        }
        break;

      case 1: // Distribution step
        // Will be implemented next
        break;

      case 2: // Review step
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

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setLoading(true);

      // Calculate dates based on start_date and weeks_duration
      const { startDate, endDate } = mealPlansApi.calculateWeekDates(
        formData.start_date,
        formData.weeks_duration
      );

      const planData = {
        patient_id: patient.id,
        name: formData.name,
        start_date: startDate,
        end_date: endDate,
        weeks_duration: formData.weeks_duration,
        vet_calories: formData.vet_calories,
        protein_percentage: formData.protein_percentage,
        carbs_percentage: formData.carbs_percentage,
        fat_percentage: formData.fat_percentage,
        food_portions: formData.food_portions,
        notes: formData.notes,
        status: 'active'
      };

      if (plan) {
        await mealPlansApi.updateMealPlan(plan.id, planData);
      } else {
        await mealPlansApi.createMealPlan(planData);
      }

      onSave();
    } catch (error) {
      console.error('Error saving meal plan:', error);
      alert('Error al guardar el plan alimenticio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {plan ? 'Editar' : 'Crear'} Plan Alimenticio
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {patient.first_name} {patient.last_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-medium
                      ${index < currentStep ? 'bg-blue-600 text-white' : ''}
                      ${index === currentStep ? 'bg-blue-600 text-white ring-4 ring-blue-100' : ''}
                      ${index > currentStep ? 'bg-gray-200 text-gray-500' : ''}
                    `}
                  >
                    {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-sm font-medium ${index === currentStep ? 'text-blue-600' : 'text-gray-500'}`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{step.description}</p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`
                      h-0.5 w-20 mx-4 mt-[-20px]
                      ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}
                    `}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {currentStep === 0 && (
            <PlanBaseStep
              formData={formData}
              foodGroups={foodGroups}
              errors={errors}
              onChange={updateFormData}
            />
          )}

          {currentStep === 1 && (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
              <p>Distribución de tiempos de comida - Próximamente</p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
              <p>Revisión final - Próximamente</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>

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
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 inline-flex items-center"
              >
                {loading ? 'Guardando...' : 'Guardar Plan'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}