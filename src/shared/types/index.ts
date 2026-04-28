export type Category = {
  id: string
  name: string
  icon: string
  color: string
  deductionLimit: number | null
  isDefault: boolean
}

export type Document = {
  id: string
  categoryId: string
  title: string
  issuer: string
  amount: number
  documentDate: string
  createdAt: string
  updatedAt: string
  fileBlob: ArrayBuffer
  fileMimeType: string
  fileName: string
  ocrExtracted: boolean
  notes?: string
  tags?: string[]
}

export type ChecklistItem = {
  id: string
  label: string
  status: 'pending' | 'done' | 'na'
  categoryId?: string
  isCustom: boolean
}

export type Setting = {
  key: string
  value: unknown
}
