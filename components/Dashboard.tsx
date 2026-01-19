
import React, { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Flame, Clock, Target, Calendar, ArrowUpRight, CheckCircle2, Activity, Droplets } from 'lucide-react';
import { UserProfile, ActivityLevel, WorkoutSession } from '../types';

interface DashboardProps {
  profile: UserProfile | null;
  history: WorkoutSession[];
}

export const Dashboard: React.FC<DashboardProps> = ({ profile, history }) => {
  // Simple TDEE and Goal calculation based on profile
  const metrics = useMemo(() => {
    if (!profile) return { dailyKcal: 2000, tdee: 2000, diff: 0 };
    
    // Mifflin-St Jeor Equation
    const s = profile.sex === 'Feminino' ? -161 : 5;
    const bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) + s;
    
    const activityFactors = {
      [ActivityLevel.SEDENTARY]: 1.2,
      [ActivityLevel.LIGHTLY_ACTIVE]: 1.375,
      [ActivityLevel.MODERATELY_ACTIVE]: 1.55,
      [ActivityLevel.ACTIVE]: 1.725,
    };
    
    const tdee = bmr * (activityFactors[profile.activityLevel] || 1.2);
    
    let dailyKcal = tdee;
    if (profile.nutrition?.objective === 'Emagrecimento') dailyKcal -= 500;
    else if (profile.nutrition?.objective === 'Ganho de massa') dailyKcal += 500;
    
    return {
      dailyKcal: Math.round(dailyKcal),
      tdee: Math.round(tdee),
      diff: Math.abs((profile.weight || 0) - (profile.targetWeight || 0)).toFixed(1)
    };
  }, [profile]);

  // Use real history for the chart if available
  const chartData = useMemo(() => {
    const currentWeight = profile?.weight || 80;
    const last7Days = Array(7).fill(0).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayStr = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
        
        // Find if we have a workout for this date
        const session = history.find(s => {
            const sDate = new Date(s.date);
            return sDate.toDateString() === d.toDateString();
        });

        return {
            name: dayStr,
            kcal: session ? session.totalKcal : 0,
            peso: currentWeight // Para peso precisaríamos de histórico de peso real
        };
    });
    return last7Days;
  }, [profile?.weight, history]);

  const lastWorkout = useMemo(() => {
    return history.length > 0 ? history[0] : null;
  }, [history]);

  const userName = profile?.name || 'Campeão';
  const targetWeight = profile?.targetWeight || 0;
  
  // Weekly total training time calculation: frequency * sessionTime * daysPerWeek / 60
  const weeklyWorkoutTime = useMemo(() => {
    if (!profile?.availability) return 0;
    const { daysPerWeek, frequencyPerDay, maxSessionTime } = profile.availability;
    const totalMinutes = daysPerWeek * (frequencyPerDay || 1) * (maxSessionTime || 0);
    return (totalMinutes / 60).toFixed(1);
  }, [profile?.availability]);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Welcome & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Olá, {userName}! 🚀</h1>
          <p className="text-gray-400">Seu plano está sincronizado com seu objetivo de {profile?.nutrition?.objective?.toLowerCase() || 'saúde'}.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-lg"><Flame size={20} className="text-white" /></div>
            <div>
              <p className="text-xs text-gray-400">Meta Ingestão</p>
              <p className="font-bold">{metrics.dailyKcal} kcal</p>
            </div>
          </div>
          {lastWorkout && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex items-center gap-3">
              <div className="bg-orange-500 p-2 rounded-lg"><Activity size={20} className="text-white" /></div>
              <div>
                <p className="text-xs text-gray-400">Gasto Hoje</p>
                <p className="font-bold">{lastWorkout.totalKcal} kcal</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Clock className="text-blue-400" />} 
          label="Meta Semanal" 
          value={`${weeklyWorkoutTime}h`} 
          sub="Tempo planejado" 
          color="blue" 
        />
        <StatCard 
          icon={<Target className="text-orange-400" />} 
          label="Meta de Peso" 
          value={`${targetWeight}kg`} 
          sub={`Faltam ${metrics.diff}kg`} 
          color="orange" 
        />
        <StatCard 
          icon={<CheckCircle2 className="text-purple-400" />} 
          label="Treinos Salvos" 
          value={`${history.length}`} 
          sub="Total concluído" 
          color="purple" 
        />
        <StatCard 
          icon={<Droplets className="text-blue-400" />} 
          label="Gordura Off" 
          value={`${history.reduce((acc, s) => acc + s.totalFatLostGrams, 0).toFixed(1)}g`} 
          sub="Estimativa total" 
          color="emerald" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900/50 p-6 rounded-3xl border border-white/5">
          <h3 className="text-lg font-semibold mb-6 flex items-center justify-between">
            Gasto Calórico Real (Treinos)
            <span className="text-emerald-400 text-xs flex items-center gap-1">
              <ArrowUpRight size={14} /> Total: {history.reduce((acc, s) => acc + s.totalKcal, 0)} kcal
            </span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorKcal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '12px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="kcal" stroke="#10b981" fillOpacity={1} fill="url(#colorKcal)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-neutral-900/50 p-6 rounded-3xl border border-white/5">
          <h3 className="text-lg font-semibold mb-6 flex items-center justify-between">
            Frequência de Treino
            <span className="text-blue-400 text-xs flex items-center gap-1">
              {profile?.availability?.daysPerWeek} dias/semana
            </span>
          </h3>
          <div className="flex items-center justify-center h-64">
             <div className="text-center">
                <div className="w-32 h-32 rounded-full border-8 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center mb-4">
                   <span className="text-3xl font-black">{Math.round((history.length / (profile?.availability?.daysPerWeek || 1)) * 100)}%</span>
                </div>
                <p className="text-xs text-gray-500 uppercase font-black tracking-widest">Aderência ao Plano</p>
             </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Insight */}
      <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center animate-pulse">
            <Activity className="text-emerald-400" size={32} />
          </div>
          <div>
            <h4 className="font-bold text-lg mb-1">Nexus AI: Insight de {profile?.name}</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              "Você já queimou {history.reduce((acc, s) => acc + s.totalKcal, 0)} kcal em seus treinos. 
              {history.length > 0 ? " Mantenha a consistência para atingir sua meta de gordura perdida." : " Comece seu primeiro treino para ver sua evolução aqui!"}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, sub }: any) => (
  <div className="bg-neutral-900/50 p-4 rounded-3xl border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
    <div className="mb-3">{icon}</div>
    <h4 className="text-gray-400 text-[10px] mb-1 uppercase tracking-widest font-bold">{label}</h4>
    <div className="flex items-baseline gap-2">
      <span className="text-xl font-black">{value}</span>
    </div>
    <p className="text-[10px] text-gray-500 mt-1 font-medium">{sub}</p>
  </div>
);
