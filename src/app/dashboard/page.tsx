'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Zap, ChevronLeft, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface OnboardingData {
  [key: string]: string | number | string[]
}

interface Option {
  value?: string
  label: string
  sublabel?: string
  icon?: string
}

interface OnboardingStep {
  id: string
  title: string
  description: string | null
  options?: Option[]
  type: string
}

interface MockupScreen {
  id: string
  title: string
  content: React.ReactElement
}

export default function OnboardingFlow() {
  const router = useRouter()
  const { signUp, signIn, loading: authLoading } = useAuth()
  
  const [isVisible, setIsVisible] = useState(false)
  const [currentScreen, setCurrentScreen] = useState(0)
  const [currentStep, setCurrentStep] = useState(-2) // Start with auth screen
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({})
  const [showPassword, setShowPassword] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const [authData, setAuthData] = useState({ email: '', password: '' })
  const [authError, setAuthError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const mockupScreens: MockupScreen[] = [
    {
      id: 'camera',
      title: 'Scanner de comida',
      content: (
        <div className="h-full bg-gradient-to-b from-yellow-200 to-orange-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
            <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 text-white">✕</div>
            </button>
            <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 text-white">⚙</div>
            </button>
          </div>
          
          <div className="absolute inset-x-8 top-1/3 bottom-1/3 border-2 border-white rounded-xl">
            <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-white rounded-tl-lg"></div>
            <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-white rounded-tr-lg"></div>
            <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-white rounded-bl-lg"></div>
            <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-white rounded-br-lg"></div>
          </div>
          
          <div className="absolute bottom-8 left-4 right-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-gray-700" />
                <span className="text-gray-700 font-medium">Scan Food</span>
              </div>
            </div>
            
            <div className="flex justify-center items-center gap-8">
              <button className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </button>
              <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <div className="w-12 h-12 bg-gray-100 rounded-full"></div>
              </button>
              <button className="w-10 h-10 bg-white/30 rounded-full"></button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: 'Dashboard principal',
      content: (
        <div className="p-6 bg-gray-50 h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="text-lg font-bold text-black">🍎 2Fit</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 mb-6">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-black">2199</div>
              <div className="text-sm text-gray-600">Calorias restantes</div>
              <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mt-2 flex items-center justify-center">
                <div className="w-6 h-6 text-gray-500">🔥</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-black">161g</div>
                <div className="text-xs text-gray-600">Proteína</div>
                <div className="w-8 h-8 mx-auto mt-1 bg-red-100 rounded-full"></div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-black">251g</div>
                <div className="text-xs text-gray-600">Carbos</div>
                <div className="w-8 h-8 mx-auto mt-1 bg-orange-100 rounded-full"></div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-black">61g</div>
                <div className="text-xs text-gray-600">Gordura</div>
                <div className="w-8 h-8 mx-auto mt-1 bg-blue-100 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'progress',
      title: 'Acompanhamento',
      content: (
        <div className="p-6 bg-gray-50 h-full">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-black mb-2">Seu Progresso</h2>
            <div className="text-3xl font-bold text-black">-2.4 kg</div>
            <div className="text-sm text-gray-600">nas últimas 4 semanas</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Meta Semanal</span>
              <span className="text-sm text-green-600">No prazo</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-black">7</div>
              <div className="text-xs text-gray-600">dias consecutivos</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-black">24.2</div>
              <div className="text-xs text-gray-600">IMC atual</div>
            </div>
          </div>
        </div>
      )
    }
  ]

  useEffect(() => {
    setIsVisible(true)
    
    // Auto-advance mockup screens only on welcome screen
    if (currentStep === -1) {
      const interval = setInterval(() => {
        setCurrentScreen((prev) => (prev + 1) % mockupScreens.length)
      }, 3000)
      
      return () => clearInterval(interval)
    }
  }, [currentStep, mockupScreens.length])

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'gender',
      title: 'Escolha seu gênero',
      description: 'Isso será usado para calibrar seu plano personalizado',
      options: [
        { value: 'male', label: 'Masculino' },
        { value: 'female', label: 'Feminino' },
        { value: 'other', label: 'Outro' }
      ],
      type: 'single'
    },
    {
      id: 'age_height_weight',
      title: 'Seus dados pessoais',
      description: 'Precisamos dessas informações para calcular suas metas',
      type: 'personal_data'
    },
    {
      id: 'target_weight',
      title: 'Qual é o seu peso desejado?',
      description: null,
      type: 'weight-slider'
    },
    {
      id: 'workouts_per_week',
      title: 'Quantos treinos você faz por semana?',
      description: 'Isso será usado para calibrar seu plano personalizado',
      options: [
        { value: '0-2', label: '0-2', sublabel: 'Treinos ocasionais' },
        { value: '3-5', label: '3-5', sublabel: 'Alguns treinos por semana' },
        { value: '6+', label: '6+', sublabel: 'Atleta dedicado' }
      ],
      type: 'single'
    },
    {
      id: 'goal',
      title: 'Qual é o seu objetivo principal?',
      description: null,
      options: [
        { value: 'lose_weight', label: 'Perder peso', icon: '📉' },
        { value: 'maintain_weight', label: 'Manter peso', icon: '⚖️' },
        { value: 'gain_weight', label: 'Ganhar peso', icon: '📈' }
      ],
      type: 'single'
    },
    {
      id: 'activity_level',
      title: 'Como você descreveria seu nível de atividade?',
      description: null,
      options: [
        { value: 'sedentary', label: 'Sedentário', sublabel: 'Pouco ou nenhum exercício' },
        { value: 'lightly_active', label: 'Levemente ativo', sublabel: 'Exercício leve 1-3 dias/semana' },
        { value: 'moderately_active', label: 'Moderadamente ativo', sublabel: 'Exercício moderado 3-5 dias/semana' },
        { value: 'very_active', label: 'Muito ativo', sublabel: 'Exercício intenso 6-7 dias/semana' }
      ],
      type: 'single'
    },
    {
      id: 'obstacles',
      title: 'O que está impedindo você de alcançar seus objetivos?',
      description: null,
      options: [
        { icon: '📊', label: 'Falta de consistência' },
        { icon: '🍔', label: 'Hábitos alimentares não saudáveis' },
        { icon: '🤝', label: 'Falta de suporte' },
        { icon: '📅', label: 'Agenda cheia' },
        { icon: '💡', label: 'Falta de inspiração para refeições' }
      ],
      type: 'multi-select'
    },
    {
      id: 'diet_type',
      title: 'Você segue uma dieta específica?',
      description: null,
      options: [
        { value: 'classic', icon: '🍗', label: 'Clássico' },
        { value: 'pescetarian', icon: '🐟', label: 'Pescetariano' },
        { value: 'vegetarian', icon: '🍎', label: 'Vegetariano' },
        { value: 'vegan', icon: '🥬', label: 'Vegano' }
      ],
      type: 'single'
    }
  ]

  const handleAuth = async () => {
    if (!authData.email || !authData.password) {
      setAuthError('Por favor, preencha todos os campos.')
      return
    }
    setIsSubmitting(true)
    setAuthError(null)
    try {
      let result
      if (authMode === 'register') {
        result = await signUp(authData.email, authData.password)
      } else {
        result = await signIn(authData.email, authData.password)
      }
      if (result.error) {
        setAuthError(result.error.message || 'Erro desconhecido')
      } else {
        setCurrentStep(0) // Avançar para o próximo passo do onboarding
      }
    } catch (_error) {
      setAuthError('Erro ao conectar. Tente novamente.')
    }
    setIsSubmitting(false)
  }

  const handleNext = () => {
    if (currentStep === -2) {
      setCurrentStep(-1)
    } else if (currentStep === -1) {
      setCurrentStep(0)
    } else if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else if (currentStep === 0) {
      setCurrentStep(-1)
    } else if (currentStep === -1) {
      setCurrentStep(-2)
    }
  }

  const handleOptionSelect = (stepId: string, value: string) => {
    setOnboardingData(prev => ({
      ...prev,
      [stepId]: value
    }))
  }

  const handleMultiSelect = (stepId: string, value: string) => {
    setOnboardingData(prev => {
      const current = (prev[stepId] as string[]) || []
      if (current.includes(value)) {
        // Remover valor se já estiver selecionado
        return {
          ...prev,
          [stepId]: current.filter((item: string) => item !== value)
        }
      } else {
        // Adicionar valor se não estiver selecionado
        return {
          ...prev,
          [stepId]: [...current, value]
        }
      }
    })
  }

  const handlePersonalDataChange = (field: string, value: number) => {
    setOnboardingData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = () => {
    // Aqui você enviaria os dados para o backend ou supabase
    console.log('Onboarding completo:', onboardingData)
    router.push('/dashboard') // Redirecionar para o dashboard principal
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      <div className="flex items-center p-4 border-b">
        <h1 className="text-lg font-semibold">Onboarding</h1>
        <button className="ml-auto text-gray-500" onClick={() => setIsVisible(false)}>
          Fechar
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        {/* Tela de autenticação */}
        {currentStep === -2 && (
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {authMode === 'register' ? 'Criar Conta' : 'Entrar'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={authData.email}
                  onChange={(e) => setAuthData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="seu@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={authData.password}
                    onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>
              
              {authError && (
                <div className="text-red-500 text-sm">{authError}</div>
              )}
              
              <button
                onClick={handleAuth}
                disabled={isSubmitting || authLoading}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting || authLoading ? 'Carregando...' : authMode === 'register' ? 'Criar Conta' : 'Entrar'}
              </button>
              
              <div className="text-center">
                <button
                  onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
                  className="text-blue-600 hover:underline"
                >
                  {authMode === 'register' ? 'Já tem uma conta? Entrar' : 'Não tem conta? Criar uma'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tela de boas-vindas */}
        {currentStep === -1 && (
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Bem-vindo ao 2Fit! 🎉</h2>
            <p className="text-gray-600 mb-8">
              Vamos personalizar sua experiência para que você alcance seus objetivos de forma mais eficiente.
            </p>
            
            {/* Mockup screens carousel */}
            <div className="h-96 bg-gray-100 rounded-xl mb-6 overflow-hidden">
              {mockupScreens[currentScreen].content}
            </div>
            
            <div className="flex justify-center space-x-2 mb-8">
              {mockupScreens.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentScreen ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Passos do onboarding */}
        {currentStep >= 0 && currentStep < onboardingSteps.length && (
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">
                  Passo {currentStep + 1} de {onboardingSteps.length}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
                />
              </div>
            </div>

            {(() => {
              const step = onboardingSteps[currentStep]
              return (
                <div>
                  <h2 className="text-xl font-bold mb-2">{step.title}</h2>
                  {step.description && (
                    <p className="text-gray-600 mb-6">{step.description}</p>
                  )}

                  {step.type === 'single' && step.options && (
                    <div className="space-y-3">
                      {step.options.map((option) => (
                        <button
                          key={option.value || option.label}
                          onClick={() => handleOptionSelect(step.id, option.value || option.label)}
                          className={`w-full p-4 border rounded-lg text-left hover:bg-gray-50 ${
                            onboardingData[step.id] === (option.value || option.label)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center">
                            {option.icon && <span className="text-2xl mr-3">{option.icon}</span>}
                            <div>
                              <div className="font-medium">{option.label}</div>
                              {option.sublabel && (
                                <div className="text-sm text-gray-500">{option.sublabel}</div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {step.type === 'multi-select' && step.options && (
                    <div className="space-y-3">
                      {step.options.map((option) => (
                        <button
                          key={option.label}
                          onClick={() => handleMultiSelect(step.id, option.label)}
                          className={`w-full p-4 border rounded-lg text-left hover:bg-gray-50 ${
                            ((onboardingData[step.id] as string[]) || []).includes(option.label)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center">
                            {option.icon && <span className="text-2xl mr-3">{option.icon}</span>}
                            <div className="font-medium">{option.label}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {step.type === 'personal_data' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Idade</label>
                        <input
                          type="number"
                          min="16"
                          max="100"
                          value={(onboardingData.age as number) || ''}
                          onChange={(e) => handlePersonalDataChange('age', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="25"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Altura (cm)</label>
                        <input
                          type="number"
                          min="100"
                          max="250"
                          value={(onboardingData.height as number) || ''}
                          onChange={(e) => handlePersonalDataChange('height', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="170"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Peso atual (kg)</label>
                        <input
                          type="number"
                          min="30"
                          max="300"
                          step="0.1"
                          value={(onboardingData.weight as number) || ''}
                          onChange={(e) => handlePersonalDataChange('weight', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="70.0"
                        />
                      </div>
                    </div>
                  )}

                  {step.type === 'weight-slider' && (
                    <div>
                      <div className="text-center mb-6">
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                          {(onboardingData.target_weight as number) || (onboardingData.weight as number) || 70} kg
                        </div>
                        <div className="text-gray-500">Peso desejado</div>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="150"
                        step="0.5"
                        value={(onboardingData.target_weight as number) || (onboardingData.weight as number) || 70}
                        onChange={(e) => handlePersonalDataChange('target_weight', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-2">
                        <span>40 kg</span>
                        <span>150 kg</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      {(currentStep >= -1) && (
        <div className="flex items-center justify-between p-4 border-t">
          {currentStep > -1 ? (
            <button 
              className="flex items-center text-gray-500 hover:text-gray-700" 
              onClick={handleBack}
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Voltar
            </button>
          ) : (
            <div></div>
          )}
          
          {currentStep < onboardingSteps.length - 1 || currentStep === -1 ? (
            <button 
              className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700" 
              onClick={handleNext}
            >
              {currentStep === -1 ? 'Começar' : 'Próximo'}
              <ChevronLeft className="w-5 h-5 ml-1 rotate-180" />
            </button>
          ) : (
            <button 
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 font-semibold" 
              onClick={handleSubmit}
            >
              Concluir
            </button>
          )}
        </div>
      )}
    </div>
  )
}