'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { SupabaseClient, createClient } from '@supabase/supabase-js'

// Tipos
export type Meal = {
  id: string;
  food: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  quantity: number;
  date: string;
  time: string;
  meal_time?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  photo_url?: string;
};

export type Exercise = {
  id: string;
  name: string;
  duration: number;
  caloriesBurned: number;
  date: string;
  time: string;
};

export type WeightEntry = {
  date: string;
  weight: number;
};

export type UserProfile = {
  name: string;
  email: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  height: number;
  currentWeight: number;
  targetWeight: number;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  goal: 'lose_weight' | 'maintain_weight' | 'gain_weight';
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  dietType: 'classic' | 'pescetarian' | 'vegetarian' | 'vegan';
  workoutsPerWeek: string;
  obstacles?: string[];
};

export type AppState = {
  user: UserProfile;
  meals: Meal[];
  exercises: Exercise[];
  weightHistory: WeightEntry[];
  selectedDate: string;
  isAuthenticated: boolean;
  isLoading: boolean;
};

type Action =
  | { type: 'SET_USER'; payload: Partial<UserProfile> }
  | { type: 'ADD_MEAL'; payload: Meal }
  | { type: 'UPDATE_MEAL'; payload: { id: string; updates: Partial<Meal> } }
  | { type: 'DELETE_MEAL'; payload: string }
  | { type: 'ADD_EXERCISE'; payload: Exercise }
  | { type: 'DELETE_EXERCISE'; payload: string }
  | { type: 'ADD_WEIGHT_ENTRY'; payload: WeightEntry }
  | { type: 'SET_SELECTED_DATE'; payload: string }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_USER_DATA'; payload: Partial<AppState> };

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Estado inicial
const initialState: AppState = {
  user: {
    name: 'Usuário',
    email: '',
    gender: 'male',
    age: 25,
    height: 170,
    currentWeight: 70,
    targetWeight: 65,
    dailyCalories: 2500,
    dailyProtein: 160,
    dailyCarbs: 300,
    dailyFat: 70,
    goal: 'lose_weight',
    activityLevel: 'moderately_active',
    dietType: 'classic',
    workoutsPerWeek: '3-5'
  },
  meals: [],
  exercises: [],
  weightHistory: [],
  selectedDate: new Date().toISOString().split('T')[0],
  isAuthenticated: false,
  isLoading: true
};

// Reducer
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload
        }
      };
    case 'ADD_MEAL':
      return {
        ...state,
        meals: [...state.meals, action.payload]
      };
    case 'UPDATE_MEAL':
      return {
        ...state,
        meals: state.meals.map(meal => 
          meal.id === action.payload.id ? { ...meal, ...action.payload.updates } : meal
        )
      };
    case 'DELETE_MEAL':
      return {
        ...state,
        meals: state.meals.filter(meal => meal.id !== action.payload)
      };
    case 'ADD_EXERCISE':
      return {
        ...state,
        exercises: [...state.exercises, action.payload]
      };
    case 'DELETE_EXERCISE':
      return {
        ...state,
        exercises: state.exercises.filter(exercise => exercise.id !== action.payload)
      };
    case 'ADD_WEIGHT_ENTRY':
      const existingEntryIndex = state.weightHistory.findIndex(
        entry => entry.date === action.payload.date
      );
      
      if (existingEntryIndex >= 0) {
        const newHistory = [...state.weightHistory];
        newHistory[existingEntryIndex] = action.payload;
        
        const isLatestEntry = new Date(action.payload.date).getTime() >= 
          Math.max(...state.weightHistory.map(e => new Date(e.date).getTime()));
        
        return {
          ...state,
          weightHistory: newHistory,
          user: isLatestEntry ? 
            { ...state.user, currentWeight: action.payload.weight } : 
            state.user
        };
      } else {
        const newHistory = [...state.weightHistory, action.payload].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        const isLatestEntry = new Date(action.payload.date).getTime() >= 
          Math.max(...newHistory.map(e => new Date(e.date).getTime()));
        
        return {
          ...state,
          weightHistory: newHistory,
          user: isLatestEntry ? 
            { ...state.user, currentWeight: action.payload.weight } : 
            state.user
        };
      }
    case 'SET_SELECTED_DATE':
      return {
        ...state,
        selectedDate: action.payload
      };
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'LOAD_USER_DATA':
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
};

