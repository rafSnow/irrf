import React, { useMemo, useState } from 'react'
import type { Document, Category } from '../../../shared/types'
import { Button, Card, Modal } from '../../../shared/components'
import { Calendar, Building2, Tag, FileText, Edit2, Trash2, Download, Share2 } from 'lucide-react'
import { documentService } from '../services/documentService'

interface DocumentDetailProps {
  document: Document
  category?: Category
  onEdit: () => void
  onDelete: () => void
}

export const DocumentDetail: React.FC<DocumentDetailProps> = ({
  document,
  category,
  onEdit,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const formattedAmount = useMemo(() => {
    return (document.amount / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }, [document.amount])

  const formattedDate = useMemo(() => {
    return new Date(document.documentDate + 'T12:00:00').toLocaleDateString('pt-BR')
  }, [document.documentDate])

  const fileUrl = useMemo(() => {
    const blob = new Blob([document.fileBlob], { type: document.fileMimeType })
    return URL.createObjectURL(blob)
  }, [document.fileBlob, document.fileMimeType])

  const isImage = document.fileMimeType.startsWith('image/')

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const blob = new Blob([document.fileBlob], { type: document.fileMimeType })
        const file = new window.File([blob], document.fileName, { type: document.fileMimeType })
        await navigator.share({
          files: [file],
          title: document.title,
          text: `Documento fiscal: ${document.title} - ${formattedAmount}`,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      // Fallback: download
      const link = window.document.createElement('a')
      link.href = fileUrl
      link.download = document.fileName
      link.click()
    }
  }

  const handleDelete = async () => {
    await documentService.delete(document.id)
    onDelete()
  }

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      <div className="flex-1 overflow-auto p-1 space-y-6">
        {/* Preview Area */}
        <div className="relative aspect-[4/3] md:aspect-video bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 group">
          {isImage ? (
            <img src={fileUrl} alt={document.title} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-4 text-gray-400">
              <FileText size={64} />
              <p className="font-medium">Documento PDF</p>
            </div>
          )}
          <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleShare}
              className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-gray-700 hover:bg-white"
              title="Compartilhar"
            >
              <Share2 size={20} />
            </button>
            <a
              href={fileUrl}
              download={document.fileName}
              className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-gray-700 hover:bg-white"
            >
              <Download size={20} />
            </a>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{document.title}</h2>
              <p className="text-2xl font-black text-indigo-600 mt-1">{formattedAmount}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-600">
                <Calendar size={18} className="text-gray-400" />
                <span className="font-medium">Data: {formattedDate}</span>
              </div>
              {document.issuer && (
                <div className="flex items-center space-x-3 text-gray-600">
                  <Building2 size={18} className="text-gray-400" />
                  <span className="font-medium">Emitente: {document.issuer}</span>
                </div>
              )}
              {category && (
                <div className="flex items-center space-x-3">
                  <Tag size={18} className="text-gray-400" />
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-bold text-xs uppercase tracking-wider text-gray-500">
                      {category.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {document.notes && (
            <Card className="bg-gray-50 border-none shadow-none">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Observações
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap text-sm">{document.notes}</p>
            </Card>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-6 border-t border-gray-100 flex space-x-3 mt-auto">
        <Button
          variant="outline"
          className="flex-1 border-red-100 text-red-600 hover:bg-red-50"
          onClick={() => setIsDeleting(true)}
        >
          <Trash2 size={20} className="mr-2" />
          Excluir
        </Button>
        <Button className="flex-1" onClick={onEdit}>
          <Edit2 size={20} className="mr-2" />
          Editar
        </Button>
      </div>

      <Modal isOpen={isDeleting} onClose={() => setIsDeleting(false)} title="Confirmar Exclusão">
        <div className="space-y-4">
          <p className="text-gray-600">
            Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
          </p>
          <div className="flex space-x-3">
            <Button variant="outline" className="flex-1" onClick={() => setIsDeleting(false)}>
              Cancelar
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete}>
              Excluir permanentemente
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
