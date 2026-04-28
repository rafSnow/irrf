import React, { useState, useEffect, useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { categoryRepository } from '../../../db/repositories/categoryRepository'
import { documentService } from '../services/documentService'
import { useAuth } from '../../../app/providers/AuthProvider'
import { useOcr } from '../hooks/useOcr'
import { Button, Input } from '../../../shared/components'
import { FileIcon, AlertCircle, Sparkles } from 'lucide-react'
import type { Document } from '../../../shared/types'

interface DocumentFormProps {
  file?: File
  initialData?: Document
  onSuccess: () => void
  onCancel: () => void
}

export const DocumentForm: React.FC<DocumentFormProps> = ({
  file,
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { encryptionKey } = useAuth()
  const categories = useLiveQuery(() => categoryRepository.getAll())
  const { processImage, isProcessing, progress } = useOcr()
  const [ocrApplied, setOcrApplied] = useState<Record<string, boolean>>({})

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    issuer: initialData?.issuer || '',
    amount: initialData?.amount?.toString() || '',
    documentDate: initialData?.documentDate || new Date().toISOString().split('T')[0],
    categoryId: initialData?.categoryId || '',
    notes: initialData?.notes || '',
  })

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOcr = useCallback(
    async (imgFile: File) => {
      const result = await processImage(imgFile)
      if (result) {
        const updates: Partial<typeof formData> = {}
        const applied: Record<string, boolean> = {}

        if (result.amount && !formData.amount) {
          updates.amount = result.amount.toString()
          applied.amount = true
        }
        if (
          result.documentDate &&
          formData.documentDate === new Date().toISOString().split('T')[0]
        ) {
          updates.documentDate = result.documentDate
          applied.documentDate = true
        }
        if (result.issuer && !formData.issuer) {
          updates.issuer = result.issuer
          applied.issuer = true
        }

        setFormData((prev) => ({ ...prev, ...updates }))
        setOcrApplied(applied)
      }
    },
    [processImage, formData],
  )

  useEffect(() => {
    if (file) {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPreviewUrl(url)
        handleOcr(file)
        return () => URL.revokeObjectURL(url)
      }
    } else if (initialData?.fileBlob) {
      const blob = new Blob([initialData.fileBlob], { type: initialData.fileMimeType })
      if (initialData.fileMimeType.startsWith('image/')) {
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
        return () => URL.revokeObjectURL(url)
      }
    }
  }, [file, initialData, handleOcr])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.documentDate) newErrors.documentDate = 'Data é obrigatória'
    if (!formData.categoryId) newErrors.categoryId = 'Categoria é obrigatória'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const formatCurrency = (value: string) => {
    const digits = value.replace(/\D/g, '')
    const amount = parseInt(digits || '0') / 100
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '')
    setFormData((prev) => ({ ...prev, amount: digits }))
    setOcrApplied((prev) => ({ ...prev, amount: false }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      if (initialData) {
        // Update
        await documentService.update(
          initialData.id,
          {
            ...formData,
            amount: parseInt(formData.amount || '0'),
          },
          encryptionKey,
        )
      } else if (file) {
        // Create
        const arrayBuffer = await file.arrayBuffer()
        await documentService.create(
          {
            title: formData.title || file.name,
            issuer: formData.issuer,
            amount: parseInt(formData.amount || '0'),
            documentDate: formData.documentDate,
            categoryId: formData.categoryId,
            notes: formData.notes,
            fileBlob: arrayBuffer,
            fileMimeType: file.type,
            fileName: file.name,
            ocrExtracted: Object.values(ocrApplied).some(Boolean),
          },
          encryptionKey,
        )
      }
      onSuccess()
    } catch (err) {
      console.error('Erro ao salvar documento:', err)
      setErrors({ global: 'Erro ao salvar o documento. Tente novamente.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-indigo-600 font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1">
              <Sparkles size={14} className="animate-pulse" />
              <span>Extraindo dados via OCR...</span>
            </div>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-indigo-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-300 ease-out"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <FileIcon className="text-gray-400" size={32} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {file?.name || initialData?.fileName}
          </p>
          <p className="text-xs text-gray-500">
            {file ? (file.size / 1024 / 1024).toFixed(2) : '---'} MB
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Título / Descrição</label>
          <Input
            placeholder="Ex: Nota Fiscal Farmácia"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 relative">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              Data
              {ocrApplied.documentDate && <Sparkles size={12} className="text-indigo-500" />}
            </label>
            <Input
              type="date"
              value={formData.documentDate}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, documentDate: e.target.value }))
                setOcrApplied((prev) => ({ ...prev, documentDate: false }))
              }}
              className={
                errors.documentDate
                  ? 'border-red-500'
                  : ocrApplied.documentDate
                    ? 'border-indigo-200 bg-indigo-50/30'
                    : ''
              }
            />
            {errors.documentDate && <p className="text-xs text-red-500">{errors.documentDate}</p>}
          </div>
          <div className="space-y-1 relative">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              Valor
              {ocrApplied.amount && <Sparkles size={12} className="text-indigo-500" />}
            </label>
            <Input
              placeholder="R$ 0,00"
              value={formData.amount ? formatCurrency(formData.amount) : ''}
              onChange={handleAmountChange}
              className={ocrApplied.amount ? 'border-indigo-200 bg-indigo-50/30' : ''}
            />
          </div>
        </div>

        <div className="space-y-1 relative">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
            Emitente
            {ocrApplied.issuer && <Sparkles size={12} className="text-indigo-500" />}
          </label>
          <Input
            placeholder="Ex: Hospital Albert Einstein"
            value={formData.issuer}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, issuer: e.target.value }))
              setOcrApplied((prev) => ({ ...prev, issuer: false }))
            }}
            className={ocrApplied.issuer ? 'border-indigo-200 bg-indigo-50/30' : ''}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Categoria</label>
          <select
            className={`w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none ${
              errors.categoryId ? 'border-red-500' : ''
            }`}
            value={formData.categoryId}
            onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
          >
            <option value="">Selecione uma categoria</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Observações</label>
          <textarea
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none h-24"
            placeholder="Algo importante sobre este documento..."
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
          />
        </div>

        {errors.global && (
          <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl">
            <AlertCircle size={18} />
            <span>{errors.global}</span>
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" isLoading={isSubmitting}>
            {initialData ? 'Atualizar' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  )
}
