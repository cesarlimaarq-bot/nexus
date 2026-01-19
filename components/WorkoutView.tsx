
import React, { useState, useEffect, useMemo } from 'react';
import { Play, Timer, Check, ChevronRight, Info, Library, Loader2, Dumbbell, X, SkipForward, Trophy, Flame, Droplets, ExternalLink, Youtube } from 'lucide-react';
import { WeeklyPlan, Exercise, WorkoutSession } from '../types';

interface Props {
  currentPlan: WeeklyPlan | null;
  onWorkoutComplete: (session: WorkoutSession) => void;
}

export const WorkoutView: React.FC<Props> = ({ currentPlan, onWorkoutComplete }) => {
  const [activeWorkoutIndex, setActiveWorkoutIndex] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [workoutResult, setWorkoutResult] = useState<WorkoutSession | null>(null);

  const workouts = useMemo(() => {
    return currentPlan?.weeklyPlan?.[selectedDayIndex]?.workout || [];
  }, [currentPlan, selectedDayIndex]);

  const activeWorkout = useMemo(() => {
    if (activeWorkoutIndex === null || !workouts[activeWorkoutIndex]) return null;
    return workouts[activeWorkoutIndex];
  }, [workouts, activeWorkoutIndex]);

  const isInitialLoading = useMemo(() => {
    return !currentPlan || currentPlan.weeklyPlan.every(d => d.workout.length === 0);
  }, [currentPlan]);

  useEffect(() => {
    let interval: any;
    if (!isPaused && activeWorkoutIndex !== null) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, activeWorkoutIndex]);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleFinishWorkout = () => {
    const totalKcal = workouts.reduce((acc, ex) => acc + (ex.kcalEstimate || 0), 0);
    const fatLost = totalKcal / 7.7;
    
    const result: WorkoutSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      dayName: currentPlan?.weeklyPlan[selectedDayIndex].day || "Hoje",
      totalKcal: Math.round(totalKcal),
      totalFatLostGrams: Math.round(fatLost * 10) / 10,
      completedExercises: workouts.length
    };
    
    setWorkoutResult(result);
    setActiveWorkoutIndex(null);
  };

  const handleNextExercise = () => {
    if (activeWorkoutIndex === null) return;
    if (activeWorkoutIndex < workouts.length - 1) {
      setActiveWorkoutIndex(activeWorkoutIndex + 1);
    } else {
      handleFinishWorkout();
    }
  };

  const startWorkout = (index: number) => {
    setWorkoutResult(null);
    setActiveWorkoutIndex(index);
    setIsPaused(false);
  };

  const saveAndExit = () => {
    if (workoutResult) {
      onWorkoutComplete(workoutResult);
    }
    setWorkoutResult(null);
  };

  const openExecutionVideo = (url: string) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getYoutubeThumbnail = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url?.match(regExp);
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
    }
    return null;
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
        <h2 className="text-xl font-bold italic uppercase tracking-tighter">Gerando seus Treinos Científicos...</h2>
        <p className="text-gray-500 text-sm max-w-xs">A Nexus AI está analisando milhares de referências para criar o treino perfeito para você.</p>
      </div>
    );
  }

  if (workoutResult) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-6 animate-in zoom-in-95 duration-500">
        <div className="bg-neutral-900 w-full max-w-lg rounded-[48px] border border-emerald-500/30 p-10 text-center shadow-[0_0_50px_rgba(16,185,129,0.15)]">
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <Trophy size={48} className="text-black" />
          </div>
          <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Missão Cumprida!</h2>
          <p className="text-gray-400 mb-8 font-medium">Você concluiu o treino de {workoutResult.dayName} com sucesso.</p>
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-black/40 p-6 rounded-[32px] border border-white/5">
              <div className="flex justify-center mb-2"><Flame className="text-orange-500" /></div>
              <p className="text-2xl font-black">{workoutResult.totalKcal}</p>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Kcal Queimadas</p>
            </div>
            <div className="bg-black/40 p-6 rounded-[32px] border border-white/5">
              <div className="flex justify-center mb-2"><Droplets className="text-blue-500" /></div>
              <p className="text-2xl font-black">{workoutResult.totalFatLostGrams}g</p>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Gordura Perdida</p>
            </div>
          </div>
          <button 
            onClick={saveAndExit}
            className="w-full bg-emerald-500 text-black py-6 rounded-3xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
          >
            SALVAR RESULTADOS E SAIR
          </button>
        </div>
      </div>
    );
  }

  if (activeWorkoutIndex !== null && activeWorkout) {
    const youtubeThumb = getYoutubeThumbnail(activeWorkout.mediaUrl);
    
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-300">
        <div className="p-6 flex justify-between items-center bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
          <button 
            onClick={() => setActiveWorkoutIndex(null)} 
            className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Exercício {activeWorkoutIndex + 1} de {workouts.length}</span>
            <div className="flex items-center gap-2 font-mono text-white text-xl font-black">
               <Timer size={18} className="text-emerald-500" /> {formatTime(timer)}
            </div>
          </div>
          <button 
            onClick={() => setIsPaused(!isPaused)} 
            className={`p-3 rounded-2xl transition-all active:scale-90 ${isPaused ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white'}`}
          >
            {isPaused ? <Play size={20} fill="currentColor" /> : <div className="w-5 h-5 bg-white rounded-sm" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-8">
            <div 
              className="relative aspect-video w-full bg-neutral-900 rounded-[40px] overflow-hidden border border-white/5 shadow-2xl group cursor-pointer"
              onClick={() => openExecutionVideo(activeWorkout.mediaUrl)}
            >
              <img 
                src={youtubeThumb || activeWorkout.mediaUrl || `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800`} 
                alt={activeWorkout.name}
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                 <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl">
                   <Youtube size={32} className="text-black" />
                 </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div className="flex-1 pr-4">
                  <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest block mb-1 flex items-center gap-1">
                    <Youtube size={12} /> Assistir Execução Técnica
                  </span>
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">{activeWorkout.name}</h2>
                </div>
                <div className="bg-emerald-500 text-black px-4 py-2 rounded-xl font-black text-xl italic shadow-lg">
                  {activeWorkout.reps}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-900/50 p-6 rounded-3xl border border-white/5">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Volume</span>
                <p className="text-xl font-bold">{activeWorkout.sets} Séries</p>
              </div>
              <div className="bg-neutral-900/50 p-6 rounded-3xl border border-white/5">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Intervalo</span>
                <p className="text-xl font-bold">{activeWorkout.rest}</p>
              </div>
            </div>

            <div className="space-y-4">
               <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                 <Info size={14} /> Descrição & Biofísica
               </h4>
               <p className="text-gray-400 leading-relaxed italic text-sm">
                 "{activeWorkout.description}"
               </p>
               <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                  <div className="flex items-center gap-2 text-[10px] text-emerald-500/60 font-black italic uppercase">
                    <Library size={12} /> Fonte: {activeWorkout.source}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-orange-500/80 font-black uppercase">
                    <Flame size={12} /> {activeWorkout.kcalEstimate} Kcal
                  </div>
                  <button 
                    onClick={() => openExecutionVideo(activeWorkout.mediaUrl)}
                    className="flex items-center gap-2 text-[10px] text-white/80 hover:text-emerald-400 font-black uppercase tracking-widest transition-colors ml-auto"
                  >
                    <ExternalLink size={12} /> Ver no YouTube
                  </button>
               </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-neutral-950/80 backdrop-blur-md border-t border-white/5">
          <div className="max-w-lg mx-auto flex gap-4">
            <button 
              onClick={handleNextExercise}
              className="flex-1 bg-white/5 py-5 rounded-2xl font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <SkipForward size={20} /> Pular
            </button>
            <button 
              onClick={handleNextExercise}
              className="flex-[2] bg-emerald-500 py-5 rounded-2xl font-black text-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 transition-all active:scale-95 active:shadow-none"
            >
              CONCLUIR SÉRIE <Check size={24} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase">Treinos de Precisão</h2>
          <p className="text-gray-400">Prescrições técnicas baseadas em evidências científicas.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {currentPlan?.weeklyPlan?.map((day, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all border ${
                selectedDayIndex === idx 
                  ? 'bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                  : 'bg-neutral-900 border-white/5 text-gray-500'
              }`}
            >
              {day.day}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {workouts.length > 0 ? workouts.map((w, idx) => {
          const thumb = getYoutubeThumbnail(w.mediaUrl);
          return (
            <div 
              key={idx} 
              className="bg-neutral-900/50 p-6 rounded-[32px] border border-white/5 flex items-center justify-between group hover:border-emerald-500/30 transition-all cursor-pointer overflow-hidden relative" 
              onClick={() => startWorkout(idx)}
            >
              <div className="absolute right-0 top-0 bottom-0 w-32 opacity-10 group-hover:opacity-20 transition-opacity">
                <img src={thumb || w.mediaUrl} alt="" className="w-full h-full object-cover grayscale" />
              </div>
              
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                  <Dumbbell size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-xl tracking-tight leading-none mb-1">{w.name}</h3>
                  <div className="flex items-center gap-3 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    <span>{w.sets} Séries</span>
                    <span>•</span>
                    <span>{w.muscleGroup}</span>
                    <span className="text-orange-500/80">• {w.kcalEstimate} Kcal</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-[9px] text-emerald-500/60 font-black italic uppercase">
                    <Youtube size={10} /> Ver Técnica fit-distance
                  </div>
                </div>
              </div>
              <button className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 relative z-10">
                <ChevronRight size={20} />
              </button>
            </div>
          );
        }) : (
          <div className="bg-neutral-900/30 border-2 border-dashed border-white/5 rounded-[40px] p-16 text-center">
            <p className="text-gray-600 font-black uppercase tracking-widest italic opacity-50">Dia de Descanso ou Cardio Regenerativo</p>
          </div>
        )}
      </div>

      <div className="bg-neutral-900/50 p-8 rounded-[40px] border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
           <Youtube size={120} />
        </div>
        <h3 className="font-black text-xl italic uppercase tracking-tighter mb-4 flex items-center gap-2"><Youtube size={22} className="text-red-500" /> Nota de Execução Técnica</h3>
        <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
          Para garantir máxima segurança e hipertrofia, cada exercício proposto inclui links de vídeo de fontes de elite como <strong>@fit-distance</strong>. 
          Assista à execução completa antes de realizar as séries para garantir a biomecânica perfeita. 
          As prescrições seguem as diretrizes do ACSM.
        </p>
      </div>
    </div>
  );
};
