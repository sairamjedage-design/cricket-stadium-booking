import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const Register: React.FC = () => {
  const navigate = useNavigate()
  const { register, isLoading } = useAuthStore()

  const [formData, setFormData] = useState({
    name: '',
    email: 'sairam107@gmail.com',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>()
  const photoInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Choose an image file for your profile photo.')
      event.target.value = ''
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Profile photos must be 2 MB or smaller.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoDataUrl(reader.result)
      } else {
        setError('We couldn’t read that image. Please choose another file.')
      }
    }
    reader.onerror = () => setError('We couldn’t read that image. Please choose another file.')
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      await register(formData.name, formData.email, formData.password, photoDataUrl, formData.phone)
      setSuccess(true)
      // Auto-login after registration
      navigate('/matches')
    } catch (registrationError) {
      setError(registrationError instanceof Error ? registrationError.message : 'Registration failed. Please try again.')
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6">
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Created Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Welcome to Cricket Stadium Ticket Booking. Your account has been created successfully.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            Continue to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-xs space-y-8">
        <div>
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="text-center text-sm text-gray-600">
            Join thousands of cricket fans booking their tickets online
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone number <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <input
              type="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="profile-photo" className="block text-sm font-medium text-gray-700 mb-2">
              Profile photo <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <div className="flex items-center gap-4">
              {photoDataUrl ? (
                <img
                  src={photoDataUrl}
                  alt="Profile photo preview"
                  className="h-14 w-14 rounded-full border border-gray-200 object-cover"
                />
              ) : (
                <div aria-hidden="true" className="grid h-14 w-14 place-items-center rounded-full bg-gray-100 text-xl text-gray-400">
                  +
                </div>
              )}
              <div className="min-w-0 flex-1">
                <input
                  ref={photoInputRef}
                  id="profile-photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:font-semibold file:text-emerald-800 hover:file:bg-emerald-100"
                />
                <p className="mt-1 text-xs text-gray-500">Image only, up to 2 MB. You can skip this.</p>
              </div>
              {photoDataUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setPhotoDataUrl(undefined)
                    if (photoInputRef.current) photoInputRef.current.value = ''
                  }}
                  className="text-xs font-medium text-gray-500 hover:text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <p className="mt-1 text-xs text-gray-500">Any non-empty password is accepted. A longer, unique password is safer.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            Already have an account?
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register