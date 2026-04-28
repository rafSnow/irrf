import React, { useState } from 'react'
import { useDashboard } from '../hooks/useDashboard'
import { useNotifications } from '../../../shared/hooks/useNotifications'
import { CategoryCard } from './CategoryCard'
import { AnnualTimeline } from './AnnualTimeline'
import { Card, Spinner, NotificationBanner, Button } from '../../../shared/components'
import { TrendingUp, FileText, CheckCircle2, Banknote, Sparkles, Download } from 'lucide-react'
import { pdfService } from '../../reports/services/pdfService'
import { useAuth } from '../../../app/providers/AuthProvider'
import { documentService } from '../../documents/services/documentService'
import { categoryRepository } from '../../../db/repositories/categoryRepository'

export const Dashboard: React.FC = () => {
  const { summary, isLoading } = useDashboard()
  const { notifications } = useNotifications()
  const { encryptionKey } = useAuth()
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  if (isLoading || !summary) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spinner className="w-12 h-12" />
        <p className="text-gray-500 mt-4 animate-pulse font-medium">Carregando painel fiscal...</p>
      </div>
    )
  }

  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true)
    try {
      const docs = await documentService.getDocuments(encryptionKey)
      const categories = await categoryRepository.getAll()
      await pdfService.generateFiscalReport(
        {
          totalAccumulated: summary.totalAccumulated,
          estimatedRefund: summary.estimatedRefund,
          categorySummaries: summary.categorySummaries,
        },
        docs,
        categories,
      )
    } catch (err) {
      console.error(err)
      alert('Erro ao gerar PDF.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const formatCurrency = (val: number) => {
    return (val / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Painel Fiscal</h1>
          <p className="text-gray-500 font-medium">Resumo do seu ano-base 2026.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGeneratePdf}
            isLoading={isGeneratingPdf}
            className="bg-white"
          >
            <Download size={18} className="mr-2" /> Relatório Contador
          </Button>
          <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl shadow-lg shadow-indigo-100 flex items-center space-x-2">
            <Sparkles size={18} className="text-indigo-200" />
            <span className="text-sm font-bold uppercase tracking-wider">
              Restituição: {formatCurrency(summary.estimatedRefund)}
            </span>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((n) => (
            <NotificationBanner key={n.id} notification={n} />
          ))}
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center space-x-4 border-l-4 border-l-indigo-600">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Geral</p>
            <p className="text-xl font-black text-gray-900">
              {formatCurrency(summary.totalAccumulated)}
            </p>
          </div>
        </Card>
        <Card className="flex items-center space-x-4 border-l-4 border-l-blue-600">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Documentos</p>
            <p className="text-xl font-black text-gray-900">{summary.totalDocuments}</p>
          </div>
        </Card>
        <Card className="flex items-center space-x-4 border-l-4 border-l-green-600">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Checklist</p>
            <p className="text-xl font-black text-gray-900">
              {Math.round(summary.checklistCompletion)}%
            </p>
          </div>
        </Card>
        <Card className="flex items-center space-x-4 border-l-4 border-l-amber-600">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Banknote size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Deduções</p>
            <p className="text-xl font-black text-gray-900">
              {summary.categorySummaries.filter((c) => c.totalAmount > 0).length} categorias
            </p>
          </div>
        </Card>
      </div>

      {/* Annual Timeline */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">
            Linha do Tempo 2026
          </h2>
          <Badge variant="info">Ano-base atual</Badge>
        </div>
        <AnnualTimeline months={summary.months} />
      </section>

      {/* Category Summaries */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight px-1">
          Totais por Categoria
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summary.categorySummaries.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>
    </div>
  )
}

const Badge: React.FC<{ children: React.ReactNode; variant: string }> = ({ children }) => (
  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500">
    {children}
  </span>
)
