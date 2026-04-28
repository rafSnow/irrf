import JSZip from 'jszip'
import { categoryRepository } from '../../../db/repositories/categoryRepository'
import { checklistRepository } from '../../../db/repositories/checklistRepository'
import { settingsRepository } from '../../../db/repositories/settingsRepository'
import { documentService } from '../../documents/services/documentService'
import type { Document } from '../../../shared/types'

export const backupService = {
  async exportBackup(key: CryptoKey | null): Promise<Blob> {
    const zip = new JSZip()

    const docs = await documentService.getDocuments(key)
    const categories = await categoryRepository.getAll()
    const checklist = await checklistRepository.getAll()

    // Save metadata without the blobs
    const metadata = docs.map(({ fileBlob: _fileBlob, ...rest }) => ({ ...rest }))

    zip.file('metadata.json', JSON.stringify(metadata))
    zip.file('categories.json', JSON.stringify(categories))
    zip.file('checklist.json', JSON.stringify(checklist))

    // Add decrypted files to zip
    const docsFolder = zip.folder('documents')
    if (docsFolder) {
      for (const doc of docs) {
        docsFolder.file(doc.fileName, doc.fileBlob)
      }
    }

    const content = await zip.generateAsync({ type: 'blob' })

    // Save backup date
    await settingsRepository.set('last_backup_date', new Date().toISOString())

    return content
  },

  async importBackup(zipFile: File, key: CryptoKey | null): Promise<number> {
    const zip = await JSZip.loadAsync(zipFile)

    const metadataJson = await zip.file('metadata.json')?.async('string')
    const categoriesJson = await zip.file('categories.json')?.async('string')
    const checklistJson = await zip.file('checklist.json')?.async('string')

    if (!metadataJson) throw new Error('Backup inválido: metadata.json não encontrado')

    const metadata = JSON.parse(metadataJson) as Omit<Document, 'fileBlob'>[]

    let restoredCount = 0
    for (const meta of metadata) {
      const fileData = await zip.file(`documents/${meta.fileName}`)?.async('arraybuffer')
      if (fileData) {
        await documentService.create(
          {
            ...meta,
            fileBlob: fileData,
          },
          key,
        )
        restoredCount++
      }
    }

    if (categoriesJson) {
      const categories = JSON.parse(categoriesJson)
      for (const cat of categories) {
        await categoryRepository.save(cat)
      }
    }

    if (checklistJson) {
      const checklist = JSON.parse(checklistJson)
      for (const item of checklist) {
        await checklistRepository.update(item.id, item)
      }
    }

    return restoredCount
  },
}
