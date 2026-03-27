import { useState, useEffect } from 'react';
import { ArrowLeftRight, Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { foodExchangesApi } from '../../lib/food-exchanges';
import ExchangeFormModal from './ExchangeFormModal';

export default function ExchangeListTable({ foodGroups }) {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExchange, setEditingExchange] = useState(null);

  useEffect(() => {
    loadExchanges();
  }, [groupFilter]);

  const loadExchanges = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (groupFilter) filters.food_group_id = groupFilter;
      const data = await foodExchangesApi.getExchanges(filters);
      setExchanges(data);
    } catch (error) {
      console.error('Error loading exchanges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    if (editingExchange) {
      await foodExchangesApi.updateExchange(editingExchange.id, formData);
    } else {
      await foodExchangesApi.createExchange(formData);
    }
    setEditingExchange(null);
    loadExchanges();
  };

  const handleEdit = (exchange) => {
    setEditingExchange(exchange);
    setShowModal(true);
  };

  const handleDelete = async (exchange) => {
    if (window.confirm(`¿Eliminar "${exchange.food_name}" de la lista?`)) {
      try {
        await foodExchangesApi.deleteExchange(exchange.id);
        loadExchanges();
      } catch (error) {
        console.error('Error deleting exchange:', error);
        alert('Error al eliminar el alimento');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExchange(null);
  };

  // Filter by search term locally
  const filtered = exchanges.filter((ex) =>
    ex.food_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by food group for display
  const groupedExchanges = foodGroups
    .map((group) => ({
      ...group,
      items: filtered.filter((ex) => ex.food_group_id === group.id),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ArrowLeftRight className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">Lista de Intercambio</h1>
          </div>
          <button
            onClick={() => { setEditingExchange(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nuevo Alimento
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar alimentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
            />
          </div>
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
          >
            <option value="">Todos los grupos</option>
            {foodGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ArrowLeftRight className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No se encontraron alimentos</p>
          <button
            onClick={() => { setEditingExchange(null); setShowModal(true); }}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Agregar primer alimento
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedExchanges.map((group) => (
            <div key={group.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Group header */}
              <div
                className="px-6 py-3 flex items-center gap-3"
                style={{ backgroundColor: `${group.color || '#6B7280'}15` }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: group.color || '#6B7280' }}
                />
                <h2 className="text-sm font-semibold" style={{ color: group.color || '#6B7280' }}>
                  {group.name}
                </h2>
                <span className="text-xs text-gray-500">
                  ({group.items.length} {group.items.length === 1 ? 'alimento' : 'alimentos'})
                </span>
              </div>

              {/* Table */}
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alimento
                    </th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Porcion (1 intercambio)
                    </th>
                    <th className="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {group.items.map((exchange) => (
                    <tr key={exchange.id} className="hover:bg-gray-50">
                      <td className="px-6 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900">{exchange.food_name}</span>
                          {!exchange.is_default && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 rounded">
                              Personalizado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-2.5">
                        <span className="text-sm text-gray-600">{exchange.portion_size}</span>
                      </td>
                      <td className="px-6 py-2.5 text-right">
                        {!exchange.is_default ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(exchange)}
                              className="text-gray-400 hover:text-green-600"
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(exchange)}
                              className="text-gray-400 hover:text-red-600"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Por defecto</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <ExchangeFormModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        exchange={editingExchange}
        foodGroups={foodGroups}
      />
    </div>
  );
}
