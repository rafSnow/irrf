import React, { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { categoryRepository } from '../../../db/repositories/categoryRepository'
import { documentService } from '../services/documentService'
import { useAuth } from '../../../app/providers/AuthProvider'
import { Card, Button, Modal } from '../../../shared/components'
import { Plus, Search, Filter, Camera, FileText, ArrowUpDown, Calendar, X } from 'lucide-react'
import { CameraCapture } from './CameraCapture'
import { FileUpload } from './FileUpload'
import { DocumentForm } from './DocumentForm'
import { DocumentCard } from './DocumentCard'
import { DocumentDetail } from './DocumentDetail'
import type { Document } from '../../../shared/types'

type SortOption = 'date-desc' | 'date-asc' | 'value-desc' | 'value-asc'

export const DocumentList: React.FC = () => {
  const { encryptionKey } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null)
  const [editingDoc, setEditingDoc] = useState<Document | null>(null)
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('date-desc')
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)

  const filterMonth = searchParams.get('month')
  const filterYear = searchParams.get('year')

  const documents = useLiveQuery(() => documentService.getDocuments(encryptionKey), [encryptionKey])
  const categories = useLiveQuery(() => categoryRepository.getAll())

  const filteredAndSortedDocs = useMemo(() => {
    if (!documents) return []

    const result = documents.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.issuer.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !selectedCategoryId || doc.categoryId === selectedCategoryId

      let matchesDate = true
      if (filterMonth && filterYear) {
        const date = new Date(doc.documentDate + 'T12:00:00')
        matchesDate =
          date.getMonth() + 1 === parseInt(filterMonth) &&
          date.getFullYear() === parseInt(filterYear)
      }

      return matchesSearch && matchesCategory && matchesDate
    })

    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.documentDate).getTime() - new Date(a.documentDate).getTime()
        case 'date-asc':
          return new Date(a.documentDate).getTime() - new Date(b.documentDate).getTime()
        case 'value-desc':
          return b.amount - a.amount
        case 'value-asc':
          return a.amount - b.amount
        default:
          return 0
      }
    })

    return result
  }, [documents, searchTerm, selectedCategoryId, sortBy, filterMonth, filterYear])

  const handleCapture = (blob: Blob) => {
    const file = new window.File([blob], `captura-${new Date().getTime()}.jpg`, {
      type: 'image/jpeg',
    })
    setSelectedFile(file)
    setIsCameraOpen(false)
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setIsUploadOpen(false)
  }

  const handleSuccess = () => {
    setSelectedFile(null)
    setEditingDoc(null)
  }

  const handleDelete = async () => {
    if (deletingDocId) {
      await documentService.delete(deletingDocId)
      setDeletingDocId(null)
    }
  }

  const clearDateFilter = () => {
    setSearchParams({})
  }

  const getMonthName = (m: string) => {
    return new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(
      new Date(2026, parseInt(m) - 1, 1),
    )
  }

  const isLoading = documents === undefined

  return (
    <div className="space-y-6 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documentos</h1>
          <p className="text-gray-500">Organize seus recibos e notas fiscais.</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setIsCameraOpen(true)}
            variant="outline"
            className="flex-1 md:flex-none flex items-center space-x-2 bg-white"
          >
            <Camera size={20} />
            <span>Câmera</span>
          </Button>
          <Button
            onClick={() => setIsUploadOpen(true)}
            className="flex-1 md:flex-none flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Novo</span>
          </Button>
        </div>
      </header>

      {filterMonth && filterYear && (
        <div className="flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl border border-indigo-100 animate-in slide-in-from-left-2">
          <Calendar size={18} />
          <span className="text-sm font-bold flex-1">
            Filtrando por: <span className="capitalize">{getMonthName(filterMonth)}</span> de{' '}
            {filterYear}
          </span>
          <button onClick={clearDateFilter} className="p-1 hover:bg-indigo-100 rounded-full">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por emitente, título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            />
          </div>
          <Button
            variant={isFilterMenuOpen ? 'secondary' : 'ghost'}
            size="icon"
            className="border border-gray-200 bg-white shadow-sm"
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
          >
            <Filter size={20} />
          </Button>
        </div>

        {isFilterMenuOpen && (
          <Card className="p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Categorias
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    !selectedCategoryId
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Todas
                </button>
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedCategoryId === cat.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <ArrowUpDown size={16} className="text-gray-400" />
                  <select
                    className="bg-transparent text-sm font-medium text-gray-600 outline-none cursor-pointer"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                  >
                    <option value="date-desc">Mais recentes</option>
                    <option value="date-asc">Mais antigos</option>
                    <option value="value-desc">Maior valor</option>
                    <option value="value-asc">Menor valor</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedCategoryId(null)
                  setSearchTerm('')
                  setSortBy('date-desc')
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                Limpar Filtros
              </button>
            </div>
          </Card>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex items-center space-x-4 p-3 animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredAndSortedDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAndSortedDocs.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              category={categories?.find((c) => c.id === doc.categoryId)}
              onClick={() => setViewingDoc(doc)}
              onDelete={() => setDeletingDocId(doc.id)}
            />
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-200 rounded-full flex items-center justify-center mb-4">
            <FileText size={40} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {searchTerm || selectedCategoryId || filterMonth
              ? 'Nenhum resultado'
              : 'Nenhum documento'}
          </h3>
          <p className="text-gray-500 max-w-xs mt-2">
            {searchTerm || selectedCategoryId || filterMonth
              ? `Não encontramos nada com os filtros aplicados.`
              : 'Comece adicionando seu primeiro recibo para organizar sua declaração.'}
          </p>
          {!searchTerm && !selectedCategoryId && !filterMonth && (
            <div className="mt-6">
              <Button onClick={() => setIsUploadOpen(true)} variant="secondary">
                Fazer Upload
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Modals remain the same */}
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Novo Documento">
        <FileUpload onFileSelect={handleFileSelect} />
      </Modal>

      {isCameraOpen && (
        <CameraCapture onCapture={handleCapture} onCancel={() => setIsCameraOpen(false)} />
      )}

      <Modal
        isOpen={!!selectedFile}
        onClose={() => setSelectedFile(null)}
        title="Detalhes do Documento"
      >
        {selectedFile && (
          <DocumentForm
            file={selectedFile}
            onSuccess={handleSuccess}
            onCancel={() => setSelectedFile(null)}
          />
        )}
      </Modal>

      <Modal isOpen={!!viewingDoc} onClose={() => setViewingDoc(null)} title="Visualizar Documento">
        {viewingDoc && (
          <DocumentDetail
            document={viewingDoc}
            category={categories?.find((c) => c.id === viewingDoc.categoryId)}
            onEdit={() => {
              setEditingDoc(viewingDoc)
              setViewingDoc(null)
            }}
            onDelete={() => setViewingDoc(null)}
          />
        )}
      </Modal>

      <Modal isOpen={!!editingDoc} onClose={() => setEditingDoc(null)} title="Editar Documento">
        {editingDoc && (
          <DocumentForm
            initialData={editingDoc}
            onSuccess={handleSuccess}
            onCancel={() => setEditingDoc(null)}
          />
        )}
      </Modal>

      <Modal
        isOpen={!!deletingDocId}
        onClose={() => setDeletingDocId(null)}
        title="Excluir Documento"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
          </p>
          <div className="flex space-x-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeletingDocId(null)}>
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
