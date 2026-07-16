import React, { useState, useEffect } from 'react';
import { UserStats } from '../types';
import { Calculator, Sparkles, Scale, Activity, Trophy, Apple, Flame, Droplet } from 'lucide-react';

interface CalorieCalculatorProps {
  onSaveStats: (stats: UserStats) => void;
  savedStats?: UserStats;
  isDark?: boolean;
}

export const CalorieCalculator: React.FC<CalorieCalculatorProps> = ({ onSaveStats, savedStats, isDark = true }) => {
  const [weight, setWeight] = useState<number>(savedStats?.weight || 75);
  const [height, setHeight] = useState<number>(savedStats?.height || 170);
  const [age, setAge] = useState<number>(savedStats?.age || 28);
  const [gender, setGender] = useState<'ذكر' | 'أنثى'>(savedStats?.gender || 'أنثى');
  const [activityLevel, setActivityLevel] = useState<number>(savedStats?.activityLevel || 1.375);
  const [goal, setGoal] = useState<'loss' | 'maintain' | 'gain'>(savedStats?.goal || 'loss');

  const [bmr, setBmr] = useState<number>(0);
  const [tdee, setTdee] = useState<number>(0);
  const [targetCalories, setTargetCalories] = useState<number>(0);
  const [bmi, setBmi] = useState<number>(0);
  const [bmiStatus, setBmiStatus] = useState<string>('');
  const [bmiColor, setBmiColor] = useState<string>('');
  const [waterGoal, setWaterGoal] = useState<number>(0); // in Liters

  // Calculate stats dynamically when input variables change
  useEffect(() => {
    // 1. BMI Calculation: Weight (kg) / Height^2 (m)
    const heightInMeters = height / 100;
    const bmiVal = weight / (heightInMeters * heightInMeters);
    setBmi(parseFloat(bmiVal.toFixed(1)));

    if (bmiVal < 18.5) {
      setBmiStatus('نقص في الوزن');
      setBmiColor(isDark ? 'text-amber-500 bg-amber-500/10' : 'text-amber-700 bg-amber-50');
    } else if (bmiVal < 25) {
      setBmiStatus('وزن صحي ومثالي');
      setBmiColor(isDark ? 'text-emerald-500 bg-emerald-500/10' : 'text-emerald-700 bg-emerald-50');
    } else if (bmiVal < 30) {
      setBmiStatus('زيادة في الوزن');
      setBmiColor(isDark ? 'text-orange-500 bg-orange-500/10' : 'text-orange-700 bg-orange-50');
    } else {
      setBmiStatus('سمنة');
      setBmiColor(isDark ? 'text-rose-500 bg-rose-500/10' : 'text-rose-700 bg-rose-50');
    }

    // 2. BMR Calculation (Mifflin-St Jeor Equation)
    let bmrVal = 0;
    if (gender === 'ذكر') {
      bmrVal = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmrVal = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    setBmr(Math.round(bmrVal));

    // 3. TDEE Calculation
    const tdeeVal = bmrVal * activityLevel;
    setTdee(Math.round(tdeeVal));

    // 4. Target Calories based on Goal
    let target = tdeeVal;
    if (goal === 'loss') {
      target = tdeeVal - 500; // Caloric deficit of 500
    } else if (goal === 'gain') {
      target = tdeeVal + 350; // Surplus of 350
    }
    // Safety lower limit
    setTargetCalories(Math.max(1200, Math.round(target)));

    // 5. Water Goal: Weight in kg * 35 ml
    const waterLit = (weight * 35) / 1000;
    setWaterGoal(parseFloat(waterLit.toFixed(1)));
  }, [weight, height, age, gender, activityLevel, goal, isDark]);

  const handleSave = () => {
    onSaveStats({
      weight,
      height,
      age,
      gender,
      activityLevel,
      goal,
    });
  };

  // Macros Calculation
  const carbPct = goal === 'loss' ? 0.4 : goal === 'gain' ? 0.5 : 0.45;
  const proteinPct = goal === 'loss' ? 0.35 : goal === 'gain' ? 0.3 : 0.3;
  const fatPct = goal === 'loss' ? 0.25 : goal === 'gain' ? 0.2 : 0.25;

  const carbsGrams = Math.round((targetCalories * carbPct) / 4);
  const proteinGrams = Math.round((targetCalories * proteinPct) / 4);
  const fatGrams = Math.round((targetCalories * fatPct) / 9);

  return (
    <div className={`space-y-6 pb-20 ${isDark ? 'text-white' : 'text-gray-900'}`} dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#FF5F2E] to-[#FF912E] rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2.5 bg-white/20 rounded-2xl">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">حسابات دقيقة</span>
            <h2 className="text-xl font-bold mt-1">حاسبة السعرات والوزن المثالي</h2>
          </div>
        </div>
        <p className="text-xs text-white/90 mt-3 leading-relaxed">
          أدخل بيانات جسمك بدقة لحساب احتياجك اليومي من الطاقة والماء والمغذيات الأساسية لتسريع حرق دهون البطن.
        </p>
      </div>

      {/* Input Form & Realtime Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Card */}
        <div className={`p-6 rounded-3xl border shadow-xs space-y-5 ${
          isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-100 shadow-sm'
        }`}>
          <h3 className={`font-bold text-base flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-950'}`}>
            <Scale className="w-5 h-5 text-[#FF5F2E]" />
            <span>بيانات القياسات الشخصية</span>
          </h3>

          {/* Gender selection */}
          <div className="space-y-2">
            <label className={`text-xs font-semibold block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>الجنس</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender('أنثى')}
                className={`py-2.5 rounded-2xl font-bold text-sm transition-all border flex items-center justify-center gap-2 ${
                  gender === 'أنثى'
                    ? 'border-[#FF5F2E] bg-[#FF5F2E]/10 text-[#FF5F2E]'
                    : (isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-gray-200 text-gray-700 hover:bg-gray-50')
                }`}
              >
                👩 أنثى
              </button>
              <button
                type="button"
                onClick={() => setGender('ذكر')}
                className={`py-2.5 rounded-2xl font-bold text-sm transition-all border flex items-center justify-center gap-2 ${
                  gender === 'ذكر'
                    ? 'border-[#FF5F2E] bg-[#FF5F2E]/10 text-[#FF5F2E]'
                    : (isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-gray-200 text-gray-700 hover:bg-gray-50')
                }`}
              >
                👨 ذكر
              </button>
            </div>
          </div>

          {/* Weight input slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>الوزن الحالي</span>
              <span className="text-[#FF5F2E] font-bold font-mono">{weight} كجم</span>
            </div>
            <input
              type="range"
              min="35"
              max="160"
              value={weight}
              onChange={(e) => setWeight(parseInt(e.target.value))}
              className={`w-full accent-[#FF5F2E] h-1.5 rounded-lg cursor-pointer ${isDark ? 'bg-[#222222]' : 'bg-gray-200'}`}
            />
          </div>

          {/* Height input slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>الطول</span>
              <span className="text-[#FF5F2E] font-bold font-mono">{height} سم</span>
            </div>
            <input
              type="range"
              min="100"
              max="220"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value))}
              className={`w-full accent-[#FF5F2E] h-1.5 rounded-lg cursor-pointer ${isDark ? 'bg-[#222222]' : 'bg-gray-200'}`}
            />
          </div>

          {/* Age input slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>العمر</span>
              <span className="text-[#FF5F2E] font-bold font-mono">{age} سنة</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value))}
              className={`w-full accent-[#FF5F2E] h-1.5 rounded-lg cursor-pointer ${isDark ? 'bg-[#222222]' : 'bg-gray-200'}`}
            />
          </div>

          {/* Activity Level selection */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>مستوى النشاط اليومي</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(parseFloat(e.target.value))}
              className={`w-full py-2.5 px-3 border rounded-2xl text-xs font-semibold focus:outline-hidden focus:border-[#FF5F2E] ${
                isDark ? 'bg-[#222222] border-white/5 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
              }`}
            >
              <option value="1.2">خامل (وظيفة مكتبية / لا تمرين)</option>
              <option value="1.375">نشاط خفيف (تمرين خفيف 1-3 أيام/أسبوع)</option>
              <option value="1.55">نشاط متوسط (تمرين رياضي 3-5 أيام/أسبوع)</option>
              <option value="1.725">نشاط عالٍ (تمرين شاق 6-7 أيام/أسبوع)</option>
              <option value="1.9">نشاط فائق الرياضية (عمل بدني شاق جداً)</option>
            </select>
          </div>

          {/* Fitness Goal selection */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>الهدف المراد تحقيقه</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setGoal('loss')}
                className={`py-2 rounded-xl text-[11px] font-bold transition-all border ${
                  goal === 'loss'
                    ? 'border-[#FF5F2E] bg-[#FF5F2E] text-white shadow-xs'
                    : (isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-gray-200 text-gray-700 hover:bg-gray-50')
                }`}
              >
                🔥 تخسيس دهون
              </button>
              <button
                type="button"
                onClick={() => setGoal('maintain')}
                className={`py-2 rounded-xl text-[11px] font-bold transition-all border ${
                  goal === 'maintain'
                    ? 'border-[#FF5F2E] bg-[#FF5F2E] text-white shadow-xs'
                    : (isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-gray-200 text-gray-700 hover:bg-gray-50')
                }`}
              >
                ⚖️ وزن مثالي
              </button>
              <button
                type="button"
                onClick={() => setGoal('gain')}
                className={`py-2 rounded-xl text-[11px] font-bold transition-all border ${
                  goal === 'gain'
                    ? 'border-[#FF5F2E] bg-[#FF5F2E] text-white shadow-xs'
                    : (isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-gray-200 text-gray-700 hover:bg-gray-50')
                }`}
              >
                💪 تضخيم عضلي
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full mt-4 py-3 bg-gradient-to-r from-[#FF5F2E] to-[#FF912E] hover:opacity-90 text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>حفظ البيانات وتحديث خطتي اليومية</span>
          </button>
        </div>

        {/* Results Card */}
        <div className="space-y-6">
          {/* Target Calories display */}
          <div className={`border p-6 rounded-3xl shadow-xs space-y-4 ${
            isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono uppercase tracking-wider ${
              isDark ? 'bg-white/10 text-[#FF912E]' : 'bg-[#FF912E]/10 text-[#FF5F2E] font-bold'
            }`}>
              احتياج السعرات المستهدف
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-[#FF5F2E] font-mono">{targetCalories}</span>
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>سعرة حرارية / اليوم</span>
            </div>
            
            {/* Target energy indicator bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] text-gray-400 font-medium">
                <span>تخسيس البطن</span>
                <span>الحفاظ على طاقتك</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#222222]' : 'bg-gray-100'}`}>
                <div 
                  className="bg-[#FF5F2E] h-full rounded-full transition-all duration-500"
                  style={{ width: goal === 'loss' ? '40%' : goal === 'maintain' ? '70%' : '100%' }}
                ></div>
              </div>
            </div>

            {/* Other Calculations Grid */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-center gap-1.5 text-gray-400 text-[11px] mb-1 font-semibold">
                  <Flame className="w-3.5 h-3.5 text-[#FF5F2E]" />
                  <span>الأيض الأساسي (BMR)</span>
                </div>
                <span className={`text-lg font-bold font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{bmr} <span className="text-[10px] text-gray-400 font-sans">سعرة</span></span>
              </div>
              
              <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-center gap-1.5 text-gray-400 text-[11px] mb-1 font-semibold">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  <span>الحرق الكامل (TDEE)</span>
                </div>
                <span className={`text-lg font-bold font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{tdee} <span className="text-[10px] text-gray-400 font-sans">سعرة</span></span>
              </div>
            </div>
          </div>

          {/* BMI Card */}
          <div className={`border p-5 rounded-3xl flex items-center justify-between gap-4 ${
            isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <div className="space-y-1">
              <span className={`text-xs block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>مؤشر كتلة جسمك (BMI)</span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl font-extrabold font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{bmi}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${bmiColor}`}>{bmiStatus}</span>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg border ${
              isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'
            }`}>
              ⚖️
            </div>
          </div>

          {/* Water goal recommendation */}
          <div className={`border p-5 rounded-3xl flex items-center gap-4 ${
            isDark ? 'bg-sky-500/10 border-sky-500/20' : 'bg-sky-50 border-sky-100 shadow-xs'
          }`}>
            <div className="p-3 bg-sky-500 text-white rounded-2xl">
              <Droplet className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className={`text-xs font-semibold block ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>معدل شرب الماء اليومي</span>
              <span className={`text-lg font-extrabold font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {waterGoal} لتر <span className={`text-xs font-normal ${isDark ? 'text-sky-300' : 'text-sky-600'} font-sans`}>(حوالي {Math.round(waterGoal * 4)} أكواب)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Macronutrient breakdown */}
      <div className={`p-6 rounded-3xl border shadow-xs space-y-4 ${
        isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-950'}`}>
          <Apple className="w-5 h-5 text-[#FF5F2E]" />
          <span>توزيع العناصر الغذائية الموصى به لمقدار {targetCalories} سعرة</span>
        </h3>
        <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          تقسيم مثالي لبناء عضلات مشدودة ومحاربة شحوم الكرش بمعدل غني بالبروتين المفيد.
        </p>

        <div className="grid grid-cols-3 gap-3 pt-2">
          {/* Proteins */}
          <div className="bg-[#FF5F2E]/5 p-4 rounded-2xl border border-[#FF5F2E]/10 flex flex-col items-center text-center">
            <span className="text-xs font-semibold text-[#FF5F2E] mb-1">البروتينات</span>
            <span className={`text-xl font-extrabold font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{proteinGrams}g</span>
            <span className="text-[10px] text-gray-400 font-medium mt-1">{(proteinPct * 100)}% من طعامك</span>
          </div>

          {/* Carbs */}
          <div className="bg-[#FF912E]/5 p-4 rounded-2xl border border-[#FF912E]/10 flex flex-col items-center text-center">
            <span className="text-xs font-semibold text-[#FF912E] mb-1">الكربوهيدرات</span>
            <span className={`text-xl font-extrabold font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{carbsGrams}g</span>
            <span className="text-[10px] text-gray-400 font-medium mt-1">{(carbPct * 100)}% من طعامك</span>
          </div>

          {/* Fats */}
          <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 flex flex-col items-center text-center">
            <span className="text-xs font-semibold text-emerald-500 mb-1">الدهون الصحية</span>
            <span className={`text-xl font-extrabold font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>{fatGrams}g</span>
            <span className="text-[10px] text-gray-400 font-medium mt-1">{(fatPct * 100)}% من طعامك</span>
          </div>
        </div>
      </div>
    </div>
  );
};
