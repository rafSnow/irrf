import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, cn } from '../../../shared/components'
import type { MonthSummary } from '../hooks/useDashboard'

interface AnnualTimelineProps {
  months: MonthSummary[]
}

export const AnnualTimeline: React.FC<AnnualTimelineProps> = ({ months }) => {
  const navigate = useNavigate()

  const handleMonthClick = (monthIndex: number) => {
    // We navigate to /documentos and pass the month as state or search param
    navigate(`/documentos?month=${monthIndex + 1}&year=2026`)
  }

  return (
    <Card className="p-0 overflow-hidden border-none shadow-none bg-transparent">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {months.map((m, i) => (
          <button
            key={i}
            onClick={() => handleMonthClick(i)}
            className={cn(
              'flex flex-col items-center justify-center p-3 rounded-2xl border transition-all hover:scale-105',
              m.isCurrent
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                : m.isFuture
                  ? 'bg-gray-50 border-gray-100 text-gray-400 opacity-60'
                  : m.documentCount === 0
                    ? 'bg-white border-gray-100 text-gray-400 border-dashed'
                    : 'bg-white border-gray-100 text-gray-900 shadow-sm',
            )}
          >
            <span
              className={cn(
                'text-[10px] font-black uppercase tracking-widest mb-1',
                m.isCurrent ? 'text-indigo-100' : 'text-gray-400',
              )}
            >
              {m.monthName}
            </span>
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold">
                {m.isFuture && m.documentCount === 0
                  ? '-'
                  : (m.totalAmount / 100).toLocaleString('pt-BR', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
              </span>
              <span
                className={cn(
                  'text-[9px] font-medium',
                  m.isCurrent ? 'text-indigo-200' : 'text-gray-400',
                )}
              >
                {m.documentCount} {m.documentCount === 1 ? 'doc' : 'docs'}
              </span>
            </div>
            {m.isCurrent && <div className="mt-1 w-1 h-1 bg-white rounded-full" />}
          </button>
        ))}
      </div>
    </Card>
  )
}
