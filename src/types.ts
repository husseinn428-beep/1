export interface Exercise {
  id: string;
  nameAr: string;
  nameEn: string;
  description: string;
  duration: number; // in seconds
  caloriesPerMin: number;
  animationType: 'jumping-jacks' | 'squats' | 'crunches' | 'russian-twist' | 'plank' | 'leg-raises' | 'cobra-stretch';
  steps: string[];
  tips: string[];
  muscleGroup: 'كامل الجسم' | 'عضلات البطن والخصر' | 'الجزء السفلي والفخذين' | 'الإطالات والاستشفاء';
  difficulty: 'مبتدئ' | 'متوسط' | 'متقدم';
  videoUrl?: string;
  mp4Url?: string;
}

export interface WorkoutDay {
  dayNumber: number;
  titleAr: string;
  titleEn: string;
  exercises: string[]; // array of exercise ids
  difficulty: 'مبتدئ' | 'متوسط' | 'متقدم';
  isRestDay: boolean;
  estimatedTime: number; // in minutes
  caloriesEstimate: number;
}

export interface UserStats {
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: 'ذكر' | 'أنثى';
  activityLevel: number; // TDEE multiplier
  goal: 'loss' | 'maintain' | 'gain'; // loss = تخسيس, maintain = محافظة, gain = تضخيم
  targetWeight?: number; // target weight in kg
  voiceGender?: 'male' | 'female'; // voice assistant coach gender
  onboarded?: boolean; // whether onboarding was completed
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  weightLogged?: number;
  waterCups: number; // each cup is 250ml
  caloriesBurned: number;
  caloriesEaten: number;
  completedExercisesCount: number;
  completedDays: number[]; // days completed in general
}

export interface JournalTask {
  id: string;
  text: string;
  completed: boolean;
}
