import { supabase } from './supabase';
import { recipesApi } from './recipes';

// Dishes API
export const dishesApi = {
  // Get all dishes (public + user's own)
  async getDishes(filters = {}) {
    let query = supabase
      .from('dishes')
      .select(`
        *,
        recipes:dishes_recipes_view(*)
      `)
      .eq('is_active', true);

    // Apply filters
    if (filters.meal_time) {
      query = query.eq('meal_time', filters.meal_time);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get user's own dishes
  async getUserDishes() {
    const { data, error } = await supabase
      .from('dishes')
      .select(`
        *,
        recipes:dishes_recipes_view(*)
      `)
      .eq('created_by', (await supabase.auth.getUser()).data.user?.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get a single dish by ID
  async getDish(dishId) {
    const { data, error } = await supabase
      .from('dishes')
      .select(`
        *,
        recipes:dishes_recipes_view(*)
      `)
      .eq('id', dishId)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  },

  // Create a new dish
  async createDish(dishData) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    // Calculate total food group portions from recipes
    const totalPortions = await this.calculateDishTotals(dishData.recipes);

    const { data, error } = await supabase
      .from('dishes')
      .insert({
        ...dishData,
        total_food_group_portions: totalPortions,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a dish
  async updateDish(dishId, updates) {
    // Recalculate totals if recipes changed
    if (updates.recipes) {
      updates.total_food_group_portions = await this.calculateDishTotals(updates.recipes);
    }

    const { data, error } = await supabase
      .from('dishes')
      .update(updates)
      .eq('id', dishId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a dish (soft delete)
  async deleteDish(dishId) {
    const { data, error } = await supabase
      .from('dishes')
      .update({ is_active: false })
      .eq('id', dishId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Duplicate a dish (create copy)
  async duplicateDish(dishId, newName) {
    const originalDish = await this.getDish(dishId);

    const { id, created_by, created_at, updated_at, ...dishDataToCopy } = originalDish;

    return await this.createDish({
      ...dishDataToCopy,
      name: newName || `${originalDish.name} (Copia)`,
      is_public: false // Always start as private copy
    });
  },

  // Calculate total food group portions from recipes
  async calculateDishTotals(recipesList) {
    const totals = {};

    for (const recipeItem of recipesList) {
      const recipe = await recipesApi.getRecipe(recipeItem.recipe_id);
      const servings = recipeItem.servings || 1;

      Object.entries(recipe.food_group_portions).forEach(([groupId, portions]) => {
        if (!totals[groupId]) {
          totals[groupId] = 0;
        }
        totals[groupId] += portions * servings;
      });
    }

    return totals;
  },

  // Get dishes for a specific meal plan
  async getMealPlanDishes(mealPlanId) {
    const { data, error } = await supabase
      .from('meal_plan_dishes')
      .select(`
        *,
        dish:dishes(
          *,
          recipes:dishes_recipes_view(*)
        )
      `)
      .eq('meal_plan_id', mealPlanId)
      .order('week_number')
      .order('meal_time');

    if (error) throw error;
    return data;
  },

  // Set dish for a specific meal time, day and week
  async setMealPlanDish(mealPlanId, weekNumber, dayOfWeek, mealTime, dishId, servings = 1, customNotes = null) {
    const { data, error } = await supabase
      .from('meal_plan_dishes')
      .upsert({
        meal_plan_id: mealPlanId,
        week_number: weekNumber,
        day_of_week: dayOfWeek,
        meal_time: mealTime,
        dish_id: dishId,
        servings: servings,
        custom_notes: customNotes
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Remove dish from meal plan
  async removeMealPlanDish(mealPlanId, weekNumber, dayOfWeek, mealTime) {
    const { error } = await supabase
      .from('meal_plan_dishes')
      .delete()
      .eq('meal_plan_id', mealPlanId)
      .eq('week_number', weekNumber)
      .eq('day_of_week', dayOfWeek)
      .eq('meal_time', mealTime);

    if (error) throw error;
  },

  // Get meal plan dishes structured by week, day and meal time
  async getMealPlanDishesStructured(mealPlanId) {
    const dishes = await this.getMealPlanDishes(mealPlanId);
    const structured = {};

    dishes.forEach(item => {
      const weekKey = `week_${item.week_number}`;
      const dayKey = `day_${item.day_of_week}`;

      if (!structured[weekKey]) {
        structured[weekKey] = {};
      }
      if (!structured[weekKey][dayKey]) {
        structured[weekKey][dayKey] = {};
      }

      structured[weekKey][dayKey][item.meal_time] = {
        dish: item.dish,
        servings: item.servings,
        custom_notes: item.custom_notes,
        id: item.id
      };
    });

    return structured;
  },

  // Validate dish data
  validateDish(dishData) {
    const errors = {};

    if (!dishData.name?.trim()) {
      errors.name = 'El nombre del plato es requerido';
    }

    if (!dishData.recipes || dishData.recipes.length === 0) {
      errors.recipes = 'Debe incluir al menos una receta';
    }

    if (dishData.recipes) {
      dishData.recipes.forEach((recipe, index) => {
        if (!recipe.recipe_id) {
          errors[`recipe_${index}_id`] = `La receta ${index + 1} es requerida`;
        }
        if (!recipe.servings || recipe.servings <= 0) {
          errors[`recipe_${index}_servings`] = `Las porciones de la receta ${index + 1} deben ser mayores a 0`;
        }
      });
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Calculate dish nutrition from its recipes
  async calculateDishNutrition(dishData, foodGroups) {
    const totals = await this.calculateDishTotals(dishData.recipes);

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    Object.entries(totals).forEach(([groupId, portions]) => {
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
      totalFat,
      foodGroupTotals: totals
    };
  }
};