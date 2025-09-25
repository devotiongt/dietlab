import React, { Fragment } from 'react'
import {
  Plus,
  Activity,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Weight,
  Ruler,
  FileText
} from 'lucide-react'

export default function MeasurementsHistory({
  measurements,
  loading,
  error,
  expandedMeasurements,
  onAddMeasurement,
  onEditMeasurement,
  onDeleteMeasurement,
  onToggleExpansion,
  onClearError
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Historial de Mediciones</h2>
          <button
            onClick={onAddMeasurement}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Medición
          </button>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando mediciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Historial de Mediciones</h2>
        <button
          onClick={onAddMeasurement}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Medición
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
          <button
            onClick={onClearError}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {measurements.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay mediciones</h3>
          <p className="text-gray-600 mb-4">Aún no se han registrado mediciones para este paciente.</p>
          <button
            onClick={onAddMeasurement}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Primera Medición
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <MeasurementsDesktopTable
            measurements={measurements}
            expandedMeasurements={expandedMeasurements}
            onToggleExpansion={onToggleExpansion}
            onEditMeasurement={onEditMeasurement}
            onDeleteMeasurement={onDeleteMeasurement}
          />

          {/* Mobile Cards */}
          <MeasurementsMobileCards
            measurements={measurements}
            expandedMeasurements={expandedMeasurements}
            onToggleExpansion={onToggleExpansion}
            onEditMeasurement={onEditMeasurement}
            onDeleteMeasurement={onDeleteMeasurement}
          />
        </>
      )}
    </div>
  )
}

