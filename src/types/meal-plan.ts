export interface FoodGroup {
  id: string;
  name: string;
  name_english?: string;
  calories_per_portion: number;
  protein_per_portion: number;
  carbs_per_portion: number;
  fat_per_portion: number;
  sort_order: number;
}

export interface MealPlanPortion {
  id?: string;
  meal_plan_id?: string;
  food_group_id: string;
  food_group?: FoodGroup;
  portions_count: number;
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
}

export interface MealPlan {
  id: string;
  patient_id: string;
  name: string;
  start_date: string;
  end_date: string;
  weeks_duration: number;

  // Plan base information
  vet_calories: number;
  protein_percentage: number;
  carbs_percentage: number;
  fat_percentage: number;

  // Calculated values
  protein_grams?: number;
  carbs_grams?: number;
  fat_grams?: number;

  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;

  // Relations
  portions?: MealPlanPortion[];
}

export interface MealPlanFormData {
  name: string;
  weeks_duration: number;
  start_date: Date | null;

  // Step 1: Plan base
  vet_calories: number;
  protein_percentage: number;
  carbs_percentage: number;
  fat_percentage: number;
  food_portions: Record<string, number>; // food_group_id -> portions_count

  notes?: string;
}

export interface MacronutrientTargets {
  calories: number;
  protein: {
    percentage: number;
    grams: number;
    calories: number;
  };
  carbs: {
    percentage: number;
    grams: number;
    calories: number;
  };
  fat: {
    percentage: number;
    grams: number;
    calories: number;
  };
}

export interface PortionSummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  adequacyPercentage: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}