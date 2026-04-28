import React, { useCallback, useState } from 'react'
import { Upload, AlertCircle } from 'lucide-react'
import heic2any from 'heic2any'

interface FileUploadProps {
  onFileSelect: (file: File) => void
}

const MAX_SIZE = 20 * 1024 * 1024 // 20MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const processFile = useCallback(
    async (file: File) => {
      setError(null)

      if (!ALLOWED_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith('.heic')) {
        setError('Formato de arquivo não suportado. Use PDF, JPG, PNG ou HEIC.')
        return
      }

      if (file.size > MAX_SIZE) {
        setError('O arquivo excede o limite de 20MB.')
        return
      }

      if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
        setIsProcessing(true)
        try {
          const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.8,
          })
          const blobData = Array.isArray(convertedBlob) ? convertedBlob[0] : (convertedBlob as Blob)
          const convertedFile = new window.File(
            [blobData],
            file.name.replace(/\.[^/.]+$/, '.jpg'),
            {
              type: 'image/jpeg',
            },
          )
          onFileSelect(convertedFile)
        } catch (err) {
          console.error('Erro ao converter HEIC:', err)
          setError('Erro ao processar arquivo HEIC.')
        } finally {
          setIsProcessing(false)
        }
      } else {
        onFileSelect(file)
      }
    },
    [onFileSelect],
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center text-center space-y-4 ${
          isDragging ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-gray-50'
        }`}
      >
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />

        <div
          className={`p-4 rounded-full ${
            isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-gray-400'
          } shadow-sm`}
        >
          {isProcessing ? (
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          ) : (
            <Upload size={32} />
          )}
        </div>

        <div>
          <p className="text-gray-900 font-semibold">
            {isProcessing ? 'Processando arquivo...' : 'Toque para selecionar ou arraste o arquivo'}
          </p>
          <p className="text-gray-500 text-sm mt-1">PDF, JPG, PNG ou HEIC (Máx. 20MB)</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
