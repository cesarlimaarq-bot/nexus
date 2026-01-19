
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { WorkoutView } from './components/WorkoutView';
import { NutritionView } from './components/NutritionView';
import { ProfileSetup } from './components/ProfileSetup';
import { ProfileView } from './components/ProfileView';
import { ReferencesView } from './components/ReferencesView';
import { ProgressView } from './components/ProgressView';
import { LibraryView } from './components/LibraryView';
import { NAVIGATION_ITEMS, DEFAULT_PLAN } from './constants';
import { AppState, UserProfile, WeeklyPlan, WorkoutSession } from './types';
import { generatePlan } from './services/geminiService';
import { Bell, Search, Menu, Loader2, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('nexus_fit_state');
    try {
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed || {
        profile: null,
        currentPlan: DEFAULT_PLAN,
        history: [],
        onboardingComplete: false
      };
    } catch (e) {
      return {
        profile: null,
        currentPlan: DEFAULT_PLAN,
        history: [],
        onboardingComplete: false
      };
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    localStorage.setItem('nexus_fit_state', JSON.stringify(state));
  }, [state]);

  const handlePlanUpdate = useCallback((plan: WeeklyPlan) => {
    setState(prev => ({
      ...prev,
      currentPlan: { ...plan }
    }));
  }, []);

  const handleWorkoutComplete = useCallback((session: WorkoutSession) => {
    setState(prev => ({
      ...prev,
      history: [session, ...prev.history],
    }));
    setActiveTab('progress');
  }, []);

  const syncPlanWithAI = useCallback(async (profile: UserProfile) => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const plan = await generatePlan(profile);
      handlePlanUpdate(plan);
    } catch (e) {
      console.error("Erro ao sincronizar plano com IA:", e);
      setSyncError("Não foi possível gerar seu plano agora. Tente novamente em instantes.");
    } finally {
      setIsSyncing(false);
    }
  }, [handlePlanUpdate]);

  useEffect(() => {
    const planIsEmpty = !state.currentPlan || 
                        !state.currentPlan.weeklyPlan || 
                        state.currentPlan.weeklyPlan.every(day => day.workout.length === 0);
    
    if (state.onboardingComplete && state.profile && planIsEmpty && !isSyncing && !syncError) {
      syncPlanWithAI(state.profile);
    }
  }, [state.onboardingComplete, state.profile, state.currentPlan, syncPlanWithAI, isSyncing, syncError]);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setState(prev => ({ ...prev, profile, onboardingComplete: true }));
  };

  const handleProfileUpdate = (profile: UserProfile) => {
    setState(prev => ({ 
      ...prev, 
      profile: { ...profile } 
    }));
    // Só sincroniza IA se mudar algo crítico (excluindo avatar)
    // Para simplificar, sincronizamos sempre que o perfil é salvo via Save button
    syncPlanWithAI(profile);
  };

  const userName = useMemo(() => state.profile?.name || 'Campeão', [state.profile?.name]);
  const avatarUrl = useMemo(() => 
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${state.profile?.avatarSeed || userName}`, 
    [state.profile?.avatarSeed, userName]
  );

  if (!state.onboardingComplete) {
    return <ProfileSetup onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row text-f5f5f5 transition-all duration-500">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r border-white/5 p-6 space-y-8 bg-neutral-950/50 backdrop-blur-md">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-black text-xl italic shadow-lg shadow-emerald-500/20">N</div>
          <h1 className="text-xl font-black italic tracking-tighter uppercase text-white">Nexus Fit</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          {NAVIGATION_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 font-bold tracking-tight ${
                activeTab === item.id 
                  ? 'bg-emerald-500 text-black shadow-xl shadow-emerald-500/20 translate-x-1' 
                  : 'text-gray-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 relative overflow-hidden">
          {isSyncing && (
            <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[2px] flex items-center justify-center z-10">
              <Loader2 className="animate-spin text-emerald-500" size={20} />
            </div>
          )}
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Sua IA Pessoal</p>
          <p className="text-sm text-gray-300 leading-relaxed italic font-medium">
            {syncError ? (
              <span className="text-red-400">{syncError}</span>
            ) : (
              `"Olá ${userName}, seu ecossistema está sendo otimizado com bases bibliográficas científicas."`
            )}
          </p>
          {syncError && (
            <button 
              onClick={() => state.profile && syncPlanWithAI(state.profile)}
              className="mt-2 text-[10px] font-black uppercase text-emerald-500 flex items-center gap-1"
            >
              <RefreshCw size={10} /> Tentar Novamente
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between p-6 bg-black/40 backdrop-blur-2xl border-b border-white/5 z-40">
          <div className="md:hidden flex items-center gap-3">
             <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black italic">N</div>
             <span className="font-black tracking-tighter uppercase">NEXUS</span>
          </div>
          <div className="hidden md:flex items-center bg-neutral-900/50 rounded-2xl px-5 py-2.5 border border-white/5 focus-within:border-emerald-500/50 focus-within:bg-black/40 transition-all w-96 group">
            <Search size={18} className="text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar na rede Nexus..." 
              className="bg-transparent border-none outline-none text-sm ml-3 w-full placeholder:text-gray-600"
            />
          </div>
          <div className="flex items-center gap-4">
            {isSyncing && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 animate-pulse">
                <Loader2 size={12} className="animate-spin" /> SINCRONIZANDO...
              </div>
            )}
            <button className="relative p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-black" />
            </button>
            <div 
              className={`w-11 h-11 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                activeTab === 'profile' ? 'border-emerald-500 shadow-lg shadow-emerald-500/20' : 'border-white/10 hover:border-emerald-500/50'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Scrollable View */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth scrollbar-hide">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {activeTab === 'dashboard' && <Dashboard profile={state.profile} history={state.history} />}
            {activeTab === 'workout' && (
              <WorkoutView 
                currentPlan={state.currentPlan} 
                onWorkoutComplete={handleWorkoutComplete}
              />
            )}
            {activeTab === 'nutrition' && (
              <NutritionView 
                profile={state.profile} 
                currentPlan={state.currentPlan} 
                onUpdatePlan={handlePlanUpdate} 
              />
            )}
            {activeTab === 'library' && <LibraryView />}
            {activeTab === 'references' && <ReferencesView currentPlan={state.currentPlan} />}
            {activeTab === 'progress' && <ProgressView history={state.history} />}
            {activeTab === 'profile' && state.profile && (
              <ProfileView profile={state.profile} onUpdate={handleProfileUpdate} />
            )}
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <nav className="md:hidden flex items-center justify-around p-4 bg-neutral-950/90 backdrop-blur-xl border-t border-white/5 pb-8 safe-area-bottom">
           {NAVIGATION_ITEMS.map(item => (
             <button
               key={item.id}
               onClick={() => setActiveTab(item.id)}
               className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
                 activeTab === item.id ? 'text-emerald-500 scale-110 -translate-y-1' : 'text-gray-600'
               }`}
             >
               <div className={`${activeTab === item.id ? 'bg-emerald-500/10 p-2 rounded-xl' : ''}`}>
                {item.icon}
               </div>
               <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
             </button>
           ))}
        </nav>
      </main>
    </div>
  );
};

export default App;
