import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ExchangeFormModal({ isOpen, onClose, onSave, exchange, foodGroups }) {
  const [formData, setFormData] = useState({
    food_name: '',
    food_group_id: '',
    portion_size: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (exchange) {
      setFormData({
        food_name: exchange.food_name,
        food_group_id: exchange.food_group_id,
        portion_size: exchange.portion_size,
      });
    } else {
      setFormData({ food_name: '', food_group_id: '', portion_size: '' });
    }
  }, [exchange, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.food_name.trim() || !formData.food_group_id || !formData.portion_size.trim()) return;

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving exchange:', error);
      alert('Error al guardar el alimento');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {exchange ? 'Editar Alimento' : 'Nuevo Alimento'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Alimento
            </label>
            <input
              type="text"
              value={formData.food_name}
              onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
              placeholder="Ej: Arroz integral"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grupo Alimenticio
            </label>
            <select
              value={formData.food_group_id}
              onChange={(e) => setFormData({ ...formData, food_group_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
              required
            >
              <option value="">Seleccionar grupo...</option>
              {foodGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Porcion (1 intercambio)
            </label>
            <input
              type="text"
              value={formData.portion_size}
              onChange={(e) => setFormData({ ...formData, portion_size: e.target.value })}
              placeholder="Ej: 0.5 taza, 1 unidad"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Guardando...' : exchange ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
