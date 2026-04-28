import { db } from '../database'
import type { Document } from '../../shared/types'

export const documentRepository = {
  async getAll() {
    return db.documents.toArray()
  },
  async getById(id: string) {
    return db.documents.get(id)
  },
  async save(document: Document) {
    return db.documents.put(document)
  },
  async delete(id: string) {
    return db.documents.delete(id)
  },
  async getByCategoryId(categoryId: string) {
    return db.documents.where('categoryId').equals(categoryId).toArray()
  },
}
