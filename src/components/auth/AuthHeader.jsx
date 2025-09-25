import { Link } from 'react-router-dom'
import { Apple } from 'lucide-react'

export default function AuthHeader({ title, subtitle }) {
  return (
    <div className="text-center mb-8">
      <Link to="/" className="inline-flex items-center space-x-2">
        <Apple className="h-10 w-10 text-green-600" />
        <span className="text-3xl font-bold text-gray-800">DietLab</span>
      </Link>
      <h2 className="mt-6 text-2xl font-semibold text-gray-900">
        {title}
      </h2>
      <p className="mt-2 text-gray-600">
        {subtitle}
      </p>
    </div>
  )
}