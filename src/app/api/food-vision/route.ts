import { NextRequest, NextResponse } from 'next/server'

// Base de dados simplificada de alimentos brasileiros
const FOOD_PATTERNS = [
  { keywords: ['rice', 'arroz', 'grain'], food: { name: 'Arroz branco cozido', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 }, quantity: 120 },
  { keywords: ['chicken', 'frango', 'meat', 'poultry'], food: { name: 'Peito de frango grelhado', calories: 165, protein: 31, carbs: 0, fat: 3.6 }, quantity: 150 },
  { keywords: ['bean', 'beans', 'feijao'], food: { name: 'Feijão preto cozido', calories: 77, protein: 4.5, carbs: 14, fat: 0.5 }, quantity: 80 },
  { keywords: ['bread', 'pao'], food: { name: 'Pão francês', calories: 300, protein: 9, carbs: 60, fat: 3.1 }, quantity: 50 },
  { keywords: ['egg', 'ovo'], food: { name: 'Ovo cozido', calories: 155, protein: 13, carbs: 1.1, fat: 11 }, quantity: 50 },
  { keywords: ['banana'], food: { name: 'Banana nanica', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 }, quantity: 100 },
  { keywords: ['potato', 'batata'], food: { name: 'Batata doce cozida', calories: 86, protein: 1.6, carbs: 20, fat: 0.1 }, quantity: 150 },
  { keywords: ['milk', 'leite'], food: { name: 'Leite integral', calories: 61, protein: 3.2, carbs: 4.6, fat: 3.2 }, quantity: 200 },
  { keywords: ['apple', 'maca'], food: { name: 'Maçã com casca', calories: 52, protein: 0.3, carbs: 14, fat: 0.2 }, quantity: 150 },
  { keywords: ['vegetable', 'broccoli'], food: { name: 'Brócolis cozido', calories: 35, protein: 2.4, carbs: 7, fat: 0.4 }, quantity: 100 },
]

export async function POST(request: NextRequest) {
  try {
    console.log('Recebendo requisição de análise de imagem...')

    // Obter imagem do FormData
    const formData = await request.formData()
    const image = formData.get('image') as File
    
    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Imagem não fornecida' },
        { status: 400 }
      )
    }

    console.log(`Processando imagem: ${image.name} (${Math.round(image.size / 1024)}KB)`)
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Análise simulada baseada no nome do arquivo
    const fileName = image.name.toLowerCase()
    const detectedFoods = []

    // Tentar detectar padrões no nome do arquivo
    for (const pattern of FOOD_PATTERNS) {
      if (pattern.keywords.some(keyword => fileName.includes(keyword))) {
        detectedFoods.push({
          food: {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: pattern.food.name,
            calories: pattern.food.calories,
            protein: pattern.food.protein,
            carbs: pattern.food.carbs,
            fat: pattern.food.fat,
            fiber: 2,
            sodium: 50
          },
          confidence: 0.75 + Math.random() * 0.15, // 75-90%
          quantity: pattern.quantity + Math.floor(Math.random() * 40) - 20 // ±20g
        })
        
        if (detectedFoods.length >= 2) break // Máximo 2 alimentos
      }
    }

    // Se não detectou nada baseado no nome, adicionar alimentos aleatórios
    if (detectedFoods.length === 0) {
      const randomPattern = FOOD_PATTERNS[Math.floor(Math.random() * FOOD_PATTERNS.length)]
      detectedFoods.push({
        food: {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: randomPattern.food.name,
          calories: randomPattern.food.calories,
          protein: randomPattern.food.protein,
          carbs: randomPattern.food.carbs,
          fat: randomPattern.food.fat,
          fiber: 2,
          sodium: 50
        },
        confidence: 0.60 + Math.random() * 0.20, // 60-80%
        quantity: randomPattern.quantity
      })
    }

    console.log(`Detectados ${detectedFoods.length} alimentos`)

    return NextResponse.json({
      success: true,
      foods: detectedFoods,
      debug: {
        fileName: image.name,
        fileSize: `${Math.round(image.size / 1024)}KB`,
        detectedCount: detectedFoods.length
      }
    })

  } catch (error) {
    console.error('Erro na análise de imagem:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno ao processar imagem',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}