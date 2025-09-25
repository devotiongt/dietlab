import { Save, ChevronRight } from 'lucide-react'

export default function SectionHeader({
  icon: Icon,
  title,
  activeSection,
  sections,
  loading,
  onSaveCurrentSection,
  onGoToNextSection
}) {
  const getNextSection = (currentSectionId) => {
    const currentIndex = sections.findIndex(section => section.id === currentSectionId)
    return currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null
  }

  const nextSection = getNextSection(activeSection)

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm pt-4 pb-2 mb-4">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between">
        {/* Título de la sección */}
        <div className="flex items-center">
          <Icon className="h-6 w-6 text-blue-600 mr-3" />
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSaveCurrentSection}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Guardando...' : 'Guardar'}
          </button>

          {nextSection && (
            <button
              type="button"
              onClick={onGoToNextSection}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}