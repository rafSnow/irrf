import { db } from '../database'
import type { Category } from '../../shared/types'

export const categoryRepository = {
  async getAll() {
    return db.categories.toArray()
  },
  async getById(id: string) {
    return db.categories.get(id)
  },
  async save(category: Category) {
    return db.categories.put(category)
  },
}
