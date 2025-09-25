import StatCard from '../StatCard'

export default function OverviewContent() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Pacientes" value="0" change="+0%" color="blue" />
        <StatCard title="Citas Hoy" value="0" change="0" color="green" />
        <StatCard title="Planes Activos" value="0" change="+0%" color="purple" />
        <StatCard title="Consultas del Mes" value="0" change="+0%" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Próximas Citas</h3>
          <p className="text-gray-500">No hay citas programadas</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
          <p className="text-gray-500">No hay actividad reciente</p>
        </div>
      </div>
    </div>
  )
}