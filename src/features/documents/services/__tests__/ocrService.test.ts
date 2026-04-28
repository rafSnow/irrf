import { describe, it, expect } from 'vitest'
import { ocrService } from '../ocrService'

describe('ocrService parsing', () => {
  it('should parse BRL currency correctly', () => {
    const text = 'Total a pagar: R$ 1.250,50'
    const result = ocrService.parseText(text)
    expect(result.amount).toBe(125050)
  })

  it('should parse date in DD/MM/YYYY format', () => {
    const text = 'Data de emissão: 25/12/2026'
    const result = ocrService.parseText(text)
    expect(result.documentDate).toBe('2026-12-25')
  })

  it('should parse date in DD/MM/YY format', () => {
    const text = 'Data: 01/05/26'
    const result = ocrService.parseText(text)
    expect(result.documentDate).toBe('2026-05-01')
  })

  it('should find the largest amount as the total', () => {
    const text = 'Item 1: R$ 10,00\nItem 2: R$ 20,00\nTotal: R$ 30,00'
    const result = ocrService.parseText(text)
    expect(result.amount).toBe(3000)
  })

  it('should extract issuer from the first non-empty line', () => {
    const text = '\n   \nHospital Albert Einstein\nAv. Albert Einstein, 627'
    const result = ocrService.parseText(text)
    expect(result.issuer).toBe('Hospital Albert Einstein')
  })
})
