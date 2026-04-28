import { useState, useCallback } from 'react'
import { ocrService, type OcrResult } from '../services/ocrService'

export function useOcr() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<OcrResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const processImage = useCallback(async (image: string | Blob | File) => {
    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setResult(null)

    try {
      const data = await ocrService.extractFromImage(image, (p) => setProgress(p))
      setResult(data)
      return data
    } catch (err) {
      console.error('OCR Error:', err)
      setError('Falha ao processar imagem para OCR.')
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [])

  return { processImage, isProcessing, progress, result, error }
}
