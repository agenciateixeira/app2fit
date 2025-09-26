// app/api/food-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ImageAnnotatorClient } from '@google-cloud/vision'

const vision = new ImageAnnotatorClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.requests || !Array.isArray(body.requests)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

    // Fazer a análise usando Google Vision API
    const [result] = await vision.batchAnnotateImages(body)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro na análise de imagem:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}