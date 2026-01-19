
import React, { useState } from 'react';
import { INITIAL_PROFILE } from '../constants';
import { UserProfile, FitnessLevel, ActivityLevel } from '../types';
import { ChevronRight, ChevronLeft, Target, Activity, Ruler, Coffee } from 'lucide-react';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

export const ProfileSetup: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE as UserProfile);

  const steps = [
    { title: 'Dados Básicos', icon: <Activity className="text-emerald-400" /> },
    { title: 'Antropometria', icon: <Ruler className="text-blue-400" /> },
    { title: 'Objetivos', icon: <Target className="text-orange-400" /> },
    { title: 'Nutrição', icon: <Coffee className="text-purple-400" /> },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else onComplete(profile);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 min-h-screen flex flex-col">
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black">Nexus AI</h1>
          <span className="text-sm text-gray-500 font-bold uppercase tracking-widest">Configuração do Sistema</span>
        </div>
        <div className="flex gap-2">
          {steps.map((s, idx) => (
            <div key={idx} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${idx <= step ? 'bg-emerald-500' : 'bg-neutral-800'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-4 mb-4">
           <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
             {steps[step].icon}
           </div>
           <div>
             <h2 className="text-xl font-bold">{steps[step].title}</h2>
             <p className="text-gray-400 text-sm">Preencha com precisão para melhores resultados.</p>
           </div>
        </div>

        {step === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Qual seu nome?" value={profile.name} onChange={v => setProfile({...profile, name: v})} />
            <InputGroup label="Sua idade" type="number" value={profile.age.toString()} onChange={v => setProfile({...profile, age: parseInt(v)})} />
            <InputGroup label="Altura (cm)" type="number" value={profile.height.toString()} onChange={v => setProfile({...profile, height: parseInt(v)})} />
            <InputGroup label="Nível de Atividade" type="select" options={Object.values(ActivityLevel)} value={profile.activityLevel} onChange={v => setProfile({...profile, activityLevel: v as ActivityLevel})} />
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Peso Atual (kg)" type="number" value={profile.weight.toString()} onChange={v => setProfile({...profile, weight: parseFloat(v)})} />
            <InputGroup label="Peso Desejado (kg)" type="number" value={profile.targetWeight.toString()} onChange={v => setProfile({...profile, targetWeight: parseFloat(v)})} />
            <InputGroup label="Cintura (cm)" type="number" value={profile.measurements.waist.toString()} onChange={v => setProfile({...profile, measurements: {...profile.measurements, waist: parseFloat(v)}})} />
            <InputGroup label="Quadril (cm)" type="number" value={profile.measurements.hips.toString()} onChange={v => setProfile({...profile, measurements: {...profile.measurements, hips: parseFloat(v)}})} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <InputGroup label="Nível Físico" type="select" options={Object.values(FitnessLevel)} value={profile.fitnessLevel} onChange={v => setProfile({...profile, fitnessLevel: v as FitnessLevel})} />
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl">
               <h4 className="font-bold text-emerald-400 mb-2">Curto Prazo</h4>
               <p className="text-sm text-gray-400 mb-4">O que você deseja conquistar nos próximos 30 dias?</p>
               <textarea 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:border-emerald-500 outline-none transition-all"
                  placeholder="Ex: Perder 2kg de gordura e começar a treinar 3x por semana."
                  value={profile.goals.shortTerm.meta}
                  onChange={e => setProfile({...profile, goals: {...profile.goals, shortTerm: {...profile.goals.shortTerm, meta: e.target.value}}})}
               />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Refeições por dia" type="number" value={profile.nutrition.mealsPerDay.toString()} onChange={v => setProfile({...profile, nutrition: {...profile.nutrition, mealsPerDay: parseInt(v)}})} />
            <InputGroup label="Orçamento Alimentar" type="select" options={['Baixo', 'Médio', 'Alto']} value={profile.nutrition.budget} onChange={v => setProfile({...profile, nutrition: {...profile.nutrition, budget: v.toLowerCase() as any}})} />
            <div className="col-span-full">
               <label className="text-sm font-bold text-gray-400 mb-2 block">Restrições ou Alergias</label>
               <input 
                  className="w-full bg-neutral-900 border border-white/5 rounded-2xl p-4 focus:border-emerald-500 outline-none transition-all"
                  placeholder="Ex: Lactose, Amendoim..."
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                       const val = (e.target as HTMLInputElement).value;
                       setProfile({...profile, nutrition: {...profile.nutrition, allergies: [...profile.nutrition.allergies, val]}});
                       (e.target as HTMLInputElement).value = '';
                    }
                  }}
               />
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 flex gap-4">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="flex-1 bg-white/5 py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
            <ChevronLeft size={20} /> Voltar
          </button>
        )}
        <button onClick={handleNext} className="flex-[2] bg-emerald-500 text-black py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all">
          {step === steps.length - 1 ? 'Iniciar Experiência' : 'Continuar'} <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, type = 'text', options }: any) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-gray-400">{label}</label>
    {type === 'select' ? (
      <select 
        value={value} 
        onChange={e => onChange(e.target.value)}
        className="w-full bg-neutral-900 border border-white/5 rounded-2xl p-4 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
      >
        {options.map((o: any) => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input 
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-neutral-900 border border-white/5 rounded-2xl p-4 focus:border-emerald-500 outline-none transition-all"
      />
    )}
  </div>
);
