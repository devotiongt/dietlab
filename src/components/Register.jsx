import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, User } from 'lucide-react'
import {
  AuthLayout,
  AuthHeader,
  FormInput,
  Alert,
  AuthFooter
} from './auth'

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      const { error } = await signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName
          }
        }
      })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <AuthHeader
        title="Crea tu cuenta"
        subtitle="Comienza a gestionar tus pacientes de manera profesional"
      />

      <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
        {error && (
          <Alert type="error" message={error} className="mb-4" />
        )}

        {success && (
          <Alert
            type="success"
            message="¡Registro exitoso! Revisa tu correo para confirmar tu cuenta. Redirigiendo..."
            className="mb-4"
          />
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <FormInput
            id="fullName"
            name="fullName"
            type="text"
            label="Nombre completo"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Dr. Juan Pérez"
            autoComplete="name"
            required
            Icon={User}
          />

          <FormInput
            id="email"
            name="email"
            type="email"
            label="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@ejemplo.com"
            autoComplete="email"
            required
            Icon={Mail}
          />

          <FormInput
            id="password"
            name="password"
            type="password"
            label="Contraseña"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            Icon={Lock}
            helperText="Mínimo 6 caracteres"
          />

          <FormInput
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirmar contraseña"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            Icon={Lock}
          />

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              Acepto los{' '}
              <a href="#" className="text-green-600 hover:text-green-500">
                términos y condiciones
              </a>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <AuthFooter
          text="¿Ya tienes cuenta?"
          linkText="Inicia sesión aquí"
          linkTo="/login"
        />
      </div>
    </AuthLayout>
  )
}