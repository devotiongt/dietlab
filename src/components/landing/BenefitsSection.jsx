import { Link } from 'react-router-dom'
import {
  Clock,
  TrendingUp,
  Heart,
  Target,
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function BenefitsSection() {
  return (
    <>
      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                ¿Por qué los nutricionistas
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"> aman </span>
                DietLab?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-white rounded-lg p-2 shadow-md">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Ahorra 10+ horas semanales</h3>
                    <p className="text-gray-600">
                      Automatiza tareas repetitivas y dedica más tiempo a lo que realmente importa: tus pacientes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-white rounded-lg p-2 shadow-md">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Incrementa tus ingresos 30%</h3>
                    <p className="text-gray-600">
                      Gestiona más pacientes eficientemente y ofrece servicios premium con herramientas profesionales.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-white rounded-lg p-2 shadow-md">
                    <Heart className="h-6 w-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Mejora la adherencia 85%</h3>
                    <p className="text-gray-600">
                      Planes personalizados y seguimiento constante que mantienen a tus pacientes motivados.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-white rounded-lg p-2 shadow-md">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Resultados medibles</h3>
                    <p className="text-gray-600">
                      Demuestra el valor de tu trabajo con reportes profesionales y métricas claras de progreso.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop"
                    alt="Nutricionista"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-gray-900">Dra. Ana Martínez</p>
                    <p className="text-gray-600">Nutricionista Clínica</p>
                    <div className="flex mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 italic mb-4">
                  "DietLab transformó completamente mi consulta. Antes pasaba horas creando planes manualmente,
                  ahora lo hago en minutos. Mis pacientes están más comprometidos y los resultados hablan por sí solos."
                </p>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">250+</p>
                    <p className="text-sm text-gray-600">Pacientes activos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">95%</p>
                    <p className="text-sm text-gray-600">Tasa de éxito</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">4.9</p>
                    <p className="text-sm text-gray-600">Calificación</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl p-4 text-white">
                <p className="font-bold">+2,500</p>
                <p className="text-sm">Profesionales confían en nosotros</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Únete a la revolución digital de la nutrición
          </h2>
          <p className="text-xl text-green-50 mb-8">
            Empieza tu prueba gratuita de 14 días y descubre por qué miles de nutricionistas
            están transformando sus consultas con DietLab.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center bg-white text-green-600 text-lg px-8 py-4 rounded-full hover:shadow-xl transition-all hover:scale-105 font-bold"
            >
              Comenzar Prueba Gratuita
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <button className="inline-flex items-center justify-center border-2 border-white text-white text-lg px-8 py-4 rounded-full hover:bg-white/10 transition font-bold">
              Hablar con Ventas
            </button>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-8 text-green-50">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Configuración en 5 min</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Soporte 24/7</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}