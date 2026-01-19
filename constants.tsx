
import React from 'react';
import { 
  Dumbbell, 
  Apple, 
  Calendar, 
  TrendingUp, 
  User,
  Layout,
  Library as LibraryIcon
} from 'lucide-react';
import { TrainingHistory, ActivityLevel, FitnessLevel, WeeklyPlan } from './types';

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Painel', icon: <Layout size={20} /> },
  { id: 'workout', label: 'Treino', icon: <Dumbbell size={20} /> },
  { id: 'nutrition', label: 'Nutrição', icon: <Apple size={20} /> },
  { id: 'library', label: 'Exercícios', icon: <LibraryIcon size={20} /> },
  { id: 'references', label: 'Fontes', icon: <LibraryIcon size={20} /> },
  { id: 'progress', label: 'Evolução', icon: <TrendingUp size={20} /> },
  { id: 'profile', label: 'Perfil', icon: <User size={20} /> },
];

export const INITIAL_PROFILE = {
  name: '',
  avatarSeed: 'Warrior',
  age: 25,
  sex: 'Masculino',
  weight: 70,
  height: 175,
  targetWeight: 65,
  idealWeight: 68,
  bodyFatPercentage: 15,
  leanMass: 60,
  activityLevel: ActivityLevel.SEDENTARY,
  fitnessLevel: FitnessLevel.BEGINNER,
  measurements: { waist: 0, hips: 0, chest: 0, arms: 0, thighs: 0, calves: 0 },
  ergonomics: { current: '', desired: '' },
  trainingStatus: {
    history: TrainingHistory.NEVER,
    familiarity: ['Calistenia']
  },
  goals: {
    shortTerm: { type: ['Emagrecimento'], meta: '', days: 30, numericGoal: '2kg', deadline: '', priority: 'high' },
    mediumTerm: { type: ['Condicionamento'], meta: '', days: 90, numericGoal: '5km', deadline: '', priority: 'medium' },
    longTerm: { type: ['Saúde'], meta: '', days: 365, numericGoal: 'Manutenção', deadline: '', priority: 'low' },
  },
  restrictions: {
    physical: [],
    articular: [],
    postural: [],
    clinical: [],
    alimentary: []
  },
  availability: { daysPerWeek: 3, frequencyPerDay: 1, maxSessionTime: 45, locations: ['Academia'] },
  nutrition: { 
    objective: 'Emagrecimento', 
    preferences: ['Carnes'], 
    allergies: [], 
    mealsPerDay: 4, 
    budget: 'medium',
    foodAccess: 'Fácil',
    dietaryRoutine: 'Regular'
  }
};

export const DEFAULT_PLAN: WeeklyPlan = {
  weeklyPlan: Array(7).fill(null).map((_, i) => ({
    day: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"][i],
    workout: [],
    nutrition: Array(4).fill(null).map((_, j) => ({
      mealName: ["Café da Manhã", "Almoço", "Lanche", "Jantar"][j],
      time: ["08:00", "12:00", "16:00", "20:00"][j],
      options: Array(4).fill(null).map(() => ({
        food: "Carregando sugestão...",
        portion: "100g",
        calories: 250,
        protein: 20,
        carbs: 30,
        fats: 5,
        source: "Nexus Base de Dados Científicos"
      }))
    }))
  })),
  summary: "Plano padrão aguardando sincronização científica via IA.",
  motivation: "Sincronize com Nexus IA para obter dados baseados em evidências bibliográficas.",
  references: [
    "World Health Organization (WHO) - Global recommendations on physical activity for health",
    "USDA FoodData Central - National Agricultural Library",
    "American College of Sports Medicine (ACSM) - Guidelines for Exercise Testing and Prescription"
  ]
};
