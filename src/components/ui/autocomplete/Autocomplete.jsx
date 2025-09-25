import { useState, useEffect, useRef } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

export default function Autocomplete({
  value,
  onChange,
  suggestions,
  placeholder,
  focusColor = 'red'
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState([])
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  const focusClasses = {
    red: 'focus:ring-red-500 focus:border-red-500',
    green: 'focus:ring-green-500 focus:border-green-500',
    blue: 'focus:ring-blue-500 focus:border-blue-500'
  }

  useEffect(() => {
    if (value) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredSuggestions(filtered)
    } else {
      setFilteredSuggestions(suggestions)
    }
  }, [value, suggestions])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e) => {
    const newValue = e.target.value
    onChange(newValue)
    setIsOpen(true)
  }

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion)
    setIsOpen(false)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className={`w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 ${focusClasses[focusColor]}`}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <span className="block text-sm text-gray-900">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}