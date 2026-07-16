import React, { useState } from 'react';
import { DailyLog, JournalTask } from '../types';
import { Droplet, Weight, Calendar, CheckSquare, Plus, Trash2, Milestone, Star, Flame, Trophy } from 'lucide-react';

interface DailyJournalProps {
  logs: Record<string, DailyLog>;
  tasks: JournalTask[];
  onUpdateWater: (change: number) => void;
  onLogWeight: (weight: number) => void;
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  waterGoalCups: number;
  isDark?: boolean;
}

export const DailyJournal: React.FC<DailyJournalProps> = ({
  logs,
  tasks,
  onUpdateWater,
  onLogWeight,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  waterGoalCups,
  isDark = true,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog: DailyLog = logs[todayStr] || {
    date: todayStr,
    waterCups: 0,
    caloriesBurned: 0,
    caloriesEaten: 0,
    completedExercisesCount: 0,
    completedDays: [],
  };

  const [weightInput, setWeightInput] = useState<string>('');
  const [taskInput, setTaskInput] = useState<string>('');

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (!isNaN(val) && val > 30 && val < 250) {
      onLogWeight(val);
      setWeightInput('');
    }
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskInput.trim()) {
      onAddTask(taskInput.trim());
      setTaskInput('');
    }
  };

  // Calculate streak
  const sortedDates = Object.keys(logs).sort();
  let currentStreak = 0;
  if (sortedDates.length > 0) {
    let streakCount = 0;
    const todayObj = new Date();
    let checkDate = todayObj;
    let keepChecking = true;

    while (keepChecking) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const log = logs[dateStr];
      if (log && (log.completedExercisesCount > 0 || log.waterCups > 0 || log.caloriesBurned > 0)) {
        streakCount++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (checkDate.toDateString() === todayObj.toDateString()) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayStr = checkDate.toISOString().split('T')[0];
          const yestLog = logs[yesterdayStr];
          if (yestLog && (yestLog.completedExercisesCount > 0 || yestLog.waterCups > 0 || yestLog.caloriesBurned > 0)) {
            continue;
          }
        }
        keepChecking = false;
      }
    }
    currentStreak = streakCount;
  }

  // Generate last 7 days for quick logs status
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const log = logs[dateStr];
    return {
      dateStr,
      dayName: d.toLocaleDateString('ar-SA', { weekday: 'short' }),
      dayNum: d.getDate(),
      hasLog: !!log && (log.completedExercisesCount > 0 || log.caloriesBurned > 0),
    };
  }).reverse();

  return (
    <div className={`space-y-6 pb-20 ${isDark ? 'text-white' : 'text-gray-950'}`} dir="rtl">
      {/* Upper Streak & Info Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Streak card */}
        <div className="bg-gradient-to-br from-[#FF5F2E] to-[#FF912E] p-4 rounded-3xl text-white shadow-xs flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-2xl">
            <Flame className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-white/85 block font-medium">سلسلة الالتزام</span>
            <span className="text-lg font-black font-mono">{currentStreak} <span className="text-xs font-normal">أيام متتالية</span></span>
          </div>
        </div>

        {/* Exercises count card */}
        <div className={`p-4 rounded-3xl border shadow-sm flex items-center gap-3 ${
          isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-100 shadow-sm'
        }`}>
          <div className="p-2 bg-[#FF5F2E]/10 text-[#FF5F2E] rounded-2xl">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className={`text-[10px] block font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>إجمالي التمارين</span>
            <span className={`text-lg font-black font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {todayLog.completedExercisesCount} <span className="text-xs font-normal text-gray-400">تمارين اليوم</span>
            </span>
          </div>
        </div>
      </div>

      {/* 7 Days tracker widget */}
      <div className={`p-5 rounded-3xl border shadow-sm space-y-3 ${
        isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        <h3 className={`font-bold text-xs flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <Calendar className="w-4 h-4 text-[#FF5F2E]" />
          <span>سجل نشاطك في الـ 7 أيام الماضية</span>
        </h3>
        <div className="grid grid-cols-7 gap-2 pt-1">
          {last7Days.map((day, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col items-center p-2 rounded-2xl border text-center transition-all ${
                day.dateStr === todayStr 
                  ? 'border-[#FF5F2E] bg-[#FF5F2E]/10' 
                  : (isDark ? 'border-white/5 bg-[#222222]/30' : 'border-gray-100 bg-gray-50')
              }`}
            >
              <span className={`text-[10px] ${day.dateStr === todayStr ? 'text-[#FF5F2E] font-extrabold' : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>{day.dayName}</span>
              <span className={`text-sm font-extrabold font-mono mt-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{day.dayNum}</span>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] mt-2 ${
                day.hasLog 
                  ? 'bg-emerald-500 text-white shadow-xs font-bold' 
                  : (isDark ? 'bg-white/5 text-gray-500' : 'bg-gray-200 text-gray-400')
              }`}>
                {day.hasLog ? '✓' : '•'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid for Tasks & Logger */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* WATER TRACKER */}
        <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
          isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-100 shadow-sm'
        }`}>
          <div className="flex justify-between items-center">
            <h3 className={`font-bold text-base flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Droplet className="w-5 h-5 text-sky-400" />
              <span>مراقب شرب الماء اليومي</span>
            </h3>
            <span className="text-[10px] bg-sky-500/10 text-sky-500 font-bold px-2.5 py-0.5 rounded-full">
              كوب = 250 مل
            </span>
          </div>

          <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            الماء أساسي لتسريع الهضم وحرق دهون البطن. حاول شرب كوب ماء قبل التمرين ونصف كوب كل 15 دقيقة.
          </p>

          {/* Interactive water glasses indicator */}
          <div className={`flex flex-col items-center justify-center py-4 rounded-2xl border space-y-3 ${
            isDark ? 'bg-sky-500/5 border-sky-500/10' : 'bg-sky-50 border-sky-100'
          }`}>
            <div className="flex justify-center flex-wrap gap-2 px-4">
              {Array.from({ length: Math.max(waterGoalCups, 8) }).map((_, i) => (
                <span 
                  key={i} 
                  className={`text-2xl transition-all filter duration-300 ${
                    i < todayLog.waterCups 
                      ? 'drop-shadow-[0_2px_4px_rgba(14,165,233,0.3)] opacity-100 scale-105' 
                      : 'opacity-25 grayscale scale-95 hover:opacity-40'
                  }`}
                >
                  🥛
                </span>
              ))}
            </div>

            <div className="text-center">
              <span className="text-xs text-sky-500 font-bold block">إجمالي المستهلك اليوم</span>
              <span className={`text-3xl font-black font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {todayLog.waterCups} <span className="text-xs font-normal text-sky-500">/ {waterGoalCups} أكواب</span>
              </span>
              <span className={`text-[11px] block font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>({(todayLog.waterCups * 0.25).toFixed(2)} لتر مستهلك)</span>
            </div>
          </div>

          {/* Plus/Minus Water Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onUpdateWater(-1)}
              disabled={todayLog.waterCups === 0}
              className={`py-3 border font-extrabold rounded-2xl text-xs active:scale-98 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${
                isDark ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              - كوب واحد أقل
            </button>
            <button
              onClick={() => onUpdateWater(1)}
              className="py-3 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-2xl text-xs active:scale-98 transition-all shadow-xs cursor-pointer text-center"
            >
              + إضافة كوب ماء
            </button>
          </div>
        </div>

        {/* WEIGHT LOGGER */}
        <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
          isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-100 shadow-sm'
        }`}>
          <h3 className={`font-bold text-base flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Weight className="w-5 h-5 text-[#FF5F2E]" />
            <span>تسجيل ومتابعة الوزن</span>
          </h3>

          <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            قم بتسجيل وزنك بانتظام (يفضل صباحاً قبل تناول الإفطار) لمراقبة تطورك الفعلي بدقة.
          </p>

          <form onSubmit={handleWeightSubmit} className="flex gap-2">
            <input
              type="number"
              step="0.1"
              required
              placeholder="مثال: 72.5"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className={`flex-1 py-2.5 px-3 border rounded-2xl text-xs focus:outline-hidden focus:border-[#FF5F2E] ${
                isDark ? 'bg-[#222222] border-white/5 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
              }`}
            />
            <button
              type="submit"
              className="py-2.5 px-5 bg-gradient-to-r from-[#FF5F2E] to-[#FF912E] text-white text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-sm"
            >
              تسجيل
            </button>
          </form>

          {/* Weight history summary */}
          <div className="space-y-2 pt-2">
            <span className={`text-[11px] font-bold block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>آخر قياسات الوزن المسجلة:</span>
            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
              {(Object.values(logs) as DailyLog[])
                .filter(l => l.weightLogged !== undefined)
                .sort((a,b) => b.date.localeCompare(a.date))
                .slice(0, 4)
                .map((log, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-white/5">
                    <span className="text-gray-400 font-medium">{log.date}</span>
                    <span className="font-mono font-bold text-[#FF5F2E]">{log.weightLogged} كجم</span>
                  </div>
                ))}
              {(Object.values(logs) as DailyLog[]).filter(l => l.weightLogged !== undefined).length === 0 && (
                <div className="text-center py-4 text-xs text-gray-400">
                  لم تقم بتسجيل أي قراءة للوزن بعد.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TODAY'S FITNESS CHEKLIST */}
      <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
        isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        <h3 className={`font-bold text-base flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <CheckSquare className="w-5 h-5 text-[#FF5F2E]" />
          <span>اليوميات والمهام الصحية والغذائية</span>
        </h3>
        
        <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          أنجز المهام اليومية لضمان توازن مثالي بين الرياضة والغذاء والمحافظة على دافع التقدم المستمر.
        </p>

        {/* Add custom task */}
        <form onSubmit={handleTaskSubmit} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="مثال: الامتناع عن السكر، شرب شاي أخضر..."
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            className={`flex-1 py-2.5 px-3 border rounded-2xl text-xs focus:outline-hidden focus:border-[#FF5F2E] ${
              isDark ? 'bg-[#222222] border-white/5 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
            }`}
          />
          <button
            type="submit"
            className="py-2.5 px-4 bg-gradient-to-r from-[#FF5F2E] to-[#FF912E] text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة</span>
          </button>
        </form>

        {/* Task List */}
        <div className="space-y-2 pt-2">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                task.completed 
                  ? 'border-emerald-500/10 bg-emerald-500/5 text-gray-400 line-through' 
                  : (isDark ? 'border-white/5 bg-[#222222]/30 text-white' : 'border-gray-100 bg-gray-50 text-gray-800')
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleTask(task.id)}
                  className="w-4.5 h-4.5 accent-[#FF5F2E] rounded-lg cursor-pointer"
                />
                <span className="text-xs font-semibold">{task.text}</span>
              </div>
              
              <button
                onClick={() => onDeleteTask(task.id)}
                className="text-gray-400 hover:text-rose-500 p-1.5 rounded-lg transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="text-center py-6 text-xs text-gray-400">
              لا توجد مهام نشطة حالياً. أضف مهمتك الأولى أعلاه!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
