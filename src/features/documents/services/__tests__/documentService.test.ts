import { describe, it, expect, beforeEach, vi } from 'vitest'
import { documentService } from '../documentService'
import { documentRepository } from '../../../../db/repositories/documentRepository'

vi.mock('../../../../db/repositories/documentRepository', () => ({
  documentRepository: {
    save: vi.fn(),
    getById: vi.fn(),
    getAll: vi.fn(),
    delete: vi.fn(),
  },
}))

// Mock image optimization since it uses browser APIs (Image, Canvas)
vi.mock('../documentService', async () => {
  const actual = await vi.importActual<any>('../documentService')
  return {
    ...actual,
    // We can't easily mock the internal optimizeImage function directly
    // so we'll just test that the service can be called.
  }
})

describe('documentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock URL.createObjectURL and other browser globals if needed
    global.URL.createObjectURL = vi.fn()
    global.URL.revokeObjectURL = vi.fn()
  })

  it('should be defined', () => {
    expect(documentService).toBeDefined()
  })

  it('should delete a document', async () => {
    await documentService.delete('123')
    expect(documentRepository.delete).toHaveBeenCalledWith('123')
  })
})
