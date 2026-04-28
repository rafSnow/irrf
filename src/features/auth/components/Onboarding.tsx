import React, { useState } from 'react'
import { Button, Card } from '../../../shared/components'
import { ShieldCheck, Lock, Upload, ChevronRight } from 'lucide-react'
import { PinScreen } from './PinScreen'

interface OnboardingProps {
  onComplete: () => void
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1)

  const steps = [
    {
      title: 'Bem-vindo ao Guardião Fiscal',
      description:
        'Sua privacidade é nossa prioridade. Todos os seus dados são armazenados localmente e criptografados no seu dispositivo.',
      icon: <ShieldCheck size={48} className="text-indigo-600" />,
    },
    {
      title: 'Segurança Total',
      description:
        'Crie um PIN de 6 dígitos para proteger seus documentos fiscais. Ninguém mais terá acesso a eles.',
      icon: <Lock size={48} className="text-indigo-600" />,
    },
    {
      title: 'Pronto para começar!',
      description:
        'Agora você pode começar a organizar seus recibos e notas fiscais para a declaração de 2027.',
      icon: <Upload size={48} className="text-indigo-600" />,
    },
  ]

  const currentStep = steps[step - 1]

  if (step === 2) {
    return <PinScreen /> // PinScreen already handles pin creation
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-8 space-y-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <div className="p-6 bg-indigo-50 rounded-3xl">{currentStep.icon}</div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">{currentStep.title}</h1>
          <p className="text-gray-500 font-medium leading-relaxed">{currentStep.description}</p>
        </div>

        <div className="flex justify-center space-x-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === i + 1 ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>

        <Button
          className="w-full h-14 text-lg"
          onClick={() => (step === 3 ? onComplete() : setStep((prev) => prev + 1))}
        >
          {step === 3 ? 'Começar Agora' : 'Continuar'}
          <ChevronRight size={20} className="ml-2" />
        </Button>
      </Card>
    </div>
  )
}
