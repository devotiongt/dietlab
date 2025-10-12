import { supabase } from './supabase';

// Meal Plans API
export const mealPlansApi = {
  // Get all meal plans for a patient
  async getPatientMealPlans(patientId) {
    const { data, error } = await supabase
      .from('meal_plans')
      .select(`
        *,
        portions:meal_plan_portions_with_totals(*)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get latest meal plan for a patient (active or draft)
  async getLatestMealPlan(patientId) {
    const { data, error } = await supabase
      .from('meal_plans')
      .select(`
        *,
        portions:meal_plan_portions_with_totals(*)
      `)
      .eq('patient_id', patientId)
      .in('status', ['active', 'draft'])  // Include both active and draft plans
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  },

  // Get a single meal plan by ID
  async getMealPlan(mealPlanId) {
    const { data, error } = await supabase
      .from('meal_plans')
      .select(`
        *,
        portions:meal_plan_portions_with_totals(*)
      `)
      .eq('id', mealPlanId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create a new meal plan
  async createMealPlan(planData) {
    const { food_portions, ...mealPlanData } = planData;

    // Start a transaction
    const { data: mealPlan, error: planError } = await supabase
      .from('meal_plans')
      .insert(mealPlanData)
      .select()
      .single();

    if (planError) throw planError;

    // Insert portions if provided
    if (food_portions && Object.keys(food_portions).length > 0) {
      const portions = Object.entries(food_portions)
        .filter(([_, count]) => count > 0)
        .map(([food_group_id, portions_count]) => ({
          meal_plan_id: mealPlan.id,
          food_group_id,
          portions_count
        }));

      if (portions.length > 0) {
        const { error: portionsError } = await supabase
          .from('meal_plan_portions')
          .insert(portions);

        if (portionsError) {
          // Rollback by deleting the meal plan
          await supabase
            .from('meal_plans')
            .delete()
            .eq('id', mealPlan.id);
          throw portionsError;
        }
      }
    }

    return mealPlan;
  },

  // Update a meal plan
  async updateMealPlan(mealPlanId, updates) {
    const { food_portions, ...mealPlanUpdates } = updates;

    // Update meal plan
    const { data: mealPlan, error: planError } = await supabase
      .from('meal_plans')
      .update(mealPlanUpdates)
      .eq('id', mealPlanId)
      .select()
      .single();

    if (planError) throw planError;

    // Update portions if provided
    if (food_portions) {
      // Delete existing portions
      await supabase
        .from('meal_plan_portions')
        .delete()
        .eq('meal_plan_id', mealPlanId);

      // Insert new portions
      const portions = Object.entries(food_portions)
        .filter(([_, count]) => count > 0)
        .map(([food_group_id, portions_count]) => ({
          meal_plan_id: mealPlanId,
          food_group_id,
          portions_count
        }));

      if (portions.length > 0) {
        const { error: portionsError } = await supabase
          .from('meal_plan_portions')
          .insert(portions);

        if (portionsError) throw portionsError;
      }
    }

    return mealPlan;
  },

  // Delete a meal plan
  async deleteMealPlan(mealPlanId) {
    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', mealPlanId);

    if (error) throw error;
  },

  // Get all food groups
  async getFoodGroups() {
    const { data, error } = await supabase
      .from('food_groups')
      .select('*')
      .order('sort_order');

    if (error) throw error;
    return data;
  },

  // Calculate week dates for meal plan
  calculateWeekDates(startDate, weeksCount) {
    const start = new Date(startDate);

    // Adjust to Monday if not already
    const dayOfWeek = start.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;
    if (daysUntilMonday > 0) {
      start.setDate(start.getDate() + daysUntilMonday);
    }

    // Calculate end date (Sunday of the last week)
    const end = new Date(start);
    end.setDate(end.getDate() + (weeksCount * 7) - 1);

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  },

  // Calculate macros from percentages
  calculateMacros(vetCalories, proteinPercent, carbsPercent, fatPercent) {
    return {
      protein: {
        percentage: proteinPercent,
        calories: (vetCalories * proteinPercent) / 100,
        grams: (vetCalories * proteinPercent / 100) / 4
      },
      carbs: {
        percentage: carbsPercent,
        calories: (vetCalories * carbsPercent) / 100,
        grams: (vetCalories * carbsPercent / 100) / 4
      },
      fat: {
        percentage: fatPercent,
        calories: (vetCalories * fatPercent) / 100,
        grams: (vetCalories * fatPercent / 100) / 9
      }
    };
  },

  // Calculate totals from portions
  calculatePortionTotals(portions, foodGroups) {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    Object.entries(portions).forEach(([groupId, count]) => {
      const group = foodGroups.find(g => g.id === groupId);
      if (group && count > 0) {
        totalCalories += group.calories_per_portion * count;
        totalProtein += group.protein_per_portion * count;
        totalCarbs += group.carbs_per_portion * count;
        totalFat += group.fat_per_portion * count;
      }
    });

    return {
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat
    };
  },

  // Calculate adequacy percentages
  calculateAdequacy(actual, target) {
    if (target === 0) return 0;
    return (actual / target) * 100;
  }
};