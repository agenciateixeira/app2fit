'use client'

import { useState, useCallback } from 'react'

export interface FoodScanResult {
  foods: Array<{
    food: {
      id: string
      name: string
      calories: number
      protein: number
      carbs: number
      fat: number
    }
    quantity: number
    confidence: number
  }>
}

export interface FoodScannerStatus {
  status: 'idle' | 'scanning' | 'completed' | 'error'
  result: FoodScanResult | null
  error: string | null
  scanImage: (imageData: string) => Promise<FoodScanResult>
}

export const useFoodScanner = (): FoodScannerStatus => {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'completed' | 'error'>('idle')
  const [result, setResult] = useState<FoodScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const scanImage = useCallback(async (imageData: string): Promise<FoodScanResult> => {
    setStatus('scanning')
    setError(null)

    try {
      // Simular análise por enquanto
      await new Promise(resolve => setTimeout(resolve, 2000))

      const mockResult: FoodScanResult = {
        foods: [
          {
            food: {
              id: `food-${Date.now()}`,
              name: 'Frango Grelhado',
              calories: 165,
              protein: 31,
              carbs: 0,
              fat: 3.6
            },
            quantity: 150,
            confidence: 0.85
          }
        ]
      }

      setResult(mockResult)
      setStatus('completed')
      return mockResult
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao analisar imagem'
      setError(errorMessage)
      setStatus('error')
      throw new Error(errorMessage)
    }
  }, [])

  return {
    status,
    result,
    error,
    scanImage
  }
}