import { describe, it, expect, beforeEach } from 'vitest'
import { documentRepository } from '../documentRepository'
import { categoryRepository } from '../categoryRepository'
import { settingsRepository } from '../settingsRepository'
import { db } from '../../database'
import type { Document } from '../../../shared/types'

describe('Repositories', () => {
  beforeEach(async () => {
    await db.documents.clear()
    await db.categories.clear()
    await db.settings.clear()
    // Populate categories as if it were a new DB
    await db.categories.bulkAdd([
      {
        id: 'saude',
        name: 'Saúde',
        icon: 'Stethoscope',
        color: '#ef4444',
        deductionLimit: null,
        isDefault: true,
      },
    ])
  })

  describe('documentRepository', () => {
    it('should save and retrieve a document', async () => {
      const doc = {
        id: '1',
        categoryId: 'saude',
        title: 'Exame',
        issuer: 'Lab',
        amount: 10000,
        documentDate: '2026-04-27',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fileBlob: new ArrayBuffer(8),
        fileMimeType: 'image/jpeg',
        fileName: 'exame.jpg',
        ocrExtracted: false,
      }

      await documentRepository.save(doc)
      const retrieved = await documentRepository.getById('1')
      expect(retrieved).toEqual(doc)
    })

    it('should get documents by category', async () => {
      await documentRepository.save({ id: '1', categoryId: 'saude' } as Document)
      await documentRepository.save({ id: '2', categoryId: 'educacao' } as Document)

      const saudeDocs = await documentRepository.getByCategoryId('saude')
      expect(saudeDocs).toHaveLength(1)
      expect(saudeDocs[0].id).toBe('1')
    })
  })

  describe('categoryRepository', () => {
    it('should get all categories', async () => {
      const categories = await categoryRepository.getAll()
      expect(categories.length).toBeGreaterThan(0)
    })
  })

  describe('settingsRepository', () => {
    it('should set and get a setting', async () => {
      await settingsRepository.set('theme', 'dark')
      const value = await settingsRepository.get('theme')
      expect(value).toBe('dark')
    })
  })
})
