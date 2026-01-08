import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { setCredentials } from '@/features/auth/authSlice'
import { useLoginMutation } from '@/services/api/authApi'
import Button from '@/components/common/Button'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [login, { isLoading }] = useLoginMutation()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Call the real login API
      const response = await login({
        username: formData.username,
        password: formData.password,
      }).unwrap()
      
      // Store credentials in Redux (tokens are already stored in localStorage by authApi transformResponse)
      dispatch(setCredentials({
        user: response.user,
        token: response.access || response.token || response.key,
        refreshToken: response.refresh,
      }))
      
      toast.success('Login successful!')
      navigate('/')
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error?.data?.detail 
        || error?.data?.message 
        || error?.data?.non_field_errors?.[0]
        || 'Invalid username or password'
      toast.error(errorMessage)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 px-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/logo-512_512 1.png" alt="Villa Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Villa Scheduling
          </h1>
          <p className="text-gray-600">
            Sign in to manage your bookings
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="input"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>


            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>


        </div>
      </div>
    </div>
  )
}
