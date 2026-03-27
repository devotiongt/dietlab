import Select from 'react-select'

export default function MultiSelectChips({
  value = [],
  onChange,
  suggestions = [],
  placeholder = 'Agregar elemento...',
  allowCustom = true,
  className = ''
}) {
  // Convert suggestions array to react-select format
  const options = suggestions.map(item => ({
    value: item,
    label: item
  }))

  // Convert value array to react-select format
  const selectedValues = Array.isArray(value)
    ? value.map(item => ({ value: item, label: item }))
    : []

  // Handle selection change
  const handleChange = (selected) => {
    const newValues = selected ? selected.map(option => option.value) : []
    onChange(newValues)
  }

  // Custom styles to match Tailwind theme
  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '40px',
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#3b82f6' : '#9ca3af'
      }
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#dbeafe',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#1e40af',
      fontWeight: '500'
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#1e40af',
      ':hover': {
        backgroundColor: '#bfdbfe',
        color: '#1e3a8a',
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: '#9ca3af'
    }),
    menu: (base) => ({
      ...base,
      zIndex: 50
    })
  }

  return (
    <div className={className}>
      <Select
        isMulti
        value={selectedValues}
        onChange={handleChange}
        options={options}
        placeholder={placeholder}
        styles={customStyles}
        isSearchable={true}
        isClearable={false}
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        noOptionsMessage={() => allowCustom ? 'Escribe para agregar...' : 'No hay opciones'}
        classNamePrefix="react-select"
      />
    </div>
  )
}
