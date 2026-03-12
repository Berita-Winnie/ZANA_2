import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { FormFeedback } from '../components/FormFeedback.jsx'
import { useToast } from '../context/ToastContext.jsx'

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      addToast('Passwords do not match.', 'error')
      return
    }

    setLoading(true)
    try {
      await register(email, password, fullName)
      addToast('Account created successfully.', 'success')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err.message || 'Failed to create account'
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#253290] via-[#a124c2] to-[#f47f8b] px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-gray-900 text-center">
          Create account
        </h1>
        <p className="text-sm text-gray-500 text-center mt-1">
          The first account becomes Super Admin; others are Field Officers by
          default.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FormFeedback error={error} />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#253290]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#253290]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#253290]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#253290]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#253290] text-white text-sm font-medium rounded-lg px-3 py-2 mt-2 hover:bg-[#1b2568] disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Already have an account?{' '}
          <Link to="/" className="text-[#253290] font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
