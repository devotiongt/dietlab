import { supabase } from './supabase';

// Recipes API
export const recipesApi = {
  // Get all recipes (public + user's own)
  async getRecipes(filters = {}) {
    let query = supabase
      .from('recipes')
      .select('*')
      .eq('is_active', true);

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }

    if (filters.maxPrepTime) {
      query = query.lte('prep_time_minutes', filters.maxPrepTime);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get user's own recipes
  async getUserRecipes() {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('created_by', (await supabase.auth.getUser()).data.user?.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get a single recipe by ID
  async getRecipe(recipeId) {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  },

  // Create a new recipe
  async createRecipe(recipeData) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('recipes')
      .insert({
        ...recipeData,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a recipe
  async updateRecipe(recipeId, updates) {
    const { data, error } = await supabase
      .from('recipes')
      .update(updates)
      .eq('id', recipeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a recipe (soft delete)
  async deleteRecipe(recipeId) {
    const { data, error } = await supabase
      .from('recipes')
      .update({ is_active: false })
      .eq('id', recipeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Duplicate a recipe (create copy)
  async duplicateRecipe(recipeId, newName) {
    const originalRecipe = await this.getRecipe(recipeId);

    const { id, created_by, created_at, updated_at, ...recipeDataToCopy } = originalRecipe;

    return await this.createRecipe({
      ...recipeDataToCopy,
      name: newName || `${originalRecipe.name} (Copia)`,
      is_public: false // Always start as private copy
    });
  },

  // Calculate total nutritional values from food group portions
  calculateRecipeNutrition(foodGroupPortions, foodGroups) {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    Object.entries(foodGroupPortions).forEach(([groupId, portions]) => {
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
      totalFat
    };
  },

  // Validate recipe data
  validateRecipe(recipeData) {
    const errors = {};

    if (!recipeData.name?.trim()) {
      errors.name = 'El nombre de la receta es requerido';
    }

    if (!recipeData.food_group_portions || Object.keys(recipeData.food_group_portions).length === 0) {
      errors.food_group_portions = 'Debe especificar al menos un grupo alimentario';
    }

    if (!recipeData.ingredients || recipeData.ingredients.length === 0) {
      errors.ingredients = 'Debe especificar al menos un ingrediente';
    }

    if (recipeData.prep_time_minutes && recipeData.prep_time_minutes < 0) {
      errors.prep_time_minutes = 'El tiempo de preparación no puede ser negativo';
    }

    if (recipeData.cook_time_minutes && recipeData.cook_time_minutes < 0) {
      errors.cook_time_minutes = 'El tiempo de cocción no puede ser negativo';
    }

    if (recipeData.servings && recipeData.servings <= 0) {
      errors.servings = 'El número de porciones debe ser mayor a 0';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};