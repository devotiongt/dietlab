export default function FormInput({
  id,
  name,
  type,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  required = false,
  Icon,
  helperText
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={onChange}
          className={`appearance-none block w-full ${
            Icon ? 'pl-10' : 'pl-3'
          } pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500`}
          placeholder={placeholder}
        />
      </div>
      {helperText && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  )
}