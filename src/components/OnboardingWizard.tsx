import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Dumbbell, 
  Flame, 
  Scale, 
  Ruler, 
  Calendar, 
  Activity, 
  Target, 
  Volume2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  TrendingDown, 
  TrendingUp, 
  ChevronRight,
  Heart
} from 'lucide-react';
import { UserStats } from '../types';

interface OnboardingWizardProps {
  onComplete: (stats: UserStats) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisText, setAnalysisText] = useState<string>('جاري تحليل البيانات المدخلة...');
  const [showSummary, setShowSummary] = useState<boolean>(false);

  // Form State
  const [gender, setGender] = useState<'ذكر' | 'أنثى'>('أنثى');
  const [age, setAge] = useState<number>(26);
  const [weight, setWeight] = useState<number>(72);
  const [targetWeight, setTargetWeight] = useState<number>(62);
  const [height, setHeight] = useState<number>(165);
  const [activityLevel, setActivityLevel] = useState<number>(1.375); // TDEE multiplier
  const [goal, setGoal] = useState<'loss' | 'maintain' | 'gain'>('loss');
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');

  // Multi-step loading messages
  const analysisMessages = [
    'جاري تحليل طبيعة الجسم وحساب مؤشر كتلة الجسم (BMI)...',
    'جاري تحديد معدل الأيض الأساسي وحساب السعرات النشطة للتمرين...',
    'جاري تقدير احتياجك اليومي من الكربوهيدرات والبروتينات والمياه...',
    'جاري تهيئة صوت المدرب المخصص للذكاء الاصطناعي بنجاح...',
    'جاري جدولة خطة تحدي الـ 30 يوماً للتخسيس ونحت الخصر لجسدك...'
  ];

  useEffect(() => {
    if (isAnalyzing) {
      let index = 0;
      const interval = setInterval(() => {
        if (index < analysisMessages.length) {
          setAnalysisText(analysisMessages[index]);
          index++;
        } else {
          clearInterval(interval);
          setIsAnalyzing(false);
          setShowSummary(true);
        }
      }, 1200);

      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  // Calculations
  const bmi = parseFloat((weight / ((height / 100) * (height / 100))).toFixed(1));
  
  // BMR (Mifflin-St Jeor Equation)
  const bmr = Math.round(
    gender === 'ذكر'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161
  );

  // TDEE (Total Daily Energy Expenditure)
  const tdee = Math.round(bmr * activityLevel);

  // Recommended Daily Calorie Budget based on goal
  const calorieBudget = Math.round(
    goal === 'loss'
      ? tdee - 500 // Fat loss deficit
      : goal === 'gain'
      ? tdee + 300 // Lean bulk surplus
      : tdee // Maintenance
  );

  // Recommended Daily Water Cups (each cup is 250ml)
  const waterCups = Math.round((weight * 35) / 250);

  const handleNext = () => {
    if (step < 8) {
      setStep(step + 1);
    } else {
      // Trigger AI Plan Generation Simulation
      setIsAnalyzing(true);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    const finalStats: UserStats = {
      weight,
      height,
      age,
      gender,
      activityLevel,
      goal,
      targetWeight,
      voiceGender,
      onboarded: true
    };
    onComplete(finalStats);
  };

  // Get BMI Status
  const getBmiStatus = (bmiValue: number) => {
    if (bmiValue < 18.5) return { text: 'نقص في الوزن', color: 'text-amber-400 bg-amber-400/10' };
    if (bmiValue < 25) return { text: 'وزن مثالي ورائع', color: 'text-emerald-400 bg-emerald-400/10' };
    if (bmiValue < 30) return { text: 'زيادة في الوزن', color: 'text-orange-400 bg-orange-400/10' };
    return { text: 'سمنة مفرطة', color: 'text-rose-400 bg-rose-400/10' };
  };

  const bmiStatus = getBmiStatus(bmi);

  return (
    <div className="flex-1 flex flex-col justify-between h-full bg-[#121212] p-5 text-white animate-fade-in" dir="rtl">
      
      {/* 1. ANALYSIS SCREEN OVERLAY */}
      {isAnalyzing && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-[#FF5F2E]/20 border-t-[#FF5F2E] animate-spin"></div>
            <Sparkles className="w-8 h-8 text-[#FF912E] absolute inset-0 m-auto animate-pulse" />
          </div>
          <div className="space-y-2 max-w-xs mx-auto">
            <h3 className="text-lg font-black text-white">الذكاء الاصطناعي يقوم بحساباتك...</h3>
            <p className="text-xs text-gray-400 leading-relaxed min-h-[40px] transition-all duration-300">
              {analysisText}
            </p>
          </div>
        </div>
      )}

      {/* 2. SUMMARY SCREEN OVERLAY */}
      {showSummary && !isAnalyzing && (
        <div className="flex-1 flex flex-col justify-between space-y-5 animate-fade-in py-2">
          <div className="space-y-4">
            {/* Celebration Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-gradient-to-tr from-[#FF5F2E] to-[#FF912E] rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#FF5F2E]/20">
                <Heart className="w-7 h-7 text-white fill-current" />
              </div>
              <h2 className="text-xl font-black">تم توليد خطتك الرياضية المخصصة!</h2>
              <p className="text-xs text-gray-400">بناءً على معلوماتك وجيناتك المدخلة، إليك ملخص الخطة:</p>
            </div>

            {/* Health & Plan Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              
              {/* BMI Card */}
              <div className="bg-[#1A1A1A] p-3.5 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold block">مؤشر كتلة جسمك (BMI)</span>
                <span className="text-xl font-mono font-black text-white">{bmi}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold inline-block mt-1 ${bmiStatus.color}`}>
                  {bmiStatus.text}
                </span>
              </div>

              {/* Water Card */}
              <div className="bg-[#1A1A1A] p-3.5 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold block">مستهدف الماء اليومي</span>
                <span className="text-xl font-mono font-black text-[#FF912E]">{waterCups} <span className="text-[10px] text-gray-400">أكواب</span></span>
                <p className="text-[8px] text-gray-400 leading-none mt-1">ما يعادل {waterCups * 250 / 1000} لتر يومياً لترطيب مثالي.</p>
              </div>

              {/* TDEE Card */}
              <div className="bg-[#1A1A1A] p-3.5 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold block">حرقك اليومي (TDEE)</span>
                <span className="text-xl font-mono font-black text-white">{tdee} <span className="text-[10px] text-gray-400">سعرة</span></span>
                <p className="text-[8px] text-gray-400 leading-none mt-1">معدل الطاقة الإجمالي المصروف يومياً.</p>
              </div>

              {/* Target Calorie Budget */}
              <div className="bg-[#FF5F2E]/5 border border-[#FF5F2E]/15 p-3.5 rounded-2xl space-y-1">
                <span className="text-[10px] text-[#FF5F2E] font-bold block">ميزانية السعرات المستهدفة</span>
                <span className="text-xl font-mono font-black text-[#FF5F2E]">{calorieBudget} <span className="text-[10px] text-gray-300">سعرة</span></span>
                <p className="text-[8px] text-gray-400 leading-none mt-1">
                  {goal === 'loss' ? 'عجز مدروس لنسف الدهون.' : goal === 'gain' ? 'فائض لبناء عضلات صافية.' : 'محافظة وتثبيت لقوام مشدود.'}
                </p>
              </div>

            </div>

            {/* Plan Info Overview Box */}
            <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-white/5 space-y-2 text-right">
              <span className="text-[10px] text-[#FF912E] font-extrabold block">🏷️ اسم البرنامج التمريني المخصص:</span>
              <h4 className="text-sm font-black text-white">برنامج {goal === 'loss' ? 'نسف الكرش ونحت الخصر الفائق (30 يوماً)' : goal === 'gain' ? 'تطوير الكتلة العضلية والقوة المتفجرة' : 'الرشاقة وتنسيق القوام المثالي'}</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                تم دمج محرك توجيه التمارين المخصص لك، وسيتولى المدرب الصوتي ({voiceGender === 'male' ? 'كابتن ماجد' : 'كابتن ليلى'}) تزويدك بالتعليمات وبث روح التحدي يومياً لمساعدتك على الانتقال من وزن {weight} كجم إلى وزن مستهدف {targetWeight} كجم!
              </p>
            </div>
          </div>

          {/* CTA Confirm */}
          <button
            onClick={handleFinish}
            className="w-full py-4 bg-gradient-to-r from-[#FF5F2E] to-[#FF912E] hover:opacity-90 active:scale-98 text-white font-extrabold rounded-2xl text-xs transition-all shadow-md shadow-[#FF5F2E]/20 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>ابدأ رحلتك الرياضية الآن</span>
            <ArrowRight className="w-4 h-4 transform rotate-180" />
          </button>
        </div>
      )}

      {/* 3. MULTI-STEP WIZARD SCREENS */}
      {!isAnalyzing && !showSummary && (
        <div className="flex-1 flex flex-col justify-between h-full">
          
          {/* Header & Progress Indicator */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-[#FF5F2E]">رَشاقَة 30 يَوْم</span>
                <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded-md text-gray-400">الذكاء الاصطناعي</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#FF5F2E]">صفحة {step} من 8</span>
            </div>

            {/* Micro Progress Bar */}
            <div className="w-full bg-[#1A1A1A] h-1.5 rounded-full overflow-hidden flex flex-row-reverse">
              <div 
                className="bg-gradient-to-r from-[#FF5F2E] to-[#FF912E] h-full transition-all duration-300"
                style={{ width: `${(step / 8) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Body Section for Each Step */}
          <div className="flex-1 flex flex-col justify-center py-6">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                
                {/* STEP 1: GENDER */}
                {step === 1 && (
                  <div className="space-y-4 text-center">
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-black text-white">اختر جنسك لتخصيص محرك التمارين</h3>
                      <p className="text-xs text-gray-400">يساعدنا هذا في ضبط شدة التمارين ومقدار الحرق الأساسي بدقة عالية.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <button
                        onClick={() => setGender('أنثى')}
                        className={`p-5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                          gender === 'أنثى'
                            ? 'border-[#FF5F2E] bg-[#FF5F2E]/10 text-white shadow-md'
                            : 'border-white/5 bg-[#1A1A1A] hover:bg-white/5 text-gray-300'
                        }`}
                      >
                        <span className="text-4xl">🙋‍♀️</span>
                        <div className="text-xs font-extrabold">أنثى</div>
                        <span className="text-[8px] text-gray-400">نحت الخصر وتنسيق القوام</span>
                      </button>

                      <button
                        onClick={() => setGender('ذكر')}
                        className={`p-5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                          gender === 'ذكر'
                            ? 'border-[#FF5F2E] bg-[#FF5F2E]/10 text-white shadow-md'
                            : 'border-white/5 bg-[#1A1A1A] hover:bg-white/5 text-gray-300'
                        }`}
                      >
                        <span className="text-4xl">🙋‍♂️</span>
                        <div className="text-xs font-extrabold">ذكر</div>
                        <span className="text-[8px] text-gray-400">بناء اللياقة وتقوية عضلات البطن</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: AGE */}
                {step === 2 && (
                  <div className="space-y-4 text-center">
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-black text-white">كم يبلغ عمرك؟</h3>
                      <p className="text-xs text-gray-400">تختلف كفاءة عمليات الأيض ومعدل الحرق الآمن تبعاً للعمر.</p>
                    </div>

                    <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 space-y-4">
                      <div className="text-4xl font-mono font-black text-[#FF5F2E]">
                        {age} <span className="text-xs text-white">سنة</span>
                      </div>
                      
                      {/* Age interactive button grid or simple slider */}
                      <div className="flex justify-center items-center gap-4">
                        <button 
                          onClick={() => setAge(Math.max(12, age - 1))}
                          className="w-10 h-10 bg-[#222222] hover:bg-white/5 text-white font-bold rounded-lg border border-white/5 flex items-center justify-center text-lg cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="range"
                          min="12"
                          max="75"
                          value={age}
                          onChange={(e) => setAge(parseInt(e.target.value))}
                          className="flex-1 accent-[#FF5F2E] h-1 bg-[#222222] rounded-lg cursor-pointer"
                        />
                        <button 
                          onClick={() => setAge(Math.min(75, age + 1))}
                          className="w-10 h-10 bg-[#222222] hover:bg-white/5 text-white font-bold rounded-lg border border-white/5 flex items-center justify-center text-lg cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-[10px] text-gray-400 text-center leading-relaxed">
                        نصيحة: تمارين الرشاقة مصممة لتناسب المدى العمري من 12 إلى 75 سنة بكفاءة وأمان تامين.
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: CURRENT WEIGHT */}
                {step === 3 && (
                  <div className="space-y-4 text-center">
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-black text-white">ما هو وزنك الحالي؟</h3>
                      <p className="text-xs text-gray-400">مفتاح رئيسي لحساب مؤشر كتلة الجسم وتحديد الاحتياج الحقيقي من الطاقة.</p>
                    </div>

                    <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 space-y-4">
                      <div className="text-4xl font-mono font-black text-[#FF912E]">
                        {weight} <span className="text-xs text-white">كجم</span>
                      </div>

                      <div className="flex justify-center items-center gap-4">
                        <button 
                          onClick={() => setWeight(Math.max(35, weight - 1))}
                          className="w-10 h-10 bg-[#222222] hover:bg-white/5 text-white font-bold rounded-lg border border-white/5 flex items-center justify-center text-lg cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="range"
                          min="35"
                          max="160"
                          value={weight}
                          onChange={(e) => setWeight(parseInt(e.target.value))}
                          className="flex-1 accent-[#FF912E] h-1 bg-[#222222] rounded-lg cursor-pointer"
                        />
                        <button 
                          onClick={() => setWeight(Math.min(160, weight + 1))}
                          className="w-10 h-10 bg-[#222222] hover:bg-white/5 text-white font-bold rounded-lg border border-white/5 flex items-center justify-center text-lg cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-[10px] bg-[#FF5F2E]/10 text-[#FF5F2E] font-bold px-3 py-1 rounded-full inline-block">
                        مقياس الوزن المعياري: {weight < 50 ? 'نحيف وقابل للزيادة' : weight < 80 ? 'وزن متوسط / نشط' : 'وزن يحتاج لإذابة وحرق الدهون'}
                      </span>
                    </div>
                  </div>
                )}

                {/* STEP 4: TARGET WEIGHT */}
                {step === 4 && (
                  <div className="space-y-4 text-center">
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-black text-white">ما هو وزنك المستهدف؟</h3>
                      <p className="text-xs text-gray-400">تحديد الهدف بوضوح يحفزك للالتزام ويسمح بحساب العجز الغذائي الملائم.</p>
                    </div>

                    <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 space-y-4">
                      <div className="text-4xl font-mono font-black text-emerald-400">
                        {targetWeight} <span className="text-xs text-white">كجم</span>
                      </div>

                      <div className="flex justify-center items-center gap-4">
                        <button 
                          onClick={() => setTargetWeight(Math.max(35, targetWeight - 1))}
                          className="w-10 h-10 bg-[#222222] hover:bg-white/5 text-white font-bold rounded-lg border border-white/5 flex items-center justify-center text-lg cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="range"
                          min="35"
                          max="160"
                          value={targetWeight}
                          onChange={(e) => setTargetWeight(parseInt(e.target.value))}
                          className="flex-1 accent-emerald-400 h-1 bg-[#222222] rounded-lg cursor-pointer"
                        />
                        <button 
                          onClick={() => setTargetWeight(Math.min(160, targetWeight + 1))}
                          className="w-10 h-10 bg-[#222222] hover:bg-white/5 text-white font-bold rounded-lg border border-white/5 flex items-center justify-center text-lg cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-[10px] text-gray-400 leading-relaxed">
                        {weight - targetWeight > 0 ? (
                          <span className="text-[#FF5F2E] font-bold">المستهدف هو نزول {weight - targetWeight} كجم من كتلة الدهون وبناء الخصر الرياضي.</span>
                        ) : weight - targetWeight < 0 ? (
                          <span className="text-emerald-400 font-bold">المستهدف هو زيادة {targetWeight - weight} كجم لبناء قوام قوي وصحي.</span>
                        ) : (
                          <span>المستهدف هو ثبات الوزن وشد العضلات وتفادي الترهلات.</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: HEIGHT */}
                {step === 5 && (
                  <div className="space-y-4 text-center">
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-black text-white">ما هو طولك بالسنتمتر؟</h3>
                      <p className="text-xs text-gray-400">الطول هو العامل الأهم لحساب مساحة توزيع كتلة الجسم ونسبة الخصر المثالية.</p>
                    </div>

                    <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 space-y-4">
                      <div className="text-4xl font-mono font-black text-[#FF5F2E]">
                        {height} <span className="text-xs text-white">سم</span>
                      </div>

                      <div className="flex justify-center items-center gap-4">
                        <button 
                          onClick={() => setHeight(Math.max(120, height - 1))}
                          className="w-10 h-10 bg-[#222222] hover:bg-white/5 text-white font-bold rounded-lg border border-white/5 flex items-center justify-center text-lg cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="range"
                          min="120"
                          max="220"
                          value={height}
                          onChange={(e) => setHeight(parseInt(e.target.value))}
                          className="flex-1 accent-[#FF5F2E] h-1 bg-[#222222] rounded-lg cursor-pointer"
                        />
                        <button 
                          onClick={() => setHeight(Math.min(220, height + 1))}
                          className="w-10 h-10 bg-[#222222] hover:bg-white/5 text-white font-bold rounded-lg border border-white/5 flex items-center justify-center text-lg cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-[10px] text-gray-400">
                        مقياس الطول: {height < 155 ? 'طول مدمج مثالي' : height < 178 ? 'طول متوسط رياضي' : 'قامة ممشوقة وطويلة'}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 6: ACTIVITY LEVEL */}
                {step === 6 && (
                  <div className="space-y-4 text-center">
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-black text-white">ما هو مستوى نشاطك اليومي؟</h3>
                      <p className="text-xs text-gray-400">تقدير معدل الحركة اليومي يمنح الخوارزمية دقة تامة لحساب السعرات النشطة.</p>
                    </div>

                    <div className="flex flex-col gap-2 pt-1 max-h-[300px] overflow-y-auto pr-1">
                      {[
                        { val: 1.2, label: 'خامل ومستقر', desc: 'جلوس مستمر في المكتب، لا أمارس الرياضة مطلقاً' },
                        { val: 1.375, label: 'نشاط خفيف', desc: 'مشي بسيط، تمارين منزلية خفيفة (1-3 أيام/أسبوع)' },
                        { val: 1.55, label: 'نشاط متوسط', desc: 'تمرين منتظم وشاق ونمط حياة نشط (3-5 أيام/أسبوع)' },
                        { val: 1.725, label: 'رياضي نشط جداً', desc: 'تمرينات يومية قاسية أو وظيفة تتطلب جهداً عضلياً مستمراً' }
                      ].map((act) => (
                        <button
                          key={act.val}
                          onClick={() => setActivityLevel(act.val)}
                          className={`w-full text-right p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1 ${
                            activityLevel === act.val
                              ? 'border-[#FF5F2E] bg-[#FF5F2E]/10 text-white shadow-xs'
                              : 'border-white/5 bg-[#1A1A1A] hover:bg-[#222222] text-gray-300'
                          }`}
                        >
                          <span className="text-xs font-black">{act.label}</span>
                          <span className="text-[10px] text-gray-400 font-medium leading-relaxed">{act.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 7: MAIN FITNESS GOAL */}
                {step === 7 && (
                  <div className="space-y-4 text-center">
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-black text-white">ما هو هدفك الرياضي الرئيسي؟</h3>
                      <p className="text-xs text-gray-400">ستقوم الخوارزمية بجدولة وحساب مستهدفات الطاقة التمرينية لتلائم هدفك.</p>
                    </div>

                    <div className="flex flex-col gap-3 pt-1">
                      {[
                        { key: 'loss', icon: '🔥', title: 'تخسيس دهون الكرش والبطن الكلي', desc: 'التركيز على إذابة دهون الخصر، وحرق السعرات العالية.' },
                        { key: 'maintain', icon: '✨', title: 'شد الترهلات والحصول على خصر مثالي', desc: 'التركيز على الإطالات المتكاملة، البلانك، وشد الأنسجة.' },
                        { key: 'gain', icon: '💪', title: 'بناء اللياقة البدنية والكتلة العضلية', desc: 'تحفيز القوة الانفجارية، تقوية الأساس (الكور) والظهر.' }
                      ].map((item) => (
                        <button
                          key={item.key}
                          onClick={() => setGoal(item.key as any)}
                          className={`w-full text-right p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                            goal === item.key
                              ? 'border-[#FF5F2E] bg-[#FF5F2E]/10 text-white shadow-xs'
                              : 'border-white/5 bg-[#1A1A1A] hover:bg-[#222222] text-gray-300'
                          }`}
                        >
                          <span className="text-3xl shrink-0">{item.icon}</span>
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-xs font-black text-white">{item.title}</span>
                            <span className="text-[10px] text-gray-400 font-medium leading-relaxed">{item.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 8: AI COACH VOICE PREFERENCE */}
                {step === 8 && (
                  <div className="space-y-4 text-center">
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-black text-white">صوت المدرب المساعد بالذكاء الاصطناعي</h3>
                      <p className="text-xs text-gray-400">اختر صوت الكابتن المفضل الذي سيرافقك بصوته طوال التحدي بنطق محترف.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <button
                        onClick={() => {
                          setVoiceGender('female');
                          // Try a test utterance
                          try {
                            if ('speechSynthesis' in window) {
                              window.speechSynthesis.cancel();
                              const utt = new SpeechSynthesisUtterance("مرحباً بك! أنا كابتن ليلى، سأرافقك خطوة بخطوة.");
                              utt.lang = 'ar-SA';
                              utt.pitch = 1.25;
                              utt.rate = 1.0;
                              window.speechSynthesis.speak(utt);
                            }
                          } catch(e){}
                        }}
                        className={`p-5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                          voiceGender === 'female'
                            ? 'border-[#FF5F2E] bg-[#FF5F2E]/10 text-white shadow-md'
                            : 'border-white/5 bg-[#1A1A1A] hover:bg-white/5 text-gray-300'
                        }`}
                      >
                        <span className="text-4xl">🎙️👩‍🏫</span>
                        <div className="text-xs font-extrabold">كابتن ليلى (صوت أنثوي)</div>
                        <span className="text-[8px] text-gray-400">صوت ناعم، محفز ومشجع للغاية</span>
                      </button>

                      <button
                        onClick={() => {
                          setVoiceGender('male');
                          // Try a test utterance
                          try {
                            if ('speechSynthesis' in window) {
                              window.speechSynthesis.cancel();
                              const utt = new SpeechSynthesisUtterance("أهلاً بك يا بطل! أنا كابتن ماجد، مستعد للتحدي ونسف الكرش!");
                              utt.lang = 'ar-SA';
                              utt.pitch = 0.85;
                              utt.rate = 1.0;
                              window.speechSynthesis.speak(utt);
                            }
                          } catch(e){}
                        }}
                        className={`p-5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                          voiceGender === 'male'
                            ? 'border-[#FF5F2E] bg-[#FF5F2E]/10 text-white shadow-md'
                            : 'border-white/5 bg-[#1A1A1A] hover:bg-white/5 text-gray-300'
                        }`}
                      >
                        <span className="text-4xl">🎙️👨‍🏫</span>
                        <div className="text-xs font-extrabold">كابتن ماجد (صوت ذكوري)</div>
                        <span className="text-[8px] text-gray-400">صوت رياضي، حازم وحماسي جداً</span>
                      </button>
                    </div>

                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center text-[10px] text-gray-400 leading-relaxed flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-[#FF5F2E] shrink-0" />
                      <span>اضغط على أحد الخيارات للاستماع لعينة تجريبية للصوت بالذكاء الاصطناعي مع تحسين النطق.</span>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

          </div>

          {/* Navigation Controls Sticky Footer */}
          <div className="flex gap-4 border-t border-white/5 pt-4 shrink-0">
            {step > 1 && (
              <button
                onClick={handlePrev}
                className="px-5 py-3 bg-[#1A1A1A] hover:bg-white/5 text-white font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>السابق</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex-1 py-3.5 bg-gradient-to-r from-[#FF5F2E] to-[#FF912E] hover:opacity-90 active:scale-98 text-white font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>{step === 8 ? 'تحليل البيانات وصناعة الخطة' : 'الاستمرار'}</span>
              <ArrowRight className="w-3.5 h-3.5 transform rotate-180" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
