import React from 'react'
import * as Icons from 'lucide-react'
import { Card, cn } from '../../../shared/components'
import type { CategorySummary } from '../hooks/useDashboard'

interface CategoryCardProps {
  category: CategorySummary
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const Icon =
    (Icons as unknown as Record<string, React.ComponentType<{ size?: number }>>)[category.icon] ||
    Icons.HelpCircle

  const formattedTotal = (category.totalAmount / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  const formattedLimit = category.deductionLimit
    ? (category.deductionLimit / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    : 'Ilimitado'

  const isNearLimit = category.progress > 80 && category.deductionLimit
  const isOverLimit = category.progress >= 100 && category.deductionLimit

  return (
    <Card className="flex flex-col space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${category.color}20`, color: category.color }}
          >
            <Icon size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{category.name}</h3>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
              {category.documentCount} {category.documentCount === 1 ? 'documento' : 'documentos'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-gray-900">{formattedTotal}</p>
          <p className="text-[10px] text-gray-400 font-medium">Limite: {formattedLimit}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-500',
              isOverLimit ? 'bg-green-500' : isNearLimit ? 'bg-amber-500' : 'bg-indigo-500',
            )}
            style={{
              width: `${category.progress}%`,
              backgroundColor: !category.deductionLimit ? category.color : undefined,
            }}
          />
        </div>
        {isOverLimit && (
          <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
            <Icons.CheckCircle2 size={10} /> Limite atingido
          </p>
        )}
        {isNearLimit && !isOverLimit && (
          <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
            <Icons.AlertTriangle size={10} /> Próximo ao limite
          </p>
        )}
      </div>
    </Card>
  )
}
