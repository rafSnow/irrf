import { createWorker } from 'tesseract.js'

export interface OcrResult {
  amount?: number
  documentDate?: string
  issuer?: string
  confidence: number
}

export const ocrService = {
  async extractFromImage(
    image: string | Blob | File,
    onProgress?: (progress: number) => void,
  ): Promise<OcrResult> {
    const worker = await createWorker('por', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(m.progress)
        }
      },
    })

    const {
      data: { text, confidence },
    } = await worker.recognize(image)
    await worker.terminate()

    return {
      ...this.parseText(text),
      confidence,
    }
  },

  parseText(text: string): Partial<OcrResult> {
    const lines = text.split('\n')
    let amount: number | undefined
    let documentDate: string | undefined

    // RegEx for currency (BRL: R$ 1.234,56 or just 1.234,56)
    const currencyRegex = /(?:R\$?\s?)?(\d{1,3}(?:\.\d{3})*,\d{2})/g
    // RegEx for date (DD/MM/YYYY or DD/MM/YY)
    const dateRegex = /(\d{2})\/(\d{2})\/(\d{2,4})/

    // Try to find the largest monetary value (often the total)
    const currencyMatches = text.match(currencyRegex)
    if (currencyMatches) {
      const amounts = currencyMatches.map((m) => {
        const clean = m.replace(/[R$\s.]/g, '').replace(',', '.')
        return Math.round(parseFloat(clean) * 100)
      })
      amount = Math.max(...amounts)
    }

    // Try to find date
    const dateMatch = text.match(dateRegex)
    if (dateMatch) {
      const day = dateMatch[1]
      const month = dateMatch[2]
      let year = dateMatch[3]
      if (year.length === 2) year = '20' + year
      documentDate = `${year}-${month}-${day}`
    }

    // Heuristic for issuer: usually one of the first 3 lines
    const issuer = lines.find((l) => l.trim().length > 5)?.trim()

    return { amount, documentDate, issuer }
  },
}
