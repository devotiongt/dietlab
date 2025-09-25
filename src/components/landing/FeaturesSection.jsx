import {
  Users,
  Utensils,
  ChartBar,
  Calendar,
  Brain,
  Shield,
  CheckCircle
} from 'lucide-react'

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Todo lo que necesitas para
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"> brillar </span>
            en tu consulta
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Herramientas profesionales diseñadas específicamente para nutricionistas modernos
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="group hover:scale-105 transition-all">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 w-14 h-14 flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Gestión Inteligente de Pacientes</h3>
              <p className="text-gray-600 mb-4">
                Historial completo, evolución del peso, alergias, preferencias alimentarias y mucho más en un solo lugar.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Expedientes digitales completos
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Seguimiento fotográfico
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Recordatorios automáticos
                </li>
              </ul>
            </div>
          </div>

          <div className="group hover:scale-105 transition-all">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 w-14 h-14 flex items-center justify-center mb-6">
                <Utensils className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Planes Alimenticios con IA</h3>
              <p className="text-gray-600 mb-4">
                Crea planes personalizados en segundos con nuestra inteligencia artificial y base de datos de +10,000 alimentos.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Cálculo automático de macros
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Recetas personalizadas
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Lista de compras inteligente
                </li>
              </ul>
            </div>
          </div>

          <div className="group hover:scale-105 transition-all">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 w-14 h-14 flex items-center justify-center mb-6">
                <ChartBar className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Análisis y Reportes Detallados</h3>
              <p className="text-gray-600 mb-4">
                Visualiza el progreso con gráficos interactivos y genera reportes profesionales con un clic.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Gráficos de evolución
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Exportación PDF/Excel
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Comparativas mensuales
                </li>
              </ul>
            </div>
          </div>

          <div className="group hover:scale-105 transition-all">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-3 w-14 h-14 flex items-center justify-center mb-6">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Agenda Inteligente</h3>
              <p className="text-gray-600 mb-4">
                Sistema de citas con recordatorios automáticos por WhatsApp y email para ti y tus pacientes.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Calendario sincronizado
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Confirmaciones automáticas
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Gestión de cancelaciones
                </li>
              </ul>
            </div>
          </div>

          <div className="group hover:scale-105 transition-all">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-3 w-14 h-14 flex items-center justify-center mb-6">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Asistente IA Nutricional</h3>
              <p className="text-gray-600 mb-4">
                Tu copiloto inteligente que te ayuda a tomar decisiones basadas en evidencia científica actualizada.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Sugerencias personalizadas
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Base de datos científica
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Alertas de interacciones
                </li>
              </ul>
            </div>
          </div>

          <div className="group hover:scale-105 transition-all">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-3 w-14 h-14 flex items-center justify-center mb-6">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Seguridad y Privacidad</h3>
              <p className="text-gray-600 mb-4">
                Cumplimiento total con RGPD y encriptación de grado médico para proteger la información sensible.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Encriptación AES-256
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Backups automáticos diarios
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Certificación ISO 27001
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}