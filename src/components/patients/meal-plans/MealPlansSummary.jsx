import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, Target, Edit2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mealPlansApi } from '../../../lib/meal-plans';

export default function MealPlansSummary({ patient, onCreatePlan, onViewAllPlans }) {
  const navigate = useNavigate();
  const [latestPlan, setLatestPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLatestPlan();
  }, [patient.id]);

  const loadLatestPlan = async () => {
    try {
      setLoading(true);
      const plan = await mealPlansApi.getLatestMealPlan(patient.id);
      setLatestPlan(plan);
    } catch (error) {
      console.error('Error loading latest meal plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateProgress = (plan) => {
    const today = new Date();
    const start = new Date(plan.start_date);
    const end = new Date(plan.end_date);

    if (today < start) return 0;
    if (today > end) return 100;

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const passedDays = Math.ceil((today - start) / (1000 * 60 * 60 * 24));

    return Math.round((passedDays / totalDays) * 100);
  };

  const handleEditPlan = () => {
    if (latestPlan) {
      navigate(`/dashboard/patients/${patient.id}/meal-plans/${latestPlan.id}/edit`);
    }
  };

  const handleCreateClick = () => {
    // Si hay un borrador, mostrar advertencia
    if (latestPlan && latestPlan.status === 'draft') {
      if (confirm('Ya existe un plan en borrador. ¿Deseas editar el borrador existente?')) {
        handleEditPlan();
      }
    } else {
      onCreatePlan();
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Plan Alimenticio</h3>
          <div className="flex items-center gap-2">
            {latestPlan && (
              <button
                onClick={handleEditPlan}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Editar
              </button>
            )}
            <button
              onClick={handleCreateClick}
              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                latestPlan?.status === 'draft'
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-white bg-blue-600 hover:bg-blue-700'
              }`}
              title={latestPlan?.status === 'draft' ? 'Completa o elimina el borrador actual antes de crear un nuevo plan' : 'Crear nuevo plan alimenticio'}
            >
              <Plus className="h-4 w-4 mr-1" />
              Nuevo Plan
            </button>
          </div>
        </div>

        {latestPlan ? (
          <div className="space-y-3">
            {/* Plan Name and Status */}
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">{latestPlan.name}</h4>
                {latestPlan.status === 'draft' && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-300">
                    Borrador
                  </span>
                )}
              </div>
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(latestPlan.start_date)} - {formatDate(latestPlan.end_date)}
                <span className="mx-2">•</span>
                {latestPlan.weeks_duration} {latestPlan.weeks_duration === 1 ? 'semana' : 'semanas'}
              </div>
            </div>

            {/* Quick Stats - Solo si no es borrador o tiene valores */}
            {(latestPlan.status !== 'draft' || latestPlan.vet_calories > 0) && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center">
                  <span className="text-gray-600">VET:</span>
                  <span className="ml-1 font-semibold text-gray-900">{latestPlan.vet_calories} kcal</span>
                </div>
                {latestPlan.protein_percentage > 0 && (
                  <>
                    <span className="text-gray-400">|</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span>P: {latestPlan.protein_percentage}%</span>
                      <span>C: {latestPlan.carbs_percentage}%</span>
                      <span>G: {latestPlan.fat_percentage}%</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Progress Bar - Solo para planes activos */}
            {latestPlan.status === 'active' && (
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${calculateProgress(latestPlan)}%` }}
                  title={`Progreso: ${calculateProgress(latestPlan)}%`}
                />
              </div>
            )}

            {/* View All Plans Link */}
            <div className="pt-1">
              <button
                onClick={onViewAllPlans}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Ver todos los planes →
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              No hay planes alimenticios creados
            </p>
            <button
              onClick={onCreatePlan}
              className="mt-3 text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              Crear primer plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}