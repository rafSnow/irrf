import React, { useMemo } from 'react'
import type { Document, Category } from '../../../shared/types'
import { Card } from '../../../shared/components'
import { FileText, MoreVertical, Calendar, Building2, Trash2 } from 'lucide-react'
import { motion, useMotionValue, useTransform } from 'framer-motion'

interface DocumentCardProps {
  document: Document
  category?: Category
  onClick?: () => void
  onDelete?: () => void
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  category,
  onClick,
  onDelete,
}) => {
  const x = useMotionValue(0)
  const opacity = useTransform(x, [-100, -50, 0], [1, 1, 1])

  const formattedAmount = useMemo(() => {
    return (document.amount / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }, [document.amount])

  const formattedDate = useMemo(() => {
    return new Date(document.documentDate + 'T12:00:00').toLocaleDateString('pt-BR')
  }, [document.documentDate])

  const thumbnail = useMemo(() => {
    if (document.fileMimeType.startsWith('image/')) {
      const blob = new Blob([document.fileBlob], { type: document.fileMimeType })
      return URL.createObjectURL(blob)
    }
    return null
  }, [document.fileBlob, document.fileMimeType])

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -80) {
      if (onDelete) onDelete()
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Delete Background */}
      <div className="absolute inset-0 bg-red-500 flex items-center justify-end px-6 text-white">
        <div className="flex flex-col items-center">
          <Trash2 size={24} />
          <span className="text-[10px] font-bold uppercase mt-1">Excluir</span>
        </div>
      </div>

      <motion.div
        style={{ x, opacity }}
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        className="relative z-10"
      >
        <Card
          className="flex items-center space-x-4 p-3 hover:shadow-md transition-shadow cursor-pointer group active:cursor-grabbing"
          onClick={onClick}
        >
          <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 flex-shrink-0">
            {thumbnail ? (
              <img src={thumbnail} alt="" className="w-full h-full object-cover" />
            ) : document.fileMimeType === 'application/pdf' ? (
              <div className="text-red-500 bg-red-50 w-full h-full flex items-center justify-center">
                <FileText size={24} />
              </div>
            ) : (
              <div className="text-gray-400">
                <FileText size={24} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                {document.title}
              </h3>
              <span className="text-sm font-bold text-gray-900">{formattedAmount}</span>
            </div>

            <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar size={12} />
                <span>{formattedDate}</span>
              </div>
              {document.issuer && (
                <div className="flex items-center space-x-1 truncate max-w-[120px]">
                  <Building2 size={12} />
                  <span className="truncate">{document.issuer}</span>
                </div>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between">
              {category ? (
                <div className="flex items-center space-x-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {category.name}
                  </span>
                </div>
              ) : (
                <div />
              )}
              <button className="text-gray-300 hover:text-gray-600">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
