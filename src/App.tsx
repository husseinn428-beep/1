import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, 
  Calculator, 
  BookOpen, 
  CalendarDays, 
  Flame, 
  Clock, 
  CheckCircle2, 
  ChevronLeft, 
  AlertCircle, 
  User, 
  Award,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Menu,
  X,
  Sun,
  Moon,
  Star,
  Shield,
  MessageSquare,
  Instagram,
  Send,
  Heart,
  ExternalLink,
  MessageCircle,
  ThumbsUp
} from 'lucide-react';

import { UserStats, DailyLog, JournalTask, WorkoutDay } from './types';
import { WORKOUT_DAYS_DB } from './data/workoutDays';
import { EXERCISES_DB } from './data/exercises';
import { ExerciseModel } from './components/ExerciseModel';
import { CalorieCalculator } from './components/CalorieCalculator';
import { DailyJournal } from './components/DailyJournal';
import { ExerciseEncyclopedia } from './components/ExerciseEncyclopedia';
import { WorkoutPlayer } from './components/WorkoutPlayer';
import { OnboardingWizard } from './components/OnboardingWizard';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'workout' | 'calculator' | 'journal' | 'encyclopedia'>('workout');
  
  // Immersive active day state
  const [activePlayingDay, setActivePlayingDay] = useState<WorkoutDay | null>(null);
  
  // Selected day for the list preview drawer/modal
  const [selectedDayPreview, setSelectedDayPreview] = useState<WorkoutDay | null>(null);

  // Scroll Container Ref to handle auto-scrolling to top on tab switch
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // --- DARK MODE STATE (Synchronized with localStorage) ---
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('rashaka_theme');
      return stored !== 'light'; // Default to dark mode if not explicitly set to light
    } catch {
      return true;
    }
  });

  // --- ADMOB SAFE AREA STATE (Optimizes layout for AppCreator24 / Google AdMob banners) ---
  const [adMobSafeArea, setAdMobSafeArea] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('rashaka_admob_safe_area');
      return stored !== 'false'; // Default to true for ready-to-go AdMob integration
    } catch {
      return true;
    }
  });

  // Synchronize state with URL Hash for high-value AdMob Interstitial triggers in AppCreator24
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;

      if (hash.startsWith('player/')) {
        const dayNum = parseInt(hash.replace('player/', ''), 10);
        const matchedDay = WORKOUT_DAYS_DB.find(d => d.dayNumber === dayNum);
        if (matchedDay) {
          // Force active speaking synthesis reset & unlock
          try {
            if ('speechSynthesis' in window) {
              window.speechSynthesis.resume();
            }
          } catch (e) {}
          setActivePlayingDay(matchedDay);
        }
      } else if (['workout', 'calculator', 'journal', 'encyclopedia'].includes(hash)) {
        setActivePlayingDay(null);
        setCurrentTab(hash as any);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Initial parse of the hash
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
      handleHashChange();
    } else {
      window.location.hash = currentTab;
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync state changes back to URL Hash to notify AppCreator24's webview of a page transition
  useEffect(() => {
    if (activePlayingDay) {
      const targetHash = `#player/${activePlayingDay.dayNumber}`;
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
    } else {
      const targetHash = `#${currentTab}`;
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
    }
  }, [currentTab, activePlayingDay]);

  // --- HAMBURGER MENU & COMPLIANCE MODALS STATE ---
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [complianceModal, setComplianceModal] = useState<'rate' | 'privacy' | 'social' | null>(null);

  // --- RATE APP CUSTOM FORM STATE ---
  const [userRating, setUserRating] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [ratingSuccess, setRatingSuccess] = useState<boolean>(false);

  // --- CORE STATE (Persisted in LocalStorage) ---
  const [completedDays, setCompletedDays] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('rashaka_completed_days');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>(() => {
    try {
      const stored = localStorage.getItem('rashaka_daily_logs');
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });

  const [journalTasks, setJournalTasks] = useState<JournalTask[]>(() => {
    try {
      const stored = localStorage.getItem('rashaka_journal_tasks');
      return stored ? JSON.parse(stored) : [
        { id: '1', text: 'شرب كوب ماء فور الاستيقاظ', completed: false },
        { id: '2', text: 'أداء تمرين اليوم بنجاح في التطبيق', completed: false },
        { id: '3', text: 'الابتعاد التام عن السكر والوجبات السريعة اليوم', completed: false },
        { id: '4', text: 'المشي لمدة 15 دقيقة بعد وجبة الغداء', completed: false }
      ];
    } catch { return []; }
  });

  const [userStats, setUserStats] = useState<UserStats>(() => {
    try {
      const stored = localStorage.getItem('rashaka_user_stats');
      return stored ? JSON.parse(stored) : {
        weight: 70,
        height: 168,
        age: 26,
        gender: 'أنثى',
        activityLevel: 1.375,
        goal: 'loss',
        onboarded: false
      };
    } catch {
      return {
        weight: 70,
        height: 168,
        age: 26,
        gender: 'أنثى',
        activityLevel: 1.375,
        goal: 'loss',
        onboarded: false
      };
    }
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Safe getter for today's log to prevent schema compatibility crashes from localStorage
  const getTodayLog = (): DailyLog => {
    const existing = dailyLogs[todayStr];
    return {
      date: todayStr,
      waterCups: existing?.waterCups ?? 0,
      caloriesBurned: existing?.caloriesBurned ?? 0,
      caloriesEaten: existing?.caloriesEaten ?? 0,
      completedExercisesCount: existing?.completedExercisesCount ?? 0,
      completedDays: existing?.completedDays ?? [],
      weightLogged: existing?.weightLogged
    };
  };

  // --- LOCAL STORAGE LOAD ---
  useEffect(() => {
    try {
      const storedCompleted = localStorage.getItem('rashaka_completed_days');
      if (storedCompleted) setCompletedDays(JSON.parse(storedCompleted));

      const storedLogs = localStorage.getItem('rashaka_daily_logs');
      if (storedLogs) setDailyLogs(JSON.parse(storedLogs));

      const storedStats = localStorage.getItem('rashaka_user_stats');
      if (storedStats) setUserStats(JSON.parse(storedStats));

      const storedTasks = localStorage.getItem('rashaka_journal_tasks');
      if (storedTasks) {
        setJournalTasks(JSON.parse(storedTasks));
      } else {
        const defaultTasks: JournalTask[] = [
          { id: '1', text: 'شرب كوب ماء فور الاستيقاظ', completed: false },
          { id: '2', text: 'أداء تمرين اليوم بنجاح في التطبيق', completed: false },
          { id: '3', text: 'الابتعاد التام عن السكر والوجبات السريعة اليوم', completed: false },
          { id: '4', text: 'المشي لمدة 15 دقيقة بعد وجبة الغداء', completed: false }
        ];
        setJournalTasks(defaultTasks);
        localStorage.setItem('rashaka_journal_tasks', JSON.stringify(defaultTasks));
      }
    } catch (e) {
      console.error('Error loading LocalStorage', e);
    }
  }, []);

  // --- STATE PERSISTENCE HELPERS ---
  const saveCompletedDays = (newCompleted: number[]) => {
    setCompletedDays(newCompleted);
    localStorage.setItem('rashaka_completed_days', JSON.stringify(newCompleted));
  };

  const saveDailyLogs = (newLogs: Record<string, DailyLog>) => {
    setDailyLogs(newLogs);
    localStorage.setItem('rashaka_daily_logs', JSON.stringify(newLogs));
  };

  const saveJournalTasks = (newTasks: JournalTask[]) => {
    setJournalTasks(newTasks);
    localStorage.setItem('rashaka_journal_tasks', JSON.stringify(newTasks));
  };

  const saveUserStats = (newStats: UserStats) => {
    setUserStats(newStats);
    localStorage.setItem('rashaka_user_stats', JSON.stringify(newStats));
  };

  // --- THEME TOGGLE ACTIONS ---
  const handleToggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('rashaka_theme', nextTheme);
    // Notify workout player of theme change
    window.dispatchEvent(new Event('storage'));
  };

  // --- STICKY FOOTER NAVIGATION HANDLER (SCROLLS TO TOP AS REQUESTED!) ---
  const handleTabChange = (tab: 'workout' | 'calculator' | 'journal' | 'encyclopedia') => {
    setCurrentTab(tab);
    // Instantly scroll back to top of page as requested by user
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  // --- ACTIONS HANDLERS ---
  const handleUpdateWater = (change: number) => {
    const todayLog = getTodayLog();
    todayLog.waterCups = Math.max(0, todayLog.waterCups + change);
    
    const updated = { ...dailyLogs, [todayStr]: todayLog };
    saveDailyLogs(updated);
  };

  const handleLogWeight = (loggedWeight: number) => {
    const todayLog = getTodayLog();
    todayLog.weightLogged = loggedWeight;

    const updatedStats = { ...userStats, weight: loggedWeight };
    setUserStats(updatedStats);
    localStorage.setItem('rashaka_user_stats', JSON.stringify(updatedStats));

    const updatedLogs = { ...dailyLogs, [todayStr]: todayLog };
    saveDailyLogs(updatedLogs);
  };

  const handleAddTask = (text: string) => {
    const newTask: JournalTask = {
      id: Date.now().toString(),
      text,
      completed: false
    };
    const updated = [newTask, ...journalTasks];
    saveJournalTasks(updated);
  };

  const handleToggleTask = (id: string) => {
    const updated = journalTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveJournalTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = journalTasks.filter(t => t.id !== id);
    saveJournalTasks(updated);
  };

  const handleFinishWorkout = (dayNum: number, caloriesEstimate: number) => {
    if (!completedDays.includes(dayNum)) {
      const updated = [...completedDays, dayNum];
      saveCompletedDays(updated);
    }

    const todayLog = getTodayLog();
    
    todayLog.caloriesBurned += caloriesEstimate;
    const targetDay = WORKOUT_DAYS_DB.find(d => d.dayNumber === dayNum);
    todayLog.completedExercisesCount += targetDay?.exercises?.length || 0;
    if (!todayLog.completedDays.includes(dayNum)) {
      todayLog.completedDays.push(dayNum);
    }

    const updatedLogs = { ...dailyLogs, [todayStr]: todayLog };
    saveDailyLogs(updatedLogs);

    setActivePlayingDay(null);
    setSelectedDayPreview(null);
  };

  const handleResetProgress = () => {
    if (confirm('هل أنت متأكد من رغبتك في إعادة ضبط جميع التقدم المحرز واليوميات والبدء من جديد؟')) {
      saveCompletedDays([]);
      saveDailyLogs({});
      saveJournalTasks([
        { id: '1', text: 'شرب كوب ماء فور الاستيقاظ', completed: false },
        { id: '2', text: 'أداء تمرين اليوم بنجاح في التطبيق', completed: false },
        { id: '3', text: 'الابتعاد التام عن السكر والوجبات السريعة اليوم', completed: false },
        { id: '4', text: 'المشي لمدة 15 دقيقة بعد وجبة الغداء', completed: false }
      ]);
      const defaultStats: UserStats = {
        weight: 70,
        height: 168,
        age: 26,
        gender: 'أنثى',
        activityLevel: 1.375,
        goal: 'loss',
        onboarded: false
      };
      saveUserStats(defaultStats);
      alert('تمت إعادة ضبط التطبيق بنجاح! حظاً موفقاً في رحلتك الجديدة.');
    }
  };

  // Handle submit review
  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRatingSuccess(true);
    setTimeout(() => {
      setRatingSuccess(false);
      setComplianceModal(null);
      setRatingComment('');
    }, 2500);
  };

  // Progress metrics
  const totalDays = 30;
  const completedCount = completedDays.length;
  const progressPercent = Math.round((completedCount / totalDays) * 100);
  const waterGoalCups = Math.round((userStats.weight * 35) / 250) || 8;

  // Render different themes seamlessly
  const themeClass = isDark 
    ? 'bg-[#0E0E10] text-white border-white/5 shadow-2xl' 
    : 'bg-[#F4F4F5] text-gray-950 border-gray-200 shadow-xl';

  const innerBgClass = isDark 
    ? 'bg-[#121214]' 
    : 'bg-[#FAFAFA]';

  const headerBgClass = isDark 
    ? 'bg-[#18181B] border-white/5' 
    : 'bg-white border-gray-200 shadow-xs';

  const cardClass = isDark 
    ? 'bg-[#1F1F23]/80 border-white/5 text-white' 
    : 'bg-white border-gray-200 text-gray-900 shadow-sm';

  return (
    <div className={`min-h-screen font-sans flex items-center justify-center p-0 md:p-6 transition-colors duration-300 ${
      isDark ? 'bg-[#040406]' : 'bg-[#EAEAEA]'
    }`} dir="rtl">
      
      {/* Absolute blurry background glow effects on desktop */}
      <div className="hidden md:block absolute top-10 left-10 w-96 h-96 bg-[#FF5F2E]/5 rounded-full blur-3xl pointer-events-none z-0 animate-pulse"></div>
      <div className="hidden md:block absolute bottom-10 right-10 w-96 h-96 bg-[#FF912E]/5 rounded-full blur-3xl pointer-events-none z-0 animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Main smartphone emulator container */}
      <div className={`relative max-w-md w-full h-screen md:h-[850px] md:max-h-[900px] md:rounded-[40px] flex flex-col justify-between overflow-hidden border transition-all duration-300 z-10 ${themeClass}`}>
        
        {!userStats.onboarded ? (
          <OnboardingWizard onComplete={saveUserStats} />
        ) : (
          <>
            {/* App Topbar (Sticky on scroll) */}
            <div className={`px-5 py-4 flex items-center justify-between border-b shrink-0 z-20 ${headerBgClass}`}>
              <div className="flex items-center gap-2.5">
                {/* Menu Hamburger Trigger */}
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className={`p-2.5 rounded-2xl transition-all cursor-pointer ${
                    isDark ? 'bg-[#1E1E22] text-gray-300 hover:text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title="القائمة الجانبية"
                >
                  <Menu className="w-4 h-4" />
                </button>
                
                <div>
                  <h1 className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>رَشاقَة 30 يَوْم</h1>
                  <p className="text-[9px] text-[#FF5F2E] font-black">تخسيس البطن ونحت الخصر</p>
                </div>
              </div>

              {/* Theme Toggle & Flame status */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleTheme}
                  className={`p-2.5 rounded-2xl transition-all cursor-pointer ${
                    isDark ? 'bg-[#1E1E22] text-amber-400' : 'bg-gray-100 text-indigo-600'
                  }`}
                  title={isDark ? "تفعيل الوضع المضيء" : "تفعيل الوضع الداكن"}
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                <div className="px-3 py-1 bg-[#FF5F2E]/10 border border-[#FF5F2E]/20 text-[#FF5F2E] rounded-full text-xs font-bold flex items-center gap-1">
                  <Flame className="w-4 h-4 text-[#FF5F2E] animate-pulse" />
                  <span className="font-mono">{completedCount} / 30</span>
                </div>
              </div>
            </div>

            {/* Dynamic Screen View Content with Scroll - Lock when Preview Modal is active as requested */}
            <div 
              ref={scrollContainerRef}
              className={`flex-1 px-5 py-4 space-y-5 overflow-y-auto transition-all ${innerBgClass} ${
                selectedDayPreview ? 'overflow-hidden pointer-events-none' : ''
              }`}
            >
              
              {/* Workout Screen Tab */}
              {currentTab === 'workout' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 pb-20"
                >
                  {/* Profile progress card */}
                  <div className={`border rounded-3xl p-5 shadow-lg relative overflow-hidden transition-all ${cardClass}`}>
                    <div className="absolute right-0 bottom-0 w-32 h-32 bg-[#FF5F2E]/10 rounded-full blur-2xl"></div>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1.5">
                        <span className="text-[10px] bg-[#FF5F2E] text-white font-bold px-2.5 py-0.5 rounded-full font-sans">
                          تطور التحدي الحالي
                        </span>
                        <h2 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>رحلة نسف الكرش</h2>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>أنهيت بنجاح {completedCount} يوماً حتى الآن.</p>
                      </div>
                      <div className="text-left">
                        <span className="text-3xl font-black font-mono text-[#FF5F2E]">{progressPercent}%</span>
                        <span className={`block text-[9px] font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>نسبة الإكمال</span>
                      </div>
                    </div>

                    {/* Progress bar visual */}
                    <div className="mt-4 space-y-1">
                      <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-[#222222]' : 'bg-gray-100'}`}>
                        <div 
                          className="bg-gradient-to-r from-[#FF5F2E] to-[#FF912E] h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Reset Progress trigger button */}
                    <div className="flex justify-between items-center mt-5 pt-3 border-t border-white/5 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1 text-[10px]">
                        <Award className="w-3.5 h-3.5 text-[#FF5F2E]" />
                        <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>الهدف: بطن مشدود وجسم رياضي</span>
                      </span>
                      <button 
                        onClick={handleResetProgress}
                        className="hover:text-rose-400 flex items-center gap-1.5 transition-all text-[10px] cursor-pointer"
                        title="إعادة تهيئة كل التقدم"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>إعادة ضبط البدء</span>
                      </button>
                    </div>
                  </div>

                  {/* 30 Days Grid Section */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <h3 className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>برنامج تحدي الـ 30 يوماً</h3>
                      <span className="text-[10px] text-gray-400 font-semibold">تحديث يومي ذكي</span>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {WORKOUT_DAYS_DB.map((day) => {
                        const isCompleted = completedDays.includes(day.dayNumber);
                        const isUnlocked = day.dayNumber === 1 || completedDays.includes(day.dayNumber - 1);

                        return (
                          <button
                            key={day.dayNumber}
                            onClick={() => isUnlocked && setSelectedDayPreview(day)}
                            disabled={!isUnlocked}
                            className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                              isCompleted
                                ? 'border-emerald-500 bg-emerald-500 text-white shadow-xs scale-98 hover:opacity-90'
                                : isUnlocked
                                ? (isDark 
                                    ? 'border-white/5 bg-[#1C1C1E] hover:border-[#FF5F2E] text-white shadow-xs' 
                                    : 'border-gray-200 bg-white hover:border-[#FF5F2E] text-gray-800 shadow-sm')
                                : (isDark
                                    ? 'border-white/5 bg-[#171717]/40 text-gray-600 cursor-not-allowed opacity-30'
                                    : 'border-gray-100 bg-gray-100 text-gray-400 cursor-not-allowed opacity-40')
                            }`}
                          >
                            <span className="text-[10px] font-bold block opacity-75">اليوم</span>
                            <span className="text-xl font-black font-mono leading-none mt-1">{day.dayNumber}</span>
                            
                            <div className="absolute bottom-2">
                              {isCompleted ? (
                                <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-md font-bold">مكتمل</span>
                              ) : day.isRestDay ? (
                                <span className={`text-[8px] font-bold px-1 py-0.5 rounded-md ${
                                  isUnlocked 
                                    ? 'bg-[#FF5F2E]/10 text-[#FF5F2E] border border-[#FF5F2E]/20' 
                                    : (isDark ? 'bg-white/5 text-gray-500' : 'bg-gray-200 text-gray-400')
                                }`}>راحة</span>
                              ) : (
                                <span className="text-[8px] opacity-75 font-mono">~{day.estimatedTime} د</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Calculator Tab */}
              {currentTab === 'calculator' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CalorieCalculator 
                    savedStats={userStats}
                    isDark={isDark}
                    onSaveStats={(stats) => {
                      saveUserStats(stats);
                      alert('تم تحديث القياسات وحساب السعرات الجديدة بنجاح!');
                    }}
                  />
                </motion.div>
              )}

              {/* Journal & Water Tab */}
              {currentTab === 'journal' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <DailyJournal 
                    logs={dailyLogs}
                    tasks={journalTasks}
                    waterGoalCups={waterGoalCups}
                    isDark={isDark}
                    onUpdateWater={handleUpdateWater}
                    onLogWeight={handleLogWeight}
                    onAddTask={handleAddTask}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                  />
                </motion.div>
              )}

              {/* Encyclopedia Tab */}
              {currentTab === 'encyclopedia' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ExerciseEncyclopedia isDark={isDark} />
                </motion.div>
              )}
            </div>

            {/* --- DYNAMIC DRAWERS AND INTERACTIVE MODALS --- */}
            
            {/* Day Preview Modal (قبل البدء في التمرين) WITH FIXED CLOSE 'X' BUTTON AND BACKGROUND SCROLL LOCK */}
            <AnimatePresence>
              {selectedDayPreview && (
                <div className="fixed inset-0 bg-black/80 z-40 flex items-end justify-center" dir="rtl">
                  {/* Backdrop Touch Close Trigger */}
                  <div className="absolute inset-0" onClick={() => setSelectedDayPreview(null)}></div>
                  
                  {/* Drawer Container */}
                  <motion.div 
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                    className={`relative max-w-md w-full border-t rounded-t-[36px] p-6 space-y-5 z-50 max-h-[90%] overflow-y-auto ${
                      isDark ? 'bg-[#161618] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900 shadow-2xl'
                    }`}
                  >
                    {/* Visual Handle */}
                    <div className="w-12 h-1 bg-gray-500/30 rounded-full mx-auto"></div>

                    {/* Bold X Close Button for professional look as explicitly requested! */}
                    <button
                      onClick={() => setSelectedDayPreview(null)}
                      className={`absolute left-5 top-5 p-2 rounded-full transition-all cursor-pointer ${
                        isDark ? 'bg-[#222224] text-gray-400 hover:text-white hover:bg-[#2C2C2E]' : 'bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                      }`}
                      title="قفل النافذة"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="flex justify-between items-start pt-2">
                      <div className="space-y-1">
                        <span className="text-[10px] bg-[#FF5F2E]/10 text-[#FF5F2E] border border-[#FF5F2E]/20 font-black px-2.5 py-0.5 rounded-full uppercase">
                          تمارين اليوم المقترحة
                        </span>
                        <h3 className={`text-lg font-black mt-1.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedDayPreview.titleAr}</h3>
                        <p className="text-[10px] text-gray-400 font-mono uppercase mt-0.5">{selectedDayPreview.titleEn}</p>
                      </div>
                    </div>

                    {/* Difficulty Badge and Metadata */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className={`p-2 rounded-2xl border text-center ${isDark ? 'bg-[#222225]/40 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                        <span className="text-[9px] text-gray-400 block font-bold">الصعوبة</span>
                        <span className="text-xs font-black text-[#FF5F2E]">{selectedDayPreview.difficulty}</span>
                      </div>
                      <div className={`p-2 rounded-2xl border text-center ${isDark ? 'bg-[#222225]/40 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                        <span className="text-[9px] text-gray-400 block font-bold">حرق تقريبي</span>
                        <span className="text-xs font-black font-mono text-emerald-500">{selectedDayPreview.caloriesEstimate} سعرة</span>
                      </div>
                      <div className={`p-2 rounded-2xl border text-center ${isDark ? 'bg-[#222225]/40 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                        <span className="text-[9px] text-gray-400 block font-bold">الوقت المقدر</span>
                        <span className="text-xs font-black font-mono text-sky-400">{selectedDayPreview.estimatedTime} دقيقة</span>
                      </div>
                    </div>

                    {/* Exercises list */}
                    {selectedDayPreview.isRestDay ? (
                      <div className={`text-center py-8 space-y-3 rounded-2xl border ${
                        isDark ? 'bg-[#FF912E]/5 border-[#FF912E]/15' : 'bg-amber-500/5 border-amber-500/15'
                      }`}>
                        <span className="text-3xl">☕</span>
                        <h4 className="font-extrabold text-[#FF912E] text-sm">يوم راحة مريح وجسم مشدود!</h4>
                        <p className={`text-xs leading-relaxed max-w-xs mx-auto px-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          عضلاتك تنمو وتتشكل أثناء الراحة وليس التمرين فقط. خذ نفساً عميقاً، ركز على الغذاء الصحي اليوم والماء لتجديد حيويتك للغد!
                        </p>
                        <button
                          onClick={() => handleFinishWorkout(selectedDayPreview.dayNumber, 0)}
                          className="mt-4 px-6 py-2.5 bg-[#FF5F2E] hover:bg-[#FF5F2E]/90 text-white rounded-full font-bold text-xs shadow-xs transition-all cursor-pointer"
                        >
                          تأكيد الراحة والانتقال لليوم التالي
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <span className={`text-xs font-bold block ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>التمارين وجولات الأداء:</span>
                        
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                          {selectedDayPreview.exercises.map((exId, index) => {
                            const ex = EXERCISES_DB[exId];
                            if (!ex) return null;
                            const isTimed = true;
                            return (
                              <div key={exId} className={`flex justify-between items-center p-3 border rounded-2xl ${
                                isDark ? 'bg-[#222225]/40 border-white/5' : 'bg-gray-50 border-gray-100 shadow-2xs'
                              }`}>
                                <div className="flex items-center gap-2.5">
                                  <span className="w-5 h-5 bg-[#FF5F2E]/10 text-[10px] text-[#FF5F2E] font-black rounded-full flex items-center justify-center">
                                    {index + 1}
                                  </span>
                                  <div>
                                    <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{ex.nameAr}</h4>
                                    <span className="text-[9px] text-gray-400 font-mono font-medium block uppercase mt-0.5">{ex.nameEn}</span>
                                  </div>
                                </div>
                                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md ${
                                  isDark ? 'bg-white/5 text-[#FF5F2E]' : 'bg-[#FF5F2E]/10 text-[#FF5F2E]'
                                }`}>
                                  {`3 مجموعات × ${ex.duration}ث`}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* CTA START BUTTON */}
                        <div className="pt-2">
                          <button
                            onClick={() => {
                              // Force-unlock text-to-speech & audio sessions on mobile devices upon direct user tap
                              try {
                                if ('speechSynthesis' in window) {
                                  window.speechSynthesis.resume();
                                  const dummy = new SpeechSynthesisUtterance(' ');
                                  dummy.volume = 0.01;
                                  window.speechSynthesis.speak(dummy);
                                }
                                const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
                                if (AudioCtxClass) {
                                  const ctx = new AudioCtxClass();
                                  if (ctx.state === 'suspended') {
                                    ctx.resume();
                                  }
                                }
                              } catch (err) {
                                console.warn('Pre-unlock failed:', err);
                              }
                              setActivePlayingDay(selectedDayPreview);
                            }}
                            className="w-full py-4 bg-gradient-to-r from-[#FF5F2E] to-[#FF912E] hover:opacity-90 text-white font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4 text-white animate-pulse" />
                            <span>ابدأ تمرين اليوم (3 مجموعات)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Fullscreen Workout Active Game/Player */}
            {activePlayingDay && (
              <WorkoutPlayer 
                day={activePlayingDay}
                onFinishWorkout={handleFinishWorkout}
                onClose={() => {
                  setActivePlayingDay(null);
                  setSelectedDayPreview(null);
                }}
                adMobSafeArea={adMobSafeArea}
              />
            )}

            {/* --- COMPLIANCE HAMBURGER MENU OVERLAY --- */}
            <AnimatePresence>
              {isMenuOpen && (
                <div className="fixed inset-0 bg-black/80 z-40 flex justify-start animate-fade-in" dir="rtl">
                  {/* Backdrop dismiss trigger */}
                  <div className="absolute inset-0" onClick={() => setIsMenuOpen(false)}></div>

                  {/* Sidebar Drawer */}
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'tween', duration: 0.3 }}
                    className={`relative w-72 h-full p-6 flex flex-col justify-between z-50 ${
                      isDark ? 'bg-[#161618] text-white border-l border-white/5' : 'bg-white text-gray-950 border-l border-gray-100 shadow-2xl'
                    }`}
                  >
                    <div className="space-y-6">
                      {/* Logo and Close header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#FF5F2E] to-[#FF912E] rounded-xl flex items-center justify-center">
                            <Dumbbell className="w-4 h-4 text-white transform -rotate-45" />
                          </div>
                          <span className="text-xs font-black">خيارات ومساعدة التطبيق</span>
                        </div>
                        <button
                          onClick={() => setIsMenuOpen(false)}
                          className={`p-1.5 rounded-lg ${isDark ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Profile brief */}
                      <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">🏆</span>
                          <div>
                            <span className="text-[10px] text-gray-400 block font-semibold">مستواك الحالي</span>
                            <span className="text-xs font-bold text-[#FF5F2E]">{progressPercent >= 100 ? 'بطل خارق!' : progressPercent >= 50 ? 'مثابر ممتاز' : 'مبتدئ مكافح'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Navigation list */}
                      <div className="space-y-2">
                        {/* 1. Rate app */}
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            setComplianceModal('rate');
                          }}
                          className={`w-full py-3 px-4 rounded-xl text-right text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                            isDark ? 'hover:bg-white/5 text-gray-200' : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span>قيم التطبيق على المتجر ⭐</span>
                          </div>
                          <ChevronLeft className="w-4 h-4 text-gray-400" />
                        </button>

                        {/* 2. Privacy Policy & Terms */}
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            setComplianceModal('privacy');
                          }}
                          className={`w-full py-3 px-4 rounded-xl text-right text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                            isDark ? 'hover:bg-white/5 text-gray-200' : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Shield className="w-4 h-4 text-[#FF5F2E]" />
                            <span>سياسة الخصوصية والأحكام</span>
                          </div>
                          <ChevronLeft className="w-4 h-4 text-gray-400" />
                        </button>

                        {/* 3. Social Media */}
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            setComplianceModal('social');
                          }}
                          className={`w-full py-3 px-4 rounded-xl text-right text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                            isDark ? 'hover:bg-white/5 text-gray-200' : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <MessageSquare className="w-4 h-4 text-sky-400" />
                            <span>وسائل التواصل الاجتماعي</span>
                          </div>
                          <ChevronLeft className="w-4 h-4 text-gray-400" />
                        </button>

                        {/* 4. AdMob Safe Area Toggle */}
                        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                          isDark ? 'bg-white/5 border-white/5 text-gray-200' : 'bg-gray-50 border-gray-100 text-gray-700'
                        }`}>
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#FF5F2E] shrink-0" />
                            <div className="text-right">
                              <span className="block text-[11px] font-extrabold text-[#FF5F2E]">مساحة إعلانات AdMob</span>
                              <span className="block text-[8px] text-gray-400 font-normal leading-normal">هامش سفلي لتفادي تغطية بنر آب كريتور 24 للأزرار</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const newVal = !adMobSafeArea;
                              setAdMobSafeArea(newVal);
                              localStorage.setItem('rashaka_admob_safe_area', String(newVal));
                            }}
                            className={`w-9 h-5 rounded-full transition-all relative shrink-0 ${
                              adMobSafeArea ? 'bg-[#FF5F2E]' : 'bg-gray-400'
                            }`}
                          >
                            <div className={`absolute top-0.5 bg-white w-4 h-4 rounded-full transition-all ${
                              adMobSafeArea ? 'right-4.5' : 'right-0.5'
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom dismiss trigger */}
                    <div className="space-y-4">
                      <div className="text-center">
                        <span className="text-[9px] text-gray-400 font-mono font-medium block">الإصدار v1.0.2 (مستقر)</span>
                        <span className="text-[9px] text-gray-400 block mt-0.5">متوافق بالكامل مع متجر Google Play</span>
                      </div>
                      
                      <button
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full py-2.5 bg-[#FF5F2E] hover:bg-[#FF912E] text-white font-extrabold text-xs rounded-xl transition-all text-center cursor-pointer"
                      >
                        إغلاق القائمة
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* --- COMPLIANCE MODALS ENGINE --- */}
            <AnimatePresence>
              {complianceModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" dir="rtl">
                  {/* Backdrop */}
                  <div className="absolute inset-0" onClick={() => setComplianceModal(null)}></div>

                  {/* Modal Container */}
                  <div className={`w-full max-w-sm rounded-3xl border overflow-hidden relative z-10 p-6 space-y-4 ${
                    isDark ? 'bg-[#161618] border-white/5 text-white' : 'bg-white border-gray-100 text-gray-900 shadow-2xl'
                  }`}>
                    
                    {/* Header close */}
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <h4 className="text-sm font-extrabold">
                        {complianceModal === 'rate' && '⭐ تقييم التطبيق على المتجر'}
                        {complianceModal === 'privacy' && '🛡️ سياسة الخصوصية وشروط الاستخدام'}
                        {complianceModal === 'social' && '📱 قنوات الدعم والتواصل'}
                      </h4>
                      <button
                        onClick={() => {
                          setComplianceModal(null);
                          setRatingSuccess(false);
                        }}
                        className={`p-1.5 rounded-lg ${isDark ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Modal Content: 1. Rate App */}
                    {complianceModal === 'rate' && (
                      <div className="space-y-4 text-center">
                        <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          تقييمك الرائع بـ 5 نجوم على متجر جوجل بلاي يسعدنا للغاية ويدعمنا للاستمرار في تطوير وإضافة المزيد من التمارين والميزات المجانية!
                        </p>

                        {ratingSuccess ? (
                          <div className="py-6 space-y-2 text-center animate-pulse">
                            <span className="text-4xl">🎉</span>
                            <h5 className="text-emerald-500 font-bold text-xs">شكراً لتقييمك الرائع والجميل!</h5>
                            <p className="text-[10px] text-gray-400">تم تسجيل تقييم الـ {userRating} نجوم بنجاح لمساعدتنا على تحسين التطبيق.</p>
                          </div>
                        ) : (
                          <form onSubmit={handleRatingSubmit} className="space-y-4">
                            {/* Stars row selector */}
                            <div className="flex justify-center gap-1.5 py-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setUserRating(star)}
                                  className="p-1 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                                >
                                  <Star className={`w-8 h-8 ${
                                    star <= userRating ? 'text-amber-400 fill-amber-400' : 'text-gray-400'
                                  }`} />
                                </button>
                              ))}
                            </div>

                            <textarea
                              rows={3}
                              placeholder="أكتب رأيك الجميل أو مقترحاتك لتحسين التطبيق (اختياري)..."
                              value={ratingComment}
                              onChange={(e) => setRatingComment(e.target.value)}
                              className={`w-full p-3 border rounded-xl text-xs focus:outline-hidden focus:border-[#FF5F2E] ${
                                isDark ? 'bg-[#222224] border-white/5 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-800'
                              }`}
                            />

                            <button
                              type="submit"
                              className="w-full py-3 bg-gradient-to-r from-[#FF5F2E] to-[#FF912E] hover:opacity-90 text-white text-xs font-bold rounded-2xl transition-all cursor-pointer"
                            >
                              إرسال التقييم والدعم 👍
                            </button>
                          </form>
                        )}
                      </div>
                    )}

                    {/* Modal Content: 2. Privacy Policy */}
                    {complianceModal === 'privacy' && (
                      <div className="space-y-3.5 text-right max-h-[60vh] overflow-y-auto pr-1">
                        <div className="space-y-1">
                          <span className="text-xs font-extrabold text-[#FF5F2E] block">1. التزام تام بحماية الخصوصية</span>
                          <p className={`text-[10px] leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            نحن في فريق "تطبيق رشاقة 30 يوم" نلتزم بأعلى معايير حماية البيانات والأمان لجميع المستخدمين وفقاً لشروط متجر Google Play.
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-extrabold text-[#FF5F2E] block">2. البيانات الشخصية والمحلية</span>
                          <p className={`text-[10px] leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            جميع بيانات الوزن والقياسات والتقدم في التمارين واليوميات يتم حفظها وتخزينها محلياً بالكامل على جهازك باستخدام (Local Storage). لا نقوم بجمع أو حفظ أو معالجة أو إرسال أي من بياناتك الشخصية إلى أي خوادم خارجية أو أطراف ثالثة على الإطلاق.
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-extrabold text-[#FF5F2E] block">3. إخلاء المسؤولية الصحية والطبية</span>
                          <p className={`text-[10px] leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            التمارين الرياضية والمعلومات المقدمة في هذا التطبيق هي لغرض التوجيه البدني العام فقط. يوصى دائماً باستشارة طبيبك أو مدربك الخاص قبل البدء في أي نشاط رياضي مكثف في حال وجود أي مشاكل صحية سابقة.
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-extrabold text-[#FF5F2E] block">4. استخدام مجاني 100%</span>
                          <p className={`text-[10px] leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            التطبيق يعمل مجاناً مدى الحياة دون أي رسوم اشتراك خفية أو فوترة معقدة لتوفير الفائدة الكاملة للجميع.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Modal Content: 3. Social Media */}
                    {complianceModal === 'social' && (
                      <div className="space-y-3">
                        <p className={`text-xs leading-relaxed text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          انضم إلى مجتمعنا الرياضي أو تواصل معنا للاستفسار والدعم الفني السريع:
                        </p>

                        <div className="space-y-2.5 pt-1">
                          {/* WhatsApp */}
                          <a
                            href="https://wa.me/#"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 px-4 bg-[#25D366] hover:opacity-90 text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <MessageCircle className="w-4 h-4 text-white fill-current" />
                              <span>تواصل فوري عبر الواتساب</span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-white" />
                          </a>

                          {/* Instagram */}
                          <a
                            href="https://instagram.com/#"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 px-4 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] hover:opacity-90 text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <Instagram className="w-4 h-4 text-white" />
                              <span>تابع حسابنا على إنستغرام</span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-white" />
                          </a>

                          {/* Telegram */}
                          <a
                            href="https://t.me/#"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 px-4 bg-[#229ED9] hover:opacity-90 text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <Send className="w-4 h-4 text-white fill-current translate-x-1" />
                              <span>انضم لقناة التلغرام الرياضية</span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-white" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </AnimatePresence>

            {/* Bottom Smartphone Navigation Bar (Fixed Bottom & Sticky layout as requested) */}
            <div 
              style={{ paddingBottom: adMobSafeArea ? '56px' : '8px' }}
              className={`border-t px-4 pt-2 flex justify-around items-center shrink-0 z-30 transition-all ${headerBgClass}`}
            >
              {/* Workouts tab button */}
              <button
                onClick={() => handleTabChange('workout')}
                className={`flex flex-col items-center gap-1 p-2 transition-all cursor-pointer ${
                  currentTab === 'workout' ? 'text-[#FF5F2E] font-extrabold' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Dumbbell className={`w-5 h-5 transition-transform ${currentTab === 'workout' ? 'scale-115 text-[#FF5F2E]' : 'scale-100'}`} />
                <span className="text-[9px]">التمارين</span>
              </button>
 
              {/* Calculator Tab */}
              <button
                onClick={() => handleTabChange('calculator')}
                className={`flex flex-col items-center gap-1 p-2 transition-all cursor-pointer ${
                  currentTab === 'calculator' ? 'text-[#FF5F2E] font-extrabold' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Calculator className={`w-5 h-5 transition-transform ${currentTab === 'calculator' ? 'scale-115 text-[#FF5F2E]' : 'scale-100'}`} />
                <span className="text-[9px]">الحاسبة</span>
              </button>

              {/* Journal Tab */}
              <button
                onClick={() => handleTabChange('journal')}
                className={`flex flex-col items-center gap-1 p-2 transition-all cursor-pointer ${
                  currentTab === 'journal' ? 'text-[#FF5F2E] font-extrabold' : 'text-gray-400 hover:text-white'
                }`}
              >
                <CalendarDays className={`w-5 h-5 transition-transform ${currentTab === 'journal' ? 'scale-115 text-[#FF5F2E]' : 'scale-100'}`} />
                <span className="text-[9px]">اليوميات</span>
              </button>

              {/* Encyclopedia Tab */}
              <button
                onClick={() => handleTabChange('encyclopedia')}
                className={`flex flex-col items-center gap-1 p-2 transition-all cursor-pointer ${
                  currentTab === 'encyclopedia' ? 'text-[#FF5F2E] font-extrabold' : 'text-gray-400 hover:text-white'
                }`}
              >
                <BookOpen className={`w-5 h-5 transition-transform ${currentTab === 'encyclopedia' ? 'scale-115 text-[#FF5F2E]' : 'scale-100'}`} />
                <span className="text-[9px]">الموسوعة</span>
              </button>
            </div>

          </>
        )}

      </div>
    </div>
  );
}
