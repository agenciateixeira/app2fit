// src/components/FoodScanner.tsx
'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, X, ArrowLeft, RotateCw, Check } from 'lucide-react'
import { useApp } from '@/app/contexts/AppContext'

interface FoodData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
}

interface LabelAnnotation {
  description: string;
  score: number;
}

interface WebEntity {
  description: string;
  score: number;
}

export default function FoodScanner() {
  const router = useRouter()
  const { state, dispatch } = useApp()
  
  const [step, setStep] = useState<'camera' | 'processing' | 'results'>('camera')
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const [foodData, setFoodData] = useState<FoodData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Iniciar a câmera
  const startCamera = useCallback(async () => {
    try {
      setError(null)
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsCameraReady(true)
      }
    } catch (err) {
      console.error('Erro ao acessar câmera:', err)
      setError('Não foi possível acessar a câmera. Verifique as permissões do navegador.')
    }
  }, [])

  // Parar a câmera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
      setIsCameraReady(false)
    }
  }, [])

  // Tirar foto
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return
    
    // Definir tamanho do canvas
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Desenhar o frame do vídeo no canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Converter para base64
    const photoData = canvas.toDataURL('image/jpeg')
    setPhoto(photoData)
    
    // Mudar para o passo de processamento
    setStep('processing')
    
    // Analisar a imagem
    analyzeFood(photoData)
  }

  // Analisar a imagem com Google Vision API
  const analyzeFood = async (imageData: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Remover prefixo "data:image/jpeg;base64," da string base64
      const base64Image = imageData.split(',')[1]
      
      // Preparar os dados para envio
      const requestData = {
        requests: [
          {
            image: {
              content: base64Image
            },
            features: [
              {
                type: 'LABEL_DETECTION',
                maxResults: 10
              },
              {
                type: 'WEB_DETECTION',
                maxResults: 10
              }
            ]
          }
        ]
      }
      
      // Enviar para API do Google Vision
      const response = await fetch('/api/food-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
      
      if (!response.ok) {
        throw new Error('Erro ao analisar a imagem')
      }
      
      const result = await response.json()
      
      // Processar resposta da API
      const labels = result.responses[0].labelAnnotations || []
      const webEntities = result.responses[0].webDetection?.webEntities || []
      
      // Filtrar rótulos relacionados a alimentos
      const foodLabels = labels.filter((label: LabelAnnotation) => 
        label.description.toLowerCase().match(/food|meal|dish|fruit|vegetable|meat|chicken|fish|salad|bread|rice|pasta/)
      )
      
      // Se não encontrou nenhum alimento
      if (foodLabels.length === 0) {
        setError('Nenhum alimento detectado. Tente novamente com uma foto melhor.')
        setStep('camera')
        setIsLoading(false)
        return
      }
      
      // Obter informações nutricionais do alimento detectado
      await fetchNutritionInfo(foodLabels, webEntities)
      
    } catch (err) {
      console.error('Erro ao analisar imagem:', err)
      setError('Erro ao processar a imagem. Tente novamente.')
      setStep('camera')
    } finally {
      setIsLoading(false)
    }
  }

  // Buscar informações nutricionais
  const fetchNutritionInfo = async (
    foodLabels: LabelAnnotation[],
    webEntities: WebEntity[]
  ) => {
    try {
      // Extrair nomes de alimentos
      const foodNames = foodLabels.map(label => label.description)
      const entityNames = webEntities
        .filter(entity => entity.score > 0.5)
        .map(entity => entity.description)
      
      // Combinar todos os termos detectados
      const allTerms = [...foodNames, ...entityNames]
      
      // Enviar para API nutricional (será implementada no backend)
      const response = await fetch('/api/nutrition-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ foodTerms: allTerms })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao buscar informações nutricionais')
      }
      
      // Para fins de exemplo, usaremos dados simulados
      // No projeto real, estes valores viriam da API
      const mockNutritionData: FoodData = {
        name: foodNames[0] || 'Alimento desconhecido',
        calories: 250,
        protein: 15,
        carbs: 30,
        fat: 8,
        quantity: 100 // gramas
      }
      
      setFoodData(mockNutritionData)
      setStep('results')
      
    } catch (err) {
      console.error('Erro ao buscar informações nutricionais:', err)
      setError('Não foi possível obter informações nutricionais deste alimento.')
      setStep('camera')
    }
  }

  // Adicionar refeição ao diário
  const addFoodToDiary = () => {
    if (!foodData) return
    
    // Criar ID único
    const mealId = `meal-${Date.now()}`
    const now = new Date()
    
    // Adicionar à lista de refeições
    dispatch({
      type: 'ADD_MEAL',
      payload: {
        id: mealId,
        food: {
          name: foodData.name,
          calories: foodData.calories,
          protein: foodData.protein,
          carbs: foodData.carbs,
          fat: foodData.fat
        },
        quantity: foodData.quantity,
        date: state.selectedDate,
        time: now.toTimeString().slice(0, 5)
      }
    })
    
    // Salvar imagem no Supabase e atualizar o registro
    if (photo) {
      // Implementar upload para Supabase
      // Esta funcionalidade será implementada posteriormente
    }
    
    // Redirecionar para dashboard
    router.push('/dashboard')
  }

  // Efeito para iniciar a câmera
  useEffect(() => {
    if (step === 'camera' && !isCameraReady) {
      startCamera()
    }
    
    // Cleanup ao desmontar
    return () => {
      stopCamera()
    }
  }, [step, isCameraReady, startCamera, stopCamera])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black text-white p-4 flex items-center z-10">
        <button 
          onClick={() => router.push('/dashboard')} 
          className="p-2 rounded-full hover:bg-gray-800"
        >
          {step === 'camera' ? <X className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
        </button>
        <h1 className="text-lg font-semibold mx-auto">
          {step === 'camera' ? 'Escanear Alimento' : 
           step === 'processing' ? 'Analisando...' : 
           'Resultado'}
        </h1>
        {step === 'results' && (
          <button 
            onClick={addFoodToDiary}
            className="p-2 rounded-full bg-green-500 hover:bg-green-600"
          >
            <Check className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {step === 'camera' && (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}

        {step === 'processing' && (
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p>Analisando alimento...</p>
            {isLoading && <p className="text-sm opacity-70 mt-2">Processando imagem</p>}
          </div>
        )}

        {step === 'results' && foodData && (
          <div className="text-white p-6 w-full max-w-md">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">{foodData.name}</h2>
              <p className="text-gray-300">Quantidade detectada: {foodData.quantity}g</p>
            </div>

            <div className="bg-white/10 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold mb-3">Informações Nutricionais</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold">{foodData.calories}</div>
                  <div className="text-sm opacity-70">Calorias</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{foodData.protein}g</div>
                  <div className="text-sm opacity-70">Proteína</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{foodData.carbs}g</div>
                  <div className="text-sm opacity-70">Carboidratos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{foodData.fat}g</div>
                  <div className="text-sm opacity-70">Gordura</div>
                </div>
              </div>
            </div>

            <button
              onClick={addFoodToDiary}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              Adicionar ao Diário
            </button>
          </div>
        )}

        {error && (
          <div className="absolute bottom-20 left-4 right-4 bg-red-500 text-white p-4 rounded-xl text-center">
            <p>{error}</p>
            <button
              onClick={() => {
                setError(null)
                setStep('camera')
              }}
              className="mt-2 text-white underline"
            >
              Tentar novamente
            </button>
          </div>
        )}
      </div>

      {/* Controles da câmera */}
      {step === 'camera' && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
          <div className="flex items-center gap-8">
            <button className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <RotateCw className="w-6 h-6 text-white" />
            </button>
            
            <button
              onClick={takePhoto}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
              disabled={!isCameraReady}
            >
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-600" />
              </div>
            </button>

            <button className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white rounded-full"></div>
            </button>
          </div>
        </div>
      )}

      {/* Instruções */}
      {step === 'camera' && (
        <div className="absolute bottom-32 left-4 right-4 text-center text-white z-10">
          <div className="bg-black/50 rounded-xl p-4">
            <p className="text-sm">
              {isCameraReady 
                ? 'Aponte a câmera para o alimento e toque no botão para capturar'
                : 'Aguardando acesso à câmera...'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  )
}