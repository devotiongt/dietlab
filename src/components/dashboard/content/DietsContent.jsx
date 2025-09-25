export default function DietsContent() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Planes Alimenticios</h2>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          Crear Plan
        </button>
      </div>
      <p className="text-gray-500">No hay planes alimenticios creados.</p>
    </div>
  )
}