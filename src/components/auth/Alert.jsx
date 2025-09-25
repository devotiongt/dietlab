import { AlertCircle, CheckCircle } from 'lucide-react'

export default function Alert({ type, message, className = "" }) {
  const getAlertStyles = () => {
    switch (type) {
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-700',
          icon: AlertCircle
        }
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-700',
          icon: CheckCircle
        }
      default:
        return {
          container: 'bg-gray-50 border-gray-200 text-gray-700',
          icon: AlertCircle
        }
    }
  }

  const { container, icon: Icon } = getAlertStyles()

  return (
    <div className={`p-3 border rounded-lg flex items-center ${container} ${className}`}>
      <Icon className="h-5 w-5 mr-2 flex-shrink-0" />
      <span className="text-sm">{message}</span>
    </div>
  )
}