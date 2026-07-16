import React, { useState, useEffect, useRef } from 'react';
import { Exercise, WorkoutDay } from '../types';
import { EXERCISES_DB } from '../data/exercises';
import { ExerciseModel } from './ExerciseModel';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  Info, 
  Check, 
  RefreshCw, 
  Trophy, 
  Flame, 
  Clock, 
  Lightbulb,
  Mic,
  Dumbbell,
  PlaySquare,
  Sparkles,
  Zap,
  CheckCircle2,
  X
} from 'lucide-react';

interface WorkoutPlayerProps {
  day: WorkoutDay;
  onFinishWorkout: (dayNumber: number, caloriesBurned: number) => void;
  onClose: () => void;
  adMobSafeArea?: boolean;
}

export const WorkoutPlayer: React.FC<WorkoutPlayerProps> = ({ day, onFinishWorkout, onClose, adMobSafeArea = true }) => {
  const exerciseIds = day.exercises;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const activeExerciseId = exerciseIds[currentIndex];
  const activeExercise: Exercise = EXERCISES_DB[activeExerciseId] || EXERCISES_DB['jumping_jacks'];

  // Sets & Reps structure:
  // Each exercise is repeated for 3 sets.
  const totalSets = 3;
  const [currentSet, setCurrentSet] = useState<number>(1);
  
  // All exercises are now 100% time-based as requested by the user
  const isTimeBased = true;
  const exerciseReps = 12; // Kept for metadata/legacy but not used for flow control
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState<number>(activeExercise.duration);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  
  // Preparation Countdown (before the very first set of an exercise)
  const [isReadyCount, setIsReadyCount] = useState<boolean>(true);
  const [readyTimeLeft, setReadyTimeLeft] = useState<number>(8); // 8 seconds warm-up
  
  // Rest period between sets of the same exercise, or between exercises
  const [isResting, setIsResting] = useState<boolean>(false);
  const [restTimeLeft, setRestTimeLeft] = useState<number>(15); // 15 seconds rest
  
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [showTipsModal, setShowTipsModal] = useState<boolean>(false);
  
  // Real-time coach voice settings
  const [voiceGenderPref, setVoiceGenderPref] = useState<'male' | 'female'>('female');

  // Theme Detection (reads directly from localStorage to ensure 100% theme alignment)
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('rashaka_theme') !== 'light';
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };

  // Sync with theme changes if any
  useEffect(() => {
    const handleStorageChange = () => {
      setIsDark(localStorage.getItem('rashaka_theme') !== 'light');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Load initial voice gender preference from UserStats
  useEffect(() => {
    try {
      const stored = localStorage.getItem('rashaka_user_stats');
      if (stored) {
        const stats = JSON.parse(stored);
        if (stats.voiceGender) {
          setVoiceGenderPref(stats.voiceGender);
        }
      }
    } catch (e) {
      console.warn('Could not read user stats from localStorage:', e);
    }
  }, []);

  // Maintain a local list of loaded voices for dynamic updates on mobile
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const allVoices = window.speechSynthesis.getVoices();
        setVoices(allVoices);
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Sound Synth Helper (tactile system beeps)
  const playBeep = (freq = 800, duration = 0.15) => {
    if (muted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('AudioContext not supported or gesture needed');
    }
  };

  // AI Voice Assistant with phonetic Arabic pronunciation and voice-saving reference
  const speakArabic = (text: string, overrideGender?: 'male' | 'female') => {
    if (muted) return;
    try {
      if ('speechSynthesis' in window) {
        // iOS Safari compatibility: resume if suspended/stuck
        window.speechSynthesis.resume();
        
        // iOS Safari bug: calling cancel() when not speaking can permanently freeze speech synthesis.
        // We only cancel if we are currently speaking and want to interrupt.
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }

        const cleanedText = text
          .replace(/جاكس/g, 'جاكْسْ')
          .replace(/سكوات/g, 'سْكْوَاتْ')
          .replace(/كرانشيز/g, 'كْرانْشِيزْ')
          .replace(/بلانك/g, 'بْلانْكْ');

        const utterance = new SpeechSynthesisUtterance(cleanedText);
        utterance.lang = 'ar-SA';
        utterance.volume = 1.0;

        // Keep a strong reference in a React ref to prevent garbage collection on iOS/Safari
        activeUtteranceRef.current = utterance;

        // Get voices from state or fallback directly to speechSynthesis
        const availableVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
        
        // Lowercase filtering is more robust for cross-platform matches
        const arabicVoices = availableVoices.filter((v) => {
          const l = v.lang.toLowerCase();
          return l.startsWith('ar') || l.includes('sa') || l.includes('ae') || l.includes('eg');
        });

        const gender = overrideGender || voiceGenderPref;
        let matchedVoice = null;

        if (gender === 'male') {
          matchedVoice = arabicVoices.find((v) => {
            const nameLower = v.name.toLowerCase();
            return (
              nameLower.includes('maged') || 
              nameLower.includes('majed') || 
              nameLower.includes('majid') || 
              nameLower.includes('ماجد') || 
              nameLower.includes('naif') || 
              nameLower.includes('naayf') || 
              nameLower.includes('نايف') || 
              nameLower.includes('hamed') || 
              nameLower.includes('حامد') || 
              nameLower.includes('tariq') || 
              nameLower.includes('طارق') || 
              nameLower.includes('tarif') || 
              nameLower.includes('تارِف') || 
              nameLower.includes('male') || 
              nameLower.includes('ذكوري')
            );
          });
          utterance.pitch = 1.0;
          utterance.rate = 0.95; // Slightly slower is much clearer on mobile
        } else {
          matchedVoice = arabicVoices.find((v) => {
            const nameLower = v.name.toLowerCase();
            return (
              nameLower.includes('laila') || 
              nameLower.includes('layla') || 
              nameLower.includes('ليلى') || 
              nameLower.includes('ليلا') || 
              nameLower.includes('hoda') || 
              nameLower.includes('هدى') || 
              nameLower.includes('mariam') || 
              nameLower.includes('مريم') || 
              nameLower.includes('sanaa') || 
              nameLower.includes('سناء') || 
              nameLower.includes('zariyah') || 
              nameLower.includes('female') || 
              nameLower.includes('أنثوي')
            );
          });
          utterance.pitch = 1.1;
          utterance.rate = 0.95; // Slightly slower is much clearer on mobile
        }

        if (matchedVoice) {
          utterance.voice = matchedVoice;
        } else if (arabicVoices.length > 0) {
          utterance.voice = arabicVoices[0];
        }

        utterance.onerror = (err) => {
          console.warn('SpeechSynthesisUtterance error:', err);
          window.speechSynthesis.resume();
          
          // Resilient retry logic using default system voice if custom selected voice fails
          if (utterance.voice) {
            console.warn('Retrying Arabic speech with default system voice...');
            try {
              const retryUtterance = new SpeechSynthesisUtterance(cleanedText);
              retryUtterance.lang = 'ar-SA';
              retryUtterance.volume = 1.0;
              retryUtterance.pitch = gender === 'male' ? 1.0 : 1.1;
              retryUtterance.rate = 0.95;
              activeUtteranceRef.current = retryUtterance;
              window.speechSynthesis.speak(retryUtterance);
            } catch (retryErr) {
              console.error('Speech retry failed:', retryErr);
            }
          }
        };

        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn('Voice synthesis failed:', e);
    }
  };

  // Touch gesture unlock to activate iOS Safari speech & audio context
  const handleUserGestureUnlock = () => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.resume();
        // Speak a silent space to activate/unlock the media channel
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
    } catch (e) {
      console.warn('Audio gesture unlock failed:', e);
    }
  };

  // Unmount voice synthesis cleanup
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      clearAllTimeouts();
    };
  }, []);

  // Trigger ready count / prepare screen on exercise or set changes
  useEffect(() => {
    if (isFinished) return;

    setIsPlaying(true);
    setIsReadyCount(true);
    setIsResting(false);
    setReadyTimeLeft(8);
    setTimeLeft(activeExercise.duration);
    setCurrentSet(1);

    const coachName = voiceGenderPref === 'male' ? 'كابتن ماجد' : 'كابتن ليلى';
    const exerciseDetails = `التمرين التالي: ${activeExercise.nameAr}. ثلاث مجموعات، مدة كل مجموعة ${activeExercise.duration} ثانية.`;

    speakArabic(`معكم ال كابتن: ${coachName}.. ${exerciseDetails}.. استعد للبدء!`);
  }, [currentIndex, voiceGenderPref, activeExerciseId, isFinished]);

  // Main Timer Tick Logic (Counts down readyTime, exerciseTime, or restTime)
  useEffect(() => {
    if (!isPlaying || isFinished) return;

    timerRef.current = setInterval(() => {
      // 1. Preparation Countdown State
      if (isReadyCount) {
        setReadyTimeLeft((prev) => {
          if (prev <= 1) {
            playBeep(1200, 0.4);
            speakArabic(`المجموعة الأولى! انطلق الآن.`);
            setIsReadyCount(false);
            return 0;
          }
          if (prev <= 4) {
            playBeep(600, 0.1);
          }
          return prev - 1;
        });
      }
      // 2. Rest Period State
      else if (isResting) {
        setRestTimeLeft((prev) => {
          if (prev <= 1) {
            playBeep(1100, 0.4);
            const nextSetNum = currentSet + 1;
            setCurrentSet(nextSetNum);
            setIsResting(false);
            
            const setWord = nextSetNum === 2 ? 'المجموعة الثانية' : 'المجموعة الثالثة والأخيرة';
            speakArabic(`${setWord}! انطلق.`);
            setTimeLeft(activeExercise.duration);
            return 0;
          }

          // Countdown countdown beeps for final 3 seconds of rest
          if (prev === 4) {
            speakArabic("ثلاثة");
            playBeep(600, 0.1);
          } else if (prev === 3) {
            speakArabic("اثنان");
            playBeep(600, 0.1);
          } else if (prev === 2) {
            speakArabic("واحد");
            playBeep(600, 0.1);
          }

          return prev - 1;
        });
      }
      // 3. Active Set Countdown
      else {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            playBeep(1000, 0.5);
            return 0; // Set to 0 and let safe side-effect useEffect handle transition!
          }
          
          // Audio countdown cues for the final 3 seconds of set
          if (prev === 4) {
            speakArabic("ثلاثة");
            playBeep(600, 0.1);
          } else if (prev === 3) {
            speakArabic("اثنان");
            playBeep(600, 0.1);
          } else if (prev === 2) {
            speakArabic("واحد");
            playBeep(600, 0.1);
          }
          
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isReadyCount, isResting, currentIndex, currentSet, isFinished, voiceGenderPref, activeExerciseId, activeExercise.duration]);

  // Safe side-effect triggers completion when timeLeft hits 0 to avoid render state conflicts
  useEffect(() => {
    if (isPlaying && !isFinished && !isReadyCount && !isResting && timeLeft === 0) {
      handleSetCompletion();
    }
  }, [timeLeft, isPlaying, isFinished, isReadyCount, isResting]);

  // Handles completion of one Set of the current exercise
  const handleSetCompletion = () => {
    playBeep(900, 0.3);
    
    if (currentSet < totalSets) {
      // Move to rest timer before starting next set
      setIsResting(true);
      setRestTimeLeft(15);
      speakArabic("عمل رائع وممتاز! ارتح الآن لمدة خمس عشرة ثانية قبل المجموعة التالية.");
    } else {
      // Completed all 3 sets of this exercise!
      handleNextExerciseTransition();
    }
  };

  // Logic to switch to next exercise or finish workout (Instant batch update avoids double-execution)
  const handleNextExerciseTransition = () => {
    try {
      if (currentIndex < exerciseIds.length - 1) {
        playBeep(1000, 0.4);
        speakArabic("رائع جداً! أنهيت هذا التمرين بالكامل بنجاح. استعد للتمرين التالي!");
        
        // Reset all states synchronously to prevent double triggering
        setIsReadyCount(true);
        setReadyTimeLeft(8);
        setCurrentSet(1);
        setIsResting(false);
        
        const nextIndex = currentIndex + 1;
        const nextExerciseId = exerciseIds[nextIndex];
        const nextExercise = EXERCISES_DB[nextExerciseId];
        setTimeLeft(nextExercise ? nextExercise.duration : 30);
        
        setCurrentIndex(nextIndex);
      } else {
        // Completed last exercise of the day!
        setIsFinished(true);
        setIsPlaying(false);
        
        try {
          speakArabic("عمل بطل جبار يا بطل! لقد أتممت جميع تمارين وجولات اليوم بنجاح باهر!");
        } catch (speechErr) {
          console.warn("Speech synthesis failed:", speechErr);
        }
        
        try {
          playBeep(523.25, 0.3); 
          const t1 = window.setTimeout(() => playBeep(659.25, 0.3), 150); 
          const t2 = window.setTimeout(() => playBeep(783.99, 0.5), 300);
          timeoutsRef.current.push(t1, t2);
        } catch (soundErr) {
          console.warn("Audio feedback failed:", soundErr);
        }
      }
    } catch (err) {
      console.error("Error in handleNextExerciseTransition:", err);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Manual trigger to force-skip the current set or rest timer
  const handleSkipRest = () => {
    if (isResting) {
      playBeep(1100, 0.2);
      const nextSetNum = currentSet + 1;
      setCurrentSet(nextSetNum);
      setIsResting(false);
      const setWord = nextSetNum === 2 ? 'المجموعة الثانية' : 'المجموعة الثالثة والأخيرة';
      speakArabic(`${setWord}! انطلق.`);
      setTimeLeft(activeExercise.duration);
    }
  };

  const handleNextExerciseManual = () => {
    try {
      if (currentIndex < exerciseIds.length - 1) {
        setIsReadyCount(true);
        setReadyTimeLeft(8);
        setCurrentSet(1);
        setIsResting(false);
        
        const nextIndex = currentIndex + 1;
        const nextExerciseId = exerciseIds[nextIndex];
        const nextExercise = EXERCISES_DB[nextExerciseId];
        setTimeLeft(nextExercise ? nextExercise.duration : 30);
        
        setCurrentIndex(nextIndex);
      } else {
        // Set state first for maximum reliability
        setIsFinished(true);
        setIsPlaying(false);
        
        try {
          speakArabic("عمل بطل جبار يا بطل! لقد أتممت جميع تمارين وجولات اليوم بنجاح باهر!");
        } catch (speechErr) {
          console.warn("Speech synthesis failed:", speechErr);
        }
        
        try {
          playBeep(523.25, 0.3); 
          const t1 = window.setTimeout(() => playBeep(659.25, 0.3), 150); 
          const t2 = window.setTimeout(() => playBeep(783.99, 0.5), 300);
          timeoutsRef.current.push(t1, t2);
        } catch (soundErr) {
          console.warn("Audio feedback failed:", soundErr);
        }
      }
    } catch (err) {
      console.error("Error in handleNextExerciseManual:", err);
    }
  };

  const handlePreviousExerciseManual = () => {
    if (currentIndex > 0) {
      setIsReadyCount(true);
      setReadyTimeLeft(8);
      setCurrentSet(1);
      setIsResting(false);
      
      const prevIndex = currentIndex - 1;
      const prevExerciseId = exerciseIds[prevIndex];
      const prevExercise = EXERCISES_DB[prevExerciseId];
      setTimeLeft(prevExercise ? prevExercise.duration : 30);
      
      setCurrentIndex(prevIndex);
    }
  };

  const handleFinishAndSave = () => {
    onFinishWorkout(day.dayNumber, day.caloriesEstimate);
  };

  const handleClose = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    clearAllTimeouts();
    onClose();
  };

  const totalSteps = exerciseIds.length;
  const currentStepNum = currentIndex + 1;

  if (isFinished) {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col justify-between p-6 transition-colors duration-300 ${
        isDark ? 'bg-[#0A0A0A] text-white' : 'bg-[#F9FAFB] text-gray-900'
      }`} dir="rtl">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 0.3 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#FF5F2E]/20 rounded-full blur-3xl"
          />
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 0.8, opacity: 0.3 }}
            transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
            className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-[#FF912E]/20 rounded-full blur-3xl"
          />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6 relative z-10">
          <motion.div 
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="relative"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-[#FF5F2E] to-[#FF912E] rounded-3xl flex items-center justify-center shadow-lg shadow-[#FF5F2E]/30 relative z-10">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
              className="absolute inset-0 bg-gradient-to-r from-[#FF5F2E] to-[#FF912E] rounded-3xl blur-md -z-10"
            />
          </motion.div>

          <div className="space-y-2">
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-extrabold tracking-tight"
            >
              تهانينا يا بطل! 🎉
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="text-sm text-[#FF912E] font-semibold"
            >
              لقد أتممت اليوم {day.dayNumber} بنجاح كامل!
            </motion.p>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={`text-xs px-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
          >
            استمر بهذا الحماس والالتزام اليومي للوصول لهدفك ونسف الكرش وبناء الخصر الرياضي المثالي في 30 يوماً.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.75 }}
            className={`grid grid-cols-2 gap-4 w-full p-5 rounded-2xl border backdrop-blur-md ${
              isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-100 shadow-sm'
            }`}
          >
            <div className="flex flex-col items-center border-l border-white/5">
              <div className="flex items-center gap-1.5 text-[#FF5F2E] text-xs mb-1 font-bold">
                <Flame className="w-4 h-4 animate-pulse" />
                <span>حرق الدهون مقدر</span>
              </div>
              <span className={`text-xl font-bold font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {day.caloriesEstimate} <span className="text-xs text-gray-400 font-sans font-medium">سعرة</span>
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-[#FF5F2E] text-xs mb-1 font-bold">
                <Clock className="w-4 h-4" />
                <span>الوقت التقريبي</span>
              </div>
              <span className={`text-xl font-bold font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {day.estimatedTime} <span className="text-xs text-gray-400 font-sans font-medium">دقائق</span>
              </span>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="max-w-md mx-auto w-full relative z-10"
        >
          <button
            onClick={handleFinishAndSave}
            className="w-full py-4 bg-gradient-to-r from-[#FF5F2E] to-[#FF912E] hover:opacity-90 active:scale-98 text-white font-extrabold rounded-2xl text-sm transition-all shadow-md shadow-[#FF5F2E]/20 cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 animate-pulse text-yellow-200" />
            <span>تأكيد إكمال اليوم والرجوع للرئيسية</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      onClick={handleUserGestureUnlock}
      onTouchStart={handleUserGestureUnlock}
      style={{ paddingBottom: adMobSafeArea ? '60px' : '16px' }}
      className={`fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto transition-colors duration-300 ${
        isDark ? 'bg-[#0A0A0A] text-white' : 'bg-[#F9FAFB] text-gray-900'
      }`} 
      dir="rtl"
    >
      
      {/* Top Header Navigation */}
      <div className={`px-5 py-4 flex items-center justify-between border-b ${
        isDark ? 'bg-[#121212] border-white/5' : 'bg-white border-gray-100 shadow-xs'
      }`}>
        <button 
          onClick={handleClose}
          className={`p-2.5 rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
            isDark ? 'bg-[#1A1A1A] text-gray-300 hover:text-white hover:bg-[#222]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title="رجوع"
        >
          <ChevronRight className="w-4 h-4" />
          <span>رجوع</span>
        </button>

        <div className="text-center">
          <span className="text-[10px] text-[#FF5F2E] font-extrabold block">تحدي 30 يوم للتخسيس</span>
          <span className={`text-xs font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>{day.titleAr}</span>
        </div>

        {/* Voice and Mute controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              handleUserGestureUnlock();
              const nextGender = voiceGenderPref === 'male' ? 'female' : 'male';
              setVoiceGenderPref(nextGender);
              try {
                const stored = localStorage.getItem('rashaka_user_stats');
                if (stored) {
                  const stats = JSON.parse(stored);
                  stats.voiceGender = nextGender;
                  localStorage.setItem('rashaka_user_stats', JSON.stringify(stats));
                }
              } catch (e) {}

              const sampleText = nextGender === 'male' 
                ? 'أهلاً بك يا بطل! أنا كابتن ماجد سأكون مدربك الصوتي.' 
                : 'أهلاً بك! أنا كابتن ليلى سأكون مدربتك الصوتية.';
              speakArabic(sampleText, nextGender);
            }}
            className={`px-2.5 py-1.5 border text-[9px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
              isDark ? 'bg-[#1A1A1A] border-white/5 text-gray-300 hover:text-white' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Mic className="w-3 h-3 text-[#FF5F2E]" />
            <span>{voiceGenderPref === 'male' ? 'كابتن ماجد' : 'كابتن ليلى'}</span>
          </button>

          <button
            onClick={() => setMuted(!muted)}
            className={`p-2.5 rounded-2xl transition-all cursor-pointer ${
              muted 
                ? 'bg-rose-500/10 text-rose-500' 
                : (isDark ? 'bg-[#FF5F2E]/10 text-[#FF5F2E]' : 'bg-[#FF5F2E]/10 text-[#FF5F2E]')
            }`}
          >
            <Volume2 className={`w-4 h-4 ${muted ? 'opacity-50' : 'opacity-100'}`} />
          </button>
        </div>
      </div>

      {/* Progress indicators */}
      <div className={`px-5 py-2 flex items-center justify-between border-b ${
        isDark ? 'bg-[#121212] border-white/5' : 'bg-white border-gray-100'
      }`}>
        <span className="text-[11px] font-bold text-gray-400">التمارين:</span>
        <div className="flex gap-1.5 flex-1 mx-4 max-w-xs">
          {exerciseIds.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                idx < currentIndex 
                  ? 'bg-emerald-500' 
                  : idx === currentIndex 
                  ? 'bg-[#FF5F2E] w-4' 
                  : (isDark ? 'bg-[#222222]' : 'bg-gray-200')
              }`}
            ></div>
          ))}
        </div>
        <span className="text-xs font-mono font-bold text-[#FF5F2E]">{currentStepNum} / {totalSteps}</span>
      </div>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col p-5 max-w-md mx-auto w-full justify-center">
        
        <AnimatePresence mode="wait">
          {isReadyCount ? (
            /* 1. GET READY STATE (WARMUP) */
            <motion.div 
              key="ready-warmup"
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-6"
            >
              <span className="text-xs bg-[#FF5F2E]/10 text-[#FF5F2E] px-3 py-1 rounded-full font-bold">استعد للتمرين التالي</span>
              <h2 className={`text-2xl font-extrabold px-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{activeExercise.nameAr}</h2>
              
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="72" stroke={isDark ? "#222222" : "#E5E7EB"} strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="80" 
                    cy="80" 
                    r="72" 
                    stroke="#FF5F2E" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 72}
                    strokeDashoffset={2 * Math.PI * 72 * (1 - readyTimeLeft / 8)}
                    className="transition-all duration-1000 linear"
                  />
                </svg>
                
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase">انطلاق خلال</span>
                  <span className={`text-5xl font-black font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{readyTimeLeft}</span>
                  <span className="text-xs text-gray-400 font-medium">ثواني</span>
                </div>
              </div>

              <div className={`p-4 rounded-2xl max-w-xs flex gap-3 text-right border ${
                isDark ? 'bg-[#1A1A1A]/40 border-white/5' : 'bg-amber-500/5 border-amber-500/15'
              }`}>
                <Lightbulb className="w-5 h-5 text-[#FF5F2E] shrink-0 mt-0.5" />
                <p className={`text-xs leading-relaxed font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {activeExercise.tips[0] || "تأكد من شرب رشفة ماء والوقوف في وضع مريح قبل الانطلاق."}
                </p>
              </div>

              <button 
                onClick={() => {
                  setIsReadyCount(false);
                  setTimeLeft(isTimeBased ? activeExercise.duration : 0);
                  playBeep(1200, 0.4);
                  speakArabic("انطلق الآن!");
                }}
                className="px-6 py-3 bg-[#FF5F2E] hover:bg-[#FF912E] text-white rounded-full font-bold text-xs cursor-pointer shadow-sm shadow-[#FF5F2E]/10 transition-all hover:scale-105 active:scale-95"
              >
                تخطي الانتظار والبدء فوراً
              </button>
            </motion.div>
          ) : isResting ? (
            /* 2. BETWEEN SETS REST STATE */
            <motion.div 
              key="resting-state"
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-6"
            >
              <div className="w-16 h-16 bg-sky-500/10 text-sky-500 rounded-full flex items-center justify-center border border-sky-500/20">
                <Clock className="w-8 h-8 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              
              <div>
                <span className="text-xs text-sky-400 font-bold tracking-wider uppercase block">وقت الراحة والاستراحة</span>
                <h3 className={`text-xl font-black mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>خذ نفساً عميقاً واسترخِ</h3>
                <p className="text-xs text-gray-400 mt-1 font-medium">المجموعة التالية: {currentSet + 1} من {totalSets}</p>
              </div>

              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="64" stroke={isDark ? "#222222" : "#E5E7EB"} strokeWidth="6" fill="transparent" />
                  <circle 
                    cx="72" 
                    cy="72" 
                    r="64" 
                    stroke="#0EA5E9" 
                    strokeWidth="6" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 64}
                    strokeDashoffset={2 * Math.PI * 64 * (1 - restTimeLeft / 15)}
                    className="transition-all duration-1000 linear"
                  />
                </svg>
                
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase">راحة متبقية</span>
                  <span className={`text-5xl font-black font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{restTimeLeft}</span>
                  <span className="text-xs text-gray-400 font-medium">ثواني</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
                "الراحة جزء من البناء العضلي. اشرب القليل من الماء ونظّم أنفاسك."
              </p>

              <button 
                onClick={handleSkipRest}
                className="px-6 py-2.5 border border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white rounded-full font-bold text-xs cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                تخطي الاستراحة والبدء فوراً ⏭
              </button>
            </motion.div>
          ) : (
            /* 3. ACTIVE EXERCISE STATE */
            <motion.div 
              key={`active-exercise-${currentIndex}-${currentSet}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="flex-1 flex flex-col justify-between space-y-4"
            >
              
              {/* Visual demo container */}
              <div className="w-full">
                <ExerciseModel type={activeExercise.animationType} isPlaying={isPlaying} mp4Url={activeExercise.mp4Url} />
              </div>

              {/* Header info */}
              <div className="text-center space-y-2">
                <span className="text-[10px] bg-[#FF5F2E]/10 text-[#FF5F2E] px-2.5 py-0.5 rounded-full font-extrabold border border-[#FF5F2E]/20">
                  المجموعة {currentSet} من {totalSets}
                </span>
                <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{activeExercise.nameAr}</h2>
                <p className="text-[10px] text-gray-400 font-medium font-mono uppercase tracking-wide">{activeExercise.nameEn}</p>
              </div>

              {/* Middle displays: Timed count vs Reps manual confirm */}
              <div className="flex justify-center items-center gap-6 py-1">
                
                <div className="text-gray-400 text-xs">
                  <span className="block text-[10px] font-medium">مقدر للحرق</span>
                  <span className="font-extrabold text-[#FF5F2E] font-mono text-sm">
                    ~{isTimeBased 
                      ? Math.round(activeExercise.caloriesPerMin * (timeLeft / 60)) 
                      : Math.round(activeExercise.caloriesPerMin * 0.5)
                    }
                  </span> سعرة
                </div>

                {isTimeBased ? (
                  /* Time display with active countdown circle */
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r="50" stroke={isDark ? "#222222" : "#E5E7EB"} strokeWidth="6" fill="transparent" />
                      <circle 
                        cx="56" 
                        cy="56" 
                        r="50" 
                        stroke="#FF5F2E" 
                        strokeWidth="6" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 50}
                        strokeDashoffset={2 * Math.PI * 50 * (1 - timeLeft / activeExercise.duration)}
                        className="transition-all duration-1000 linear"
                      />
                    </svg>
                    <div className="flex flex-col items-center">
                      <span className={`text-4xl font-black font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{timeLeft}</span>
                      <span className="text-[10px] text-gray-400 font-bold">ثانية</span>
                    </div>
                  </div>
                ) : (
                  /* Reps display with manual action required button (exactly as requested!) */
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-28 h-28 rounded-3xl border flex flex-col items-center justify-center shadow-xs ${
                      isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-100'
                    }`}>
                      <span className="text-3xl font-black font-mono text-[#FF5F2E]">{exerciseReps}</span>
                      <span className={`text-[10px] font-extrabold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>تكرارات جيدة</span>
                    </div>
                  </div>
                )}

                {/* Reset/Restart set button */}
                <button 
                  onClick={() => {
                    setTimeLeft(isTimeBased ? activeExercise.duration : 0);
                    playBeep(600, 0.15);
                    speakArabic("أعدنا بدء هذه المجموعة.");
                  }}
                  className={`p-3 rounded-full transition-all cursor-pointer border ${
                    isDark ? 'bg-[#1A1A1A] border-white/5 text-gray-300 hover:text-white' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50 shadow-sm'
                  }`}
                  title="إعادة جولة التمرين"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Reps interactive validation button (FORBIDDEN automatic skip when doing reps!) */}
              {!isTimeBased && (
                <div className="px-6 pb-2">
                  <button
                    onClick={handleSetCompletion}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/10 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>أنهيت الـ {exerciseReps} تكرارات (تمت المجموعة ✔)</span>
                  </button>
                </div>
              )}

              {/* Controller row: Back, Play/Pause/Mute, Next */}
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={handlePreviousExerciseManual}
                  disabled={currentIndex === 0}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-gray-200 text-gray-800 hover:bg-gray-50'
                  } disabled:opacity-30 disabled:pointer-events-none`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {isTimeBased && (
                  <button
                    onClick={handlePlayPause}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer ${
                      isPlaying 
                        ? 'bg-[#FF5F2E] text-white hover:bg-[#FF912E]' 
                        : (isDark ? 'bg-white text-black hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-black')
                    }`}
                  >
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-[-1px]" />}
                  </button>
                )}

                <button
                  onClick={handleNextExerciseManual}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-gray-200 text-gray-800 hover:bg-gray-50'
                  }`}
                  title="التمرين التالي"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              {/* Info Pill Button */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setShowTipsModal(true)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs border ${
                    isDark 
                      ? 'bg-[#121212] border-white/5 text-gray-300 hover:text-white hover:bg-[#1A1A1A]/80 hover:scale-105 active:scale-95' 
                      : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50 hover:scale-105 active:scale-95'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-[#FF5F2E]/10 text-[#FF5F2E] flex items-center justify-center text-xs font-black font-mono">i</span>
                  <span>طريقة الأداء والتركيز الذهني</span>
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Steps & Guidance Checklist Popup Modal */}
      <AnimatePresence>
        {showTipsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with elegant blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTipsModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className={`relative w-full max-w-sm rounded-3xl p-6 shadow-2xl border overflow-hidden z-10 ${
                isDark 
                  ? 'bg-[#121212] border-white/10 text-white' 
                  : 'bg-white border-gray-100 text-gray-900'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 border-b pb-3 border-gray-100 dark:border-white/5">
                <span className="text-sm font-extrabold flex items-center gap-2 text-[#FF5F2E]">
                  <span className="w-5 h-5 rounded-full bg-[#FF5F2E]/10 text-[#FF5F2E] flex items-center justify-center text-xs font-black font-mono">i</span>
                  <span>طريقة الأداء والتركيز الذهني</span>
                </span>
                <button
                  onClick={() => setShowTipsModal(false)}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    isDark ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content Checklist */}
              <ul className="space-y-3.5 my-4 pr-1 max-h-[60vh] overflow-y-auto">
                {activeExercise.steps.map((step, idx) => (
                  <li key={idx} className="text-xs flex items-start gap-3 leading-relaxed">
                    <span className={`w-5 h-5 rounded-full text-[11px] font-bold font-mono flex items-center justify-center shrink-0 mt-0.5 ${
                      isDark ? 'bg-[#1A1A1A] text-gray-300 border border-white/5' : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{step}</span>
                  </li>
                ))}
              </ul>

              {/* Action Close Button */}
              <div className="pt-2 border-t border-gray-100 dark:border-white/5">
                <button
                  onClick={() => setShowTipsModal(false)}
                  className="w-full py-2.5 bg-gradient-to-r from-[#FF5F2E] to-[#FF912E] text-white text-xs font-bold rounded-xl hover:opacity-90 active:scale-98 transition-all cursor-pointer"
                >
                  حسناً، فهمت
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
