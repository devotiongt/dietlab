import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock } from 'lucide-react'
import AuthLayout from './auth/AuthLayout'
import AuthHeader from './auth/AuthHeader'
import FormInput from './auth/FormInput'
import Alert from './auth/Alert'
import AuthFooter from './auth/AuthFooter'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await signIn({ email, password })

      if (error) throw error

      navigate('/dashboard')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <AuthHeader
        title="Bienvenido de vuelta"
        subtitle="Inicia sesión para continuar"
      />

      <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
        {error && (
          <Alert type="error" message={error} className="mb-4" />
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <FormInput
            id="email"
            name="email"
            type="email"
            label="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            Icon={Lock}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Recordarme
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-green-600 hover:text-green-500">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <AuthFooter
          text="¿No tienes cuenta?"
          linkText="Regístrate aquí"
          linkTo="/register"
        />
      </div>
    </AuthLayout>
  )
}