function MeasurementsDesktopTable({
  measurements,
  expandedMeasurements,
  onToggleExpansion,
  onEditMeasurement,
  onDeleteMeasurement
}) {
  return (
    <div className="hidden lg:block">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Peso (kg)
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              % Grasa
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notas
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {measurements.map((measurement, index) => {
            const isExpanded = expandedMeasurements.has(measurement.id)
            return (
              <Fragment key={measurement.id}>
                <tr className={index === 0 ? 'bg-green-50' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div>
                      <div className="font-medium text-gray-900">
                        {new Date(measurement.measurement_date).toLocaleDateString()}
                      </div>
                      {index === 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Más reciente
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {measurement.weight ? (
                      <span className="font-medium text-gray-900">{measurement.weight} kg</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {measurement.body_fat_percentage ? (
                      <span className="font-medium text-gray-900">{measurement.body_fat_percentage}%</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 max-w-xs">
                    {measurement.notes ? (
                      <span className="truncate block" title={measurement.notes}>
                        {measurement.notes}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-1">
                      <button
                        onClick={() => onToggleExpansion(measurement.id)}
                        className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                        title={isExpanded ? "Ocultar detalles" : "Ver más detalles"}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => onEditMeasurement(measurement)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteMeasurement(measurement.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <ExpandedMeasurementRow measurement={measurement} index={index} />
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function ExpandedMeasurementRow({ measurement, index }) {
  return (
    <tr className={index === 0 ? 'bg-green-25' : 'bg-gray-25'}>
      <td colSpan="5" className="px-4 py-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Medidas Adicionales</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {measurement.muscle_mass && (
              <MeasurementDetail
                icon={<Activity className="h-4 w-4 text-green-500 mr-2" />}
                value={`${measurement.muscle_mass} kg`}
                label="Masa Muscular"
              />
            )}
            {measurement.waist_circumference && (
              <MeasurementDetail
                icon={<Ruler className="h-4 w-4 text-purple-500 mr-2" />}
                value={`${measurement.waist_circumference} cm`}
                label="Cintura"
              />
            )}
            {measurement.hip_circumference && (
              <MeasurementDetail
                icon={<Ruler className="h-4 w-4 text-pink-500 mr-2" />}
                value={`${measurement.hip_circumference} cm`}
                label="Cadera"
              />
            )}
            {measurement.chest_circumference && (
              <MeasurementDetail
                icon={<Ruler className="h-4 w-4 text-indigo-500 mr-2" />}
                value={`${measurement.chest_circumference} cm`}
                label="Pecho"
              />
            )}
            {measurement.arm_circumference && (
              <MeasurementDetail
                icon={<Ruler className="h-4 w-4 text-teal-500 mr-2" />}
                value={`${measurement.arm_circumference} cm`}
                label="Brazo"
              />
            )}
            {measurement.thigh_circumference && (
              <MeasurementDetail
                icon={<Ruler className="h-4 w-4 text-cyan-500 mr-2" />}
                value={`${measurement.thigh_circumference} cm`}
                label="Muslo"
              />
            )}
          </div>
        </div>
      </td>
    </tr>
  )
}

function MeasurementsMobileCards({
  measurements,
  expandedMeasurements,
  onToggleExpansion,
  onEditMeasurement,
  onDeleteMeasurement
}) {
  return (
    <div className="lg:hidden space-y-4">
      {measurements.map((measurement, index) => {
        const isExpanded = expandedMeasurements.has(measurement.id)
        return (
          <div
            key={measurement.id}
            className={`rounded-lg border p-4 ${
              index === 0 ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-medium text-gray-900">
                  {new Date(measurement.measurement_date).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
                {index === 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                    Más reciente
                  </span>
                )}
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => onToggleExpansion(measurement.id)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                  title={isExpanded ? "Ocultar detalles" : "Ver más detalles"}
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => onEditMeasurement(measurement)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                  title="Editar"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDeleteMeasurement(measurement.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Main measurements - always visible */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {measurement.weight && (
                <div className="flex items-center text-sm">
                  <Weight className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="font-medium">{measurement.weight} kg</span>
                </div>
              )}
              {measurement.body_fat_percentage && (
                <div className="flex items-center text-sm">
                  <Activity className="h-4 w-4 text-orange-500 mr-2" />
                  <span>{measurement.body_fat_percentage}% grasa</span>
                </div>
              )}
            </div>

            {/* Expanded measurements */}
            {isExpanded && (
              <ExpandedMobileMeasurements measurement={measurement} />
            )}

            {measurement.notes && (
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                <div className="flex items-start">
                  <FileText className="h-3 w-3 text-gray-400 mr-1 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{measurement.notes}</span>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ExpandedMobileMeasurements({ measurement }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 mb-3">
      <h4 className="text-sm font-medium text-gray-900 mb-2">Medidas Adicionales</h4>
      <div className="grid grid-cols-1 gap-2">
        {measurement.muscle_mass && (
          <div className="flex items-center text-sm">
            <Activity className="h-4 w-4 text-green-500 mr-2" />
            <span>{measurement.muscle_mass} kg músculo</span>
          </div>
        )}
        {measurement.waist_circumference && (
          <div className="flex items-center text-sm">
            <Ruler className="h-4 w-4 text-purple-500 mr-2" />
            <span>{measurement.waist_circumference} cm cintura</span>
          </div>
        )}
        {measurement.hip_circumference && (
          <div className="flex items-center text-sm">
            <Ruler className="h-4 w-4 text-pink-500 mr-2" />
            <span>{measurement.hip_circumference} cm cadera</span>
          </div>
        )}
        {measurement.chest_circumference && (
          <div className="flex items-center text-sm">
            <Ruler className="h-4 w-4 text-indigo-500 mr-2" />
            <span>{measurement.chest_circumference} cm pecho</span>
          </div>
        )}
        {measurement.arm_circumference && (
          <div className="flex items-center text-sm">
            <Ruler className="h-4 w-4 text-teal-500 mr-2" />
            <span>{measurement.arm_circumference} cm brazo</span>
          </div>
        )}
        {measurement.thigh_circumference && (
          <div className="flex items-center text-sm">
            <Ruler className="h-4 w-4 text-cyan-500 mr-2" />
            <span>{measurement.thigh_circumference} cm muslo</span>
          </div>
        )}
      </div>
    </div>
  )
}

function MeasurementDetail({ icon, value, label }) {
  return (
    <div className="flex items-center text-sm">
      {icon}
      <div>
        <p className="font-medium">{value}</p>
        <p className="text-gray-500 text-xs">{label}</p>
      </div>
    </div>
  )
}