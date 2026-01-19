
import React, { useMemo } from 'react';
import { WorkoutSession } from '../types';
import { TrendingUp, Flame, Droplets, Calendar, ChevronRight, Award } from 'lucide-react';

interface Props {
  history: WorkoutSession[];
}

export const ProgressView: React.FC<Props> = ({ history }) => {
  const totals = useMemo(() => {
    return history.reduce((acc, s) => ({
      kcal: acc.kcal + s.totalKcal,
      fat: acc.fat + s.totalFatLostGrams,
      count: acc.count + 1
    }), { kcal: 0, fat: 0, count: 0 });
  }, [history]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      <div>
        <h2 className="text-3xl font-black italic tracking-tighter uppercase">Evolução Nexus</h2>
        <p className="text-gray-400">Acompanhamento contínuo de resultados baseados em biometria.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[40px] text-center">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-black mx-auto mb-4">
             <Award size={24} />
          </div>
          <p className="text-4xl font-black mb-1">{totals.count}</p>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Treinos Concluídos</p>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/20 p-8 rounded-[40px] text-center">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-black mx-auto mb-4">
             <Flame size={24} />
          </div>
          <p className="text-4xl font-black mb-1">{totals.kcal}</p>
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Kcal Acumuladas</p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 p-8 rounded-[40px] text-center">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-black mx-auto mb-4">
             <Droplets size={24} />
          </div>
          <p className="text-4xl font-black mb-1">{totals.fat.toFixed(1)}g</p>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Gordura Perdida</p>
        </div>
      </div>

      <div className="bg-neutral-900/50 p-8 rounded-[40px] border border-white/5">
        <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
          <Calendar className="text-emerald-500" /> Histórico de Sessões
        </h3>
        
        <div className="space-y-4">
          {history.length > 0 ? history.map((session, idx) => (
            <div key={session.id} className="bg-black/40 p-6 rounded-[32px] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-500/30 transition-all">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-neutral-800 rounded-2xl flex items-center justify-center text-emerald-500">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg leading-none mb-1">Treino: {session.dayName}</h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    {new Date(session.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-lg font-black">{session.totalKcal} kcal</p>
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Energia</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-emerald-500">{session.totalFatLostGrams}g</p>
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Gordura</p>
                </div>
                <ChevronRight className="text-gray-700" size={20} />
              </div>
            </div>
          )) : (
            <div className="text-center py-20 bg-black/20 rounded-3xl border border-dashed border-white/5">
               <p className="text-gray-600 font-black uppercase tracking-widest italic">Nenhum treino registrado ainda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
