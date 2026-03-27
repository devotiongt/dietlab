# Componentes UI Estándar del Proyecto

## MultiSelectChips

**Ubicación:** `src/components/ui/MultiSelectChips.jsx`

**Librería base:** React Select (`react-select`)

**Uso:** Este es el componente estándar para selección múltiple en todo el proyecto. Siempre usar este componente cuando se necesite selección múltiple con chips.

Construido sobre React Select, la librería más popular y madura para selects en React, con soporte completo de accesibilidad y UX profesional.

### Características:
- **Construido con React Select** - La librería más popular y confiable
- **Checkboxes en dropdown** - Visualización clara de opciones seleccionadas/no seleccionadas
- **Chips visuales** - Elementos seleccionados aparecen como chips azules con X para remover
- **Dropdown siempre visible** - Muestra todas las opciones con checkmarks en las seleccionadas
- Input con búsqueda/filtrado en tiempo real
- **No cierra al seleccionar** - Puedes seleccionar múltiples opciones sin cerrar el menú
- **Manejo de teclado completo:**
  - Flechas arriba/abajo para navegar opciones
  - Enter/Space para seleccionar
  - Escape para cerrar dropdown
  - Backspace para eliminar chips
- Click fuera para cerrar dropdown automáticamente
- Estilos personalizados que coinciden con Tailwind CSS
- Accesibilidad WAI-ARIA completa

### Props:
```javascript
{
  value: [],              // Array de valores seleccionados (requerido)
  onChange: (array) => {}, // Callback cuando cambian las selecciones (requerido)
  suggestions: [],        // Array de sugerencias disponibles (requerido)
  placeholder: '',        // Placeholder del input (default: 'Agregar elemento...')
  allowCustom: true,      // Permitir agregar valores personalizados (default: true)
  className: ''           // Clases CSS adicionales (opcional)
}
```

### Ejemplo de uso:

```javascript
import MultiSelectChips from '../ui/MultiSelectChips';

// En el componente:
<MultiSelectChips
  value={recipeData.category}
  onChange={(categories) => updateField('category', categories)}
  suggestions={['Desayuno', 'Almuerzo', 'Cena', 'Colación', 'Bebida']}
  placeholder="Seleccionar categorías..."
  allowCustom={false}
/>
```

### Lugares donde se usa actualmente:
- ✅ Antecedentes Heredofamiliares (familiares afectados)
- ✅ Formulario de Recetas (categorías)
- TODO: Agregar en otros lugares que necesiten multiselect

## Guía de Uso

**IMPORTANTE:** Siempre que necesites un campo de selección múltiple en cualquier parte del proyecto:

1. Importar el componente: `import MultiSelectChips from '../ui/MultiSelectChips'`
2. Usar el componente en lugar de crear selectores personalizados
3. Mantener consistencia visual en toda la aplicación
4. NO crear dropdowns o multiselects custom - siempre usar este componente

### Ventajas:
- Consistencia visual en toda la app
- UX probada y refinada
- Código reutilizable
- Fácil mantenimiento
- Accesibilidad incorporada
