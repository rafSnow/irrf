import jsPDF from 'jspdf'
import type { CategorySummary } from '../../dashboard/hooks/useDashboard'
import type { Document, Category } from '../../../shared/types'

export const pdfService = {
  async generateFiscalReport(
    summary: {
      totalAccumulated: number
      estimatedRefund: number
      categorySummaries: CategorySummary[]
    },
    documents: Document[],
    categories: Category[],
  ): Promise<void> {
    const doc = new jsPDF()
    const now = new Date().toLocaleDateString('pt-BR')

    // Header
    doc.setFontSize(22)
    doc.text('Relatório Fiscal IRPF 2027', 20, 20)
    doc.setFontSize(10)
    doc.text(`Gerado em: ${now} - Guardião Fiscal`, 20, 28)

    // Summary Section
    doc.setFontSize(16)
    doc.text('Resumo Fiscal (Ano-Base 2026)', 20, 45)

    doc.setFontSize(12)
    doc.text(
      `Total Geral Acumulado: ${(summary.totalAccumulated / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      20,
      55,
    )
    doc.text(
      `Restituição Estimada: ${(summary.estimatedRefund / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      20,
      62,
    )

    // Category Breakdown
    let y = 80
    doc.setFontSize(14)
    doc.text('Totais por Categoria', 20, y)
    y += 10
    doc.setFontSize(10)

    summary.categorySummaries.forEach((cat) => {
      if (cat.totalAmount > 0) {
        doc.text(
          `${cat.name}: ${(cat.totalAmount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (${cat.documentCount} docs)`,
          25,
          y,
        )
        y += 7
        if (y > 270) {
          doc.addPage()
          y = 20
        }
      }
    })

    // Detailed List
    doc.addPage()
    y = 20
    doc.setFontSize(16)
    doc.text('Listagem Detalhada de Documentos', 20, y)
    y += 15
    doc.setFontSize(9)

    // Table Header
    doc.setFont('helvetica', 'bold')
    doc.text('Data', 20, y)
    doc.text('Emitente', 40, y)
    doc.text('Valor', 130, y)
    doc.text('Categoria', 160, y)
    doc.line(20, y + 2, 190, y + 2)
    doc.setFont('helvetica', 'normal')
    y += 10

    documents
      .sort((a, b) => new Date(a.documentDate).getTime() - new Date(b.documentDate).getTime())
      .forEach((d) => {
        const cat = categories.find((c) => c.id === d.categoryId)?.name || 'Outros'
        const date = new Date(d.documentDate + 'T12:00:00').toLocaleDateString('pt-BR')
        const amount = (d.amount / 100).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })

        doc.text(date, 20, y)
        doc.text(d.issuer.substring(0, 40), 40, y)
        doc.text(amount, 130, y)
        doc.text(cat, 160, y)

        y += 8
        if (y > 280) {
          doc.addPage()
          y = 20
        }
      })

    doc.save(`relatorio-fiscal-${new Date().toISOString().split('T')[0]}.pdf`)
  },
}
