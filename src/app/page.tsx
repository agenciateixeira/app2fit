'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Smartphone, Monitor, Download, Zap, Camera, BarChart3 } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function HomePage() {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Detectar se é mobile
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor
      const isMobileDevice = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
      const isSmallScreen = window.innerWidth <= 768
      
      return isMobileDevice || isSmallScreen
    }

    setIsMobile(checkIfMobile())

    // Se for mobile, redirecionar para onboarding após 2 segundos
    if (checkIfMobile()) {
      const timer = setTimeout(() => {
        router.push('/onboarding')
      }, 2000)
      
      return () => clearTimeout(timer)
    }

    // Listener para prompt de instalação PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [router])

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setShowInstallPrompt(false)
      }
      
      setDeferredPrompt(null)
    }
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center px-6">
        <div className="text-center text-white">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-400 to-green-600 rounded-3xl flex items-center justify-center">
              <span className="text-4xl font-black">2F</span>
            </div>
            <h1 className="text-3xl font-black mb-2">
              <span className="text-[#00FF88]">2</span>Fit
            </h1>
            <p className="text-gray-300">Seu Coach Digital</p>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2 h-2 bg-[#00FF88] rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-[#00FF88] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-[#00FF88] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          
          <p className="text-sm text-gray-400">Redirecionando para o app...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">2F</span>
              </div>
              <span className="text-xl font-black">
                <span className="text-[#00FF88]">2</span>Fit
              </span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Recursos</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">Como Funciona</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Preços</a>
            </nav>

            <div className="flex items-center gap-4">
              {showInstallPrompt && (
                <button
                  onClick={handleInstallPWA}
                  className="flex items-center gap-2 bg-[#00FF88] text-black px-4 py-2 rounded-lg font-medium hover:bg-green-400 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Instalar App
                </button>
              )}
              
              <button
                onClick={() => router.push('/onboarding')}
                className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Começar Agora
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Monitor className="w-6 h-6 text-[#00FF88]" />
            <span className="text-sm font-medium text-gray-600">Versão Web - Acesse pelo mobile para melhor experiência</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            Sua transformação,{' '}
            <span className="text-[#00FF88]">simplificada</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Coach nutricional e fitness digital personalizado. Substitua consultorias caras por um acompanhamento inteligente que cabe no seu bolso.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              onClick={() => router.push('/onboarding')}
              className="bg-black text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-colors"
            >
              Começar Agora - R$ 29,90/mês
            </button>
            
            <div className="text-sm text-gray-500">
              7 dias grátis • Cancele quando quiser
            </div>
          </div>

          <div className="bg-gray-100 rounded-2xl p-8 mb-12">
            <h3 className="text-2xl font-bold mb-6">Acesse pelo mobile para a melhor experiência</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <Smartphone className="w-12 h-12 mx-auto mb-4 text-[#00FF88]" />
                <h4 className="font-semibold mb-2">Mobile (Recomendado)</h4>
                <p className="text-gray-600">Scanner de alimentos, câmera, notificações e melhor experiência</p>
              </div>
              <div className="text-center">
                <Monitor className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h4 className="font-semibold mb-2">Desktop</h4>
                <p className="text-gray-600">Funcionalidades limitadas, ideal para primeiros passos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-center mb-12">
            Tudo que você precisa em um só lugar
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#00FF88] rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Camera className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-4">Scanner de Alimentos</h3>
              <p className="text-gray-600">
                Aponte a câmera para qualquer alimento e nossa IA identifica automaticamente calorias e macros
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#00FF88] rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Zap className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-4">Planos Personalizados</h3>
              <p className="text-gray-600">
                Treinos e dietas criados especificamente para você baseados nos seus objetivos e rotina
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#00FF88] rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-4">Acompanhamento Inteligente</h3>
              <p className="text-gray-600">
                Ajustes automáticos baseados no seu progresso e feedback contínuo da nossa IA
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black mb-6">
            Um preço justo para resultados reais
          </h2>
          
          <div className="bg-white rounded-3xl p-8 shadow-xl border-4 border-[#00FF88]">
            <div className="mb-6">
              <div className="text-5xl font-black mb-2">R$ 29,90</div>
              <div className="text-gray-600">por mês</div>
            </div>
            
            <div className="text-left space-y-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-[#00FF88] rounded-full flex items-center justify-center">
                  <span className="text-black text-xs">✓</span>
                </div>
                <span>Scanner de alimentos com IA</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-[#00FF88] rounded-full flex items-center justify-center">
                  <span className="text-black text-xs">✓</span>
                </div>
                <span>Planos de treino personalizados</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-[#00FF88] rounded-full flex items-center justify-center">
                  <span className="text-black text-xs">✓</span>
                </div>
                <span>Dietas adaptadas aos seus objetivos</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-[#00FF88] rounded-full flex items-center justify-center">
                  <span className="text-black text-xs">✓</span>
                </div>
                <span>Acompanhamento de progresso</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-[#00FF88] rounded-full flex items-center justify-center">
                  <span className="text-black text-xs">✓</span>
                </div>
                <span>7 dias grátis para testar</span>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/onboarding')}
              className="w-full bg-black text-white py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-colors"
            >
              Começar Teste Grátis
            </button>
            
            <p className="text-sm text-gray-500 mt-4">
              Cancele quando quiser • Sem taxas escondidas
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#00FF88] rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">2F</span>
            </div>
            <span className="text-xl font-black">
              <span className="text-[#00FF88]">2</span>Fit
            </span>
          </div>
          
          <p className="text-gray-400 mb-6">
            Transformando vidas através da tecnologia
          </p>
          
          <div className="text-sm text-gray-500">
            © 2025 2Fit. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}