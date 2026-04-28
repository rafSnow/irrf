import Dexie, { type Table } from 'dexie'
import type { Category, Document, ChecklistItem, Setting } from '../shared/types'
import { DEFAULT_CATEGORIES, DEFAULT_CHECKLIST } from './migrations/v1'

export class AppDatabase extends Dexie {
  documents!: Table<Document>
  categories!: Table<Category>
  checklist!: Table<ChecklistItem>
  settings!: Table<Setting>

  constructor() {
    super('GuardiaoFiscalDB')
    this.version(1).stores({
      documents: '++id, categoryId, documentDate, createdAt, amount',
      categories: 'id, name',
      checklist: 'id, categoryId',
      settings: 'key',
    })

    this.on('populate', () => {
      this.categories.bulkAdd(DEFAULT_CATEGORIES)
      this.checklist.bulkAdd(DEFAULT_CHECKLIST)
    })
  }
}

export const db = new AppDatabase()
