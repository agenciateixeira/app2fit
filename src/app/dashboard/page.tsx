'use client'

import { useState } from 'react'
import { Home, BarChart3, Settings, Plus, Camera, Flame, HelpCircle, ChevronRight } from 'lucide-react'
import { useApp } from '../contexts/AppContext'

// Componente CircularProgress
type CircularProgressProps = {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
}

const CircularProgress = ({ percentage, size = 100, strokeWidth = 8, color = "#00FF88" }: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#f3f4f6" strokeWidth={strokeWidth} fill="transparent" />
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          stroke={color} 
          strokeWidth={strokeWidth} 
          fill="transparent" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-gray-700">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { state, dispatch, utils } = useApp()
  const [currentTab, setCurrentTab] = useState('home')
  const [showActionModal, setShowActionModal] = useState(false)

  // Calcular dados do dia selecionado
  const { consumed, burned } = utils.getDayTotals(state.meals, state.exercises, state.selectedDate)
  const { bmi, category: bmiCategory } = utils.calculateBMI(state.user.currentWeight, state.user.height)
  const weekDays = utils.getWeekDays(state.selectedDate)

  // Calcular calorias restantes
  const remainingCalories = Math.max(0, state.user.dailyCalories - consumed.calories + burned)
  const remainingProtein = Math.max(0, state.user.dailyProtein - consumed.protein)
  const remainingCarbs = Math.max(0, state.user.dailyCarbs - consumed.carbs)
  const remainingFat = Math.max(0, state.user.dailyFat - consumed.fat)

  // Calcular streak (simplificado - dias com pelo menos 1 refeição)
  const calculateStreak = () => {
    const today = new Date(state.selectedDate)
    let streak = 0

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]

      const hasMeals = state.meals.some(meal => meal.date === dateStr)
      if (hasMeals) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  const streakCount = calculateStreak()

  // Mudança de data
  const handleDateChange = (date: string) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date })
  }

  // Modal de ações
  const ActionModal = () => (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowActionModal(false)} />

      <div className="fixed bottom-24 left-4 right-4 z-50 max-w-md mx-auto">
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => { 
              window.location.href = '/scan'
            }} 
            className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:bg-gray-50 transition-all duration-200 active:scale-95"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Camera className="w-6 h-6 text-black" />
              </div>
              <div className="text-sm font-medium text-black leading-tight">
                Escanear alimento
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              // Adicionar exercício rápido
              const now = new Date()
              dispatch({
                type: 'ADD_EXERCISE',
                payload: {
                  id: `ex-${Date.now()}`,
                  name: 'Caminhada',
                  duration: 30,
                  caloriesBurned: 150,
                  date: state.selectedDate,
                  time: now.toTimeString().slice(0, 5)
                }
              })
              setShowActionModal(false)
            }}
            className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:bg-gray-50 transition-all duration-200 active:scale-95"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <div className="text-2xl">👟</div>
              </div>
              <div className="text-sm font-medium text-black leading-tight">
                Registrar exercício
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setShowActionModal(false)
              window.location.href = '/saved-foods'
            }}
            className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:bg-gray-50 transition-all duration-200 active:scale-95"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <div className="w-6 h-6 bg-black rounded-sm"></div>
              </div>
              <div className="text-sm font-medium text-black leading-tight">
                Alimentos salvos
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              // Adicionar peso
              const weight = prompt('Novo peso (kg):', state.user.currentWeight.toString())
              if (weight) {
                dispatch({
                  type: 'ADD_WEIGHT_ENTRY',
                  payload: {
                    date: state.selectedDate,
                    weight: parseFloat(weight)
                  }
                })
              }
              setShowActionModal(false)
            }}
            className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:bg-gray-50 transition-all duration-200 active:scale-95"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <div className="text-2xl">⚖️</div>
              </div>
              <div className="text-sm font-medium text-black leading-tight">
                Registrar peso
              </div>
            </div>
          </button>
        </div>
      </div>
    </>
  )

  const HomeTab = () => {
    const todayMeals = state.meals.filter(meal => meal.date === state.selectedDate)

    return (
      <div className="pb-20">
        <div className="bg-white border-b border-gray-100 px-6 py-4 pt-12">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xl font-black text-black">
              🍎 <span className="text-[#00FF88]">2</span>Fit
            </div>
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold">{streakCount}</span>
            </div>
          </div>

          <div className="flex justify-between">
            {weekDays.map((day, index) => (
              <button
                key={index}
                onClick={() => handleDateChange(day.fullDate)}
                className="text-center"
              >
                <div className="text-xs text-gray-500 mb-1">{day.day}</div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  day.fullDate === state.selectedDate
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                  {day.date}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Card Principal de Calorias */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-black text-black mb-1">
                  {remainingCalories.toLocaleString('pt-BR')}
                </div>
                <div className="text-gray-600">Calorias restantes</div>
                <div className="text-sm text-gray-500 mt-1">
                  {Math.round(consumed.calories)} consumidas • {burned} queimadas
                </div>
              </div>
              <div className="relative">
                <CircularProgress 
                  percentage={(consumed.calories / state.user.dailyCalories) * 100} 
                  size={100} 
                  color="#00FF88" 
                />
              </div>
            </div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="text-center">
                <div className="text-lg font-bold text-black mb-1">{Math.round(remainingProtein)}g</div>
                <div className="text-xs text-gray-600 mb-3">Proteína restante</div>
                <CircularProgress 
                  percentage={(consumed.protein / state.user.dailyProtein) * 100} 
                  size={50} 
                  color="#EF4444" 
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="text-center">
                <div className="text-lg font-bold text-black mb-1">{Math.round(remainingCarbs)}g</div>
                <div className="text-xs text-gray-600 mb-3">Carbos restantes</div>
                <CircularProgress 
                  percentage={(consumed.carbs / state.user.dailyCarbs) * 100} 
                  size={50} 
                  color="#F97316" 
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="text-center">
                <div className="text-lg font-bold text-black mb-1">{Math.round(remainingFat)}g</div>
                <div className="text-xs text-gray-600 mb-3">Gordura restante</div>
                <CircularProgress 
                  percentage={(consumed.fat / state.user.dailyFat) * 100} 
                  size={50} 
                  color="#3B82F6" 
                />
              </div>
            </div>
          </div>

          {/* Refeições do Dia */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-black">Refeições</h3>
              <span className="text-sm text-gray-500">
                {new Date(state.selectedDate).toLocaleDateString('pt-BR')}
              </span>
            </div>
            
            {todayMeals.length > 0 ? (
              <div className="space-y-3">
                {todayMeals.map(meal => {
                  const calories = Math.round(meal.food.calories * meal.quantity / 100)
                  const protein = Math.round(meal.food.protein * meal.quantity / 100)
                  const carbs = Math.round(meal.food.carbs * meal.quantity / 100)
                  const fat = Math.round(meal.food.fat * meal.quantity / 100)
                  
                  return (
                    <div key={meal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-medium text-black">{meal.food.name}</div>
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                            {meal.quantity}g
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {meal.time} • {calories} kcal
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        P:{protein}g C:{carbs}g G:{fat}g
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="w-8 h-8 bg-green-200 rounded-full"></div>
                </div>
                <div className="text-gray-600 mb-2">Nenhuma refeição registrada</div>
                <div className="text-sm text-gray-500">Toque em + para adicionar</div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const ProgressTab = () => {
    return (
      <div className="pb-20">
        <div className="bg-white px-6 py-4 pt-12 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-black">Progresso</h1>
          <div className="text-sm text-gray-500">
            {new Date(state.selectedDate).toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Meu Peso</div>
                <div className="text-2xl font-bold text-black mb-2">{state.user.currentWeight} kg</div>
                <div className="text-xs text-gray-500 mb-3">Meta {state.user.targetWeight} kg</div>
                <button 
                  onClick={() => {
                    const weight = prompt('Novo peso (kg):', state.user.currentWeight.toString())
                    if (weight) {
                      dispatch({
                        type: 'ADD_WEIGHT_ENTRY',
                        payload: {
                          date: state.selectedDate,
                          weight: parseFloat(weight)
                        }
                      })
                    }
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Atualizar peso
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-2xl font-bold text-orange-500">{streakCount}</span>
                </div>
                <div className="text-sm text-orange-500 font-medium mb-2">Dias sequência</div>
                <div className="text-xs text-gray-500">Registros consecutivos</div>
              </div>
            </div>
          </div>

          {/* Histórico de Peso */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-black mb-4">Histórico de Peso</h3>
            
            <div className="h-32 relative border-l border-b border-gray-200">
              {state.weightHistory.map((entry, index) => {
                const x = (index / Math.max(state.weightHistory.length - 1, 1)) * 100
                const minWeight = Math.min(...state.weightHistory.map(e => e.weight))
                const maxWeight = Math.max(...state.weightHistory.map(e => e.weight))
                const y = ((entry.weight - minWeight) / Math.max(maxWeight - minWeight, 1)) * 60
                
                return (
                  <div
                    key={entry.date}
                    className="absolute w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1 -translate-y-1 cursor-pointer hover:bg-blue-600"
                    style={{
                      left: `${x}%`,
                      bottom: `${20 + y}%`
                    }}
                    title={`${entry.weight}kg - ${new Date(entry.date).toLocaleDateString('pt-BR')}`}
                  />
                )
              })}
              
              <div className="absolute left-2 bottom-2 text-xs text-gray-500">
                {state.weightHistory.length > 0 ? Math.min(...state.weightHistory.map(e => e.weight)) : 0}kg
              </div>
              <div className="absolute left-2 top-2 text-xs text-gray-500">
                {state.weightHistory.length > 0 ? Math.max(...state.weightHistory.map(e => e.weight)) : 0}kg
              </div>
            </div>
            
            {state.user.currentWeight > state.user.targetWeight && (
              <div className="mt-4 p-3 bg-green-50 rounded-xl">
                <div className="text-sm text-green-800">
                  Faltam {(state.user.currentWeight - state.user.targetWeight).toFixed(1)}kg para atingir sua meta!
                </div>
              </div>
            )}
          </div>

          {/* IMC */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-black">Seu IMC</h3>
                <HelpCircle className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-black">{bmi}</span>
                <span className="text-sm text-gray-600">Seu peso é</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  bmiCategory === 'Saudável' ? 'bg-green-500 text-white' :
                  bmiCategory === 'Sobrepeso' ? 'bg-yellow-500 text-white' :
                  bmiCategory === 'Obeso' ? 'bg-red-500 text-white' :
                  'bg-blue-500 text-white'
                }`}>
                  {bmiCategory}
                </span>
              </div>
              
              <div className="relative">
                <div className="w-full h-2 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-400 rounded-full"></div>
                <div 
                  className="absolute top-0 w-1 h-4 bg-black rounded"
                  style={{ 
                    left: `${Math.min(Math.max((bmi - 15) / 25 * 100, 0), 100)}%`, 
                    transform: 'translateY(-1px)' 
                  }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>&lt;18.5</span>
                <span>18.5-25</span>
                <span>25-30</span>
                <span>&gt;30</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const SettingsTab = () => (
    <div className="pb-20">
      <div className="bg-white px-6 py-4 pt-12 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-black">Configurações</h1>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{state.user.name.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <div className="text-lg font-medium text-black">{state.user.name}</div>
              <div className="text-sm text-gray-500">{state.user.age} anos • {state.user.height}cm</div>
            </div>
            <button 
              onClick={() => {
                const newName = prompt('Novo nome:', state.user.name)
                if (newName) {
                  dispatch({ 
                    type: 'SET_USER', 
                    payload: { name: newName } 
                  })
                }
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              ✏️
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-black mb-4">Metas Diárias</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-black">{state.user.dailyCalories}</div>
              <div className="text-sm text-gray-600">Calorias</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-black">{state.user.dailyProtein}g</div>
              <div className="text-sm text-gray-600">Proteína</div>
            </div>
          </div>
          <button 
            onClick={() => {
              const calories = prompt('Calorias diárias:', state.user.dailyCalories.toString())
              const protein = prompt('Proteína diária (g):', state.user.dailyProtein.toString())
              if (calories) {
                dispatch({
                  type: 'SET_USER',
                  payload: {
                    dailyCalories: parseInt(calories),
                    ...(protein && { dailyProtein: parseInt(protein) })
                  }
                })
              }
            }}
            className="w-full py-2 px-4 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200"
          >
            Editar metas
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-black mb-4">Dados Pessoais</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Altura</span>
              <span className="font-medium">{state.user.height} cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Peso atual</span>
              <span className="font-medium">{state.user.currentWeight} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Meta de peso</span>
              <span className="font-medium">{state.user.targetWeight} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">IMC</span>
              <span className="font-medium">{bmi}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-black mb-4">Estatísticas</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total de refeições</span>
              <span className="font-medium">{state.meals.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total de exercícios</span>
              <span className="font-medium">{state.exercises.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Registros de peso</span>
              <span className="font-medium">{state.weightHistory.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sequência atual</span>
              <span className="font-medium">{streakCount} dias</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 'home':
        return <HomeTab />
      case 'progress':
        return <ProgressTab />
      case 'settings':
        return <SettingsTab />
      default:
        return <HomeTab />
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col max-w-md mx-auto overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {renderCurrentTab()}
      </div>

      {/* Navegação Fixa */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 max-w-md mx-auto">
        <div className="px-6 py-2">
          <div className="flex items-center justify-around">
            <button
              onClick={() => setCurrentTab('home')}
              className={`flex flex-col items-center gap-1 py-2 px-4 ${
                currentTab === 'home' ? 'text-black' : 'text-gray-500'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">Início</span>
            </button>

            <button
              onClick={() => setCurrentTab('progress')}
              className={`flex flex-col items-center gap-1 py-2 px-4 ${
                currentTab === 'progress' ? 'text-black' : 'text-gray-500'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs">Progresso</span>
            </button>
            
            <button
              onClick={() => setCurrentTab('settings')}
              className={`flex flex-col items-center gap-1 py-2 px-4 ${
                currentTab === 'settings' ? 'text-black' : 'text-gray-500'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs">Configurações</span>
            </button>
          </div>
        </div>
      </div>

      {/* Botão de Ação Flutuante */}
      <button
        onClick={() => setShowActionModal(!showActionModal)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-black rounded-full shadow-lg flex items-center justify-center z-50 hover:scale-110 transition-transform max-w-md"
      >
        <Plus className={`w-6 h-6 text-white transition-transform duration-200 ${showActionModal ? 'rotate-45' : ''}`} />
      </button>

      {/* Modal de Ações */}
      {showActionModal && <ActionModal />}
    </div>
  )
}