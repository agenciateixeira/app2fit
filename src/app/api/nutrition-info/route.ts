// app/api/nutrition-info/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Base de dados nutricional simplificada
const NUTRITION_DATABASE: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {
  'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  'chicken': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  'bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
  'beef': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  'fish': { calories: 206, protein: 22, carbs: 0, fat: 12 },
  'egg': { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  'pasta': { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
  'salad': { calories: 20, protein: 1.4, carbs: 4, fat: 0.2 },
  'vegetable': { calories: 25, protein: 1.5, carbs: 5, fat: 0.1 },
  'fruit': { calories: 60, protein: 0.8, carbs: 15, fat: 0.2 },
  'cheese': { calories: 113, protein: 7, carbs: 1, fat: 9 },
  'milk': { calories: 42, protein: 3.4, carbs: 5, fat: 1 },
  'yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  'potato': { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
  'tomato': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  'carrot': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  'broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 }
}

function findBestMatch(foodTerms: string[]): { name: string; nutrition: typeof NUTRITION_DATABASE[string] } | null {
  const normalizedTerms = foodTerms.map(term => 
    term.toLowerCase().replace(/[^a-z\s]/g, '')
  )

  // Tentar encontrar correspondências exatas primeiro
  for (const term of normalizedTerms) {
    for (const [key, nutrition] of Object.entries(NUTRITION_DATABASE)) {
      if (term.includes(key) || key.includes(term)) {
        return {
          name: key.charAt(0).toUpperCase() + key.slice(1),
          nutrition
        }
      }
    }
  }

  // Se não encontrou correspondência exata, retornar um alimento genérico
  return {
    name: 'Alimento',
    nutrition: { calories: 100, protein: 5, carbs: 15, fat: 3 }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { foodTerms } = await request.json()
    
    if (!foodTerms || !Array.isArray(foodTerms)) {
      return NextResponse.json(
        { error: 'foodTerms deve ser um array' },
        { status: 400 }
      )
    }

    const match = findBestMatch(foodTerms)
    
    if (!match) {
      return NextResponse.json(
        { error: 'Alimento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      name: match.name,
      nutrition: match.nutrition,
      confidence: 0.8
    })
    
  } catch (error) {
    console.error('Erro ao buscar informações nutricionais:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}