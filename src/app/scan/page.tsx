'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, X, Zap, Plus, Minus, AlertCircle, RefreshCw } from 'lucide-react'
import { useCamera } from '../hooks/useCamera'
import { useFoodScanner } from '../hooks/useFoodScanner'
import { useApp } from '../contexts/AppContext'

export default function FoodScannerPage() {
  const router = useRouter()
  const { state, dispatch } = useApp()
  const { status: cameraStatus, error: cameraError, videoRef, startCamera, stopCamera, capturePhoto } = useCamera()
  const { status: scanStatus, result, error: scanError, scanImage } = useFoodScanner()
  const [showResults, setShowResults] = useState(false)
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({})

  useEffect(() => {
    const initCamera = async () => {
      try {
        console.log('Iniciando câmera...')
        await startCamera()
      } catch (error) {
        console.error('Erro ao iniciar câmera:', error)
      }
    }
    
    initCamera()
    
    // Cleanup
    return () => {
      console.log('Parando câmera...')
      stopCamera()
    }
  }, [startCamera, stopCamera])

  const handleCapture = async () => {
    try {
      console.log('Tentando capturar foto...')
      
      if (cameraStatus !== 'active') {
        alert('Câmera não está ativa. Aguarde um momento.')
        return
      }

      if (!videoRef.current) {
        alert('Elemento de vídeo não encontrado.')
        return
      }
      
      const photo = await capturePhoto()
      console.log('Foto capturada:', photo)
      
      const scanResult = await scanImage(photo)
      console.log('Resultado do scan:', scanResult)
      
      // Inicializar quantidades com valores estimados
      const quantities: Record<string, number> = {}
      scanResult.foods.forEach(item => {
        quantities[item.food.id] = item.quantity
      })
      setSelectedQuantities(quantities)
      setShowResults(true)
    } catch (error) {
      console.error('Erro ao capturar/analisar:', error)
      alert('Erro ao processar imagem: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
    }
  }

  const handleSaveMeal = () => {
    if (!result) return

    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5)
    
    result.foods.forEach(item => {
      const quantity = selectedQuantities[item.food.id] || item.quantity
      
      dispatch({
        type: 'ADD_MEAL',
        payload: {
          id: `meal-${Date.now()}-${Math.random()}`,
          food: item.food,
          quantity,
          date: state.selectedDate,
          time: currentTime,
          meal_time: getMealType(currentTime)
        }
      })
    })

    router.push('/dashboard')
  }

  const getMealType = (time: string): 'breakfast' | 'lunch' | 'dinner' | 'snack' => {
    const hour = parseInt(time.split(':')[0])
    if (hour < 10) return 'breakfast'
    if (hour < 15) return 'lunch'
    if (hour < 19) return 'dinner'
    return 'snack'
  }

  const updateQuantity = (foodId: string, delta: number) => {
    setSelectedQuantities(prev => ({
      ...prev,
      [foodId]: Math.max(10, (prev[foodId] || 0) + delta)
    }))
  }

  const getTotalCalories = () => {
    if (!result) return 0
    return result.foods.reduce((sum, item) => {
      const quantity = selectedQuantities[item.food.id] || item.quantity
      return sum + (item.food.calories * quantity / 100)
    }, 0)
  }

  const handleRetryCamera = async () => {
    try {
      await startCamera()
    } catch (error) {
      console.error('Erro ao reiniciar câmera:', error)
    }
  }

  const handleScanAgain = () => {
    setShowResults(false)
    setSelectedQuantities({})
  }

  // Tela de resultados
  if (showResults && result) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <button 
            onClick={handleScanAgain}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Resultado do Scan</h1>
          <div className="w-10"></div>
        </div>

        <div className="p-6">
          {/* Total de Calorias */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-6 text-center">
            <div className="text-3xl font-bold text-black mb-2">
              {Math.round(getTotalCalories())}
            </div>
            <div className="text-gray-600">Calorias totais</div>
            <div className="text-sm text-gray-500 mt-2">
              {result.foods.length} item(ns) identificado(s)
            </div>
          </div>

          {/* Lista de Alimentos */}
          <div className="space-y-4 mb-8">
            {result.foods.map((item, index) => {
              const quantity = selectedQuantities[item.food.id] || item.quantity
              const calories = Math.round(item.food.calories * quantity / 100)
              const protein = Math.round(item.food.protein * quantity / 100)
              const carbs = Math.round(item.food.carbs * quantity / 100)
              const fat = Math.round(item.food.fat * quantity / 100)

              return (
                <div key={index} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-black">{item.food.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Confiança: {Math.round(item.confidence * 100)}%</span>
                        <span>•</span>
                        <span>{calories} kcal</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantidade */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Quantidade</span>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => updateQuantity(item.food.id, -10)}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium min-w-[50px] text-center">
                        {quantity}g
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.food.id, 10)}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Macros */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1"></div>
                      <div className="text-sm font-medium text-black">{protein}g</div>
                      <div className="text-xs text-gray-600">Proteína</div>
                    </div>
                    <div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-1"></div>
                      <div className="text-sm font-medium text-black">{carbs}g</div>
                      <div className="text-xs text-gray-600">Carbos</div>
                    </div>
                    <div>
                      <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1"></div>
                      <div className="text-sm font-medium text-black">{fat}g</div>
                      <div className="text-xs text-gray-600">Gordura</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Botões de Ação */}
          <div className="space-y-3">
            <button 
              onClick={handleSaveMeal}
              className="w-full bg-green-600 text-white py-4 rounded-2xl font-semibold hover:bg-green-700 transition-colors"
            >
              Salvar Refeição
            </button>
            <button 
              onClick={handleScanAgain}
              className="w-full border border-gray-300 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Escanear Novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 pt-12">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="text-white text-center">
          <div className="text-sm opacity-80">Scanner de Alimentos</div>
          <div className="text-xs opacity-60 mt-1">
            Status: {cameraStatus === 'active' ? 'Ativo' : 
                     cameraStatus === 'requesting' ? 'Iniciando...' :
                     cameraStatus === 'error' ? 'Erro' : 'Inativo'}
          </div>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Camera View */}
      <div className="absolute inset-0">
        {cameraStatus === 'active' ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <div className="text-center text-white max-w-sm mx-auto px-6">
              {cameraStatus === 'error' ? (
                <>
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
                  <div className="text-lg mb-2 text-red-300">Erro ao acessar câmera</div>
                  <div className="text-sm text-gray-400 mb-4">
                    {cameraError || 'Verifique as permissões do navegador'}
                  </div>
                  <button 
                    onClick={handleRetryCamera}
                    className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl text-white font-medium transition-colors flex items-center gap-2 mx-auto"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Tentar Novamente
                  </button>
                </>
              ) : (
                <>
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-60" />
                  <div className="text-lg mb-2">
                    {cameraStatus === 'requesting' ? 'Iniciando câmera...' : 'Câmera não disponível'}
                  </div>
                  {cameraStatus === 'requesting' && (
                    <div className="text-sm text-gray-400">
                      Aguarde ou permita o acesso à câmera
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay quando câmera ativa */}
      {cameraStatus === 'active' && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Overlay de escaneamento */}
          {scanStatus === 'scanning' && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-auto">
              <div className="text-center text-white">
                <Zap className="w-12 h-12 mx-auto mb-4 animate-pulse" />
                <div className="text-lg font-semibold mb-2">Analisando...</div>
                <div className="text-sm opacity-80">Nossa IA está identificando os alimentos</div>
                {scanError && (
                  <div className="text-red-300 text-sm mt-2 max-w-xs">
                    {scanError}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Frame de scan */}
          <div className="absolute inset-x-8 top-1/3 bottom-1/3">
            <div className="w-full h-full border-2 border-white rounded-3xl relative">
              <div className="absolute top-2 left-2 w-8 h-8 border-l-4 border-t-4 border-white rounded-tl-xl"></div>
              <div className="absolute top-2 right-2 w-8 h-8 border-r-4 border-t-4 border-white rounded-tr-xl"></div>
              <div className="absolute bottom-2 left-2 w-8 h-8 border-l-4 border-b-4 border-white rounded-bl-xl"></div>
              <div className="absolute bottom-2 right-2 w-8 h-8 border-r-4 border-b-4 border-white rounded-br-xl"></div>
              
              {scanStatus === 'scanning' && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="absolute bottom-32 left-0 right-0 px-8 z-10">
        <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 text-center text-white">
          <div className="text-sm mb-2">
            {scanStatus === 'scanning' ? 'Processando imagem...' :
             cameraStatus !== 'active' ? 'Aguardando câmera...' :
             'Posicione o prato dentro da área'}
          </div>
          <div className="text-xs opacity-70">
            {cameraStatus === 'active' ? 'Certifique-se de que a comida está bem iluminada' :
             'Permita o acesso à câmera para continuar'}
          </div>
        </div>
      </div>

      {/* Controles inferiores */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-8 z-10">
        <button className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white opacity-50">
          <div className="w-8 h-8 bg-white/30 rounded"></div>
        </button>

        <button 
          onClick={handleCapture}
          disabled={cameraStatus !== 'active' || scanStatus === 'scanning'}
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform active:scale-95"
        >
          {scanStatus === 'scanning' ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <div className="w-12 h-12 bg-green-600 rounded-full"></div>
            </div>
          )}
        </button>

        <button className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white opacity-50">
          <div className="w-6 h-6 border-2 border-current rounded-full relative">
            <div className="absolute top-1 right-1 w-2 h-2 bg-current rounded-full"></div>
          </div>
        </button>
      </div>
    </div>
  )
}