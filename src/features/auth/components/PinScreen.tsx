import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../app/providers/AuthProvider'
import { Fingerprint } from 'lucide-react'
import { Button } from '../../../shared/components'

export const PinScreen: React.FC = () => {
  const { hasPin, isBiometryEnabled, login, loginWithBiometry, setupPin, attempts } = useAuth()
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)

  useEffect(() => {
    if (hasPin && isBiometryEnabled) {
      loginWithBiometry()
    }
  }, [hasPin, isBiometryEnabled, loginWithBiometry])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError('')

    if (pin.length !== 6) {
      setError('O PIN deve ter 6 dígitos.')
      return
    }

    if (!hasPin) {
      if (!isConfirming) {
        setIsConfirming(true)
        setConfirmPin(pin)
        setPin('')
      } else {
        if (pin === confirmPin) {
          await setupPin(pin)
        } else {
          setError('Os PINs não conferem. Tente novamente.')
          setIsConfirming(false)
          setPin('')
          setConfirmPin('')
        }
      }
    } else {
      const success = await login(pin)
      if (!success) {
        if (attempts + 1 >= 5) {
          setError('App bloqueado após 5 tentativas. Use o backup para recuperar.')
        } else {
          setError(`PIN incorreto. Tentativa ${attempts + 1} de 5.`)
        }
        setPin('')
      }
    }
  }

  const handleNumberClick = (num: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num)
    }
  }

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1))
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 space-y-8 animate-in fade-in zoom-in duration-300">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {!hasPin ? (isConfirming ? 'Confirme seu PIN' : 'Crie seu PIN') : 'Digite seu PIN'}
          </h1>
          <p className="text-gray-500 mt-2">
            {!hasPin
              ? 'Defina um PIN de 6 dígitos para proteger seus dados.'
              : 'Acesso restrito aos seus documentos fiscais.'}
          </p>
        </div>

        <div className="flex justify-center space-x-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                pin.length > i ? 'bg-indigo-600 border-indigo-600 scale-110' : 'border-gray-300'
              }`}
            />
          ))}
        </div>

        {error && <p className="text-red-500 text-center text-sm font-medium">{error}</p>}

        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              className="h-16 text-2xl font-semibold bg-gray-50 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-800"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleDelete}
            className="h-16 text-lg font-semibold text-gray-600 bg-white rounded-xl hover:bg-gray-50 border border-gray-100"
          >
            Del
          </button>
          <button
            onClick={() => handleNumberClick('0')}
            className="h-16 text-2xl font-semibold bg-gray-50 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-800"
          >
            0
          </button>
          <button
            onClick={() => handleSubmit()}
            className="h-16 text-lg font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:bg-indigo-800 shadow-md transition-all"
          >
            OK
          </button>
        </div>

        {hasPin && isBiometryEnabled && (
          <div className="flex justify-center pt-2">
            <Button
              variant="ghost"
              className="flex items-center space-x-2 text-indigo-600"
              onClick={loginWithBiometry}
            >
              <Fingerprint size={24} />
              <span>Usar Biometria</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
