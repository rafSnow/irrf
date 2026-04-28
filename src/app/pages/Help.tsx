import React from 'react'
import { Card, Button } from '../../shared/components'
import { HelpCircle, Shield, Database, Smartphone, CheckSquare } from 'lucide-react'

export const Help: React.FC = () => {
  const faqs = [
    {
      question: 'Meus dados são enviados para algum servidor?',
      answer: 'Não. O Guardião Fiscal opera sob o paradigma "Zero-Backend". Todos os seus documentos e dados fiscais são armazenados e processados exclusivamente no seu dispositivo.',
      icon: <Shield className="text-green-500" />,
    },
    {
      question: 'Como faço para garantir que não vou perder meus dados?',
      answer: 'Como não temos servidor, você é o responsável pelos seus dados. Recomendamos fazer um backup mensal (em Ajustes > Backup) e salvar o arquivo ZIP em um local seguro como Google Drive ou iCloud.',
      icon: <Database className="text-blue-500" />,
    },
    {
      question: 'O app funciona sem internet?',
      answer: 'Sim! Após o primeiro acesso, o app funciona 100% offline. Você pode fotografar e organizar seus recibos mesmo sem conexão.',
      icon: <Smartphone className="text-indigo-500" />,
    },
    {
      question: 'O que é o Checklist?',
      answer: 'É uma lista de conferência baseada nas exigências da Receita Federal. Use-a para garantir que você não esqueceu de nenhum documento importante para a declaração de 2027.',
      icon: <CheckSquare className="text-amber-500" />,
    },
  ]

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Ajuda & FAQ</h1>
        <p className="text-gray-500 font-medium">Tudo o que você precisa saber sobre o app.</p>
      </header>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <Card key={i} className="p-6 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-lg">{faq.icon}</div>
              <h3 className="font-bold text-gray-900 leading-tight">{faq.question}</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed pl-12">{faq.answer}</p>
          </Card>
        ))}
      </div>

      <Card className="bg-indigo-600 text-white p-8 text-center space-y-4">
        <div className="flex justify-center">
          <HelpCircle size={48} className="text-indigo-200" />
        </div>
        <h2 className="text-xl font-bold">Ainda tem dúvidas?</h2>
        <p className="text-indigo-100 text-sm">
          Consulte a documentação completa no nosso repositório ou entre em contato.
        </p>
        <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-indigo-50 border-none">
          Ver GitHub
        </Button>
      </Card>
    </div>
  )
}