// Utilitários
const utils = {
  calculateBMI: (weight: number, height: number) => {
    const heightInMeters = height / 100;
    const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
    
    let category = 'Normal';
    if (bmi < 18.5) category = 'Abaixo do peso';
    else if (bmi < 25) category = 'Saudável';
    else if (bmi < 30) category = 'Sobrepeso';
    else category = 'Obeso';
    
    return { bmi, category };
  },
  
  getWeekDays: (date: string) => {
    const result = [];
    const currentDate = new Date(date);
    const day = currentDate.getDay();
    
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - day);
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      
      const dayOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][i];
      const dayDate = d.getDate().toString();
      const fullDate = d.toISOString().split('T')[0];
      
      result.push({ day: dayOfWeek, date: dayDate, fullDate });
    }
    
    return result;
  },
  
  getDayTotals: (meals: Meal[], exercises: Exercise[], date: string) => {
    const dayMeals = meals.filter(meal => meal.date === date);
    
    const totalConsumed = dayMeals.reduce(
      (total, meal) => {
        const caloriesFactor = meal.quantity / 100;
        return {
          calories: total.calories + (meal.food.calories * caloriesFactor),
          protein: total.protein + (meal.food.protein * caloriesFactor),
          carbs: total.carbs + (meal.food.carbs * caloriesFactor),
          fat: total.fat + (meal.food.fat * caloriesFactor)
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    
    const dayExercises = exercises.filter(exercise => exercise.date === date);
    const totalBurned = dayExercises.reduce(
      (total, exercise) => total + exercise.caloriesBurned, 0
    );
    
    return {
      consumed: totalConsumed,
      burned: totalBurned
    };
  },
  
  saveToSupabase: async (data: any, table: string) => {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .upsert(data)
        .select();
        
      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Erro ao salvar no Supabase:', error);
      throw error;
    }
  },
  
  fetchFromSupabase: async (table: string) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*');
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar do Supabase:', error);
      throw error;
    }
  }
};

// Contexto
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  supabase: SupabaseClient;
  utils: typeof utils;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          dispatch({ type: 'SET_AUTHENTICATED', payload: true });
          
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
              
            if (profileError) {
              console.error('Erro ao buscar perfil:', profileError);
            } else if (profileData) {
              try {
                const { data: weightData } = await supabase
                  .from('body_measurements')
                  .select('measurement_date, weight')
                  .eq('user_id', session.user.id)
                  .order('measurement_date', { ascending: true });
                
                const { data: mealData } = await supabase
                  .from('meal_entries')
                  .select('*')
                  .eq('user_id', session.user.id);
                
                const weightHistory: WeightEntry[] = weightData?.map(entry => ({
                  date: entry.measurement_date,
                  weight: entry.weight
                })) || [];
                
                const meals: Meal[] = mealData?.map(meal => ({
                  id: meal.id,
                  food: {
                    name: meal.food_name,
                    calories: meal.calories_per_100g,
                    protein: meal.protein_per_100g,
                    carbs: meal.carbs_per_100g,
                    fat: meal.fat_per_100g
                  },
                  quantity: meal.quantity,
                  date: meal.entry_date,
                  time: meal.created_at ? meal.created_at.split('T')[1].substring(0, 5) : '12:00',
                  meal_time: meal.meal_time,
                  photo_url: meal.photo_url
                })) || [];
                
                dispatch({
                  type: 'LOAD_USER_DATA',
                  payload: {
                    user: {
                      name: profileData.name || 'Usuário',
                      email: profileData.email || '',
                      gender: profileData.gender || 'male',
                      age: profileData.age || 25,
                      height: profileData.height || 170,
                      currentWeight: profileData.current_weight || 70,
                      targetWeight: profileData.target_weight || 65,
                      dailyCalories: 2500,
                      dailyProtein: 160,
                      dailyCarbs: 300,
                      dailyFat: 70,
                      goal: profileData.goal || 'lose_weight',
                      activityLevel: profileData.activity_level || 'moderately_active',
                      dietType: profileData.diet_type || 'classic',
                      workoutsPerWeek: profileData.workouts_per_week || '3-5',
                      obstacles: profileData.obstacles || []
                    },
                    weightHistory,
                    meals,
                    exercises: [],
                    selectedDate: new Date().toISOString().split('T')[0],
                    isAuthenticated: true,
                    isLoading: false
                  }
                });
              } catch (dataError) {
                console.error('Erro ao buscar dados:', dataError);
                dispatch({ type: 'SET_LOADING', payload: false });
              }
            } else {
              dispatch({ type: 'SET_LOADING', payload: false });
            }
          } catch (profileError) {
            console.error('Erro ao buscar perfil:', profileError);
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    loadUserData();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'SET_AUTHENTICATED', payload: false });
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return (
    <AppContext.Provider value={{ state, dispatch, supabase, utils }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};