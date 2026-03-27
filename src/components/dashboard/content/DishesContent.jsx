import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import DishesTable from '../../dishes/DishesTable';

export default function DishesContent() {
  const [foodGroups, setFoodGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFoodGroups();
  }, []);

  const loadFoodGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('food_groups')
        .select('*')
        .order('name');

      if (error) throw error;
      setFoodGroups(data || []);
    } catch (error) {
      console.error('Error loading food groups:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return <DishesTable foodGroups={foodGroups} />;
}
