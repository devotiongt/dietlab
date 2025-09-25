import { Link } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react'

export default function HeroSection() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-green-50 rounded-full px-4 py-2 mb-6">
                <Sparkles className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">
                  Plataforma #1 para Nutricionistas
                </span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Transforma la forma en que
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"> gestionas </span>
                tus consultas
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Optimiza tu práctica nutricional con herramientas inteligentes que te permiten
                crear planes personalizados, hacer seguimiento y gestionar pacientes en minutos, no horas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg px-8 py-4 rounded-full hover:shadow-xl transition-all hover:scale-105 font-semibold"
                >
                  Empieza Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <button className="inline-flex items-center justify-center border-2 border-gray-300 text-gray-700 text-lg px-8 py-4 rounded-full hover:border-gray-400 transition font-semibold">
                  Ver Demo
                </button>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Sin tarjeta de crédito
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  14 días gratis
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Cancela cuando quieras
                </div>
              </div>
            </div>
            <div className="relative lg:pl-12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-3xl transform rotate-6 opacity-20"></div>
                <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-2xl">
                  <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">Dashboard Principal</h3>
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white"></div>
                        <div className="w-8 h-8 bg-emerald-500 rounded-full border-2 border-white"></div>
                        <div className="w-8 h-8 bg-teal-500 rounded-full border-2 border-white"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl">
                        <p className="text-xs text-gray-600 mb-1">Pacientes Activos</p>
                        <p className="text-2xl font-bold text-gray-900">147</p>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +12% este mes
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl">
                        <p className="text-xs text-gray-600 mb-1">Citas Hoy</p>
                        <p className="text-2xl font-bold text-gray-900">8</p>
                        <p className="text-xs text-blue-600 flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          Próxima: 2:00 PM
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full"></div>
                      <div>
                        <p className="font-semibold text-sm">María García</p>
                        <p className="text-xs text-gray-500">Plan nutricional actualizado</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-gray-600">Progreso semanal</span>
                        <span className="font-semibold text-green-600">85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full" style={{width: '85%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 border-y border-gray-100 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">2,500+</p>
              <p className="text-gray-600 mt-1">Nutricionistas Activos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">50,000+</p>
              <p className="text-gray-600 mt-1">Pacientes Gestionados</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">4.9/5</p>
              <div className="flex justify-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">99.9%</p>
              <p className="text-gray-600 mt-1">Uptime Garantizado</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}