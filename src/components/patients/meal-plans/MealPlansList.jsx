import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Clock, ChevronRight, Edit, Trash2, Plus } from 'lucide-react';
import { mealPlansApi } from '../../../lib/meal-plans';

export default function MealPlansList({ patient, onCreatePlan, onEditPlan, onBack }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    loadPlans();
  }, [patient.id]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await mealPlansApi.getPatientMealPlans(patient.id);
      setPlans(data);
    } catch (error) {
      console.error('Error loading meal plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (confirm('¿Está seguro de eliminar este plan alimenticio?')) {
      try {
        await mealPlansApi.deleteMealPlan(planId);
        loadPlans();
      } catch (error) {
        console.error('Error deleting meal plan:', error);
        alert('Error al eliminar el plan alimenticio');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (plan) => {
    const today = new Date();
    const start = new Date(plan.start_date);
    const end = new Date(plan.end_date);

    if (plan.status === 'draft') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-300">Borrador</span>;
    }

    if (plan.status === 'cancelled') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Cancelado</span>;
    }

    if (today < start) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Programado</span>;
    }

    if (today > end) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Completado</span>;
    }

    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Activo</span>;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center"
        >
          ← Volver al paciente
        </button>

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Planes Alimenticios - {patient.first_name} {patient.last_name}
          </h2>
          <button
            onClick={onCreatePlan}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Plan
          </button>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay planes alimenticios
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Comience creando el primer plan alimenticio para este paciente.
          </p>
          <button
            onClick={onCreatePlan}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear primer plan
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map(plan => (
            <div
              key={plan.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedPlan(selectedPlan?.id === plan.id ? null : plan)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                      {getStatusBadge(plan)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(plan.start_date)} - {formatDate(plan.end_date)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {plan.weeks_duration} {plan.weeks_duration === 1 ? 'semana' : 'semanas'}
                      </div>
                      <div>
                        <span className="font-medium">VET:</span> {plan.vet_calories} kcal/día
                      </div>
                    </div>

                    {/* Macros summary - Solo mostrar si no es borrador o si tiene valores definidos */}
                    {(plan.status !== 'draft' || (plan.protein_percentage + plan.carbs_percentage + plan.fat_percentage) > 0) && (
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          <span className="font-medium">P:</span> {plan.protein_percentage}%
                        </span>
                        <span className="text-gray-600">
                          <span className="font-medium">C:</span> {plan.carbs_percentage}%
                        </span>
                        <span className="text-gray-600">
                          <span className="font-medium">G:</span> {plan.fat_percentage}%
                        </span>
                      </div>
                    )}

                    {/* Mensaje para borradores incompletos */}
                    {plan.status === 'draft' && (plan.protein_percentage + plan.carbs_percentage + plan.fat_percentage) === 0 && (
                      <div className="mt-2 text-xs text-gray-500 italic">
                        Plan sin configuración completa
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditPlan(plan);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title="Editar plan"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlan(plan.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${selectedPlan?.id === plan.id ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedPlan?.id === plan.id && plan.portions && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Distribución de Porciones</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {plan.portions.map(portion => (
                        <div key={portion.id} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-600">{portion.food_group_name}</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {portion.portions_count}
                          </p>
                          <p className="text-xs text-gray-500">
                            {portion.total_calories?.toFixed(0)} kcal
                          </p>
                        </div>
                      ))}
                    </div>

                    {plan.notes && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Notas</h4>
                        <p className="text-sm text-gray-600">{plan.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}