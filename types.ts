
export enum FitnessLevel {
  BEGINNER = 'Iniciante',
  INTERMEDIATE = 'Intermediário',
  ADVANCED = 'Avançado'
}

export enum ActivityLevel {
  SEDENTARY = 'Sedentário',
  LIGHTLY_ACTIVE = 'Levemente Ativo',
  MODERATELY_ACTIVE = 'Moderadamente Ativo',
  ACTIVE = 'Ativo'
}

export enum TrainingHistory {
  NEVER = 'Nunca treinou',
  PAST = 'Já treinou no passado',
  CURRENT = 'Treina atualmente'
}

export interface UserMeasurements {
  waist: number;
  hips: number;
  chest: number;
  arms: number;
  thighs: number;
  calves: number;
}

export interface Goal {
  type: string[];
  meta: string;
  days: number;
  numericGoal?: string;
  frequency?: number;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
}

export interface UserProfile {
  name: string;
  avatarSeed?: string;
  age: number;
  sex?: 'Masculino' | 'Feminino' | 'Outro';
  weight: number;
  height: number;
  targetWeight: number;
  idealWeight?: number;
  bodyFatPercentage?: number;
  leanMass?: number;
  measurements: UserMeasurements;
  ergonomics: {
    current: string;
    desired: string;
  };
  trainingStatus: {
    history: TrainingHistory;
    familiarity: string[];
  };
  activityLevel: ActivityLevel;
  fitnessLevel: FitnessLevel;
  goals: {
    shortTerm: Goal;
    mediumTerm: Goal;
    longTerm: Goal;
  };
  restrictions: {
    physical: string[];
    articular: string[];
    postural: string[];
    clinical: string[];
    alimentary: string[];
  };
  availability: {
    daysPerWeek: number;
    frequencyPerDay: number;
    maxSessionTime: number;
    locations: string[];
  };
  nutrition: {
    objective: string;
    preferences: string[];
    allergies: string[];
    mealsPerDay: number;
    budget: 'low' | 'medium' | 'high';
    foodAccess: string;
    dietaryRoutine: string;
  };
}

export interface Exercise {
  id: string;
  name: string;
  reps: string;
  sets: number;
  rest: string;
  description: string;
  muscleGroup: string;
  source: string;
  mediaUrl: string;
  kcalEstimate: number; // Gasto calórico estimado por execução completa
}

export interface WorkoutSession {
  id: string;
  date: string;
  dayName: string;
  totalKcal: number;
  totalFatLostGrams: number;
  completedExercises: number;
}

export interface MealOption {
  food: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  source: string;
}

export interface Meal {
  mealName: string;
  time: string;
  options: MealOption[];
}

export interface DailyPlan {
  day: string;
  workout: Exercise[];
  nutrition: Meal[];
}

export interface WeeklyPlan {
  weeklyPlan: DailyPlan[];
  summary: string;
  motivation: string;
  references: string[];
}

export interface AppState {
  profile: UserProfile | null;
  currentPlan: WeeklyPlan | null;
  history: WorkoutSession[];
  onboardingComplete: boolean;
}
