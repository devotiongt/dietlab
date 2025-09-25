import { Link } from 'react-router-dom'
import { Apple } from 'lucide-react'

export default function NavigationHeader() {
  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-2 rounded-xl">
              <Apple className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              DietLab
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition">
              Características
            </a>
            <a href="#benefits" className="text-gray-600 hover:text-gray-900 transition">
              Beneficios
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition">
              Precios
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium">
              Iniciar Sesión
            </Link>
            <Link
              to="/register"
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2.5 rounded-full hover:shadow-lg transition-all hover:scale-105 font-medium"
            >
              Prueba Gratis
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}