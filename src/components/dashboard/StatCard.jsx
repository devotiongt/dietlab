import PropTypes from 'prop-types'

export default function StatCard({ title, value, change, color }) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  }

  const isPositive = typeof change === 'string' && change.startsWith('+')

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-gray-600'}`}>
          {change}
        </span>
      </div>
      <div className="flex items-center">
        <div className={`h-12 w-1 ${colors[color]} mr-4`}></div>
        <span className="text-3xl font-bold text-gray-900">{value}</span>
      </div>
    </div>
  )
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  change: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['blue', 'green', 'purple', 'orange']).isRequired,
}