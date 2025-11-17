'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'

type Step = 'request' | 'confirm'

export default function ResetPasswordPage() {
  const [step, setStep] = useState<Step>('request')
  const [requestEmail, setRequestEmail] = useState('')
  const [requestMessage, setRequestMessage] = useState<string | null>(null)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [requestLoading, setRequestLoading] = useState(false)

  const [tokenInput, setTokenInput] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const handleRequestReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setRequestLoading(true)
    setRequestMessage(null)
    setRequestError(null)

    try {
      const response = await fetch('/api/auth/reset-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: requestEmail })
      })

      const data = await response.json()

      if (!response.ok) {
        setRequestError(data.error || 'Failed to generate reset instructions.')
        return
      }

      setRequestMessage(
        data.message ||
          'If an account exists with that email, reset instructions have been generated.'
      )

      if (data.resetToken) {
        setTokenInput(data.resetToken)
      }

      setStep('confirm')
    } catch (error) {
      console.error('Password reset request failed:', error)
      setRequestError('Unable to process your request. Please try again.')
    } finally {
      setRequestLoading(false)
    }
  }

  const handleConfirmReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setConfirmLoading(true)
    setConfirmError(null)
    setConfirmMessage(null)

    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match.')
      setConfirmLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setConfirmError(data.error || 'Failed to reset password.')
        return
      }

      setConfirmMessage(
        data.message || 'Password updated. You can now sign in with the new password.'
      )
      setPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Password reset confirmation failed:', error)
      setConfirmError('Unable to reset password. Please try again.')
    } finally {
      setConfirmLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <span className="text-4xl text-white font-bold">dY</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600">
              Enter your email to receive reset instructions, then set a new password.
            </p>
          </div>

          {step === 'request' && (
            <form onSubmit={handleRequestReset} className="space-y-6">
              {requestMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  {requestMessage}
                </div>
              )}
              {requestError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {requestError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={requestEmail}
                  onChange={(event) => setRequestEmail(event.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="admin@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={requestLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {requestLoading ? 'Preparing instructions...' : 'Send Reset Instructions'}
              </button>
            </form>
          )}

          {step === 'confirm' && (
            <form onSubmit={handleConfirmReset} className="space-y-6">
              {confirmMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  {confirmMessage}
                </div>
              )}
              {confirmError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {confirmError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reset Token
                </label>
                <input
                  type="text"
                  required
                  value={tokenInput}
                  onChange={(event) => setTokenInput(event.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="Paste the reset token"
                />
                {!tokenInput && (
                  <p className="mt-2 text-xs text-gray-500">
                    Check your email for the reset token. In development, we display it on this page.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="Enter a strong password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="Re-enter the new password"
                />
              </div>

              <button
                type="submit"
                disabled={confirmLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {confirmLoading ? 'Updating password...' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('request')
                  setConfirmError(null)
                  setConfirmMessage(null)
                }}
                className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                Start Over
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          <Link href="/admin/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Back to login
          </Link>
        </p>

        {process.env.NODE_ENV !== 'production' && step === 'confirm' && tokenInput && (
          <div className="mt-4 text-xs text-gray-500 text-center">
            Keep your reset token private. Anyone with the token can change the password.
          </div>
        )}
      </div>
    </div>
  )
}
