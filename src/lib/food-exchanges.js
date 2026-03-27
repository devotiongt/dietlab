import { supabase } from './supabase';

export const foodExchangesApi = {
  // Get all exchanges (defaults + user's own)
  async getExchanges(filters = {}) {
    let query = supabase
      .from('food_exchanges')
      .select('*, food_group:food_groups(id, name, sort_order)')
      .eq('is_active', true);

    if (filters.food_group_id) {
      query = query.eq('food_group_id', filters.food_group_id);
    }

    if (filters.search) {
      query = query.ilike('food_name', `%${filters.search}%`);
    }

    const { data, error } = await query.order('food_name');

    if (error) throw error;
    return data;
  },

  // Create a new custom exchange
  async createExchange(exchangeData) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('food_exchanges')
      .insert({
        food_name: exchangeData.food_name,
        food_group_id: exchangeData.food_group_id,
        portion_size: exchangeData.portion_size,
        user_id: user.id,
        is_default: false,
      })
      .select('*, food_group:food_groups(id, name, sort_order)')
      .single();

    if (error) throw error;
    return data;
  },

  // Update a custom exchange
  async updateExchange(exchangeId, updates) {
    const { data, error } = await supabase
      .from('food_exchanges')
      .update({
        food_name: updates.food_name,
        food_group_id: updates.food_group_id,
        portion_size: updates.portion_size,
      })
      .eq('id', exchangeId)
      .select('*, food_group:food_groups(id, name, sort_order)')
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a custom exchange (soft delete)
  async deleteExchange(exchangeId) {
    const { data, error } = await supabase
      .from('food_exchanges')
      .update({ is_active: false })
      .eq('id', exchangeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
