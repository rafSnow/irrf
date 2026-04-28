import React, { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { checklistRepository } from '../../../db/repositories/checklistRepository'
import { Card, Badge, Button, Modal, Input } from '../../../shared/components'
import { CheckSquare, Plus, Trash2, Circle, CheckCircle2, MinusCircle } from 'lucide-react'
import type { ChecklistItem } from '../../../shared/types'
import { v4 as uuidv4 } from 'uuid'

export const Checklist: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newItemLabel, setNewItemLabel] = useState('')
  const items = useLiveQuery(() => checklistRepository.getAll())

  const completion = useMemo(() => {
    if (!items || items.length === 0) return 0
    const done = items.filter((i) => i.status === 'done').length
    return Math.round((done / items.length) * 100)
  }, [items])

  const handleToggleStatus = async (item: ChecklistItem) => {
    const statuses: ChecklistItem['status'][] = ['pending', 'done', 'na']
    const currentIndex = statuses.indexOf(item.status)
    const nextStatus = statuses[(currentIndex + 1) % statuses.length]
    await checklistRepository.updateStatus(item.id, nextStatus)
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemLabel.trim()) return

    await checklistRepository.add({
      id: uuidv4(),
      label: newItemLabel.trim(),
      status: 'pending',
      isCustom: true,
    })

    setNewItemLabel('')
    setIsAddModalOpen(false)
  }

  const handleDeleteItem = async (id: string) => {
    await checklistRepository.delete(id)
  }

  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 size={24} className="text-green-500" />
      case 'na':
        return <MinusCircle size={24} className="text-gray-300" />
      default:
        return <Circle size={24} className="text-gray-300" />
    }
  }

  const getStatusBadge = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'done':
        return <Badge variant="success">Obtido</Badge>
      case 'na':
        return <Badge variant="info">N/A</Badge>
      default:
        return <Badge variant="warning">Pendente</Badge>
    }
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Checklist</h1>
          <p className="text-gray-500 font-medium">Acompanhe a coleta dos documentos essenciais.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2">
          <Plus size={20} />
          <span>Novo Item</span>
        </Button>
      </header>

      {/* Progress Card */}
      <Card className="bg-indigo-600 border-none text-white p-6 shadow-lg shadow-indigo-100 overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">
                Progresso Total
              </p>
              <h2 className="text-4xl font-black">{completion}%</h2>
            </div>
            <p className="text-sm font-bold text-indigo-100">
              {items?.filter((i) => i.status === 'done').length} de {items?.length} itens
            </p>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-700 ease-out"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 text-white/10 rotate-12">
          <CheckSquare size={120} />
        </div>
      </Card>

      <Card className="divide-y divide-gray-50 p-0 overflow-hidden">
        {items?.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center space-x-4 flex-1">
              <button
                onClick={() => handleToggleStatus(item)}
                className="transition-transform active:scale-90"
              >
                {getStatusIcon(item.status)}
              </button>
              <span
                className={`font-semibold text-gray-700 ${
                  item.status === 'done' ? 'line-through text-gray-400' : ''
                }`}
              >
                {item.label}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {getStatusBadge(item.status)}
              {item.isCustom && (
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </Card>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Novo Item de Checklist"
      >
        <form onSubmit={handleAddItem} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-widest">
              Descrição
            </label>
            <Input
              autoFocus
              placeholder="Ex: Extrato da conta corrente"
              value={newItemLabel}
              onChange={(e) => setNewItemLabel(e.target.value)}
            />
          </div>
          <div className="flex space-x-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              type="button"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button className="flex-1" type="submit">
              Adicionar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
