import { db } from '../database'
import type { ChecklistItem } from '../../shared/types'

export const checklistRepository = {
  async getAll() {
    return db.checklist.toArray()
  },
  async updateStatus(id: string, status: ChecklistItem['status']) {
    return db.checklist.update(id, { status })
  },
  async add(item: ChecklistItem) {
    return db.checklist.add(item)
  },
  async delete(id: string) {
    return db.checklist.delete(id)
  },
  async update(id: string, data: Partial<ChecklistItem>) {
    return db.checklist.update(id, data)
  },
}
