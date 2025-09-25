import Autocomplete from './Autocomplete'

export default function SupplementAutocomplete({ value, onChange, suggestions, placeholder }) {
  return (
    <Autocomplete
      value={value}
      onChange={onChange}
      suggestions={suggestions}
      placeholder={placeholder}
      focusColor="green"
    />
  )
}