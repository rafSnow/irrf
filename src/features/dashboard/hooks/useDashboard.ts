import { useLiveQuery } from 'dexie-react-hooks'
import { documentRepository } from '../../../db/repositories/documentRepository'
import { categoryRepository } from '../../../db/repositories/categoryRepository'
import { db } from '../../../db/database'
import type { Category } from '../../../shared/types'

export interface CategorySummary extends Category {
  totalAmount: number
  documentCount: number
  progress: number
}

export interface MonthSummary {
  month: number
  monthName: string
  totalAmount: number
  documentCount: number
  isFuture: boolean
  isCurrent: boolean
}

export function useDashboard() {
  const categories = useLiveQuery(() => categoryRepository.getAll())
  const documents = useLiveQuery(() => documentRepository.getAll())
  const checklistItems = useLiveQuery(() => db.checklist.toArray())

  const summary = useLiveQuery(async () => {
    const allDocs = await documentRepository.getAll()
    const allCats = await categoryRepository.getAll()
    const allChecklist = await db.checklist.toArray()

    const totalAccumulated = allDocs.reduce((sum, doc) => sum + doc.amount, 0)

    // Simplified refund projection: 15% of deductible amount (just a placeholder logic)
    // In a real app, this would follow the IRPF table rules.
    const estimatedRefund = totalAccumulated * 0.15

    const checklistCompletion =
      allChecklist.length > 0
        ? (allChecklist.filter((i) => i.status === 'done').length / allChecklist.length) * 100
        : 0

    const categorySummaries: CategorySummary[] = allCats.map((cat) => {
      const catDocs = allDocs.filter((d) => d.categoryId === cat.id)
      const total = catDocs.reduce((sum, d) => sum + d.amount, 0)
      const progress = cat.deductionLimit ? Math.min((total / cat.deductionLimit) * 100, 100) : 100

      return {
        ...cat,
        totalAmount: total,
        documentCount: catDocs.length,
        progress,
      }
    })

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const fiscalYear = 2026 // As per requirements

    const months: MonthSummary[] = Array.from({ length: 12 }, (_, i) => {
      const monthDocs = allDocs.filter((d) => {
        const date = new Date(d.documentDate + 'T12:00:00')
        return date.getMonth() === i && date.getFullYear() === fiscalYear
      })

      const isFuture = fiscalYear > currentYear || (fiscalYear === currentYear && i > currentMonth)
      const isCurrent = fiscalYear === currentYear && i === currentMonth

      return {
        month: i,
        monthName: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(
          new Date(2026, i, 1),
        ),
        totalAmount: monthDocs.reduce((sum, d) => sum + d.amount, 0),
        documentCount: monthDocs.length,
        isFuture,
        isCurrent,
      }
    })

    return {
      totalAccumulated,
      estimatedRefund,
      totalDocuments: allDocs.length,
      checklistCompletion,
      categorySummaries,
      months,
    }
  }, [documents, categories, checklistItems])

  return {
    summary,
    isLoading: summary === undefined,
  }
}
