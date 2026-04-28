import { db } from '../database'
import type { Category, ChecklistItem } from '../../shared/types'

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'saude',
    name: 'Saúde',
    icon: 'Stethoscope',
    color: '#ef4444',
    deductionLimit: null,
    isDefault: true,
  },
  {
    id: 'educacao',
    name: 'Educação',
    icon: 'GraduationCap',
    color: '#3b82f6',
    deductionLimit: 356150, // R$ 3.561,50 in cents
    isDefault: true,
  },
  {
    id: 'renda',
    name: 'Renda',
    icon: 'Wallet',
    color: '#10b981',
    deductionLimit: null,
    isDefault: true,
  },
  {
    id: 'previdencia',
    name: 'Previdência',
    icon: 'ShieldCheck',
    color: '#f59e0b',
    deductionLimit: null,
    isDefault: true,
  },
  {
    id: 'doacoes',
    name: 'Doações',
    icon: 'Heart',
    color: '#ec4899',
    deductionLimit: null,
    isDefault: true,
  },
  {
    id: 'aluguel',
    name: 'Aluguel',
    icon: 'Home',
    color: '#8b5cf6',
    deductionLimit: null,
    isDefault: true,
  },
  {
    id: 'pensao',
    name: 'Pensão Alimentícia',
    icon: 'Baby',
    color: '#06b6d4',
    deductionLimit: null,
    isDefault: true,
  },
  {
    id: 'outros',
    name: 'Outros',
    icon: 'Plus',
    color: '#6b7280',
    deductionLimit: null,
    isDefault: true,
  },
]

export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: '1', label: 'Informe de rendimentos do empregador', status: 'pending', isCustom: false },
  { id: '2', label: 'Comprovantes de despesas médicas', status: 'pending', isCustom: false },
  { id: '3', label: 'Comprovantes de despesas com instrução', status: 'pending', isCustom: false },
  { id: '4', label: 'Informe de rendimentos bancários', status: 'pending', isCustom: false },
]

export async function seedDatabase() {
  const count = await db.categories.count()
  if (count === 0) {
    await db.categories.bulkAdd(DEFAULT_CATEGORIES)
    await db.checklist.bulkAdd(DEFAULT_CHECKLIST)
  }
}
