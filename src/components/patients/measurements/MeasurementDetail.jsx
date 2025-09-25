import { 
  X, 
  Edit, 
  Trash2, 
  Calendar, 
  Weight, 
  Activity, 
  Ruler,
  FileText 
} from 'lucide-react'

export default function MeasurementDetail({ measurement, onClose, onEdit, onDelete }) {
  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta medición? Esta acción no se puede deshacer.')) {
      onDelete(measurement.id)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const measurements = [
    { label: 'Peso', value: measurement.weight, unit: 'kg', icon: Weight },
    { label: 'Porcentaje de Grasa', value: measurement.body_fat_percentage, unit: '%', icon: Activity },
    { label: 'Masa Muscular', value: measurement.muscle_mass, unit: 'kg', icon: Activity },
    { label: 'Circunferencia de Cintura', value: measurement.waist_circumference, unit: 'cm', icon: Ruler },
    { label: 'Circunferencia de Cadera', value: measurement.hip_circumference, unit: 'cm', icon: Ruler },
    { label: 'Circunferencia de Pecho', value: measurement.chest_circumference, unit: 'cm', icon: Ruler },
    { label: 'Circunferencia de Brazo', value: measurement.arm_circumference, unit: 'cm', icon: Ruler },
    { label: 'Circunferencia de Muslo', value: measurement.thigh_circumference, unit: 'cm', icon: Ruler },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Detalles de Medición</h2>
            <div className="flex items-center mt-2 text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(measurement.measurement_date)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(measurement)}
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Measurements Grid */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Medidas Corporales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {measurements.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center mb-3">
                      <div className="bg-blue-100 rounded-lg p-2 mr-3">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-medium text-gray-700">{item.label}</h4>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {item.value ? `${item.value} ${item.unit}` : 'No registrado'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* BMI Calculation */}
            {measurement.weight && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Fecha de medición:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(measurement.measurement_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Hora de registro:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(measurement.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {measurement.notes && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Notas de la Medición</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{measurement.notes}</p>
              </div>
            )}
          </div>


          {/* Measurements History Context */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <Calendar className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Nota:</strong> Esta medición forma parte del historial de seguimiento del paciente. 
                  Los cambios o eliminaciones afectarán el análisis de progreso.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={() => onEdit(measurement)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Editar Medición
          </button>
        </div>
      </div>
    </div>
  )
}