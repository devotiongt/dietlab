import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const countries = [
  { code: '+502', name: 'Guatemala', flag: '🇬🇹', format: '(###) ####-####' },
  { code: '+1', name: 'Estados Unidos', flag: '🇺🇸', format: '(###) ###-####' },
  { code: '+52', name: 'México', flag: '🇲🇽', format: '## #### ####' },
  { code: '+503', name: 'El Salvador', flag: '🇸🇻', format: '####-####' },
  { code: '+504', name: 'Honduras', flag: '🇭🇳', format: '####-####' },
  { code: '+505', name: 'Nicaragua', flag: '🇳🇮', format: '####-####' },
  { code: '+506', name: 'Costa Rica', flag: '🇨🇷', format: '####-####' },
  { code: '+507', name: 'Panamá', flag: '🇵🇦', format: '####-####' },
  { code: '+34', name: 'España', flag: '🇪🇸', format: '### ## ## ##' },
]

export default function PhoneInput({ 
  value = '', 
  countryCode = '+502', 
  onChange, 
  onCountryChange,
  placeholder = 'Número de teléfono',
  className = '',
  error = false 
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  const selectedCountry = countries.find(country => country.code === countryCode) || countries[0]

  const formatPhoneNumber = (phoneNumber, format) => {
    // Remove all non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '')
    
    // Apply format
    let formatted = ''
    let cleanedIndex = 0
    
    for (let i = 0; i < format.length && cleanedIndex < cleaned.length; i++) {
      if (format[i] === '#') {
        formatted += cleaned[cleanedIndex]
        cleanedIndex++
      } else {
        formatted += format[i]
      }
    }
    
    return formatted
  }

  const handlePhoneChange = (e) => {
    const rawValue = e.target.value
    const formatted = formatPhoneNumber(rawValue, selectedCountry.format)
    onChange(formatted)
  }

  const handleCountrySelect = (country) => {
    onCountryChange(country.code)
    setIsDropdownOpen(false)
    // Reformat current number with new country format
    if (value) {
      const formatted = formatPhoneNumber(value, country.format)
      onChange(formatted)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className={`flex border rounded-lg overflow-hidden ${error ? 'border-red-300' : 'border-gray-300'} focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent`}>
        {/* Country Selector */}
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center px-3 py-2 bg-gray-50 border-r border-gray-300 hover:bg-gray-100 transition-colors"
        >
          <span className="mr-2">{selectedCountry.flag}</span>
          <span className="text-sm font-medium text-gray-700">{selectedCountry.code}</span>
          <ChevronDown className="h-4 w-4 ml-1 text-gray-500" />
        </button>

        {/* Phone Input */}
        <input
          type="tel"
          value={value}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 focus:outline-none"
        />
      </div>

      {/* Country Dropdown */}
      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
            {countries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleCountrySelect(country)}
                className={`w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                  country.code === selectedCountry.code ? 'bg-blue-50 text-blue-700' : ''
                }`}
              >
                <span className="mr-3">{country.flag}</span>
                <span className="font-medium text-sm mr-2">{country.code}</span>
                <span className="text-sm text-gray-600">{country.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}