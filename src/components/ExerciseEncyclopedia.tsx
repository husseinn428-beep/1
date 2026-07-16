import React, { useState } from 'react';
import { EXERCISES_DB } from '../data/exercises';
import { Exercise } from '../types';
import { Search, Info, Flame, Clock, PlayCircle, Star, Dumbbell } from 'lucide-react';
import { ExerciseModel } from './ExerciseModel';

interface ExerciseEncyclopediaProps {
  isDark?: boolean;
}

export const ExerciseEncyclopedia: React.FC<ExerciseEncyclopediaProps> = ({ isDark = true }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const exercises = Object.values(EXERCISES_DB) as Exercise[];

  // Define muscle categories matching exactly the muscleGroup field of Exercise
  const categories = [
    { id: 'all', name: 'الكل' },
    { id: 'عضلات البطن والخصر', name: 'عضلات البطن والخصر' },
    { id: 'كامل الجسم', name: 'كامل الجسم' },
    { id: 'الجزء السفلي والفخذين', name: 'الجزء السفلي والخصر' },
    { id: 'الإطالات والاستشفاء', name: 'الإطالات والاستشفاء' },
  ];

  // Filter exercises based on query and muscleGroup
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = 
      ex.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ex.steps && ex.steps.some((step) => step.includes(searchQuery)));
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      ex.muscleGroup === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`space-y-6 pb-20 ${isDark ? 'text-white' : 'text-gray-950'}`} dir="rtl">
      {/* Search and Category Filter section */}
      <div className={`p-5 rounded-3xl border shadow-xs space-y-4 ${
        isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث عن تمرين... (مثال: بلانك، سكوات)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full py-3 pr-10 pl-4 border rounded-2xl text-xs font-semibold focus:outline-hidden focus:border-[#FF5F2E] ${
              isDark ? 'bg-[#222222] border-white/5 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
            }`}
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
        </div>

        {/* Scrollable category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#FF5F2E] text-white shadow-xs'
                  : (isDark ? 'bg-[#222222] text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of exercise cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            onClick={() => setSelectedExercise(exercise)}
            className={`p-4 rounded-3xl border hover:border-[#FF5F2E]/30 transition-all cursor-pointer flex gap-4 ${
              isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-100 shadow-sm'
            }`}
          >
            {/* Exercise preview image or avatar */}
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 ${
              isDark ? 'bg-[#222222]' : 'bg-gray-50'
            }`}>
              <Dumbbell className="w-8 h-8 text-[#FF5F2E]" />
            </div>

            {/* Exercise details */}
            <div className="flex-1 space-y-1.5 min-w-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'
              }`}>
                {exercise.muscleGroup}
              </span>
              <h3 className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{exercise.nameAr}</h3>
              <p className="text-[10px] text-gray-400 font-mono uppercase truncate">{exercise.nameEn}</p>
              
              <div className="flex gap-4 text-[10px] text-gray-400 font-semibold pt-1">
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-[#FF5F2E]" />
                  <span>{exercise.caloriesPerMin} سعرة / د</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sky-400" />
                  <span>{exercise.duration} ثانية</span>
                </span>
              </div>
            </div>
          </div>
        ))}

        {filteredExercises.length === 0 && (
          <div className="col-span-full text-center py-10 text-xs text-gray-400">
            لا توجد تمارين تطابق بحثك حالياً. جرب كلمات أخرى!
          </div>
        )}
      </div>

      {/* MODAL DETAILED VIEW */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop (X Close Trigger) */}
          <div 
            onClick={() => setSelectedExercise(null)}
            className="absolute inset-0 bg-black/80 backdrop-blur-xs"
          ></div>

          {/* Modal Container */}
          <div className={`w-full max-w-md rounded-3xl border overflow-hidden relative z-10 animate-fade-in ${
            isDark ? 'bg-[#121212] border-white/5 text-white' : 'bg-white border-gray-100 text-gray-900'
          }`}>
            {/* Header info */}
            <div className={`p-4 flex justify-between items-center border-b ${
              isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-gray-50 border-gray-100'
            }`}>
              <div>
                <h3 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-gray-950'}`}>{selectedExercise.nameAr}</h3>
                <p className="text-[10px] text-gray-400 font-mono uppercase mt-0.5">{selectedExercise.nameEn}</p>
              </div>
              <button
                onClick={() => setSelectedExercise(null)}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isDark ? 'bg-[#222222] text-gray-300 hover:text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ✕ قفل
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Exercise model display */}
              <div className="w-full">
                <ExerciseModel type={selectedExercise.animationType} isPlaying={true} mp4Url={selectedExercise.mp4Url} />
              </div>

              {/* Estimate counters */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-2xl text-center border ${
                  isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-gray-50 border-gray-100'
                }`}>
                  <span className="text-[10px] text-gray-400 font-semibold block mb-1">السعرات التقريبية</span>
                  <span className="text-sm font-extrabold text-[#FF5F2E] font-mono">{selectedExercise.caloriesPerMin} <span className="text-[10px] font-sans font-medium text-gray-400">سعرة / دقيقة</span></span>
                </div>
                <div className={`p-3 rounded-2xl text-center border ${
                  isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-gray-50 border-gray-100'
                }`}>
                  <span className="text-[10px] text-gray-400 font-semibold block mb-1">المجموعة المقترحة</span>
                  <span className="text-sm font-extrabold text-sky-400 font-mono">3 مجموعات × 12 تكراراً</span>
                </div>
              </div>

              {/* Tips block */}
              {selectedExercise.tips && selectedExercise.tips.length > 0 && (
                <div className={`p-3.5 rounded-2xl border ${
                  isDark ? 'bg-amber-500/5 border-amber-500/10' : 'bg-amber-500/5 border-amber-500/15'
                }`}>
                  <span className="text-[11px] font-bold text-[#FF5F2E] flex items-center gap-1 mb-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span>نصيحة الكابتن للأداء المثالي:</span>
                  </span>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{selectedExercise.tips[0]}</p>
                </div>
              )}

              {/* Sequential Steps instructions */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 block">خطوات التنفيذ بالتفصيل:</span>
                <ul className="space-y-2 pr-1">
                  {selectedExercise.steps.map((step, idx) => (
                    <li key={idx} className="text-xs flex items-start gap-2.5 leading-relaxed">
                      <span className={`w-4 h-4 rounded-full text-[10px] font-bold font-mono flex items-center justify-center shrink-0 mt-0.5 ${
                        isDark ? 'bg-[#222222] text-gray-400' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
