import React, { useEffect, useRef } from 'react';
import { EXERCISES_DB } from '../data/exercises';
import { Play, Pause } from 'lucide-react';

interface ExerciseModelProps {
  type: 'jumping-jacks' | 'squats' | 'crunches' | 'russian-twist' | 'plank' | 'leg-raises' | 'cobra-stretch';
  isPlaying?: boolean;
  mp4Url?: string;
}

export const ExerciseModel: React.FC<ExerciseModelProps> = ({ type, isPlaying = true, mp4Url }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Look up the exercise to get its custom MP4 video URL if not explicitly provided
  const exercise = Object.values(EXERCISES_DB).find((ex) => ex.animationType === type);
  const videoSource = mp4Url || exercise?.mp4Url || 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-jumping-jacks-in-the-gym-43029-large.mp4';

  // Load and play video when source changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Explicitly load the video only when the source changes
    video.load();

    if (isPlaying) {
      video.play().catch((err) => {
        console.warn('Autoplay was prevented by browser security rules:', err);
      });
    }
  }, [videoSource]);

  // Synchronize play/pause state without resetting/reloading
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch((err) => {
        console.warn('Playback resume was prevented by browser security rules:', err);
      });
    } else {
      video.pause();
    }
  }, [isPlaying]);

  return (
    <div className="relative w-full h-72 flex items-center justify-center bg-[#0C0C0C] rounded-3xl border border-white/10 overflow-hidden shadow-inner group">
      
      {/* Background Dark Overlay and loading state indicators */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/50 pointer-events-none z-10"></div>

      {/* HTML5 Video Element playing looping MP4 */}
      <video
        ref={videoRef}
        src={videoSource}
        className="absolute inset-0 w-full h-full object-cover opacity-85 transition-opacity duration-300 group-hover:opacity-100"
        loop
        muted
        playsInline
        autoPlay
        referrerPolicy="no-referrer"
      />

      {/* Top Left Media badge */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-[#121212]/95 text-white rounded-full text-[10px] font-bold tracking-wider backdrop-blur-xs shadow-sm z-20 border border-white/5">
        <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-[#FF5F2E] animate-pulse' : 'bg-amber-400'}`}></span>
        <span className="text-gray-200">المدرب الافتراضي المباشر MP4</span>
      </div>

      {/* Play/Pause feedback Overlay when hovered or paused */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-15 transition-all animate-fade-in">
          <div className="p-4 bg-black/60 rounded-full border border-white/10 shadow-lg text-[#FF5F2E] scale-110">
            <Pause className="w-8 h-8 fill-current" />
          </div>
        </div>
      )}

      {/* Subtle bottom gradient to ensure overlay labels are readable */}
      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10"></div>
    </div>
  );
};
