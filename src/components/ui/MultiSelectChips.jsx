import { useState, useRef, useEffect } from 'react'
import { X, Plus } from 'lucide-react'

export default function MultiSelectChips({
  value = [],
  onChange,
  suggestions = [],
  placeholder = 'Agregar elemento...',
  maxSuggestions = 5,
  allowCustom = true,
  className = ''
}) {
  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : []
  
  const [inputValue, setInputValue] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [forceRender, setForceRender] = useState(0)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  // Get filtered suggestions based on input
  const getFilteredSuggestions = () => {
    if (!inputValue.trim()) return []
    
    return suggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
        !safeValue.includes(suggestion)
      )
      .slice(0, maxSuggestions)
  }

  const filteredSuggestions = getFilteredSuggestions()

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const addItem = (item) => {
    if (item.trim() && !safeValue.includes(item.trim())) {
      onChange([...safeValue, item.trim()])
      setInputValue('')
      setIsDropdownOpen(false)
    }
  }

  const removeItem = (indexToRemove) => {
    onChange(safeValue.filter((_, index) => index !== indexToRemove))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) {
        addItem(inputValue)
      }
    } else if (e.key === 'Backspace' && !inputValue && safeValue.length > 0) {
      removeItem(safeValue.length - 1)
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false)
    }
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    // Force a re-render to ensure dropdown appears
    setForceRender(prev => prev + 1)
    
    // Open dropdown if there's input and there are suggestions or custom is allowed
    if (newValue.trim()) {
      const filtered = suggestions
        .filter(s => 
          s.toLowerCase().includes(newValue.toLowerCase()) &&
          !safeValue.includes(s)
        )
        .slice(0, maxSuggestions)
      
      if (filtered.length > 0 || allowCustom) {
        setIsDropdownOpen(true)
      } else {
        setIsDropdownOpen(false)
      }
    } else {
      setIsDropdownOpen(false)
    }
  }

  const handleInputFocus = () => {
    // Force a re-render and then check if dropdown should open
    setForceRender(prev => prev + 1)
    
    setTimeout(() => {
      if (inputValue.trim() && (filteredSuggestions.length > 0 || allowCustom)) {
        setIsDropdownOpen(true)
      }
    }, 0)
  }

  const shouldShowDropdown = isDropdownOpen && inputValue.trim() && (filteredSuggestions.length > 0 || allowCustom)

  return (
    <div className={`relative ${className}`}>
      {/* Input Container */}
      <div className="min-h-[2.5rem] border border-gray-300 rounded-lg p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        <div className="flex flex-wrap gap-2">
          {/* Chips */}
          {safeValue.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          
          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            placeholder={safeValue.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Dropdown */}
      {shouldShowDropdown && (
        <div 
          key={`dropdown-${forceRender}`}
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {/* Filtered Suggestions */}
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => addItem(suggestion)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              {suggestion}
            </button>
          ))}
          
          {/* Add Custom Option */}
          {allowCustom && inputValue.trim() && !filteredSuggestions.includes(inputValue.trim()) && (
            <button
              type="button"
              onClick={() => addItem(inputValue)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-t border-gray-100 text-blue-600 last:rounded-b-lg"
            >
              <Plus className="inline h-4 w-4 mr-2" />
              Agregar "{inputValue.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  )
}