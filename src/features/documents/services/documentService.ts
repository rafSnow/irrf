import { v4 as uuidv4 } from 'uuid'
import { documentRepository } from '../../../db/repositories/documentRepository'
import type { Document } from '../../../shared/types'
import { encryptionService } from './encryptionService'

const MAX_IMAGE_WIDTH = 2048

async function optimizeImage(blob: ArrayBuffer, mimeType: string): Promise<ArrayBuffer> {
  if (!mimeType.startsWith('image/') || mimeType === 'image/gif') return blob

  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(new Blob([blob], { type: mimeType }))

    img.onload = () => {
      URL.revokeObjectURL(url)
      if (img.width <= MAX_IMAGE_WIDTH) {
        resolve(blob)
        return
      }

      const canvas = document.createElement('canvas')
      const scale = MAX_IMAGE_WIDTH / img.width
      canvas.width = MAX_IMAGE_WIDTH
      canvas.height = img.height * scale

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(blob)
        return
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (resizedBlob) => {
          if (resizedBlob) {
            resizedBlob.arrayBuffer().then(resolve)
          } else {
            resolve(blob)
          }
        },
        mimeType,
        0.8,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(blob)
    }

    img.src = url
  })
}

export const documentService = {
  async create(
    data: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>,
    key: CryptoKey | null,
  ): Promise<string> {
    const now = new Date().toISOString()
    let fileBlob = await optimizeImage(data.fileBlob, data.fileMimeType)

    if (key) {
      fileBlob = await encryptionService.encrypt(fileBlob, key)
    }

    const document: Document = {
      ...data,
      fileBlob,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    }

    await documentRepository.save(document)
    return document.id
  },

  async update(id: string, data: Partial<Document>, key: CryptoKey | null): Promise<void> {
    const existing = await documentRepository.getById(id)
    if (!existing) throw new Error('Documento não encontrado')

    let fileBlob = data.fileBlob || existing.fileBlob

    if (data.fileBlob) {
      fileBlob = await optimizeImage(data.fileBlob, data.fileMimeType || existing.fileMimeType)
      if (key) {
        fileBlob = await encryptionService.encrypt(fileBlob, key)
      }
    }

    const updated: Document = {
      ...existing,
      ...data,
      fileBlob,
      updatedAt: new Date().toISOString(),
    }

    await documentRepository.save(updated)
  },

  async delete(id: string): Promise<void> {
    await documentRepository.delete(id)
  },

  async getDocuments(key: CryptoKey | null) {
    const docs = await documentRepository.getAll()
    if (!key) return docs

    return await Promise.all(
      docs.map(async (doc) => {
        try {
          const decrypted = await encryptionService.decrypt(doc.fileBlob, key)
          return { ...doc, fileBlob: decrypted }
        } catch (_e) {
          return doc
        }
      }),
    )
  },

  async getById(id: string, key: CryptoKey | null) {
    const doc = await documentRepository.getById(id)
    if (!doc || !key) return doc

    try {
      const decrypted = await encryptionService.decrypt(doc.fileBlob, key)
      return { ...doc, fileBlob: decrypted }
    } catch (_e) {
      return doc
    }
  },

  async migrateToEncryption(key: CryptoKey): Promise<number> {
    const docs = await documentRepository.getAll()
    let migratedCount = 0

    for (const doc of docs) {
      try {
        await encryptionService.decrypt(doc.fileBlob, key)
      } catch (_e) {
        const encrypted = await encryptionService.encrypt(doc.fileBlob, key)
        await documentRepository.save({ ...doc, fileBlob: encrypted })
        migratedCount++
      }
    }
    return migratedCount
  },
}
