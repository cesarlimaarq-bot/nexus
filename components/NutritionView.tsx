
import React, { useState, useMemo } from 'react';
import { 
  Coffee, Utensils, Moon, Edit3, ChevronDown, ChevronUp, Sparkles, Loader2,
  Table, Calendar as CalendarIcon, Info, Library, BookOpen, RefreshCw, Plus, Trash2, CheckCircle
} from 'lucide-react';
import { WeeklyPlan, UserProfile, Meal, MealOption, DailyPlan } from '../types';
import { generatePlan, calculateNutrition } from '../services/geminiService';

interface Props {
  profile: UserProfile | null;
  currentPlan: WeeklyPlan | null;
  onUpdatePlan: (plan: WeeklyPlan) => void;
}

export const NutritionView: React.FC<Props> = ({ profile, currentPlan, onUpdatePlan }) => {
  const [view, setView] = useState<'daily' | 'weekly'>('daily');
  const [isGenerating, setIsGenerating] = useState(false);
  const [calculatingOptions, setCalculatingOptions] = useState<Record<number, boolean>>({});
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [editingMeal, setEditingMeal] = useState<{ dayIndex: number, mealIndex: number } | null>(null);

  const handleGenerate = async () => {
    if (!profile) return;
    setIsGenerating(true);
    try {
      const plan = await generatePlan(profile);
      onUpdatePlan(plan);
    } catch (e) {
      console.error("Erro ao gerar plano:", e);
      alert("Houve um erro ao gerar sua dieta. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateDayTotals = (day: DailyPlan) => {
    if (!day || !day.nutrition) return { kcal: 0, prot: 0, carb: 0, fat: 0 };
    return day.nutrition.reduce((acc, meal) => {
      // Usamos a primeira opção como referência para o total diário
      const opt = (meal.options && meal.options[0]) || { calories: 0, protein: 0, carbs: 0, fats: 0 };
      return {
        kcal: acc.kcal + (opt.calories || 0),
        prot: acc.prot + (opt.protein || 0),
        carb: acc.carb + (opt.carbs || 0),
        fat: acc.fat + (opt.fats || 0)
      };
    }, { kcal: 0, prot: 0, carb: 0, fat: 0 });
  };

  const handleUpdateMealOption = (dayIdx: number, mealIdx: number, optIdx: number, field: keyof MealOption, value: any) => {
    if (!currentPlan || !currentPlan.weeklyPlan?.[dayIdx]?.nutrition?.[mealIdx]?.options?.[optIdx]) return;
    const newPlan = { ...currentPlan };
    const meal = newPlan.weeklyPlan[dayIdx].nutrition[mealIdx];
    (meal.options[optIdx] as any)[field] = value;
    onUpdatePlan(newPlan);
  };

  const handleAddOption = () => {
    if (!editingMeal || !currentPlan) return;
    const newPlan = { ...currentPlan };
    const options = newPlan.weeklyPlan[editingMeal.dayIndex].nutrition[editingMeal.mealIndex].options;
    
    options.push({
      food: "",
      portion: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      source: "Manual / IA Pending"
    });
    
    onUpdatePlan(newPlan);
  };

  const handleRemoveOption = (optIdx: number) => {
    if (!editingMeal || !currentPlan) return;
    const newPlan = { ...currentPlan };
    const options = newPlan.weeklyPlan[editingMeal.dayIndex].nutrition[editingMeal.mealIndex].options;
    
    if (options.length <= 1) {
      alert("Pelo menos uma opção deve ser mantida.");
      return;
    }
    
    options.splice(optIdx, 1);
    onUpdatePlan(newPlan);
  };

  const handleSmartCalculate = async (dayIdx: number, mealIdx: number, optIdx: number) => {
    const option = currentPlan?.weeklyPlan[dayIdx].nutrition[mealIdx].options[optIdx];
    if (!option || !option.food || !option.portion) return;

    setCalculatingOptions(prev => ({ ...prev, [optIdx]: true }));
    try {
      const data = await calculateNutrition(option.food, option.portion, profile || undefined);
      
      const newPlan = { ...currentPlan! };
      const targetOption = newPlan.weeklyPlan[dayIdx].nutrition[mealIdx].options[optIdx];
      
      targetOption.calories = data.calories || 0;
      targetOption.protein = data.protein || 0;
      targetOption.carbs = data.carbs || 0;
      targetOption.fats = data.fats || 0;
      targetOption.source = data.source || "Nexus AI Sync";
      
      onUpdatePlan(newPlan);
    } catch (e) {
      console.error("Erro no cálculo inteligente:", e);
      alert("Não foi possível calcular os dados para este alimento. Tente novamente.");
    } finally {
      setCalculatingOptions(prev => ({ ...prev, [optIdx]: false }));
    }
  };

  const dayTotals = useMemo(() => {
    if (!currentPlan || !currentPlan.weeklyPlan || !currentPlan.weeklyPlan[selectedDayIndex]) {
      return { kcal: 0, prot: 0, carb: 0, fat: 0 };
    }
    return calculateDayTotals(currentPlan.weeklyPlan[selectedDayIndex]);
  }, [currentPlan, selectedDayIndex]);

  if (!currentPlan) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
        <h2 className="text-xl font-bold">Preparando Nutrição Nexus...</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase">Nexus Nutrition</h2>
          <p className="text-gray-400">Plano adaptativo para {profile?.nutrition?.objective || 'Saúde'}.</p>
        </div>
        <div className="flex bg-neutral-900 p-1.5 rounded-2xl border border-white/5">
          <button 
            onClick={() => setView('daily')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${view === 'daily' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-gray-500'}`}
          >
            <CalendarIcon size={16} /> DIÁRIO
          </button>
          <button 
            onClick={() => setView('weekly')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${view === 'weekly' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-gray-500'}`}
          >
            <Table size={16} /> SEMANAL
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MacroCard label="Calorias" value={`${dayTotals.kcal} kcal`} sub="Meta diária" icon={<Flame color="#10b981" />} />
        <MacroCard label="Proteínas" value={`${dayTotals.prot}g`} sub="Massa magra" icon={<ActivityIcon color="#3b82f6" />} />
        <MacroCard label="Carboidratos" value={`${dayTotals.carb}g`} sub="Energia" icon={<Zap color="#f59e0b" />} />
        <MacroCard label="Gorduras" value={`${dayTotals.fat}g`} sub="Hormonal" icon={<Droplet color="#ef4444" />} />
      </div>

      {view === 'daily' ? (
        <div className="space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {currentPlan.weeklyPlan?.map((day, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex-shrink-0 px-6 py-3 rounded-2xl text-xs font-black transition-all border ${
                  selectedDayIndex === idx 
                    ? 'bg-emerald-500 border-emerald-500 text-black' 
                    : 'bg-neutral-900 border-white/5 text-gray-500'
                }`}
              >
                {day.day}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {currentPlan.weeklyPlan?.[selectedDayIndex]?.nutrition?.map((meal, mIdx) => (
              <MealCard 
                key={mIdx} 
                meal={meal} 
                onEdit={() => setEditingMeal({ dayIndex: selectedDayIndex, mealIndex: mIdx })}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {currentPlan.weeklyPlan?.map((day, dIdx) => (
            <div key={dIdx} className="space-y-4">
              <h3 className="text-xl font-black text-emerald-500 uppercase tracking-widest flex items-center gap-3">
                <span className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-sm">{dIdx + 1}</span>
                {day.day}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {day.nutrition?.map((meal, mIdx) => (
                  <div 
                    key={mIdx} 
                    className="bg-neutral-900/40 p-5 rounded-3xl border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                    onClick={() => {
                      setSelectedDayIndex(dIdx);
                      setView('daily');
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{meal.time}</span>
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded-full">
                        {meal.options?.[0]?.calories || 0} kcal
                      </span>
                    </div>
                    <h4 className="font-bold text-sm mb-2">{meal.mealName}</h4>
                    <p className="text-[11px] text-gray-500 line-clamp-1">Sugestão: {meal.options?.[0]?.food || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editing Modal */}
      {editingMeal && currentPlan.weeklyPlan?.[editingMeal.dayIndex]?.nutrition?.[editingMeal.mealIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 w-full max-w-3xl rounded-[40px] border border-white/10 p-6 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-black italic tracking-tighter uppercase">Customizar Alimentos</h3>
                <p className="text-gray-400 text-sm">Insira os dados e a IA calculará tudo automaticamente.</p>
              </div>
              <button 
                onClick={() => setEditingMeal(null)}
                className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {currentPlan.weeklyPlan[editingMeal.dayIndex].nutrition[editingMeal.mealIndex].options?.map((opt, oIdx) => (
                <div key={oIdx} className="bg-black/40 p-6 rounded-3xl border border-white/5 space-y-5 relative group/item">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 flex items-center gap-4">
                      <span className="w-8 h-8 bg-emerald-500 text-black rounded-lg flex items-center justify-center font-black text-xs">{oIdx + 1}</span>
                      <input 
                        placeholder="Nome do alimento (ex: Peito de Frango)"
                        className="flex-1 bg-transparent border-b border-white/10 py-2 text-lg font-bold outline-none text-white focus:border-emerald-500 transition-all"
                        value={opt.food}
                        onChange={(e) => handleUpdateMealOption(editingMeal.dayIndex, editingMeal.mealIndex, oIdx, 'food', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        placeholder="Qtd (ex: 150g)"
                        className="w-32 bg-neutral-800/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm font-bold outline-none text-center focus:border-emerald-500"
                        value={opt.portion}
                        onChange={(e) => handleUpdateMealOption(editingMeal.dayIndex, editingMeal.mealIndex, oIdx, 'portion', e.target.value)}
                      />
                      <button 
                        onClick={() => handleSmartCalculate(editingMeal.dayIndex, editingMeal.mealIndex, oIdx)}
                        disabled={calculatingOptions[oIdx] || !opt.food || !opt.portion}
                        className={`p-3 rounded-xl transition-all flex items-center gap-2 ${calculatingOptions[oIdx] ? 'bg-emerald-500/20 text-emerald-500' : 'bg-emerald-500 text-black hover:bg-emerald-400'} active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed`}
                      >
                        {calculatingOptions[oIdx] ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                        <span className="hidden sm:inline text-[10px] font-black uppercase">SYNC IA</span>
                      </button>
                      <button 
                        onClick={() => handleRemoveOption(oIdx)}
                        className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all active:scale-90"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <MacroResult label="Kcal" val={opt.calories} unit="" />
                    <MacroResult label="Prot(g)" val={opt.protein} unit="g" />
                    <MacroResult label="Carb(g)" val={opt.carbs} unit="g" />
                    <MacroResult label="Fat(g)" val={opt.fats} unit="g" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-gray-600 italic">
                      <Library size={12} /> {opt.source}
                    </div>
                    {opt.calories > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold uppercase">
                        <CheckCircle size={12} /> Calculado
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleAddOption}
                className="flex-1 border-2 border-dashed border-white/10 text-gray-400 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:border-emerald-500/50 hover:text-emerald-500 transition-all"
              >
                <Plus size={20} /> ADICIONAR NOVA OPÇÃO
              </button>
              <button 
                onClick={() => setEditingMeal(null)}
                className="flex-[1.5] bg-emerald-500 text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-400 active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
              >
                CONCLUIR EDIÇÃO
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-12 flex flex-col items-center">
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="text-xs font-black text-gray-600 hover:text-emerald-500 transition-colors flex items-center gap-2 uppercase tracking-widest"
        >
          {isGenerating ? "RECALCULANDO..." : "GERAR NOVO PLANO SEMANAL"}
        </button>
      </div>
    </div>
  );
};

const MacroResult = ({ label, val, unit }: any) => (
  <div className="bg-neutral-800/30 p-3 rounded-2xl border border-white/5 text-center">
    <p className="text-[9px] font-black text-gray-600 uppercase mb-1">{label}</p>
    <p className="text-sm font-black text-white">{val}{unit}</p>
  </div>
);

const MealCard: React.FC<{ meal: Meal, onEdit: () => void }> = ({ meal, onEdit }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-neutral-900/50 rounded-[32px] border border-white/5 overflow-hidden transition-all hover:border-white/10">
      <div 
        className="p-6 flex items-center justify-between cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
             {meal.mealName?.toLowerCase().includes('café') ? <Coffee size={28} /> : 
              meal.mealName?.toLowerCase().includes('jantar') ? <Moon size={28} /> : <Utensils size={28} />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{meal.time}</span>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase">{meal.options?.[0]?.calories || 0} kcal</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight">{meal.mealName}</h3>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-3 bg-white/5 rounded-xl text-emerald-500 hover:bg-emerald-500/10 transition-all opacity-0 group-hover:opacity-100"
          >
            <Edit3 size={18} />
          </button>
          <div className="text-gray-500">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="px-6 pb-8 animate-in slide-in-from-top-2 duration-300">
          <div className="pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {meal.options?.map((opt, idx) => (
              <div key={idx} className="bg-black/20 p-5 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all">
                <div className="flex justify-between items-start mb-4">
                   <div>
                    <h4 className="font-bold text-sm text-emerald-400">{opt.food}</h4>
                    <span className="text-[9px] text-gray-600 block italic mt-0.5">Ref: {opt.source}</span>
                   </div>
                   <span className="text-[10px] font-bold text-gray-600 uppercase">{opt.portion}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <MiniStat label="Kcal" val={opt.calories} />
                  <MiniStat label="Prot" val={opt.protein} />
                  <MiniStat label="Carb" val={opt.carbs} />
                  <MiniStat label="Fat" val={opt.fats} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MacroCard = ({ label, value, sub, icon }: any) => (
  <div className="bg-neutral-900/50 p-6 rounded-[32px] border border-white/5 transition-all hover:translate-y-[-4px]">
    <div className="mb-4">{icon}</div>
    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</h4>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-black text-white">{value}</span>
    </div>
    <p className="text-[10px] text-gray-600 font-bold uppercase mt-1">{sub}</p>
  </div>
);

const MiniStat = ({ label, val }: any) => (
  <div className="text-center">
    <p className="text-[9px] font-bold text-gray-600 uppercase mb-0.5">{label}</p>
    <p className="text-xs font-black text-gray-300">{val}{label !== 'Kcal' ? 'g' : ''}</p>
  </div>
);

const ActivityIcon = ({ color }: any) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

const Zap = ({ color }: any) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);

const Droplet = ({ color }: any) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
  </svg>
);

const Flame = ({ color }: any) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);
