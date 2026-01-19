
import React, { useEffect, useState, useMemo } from 'react';
import { UserProfile, TrainingHistory, ActivityLevel, FitnessLevel } from '../types';
import { 
  User, Ruler, Target, Clock, Coffee, ShieldAlert, 
  Info, Camera, Save, Activity, Check, Palette, RefreshCw, X, HelpCircle
} from 'lucide-react';

interface Props {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

const AVATAR_SEEDS = [
  'Warrior', 'Champion', 'Legend', 'Zen', 'Nova', 'Titan', 'Ghost', 'Blaze', 'Frost', 'Spark'
];

export const ProfileView: React.FC<Props> = ({ profile, onUpdate }) => {
  const [localProfile, setLocalProfile] = useState<UserProfile>(profile);
  const [imc, setImc] = useState<number>(0);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Auto-calculate IMC and Ideal Weight whenever weight or height changes
  useEffect(() => {
    const heightInMeters = localProfile.height / 100;
    if (heightInMeters > 0) {
      const calculatedImc = localProfile.weight / (heightInMeters * heightInMeters);
      setImc(Math.round(calculatedImc * 10) / 10);
      
      const idealWeight = 22 * (heightInMeters * heightInMeters); // Baseado em IMC saudável de 22
      setLocalProfile(prev => ({ 
        ...prev, 
        idealWeight: Math.round(idealWeight * 10) / 10 
      }));
    }
  }, [localProfile.weight, localProfile.height]);

  const handleChange = (path: string, value: any) => {
    const keys = path.split('.');
    setLocalProfile(prev => {
      const newProfile = { ...prev };
      let current: any = newProfile;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newProfile;
    });
  };

  const save = () => {
    onUpdate(localProfile);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  const avatarUrl = useMemo(() => 
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${localProfile.avatarSeed || localProfile.name || 'Nexus'}`,
    [localProfile.avatarSeed, localProfile.name]
  );

  const Section = ({ title, icon, children }: any) => (
    <div className="bg-neutral-900/50 rounded-3xl border border-white/5 p-6 h-fit">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
          {icon}
        </div>
        <h3 className="text-xl font-bold tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  );

  const InputField = ({ label, value, onChange, type = "text", placeholder = "", suffix = "" }: any) => (
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input 
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-emerald-500/50 outline-none transition-all pr-10"
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-600">{suffix}</span>}
      </div>
    </div>
  );

  const SelectionGrid = ({ label, options, selectedValues, onToggle }: any) => (
    <div className="space-y-2 col-span-full">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map((opt: string) => {
          const isSelected = selectedValues.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => {
                if (isSelected) {
                  onToggle(selectedValues.filter((v: string) => v !== opt));
                } else {
                  onToggle([...selectedValues, opt]);
                }
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                isSelected 
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                  : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/20'
              }`}
            >
              {opt}
              {isSelected && <Check size={14} />}
            </button>
          );
        })}
      </div>
    </div>
  );

  const SelectField = ({ label, value, options, onChange }: any) => (
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <select 
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-emerald-500/50 outline-none transition-all cursor-pointer appearance-none"
      >
        {options.map((opt: any) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  return (
    <div className="pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase">Configuração de Perfil</h2>
          <p className="text-gray-400">Suas alterações refletem em todo o ecossistema Nexus AI.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {savedFeedback && (
            <span className="text-emerald-400 text-sm font-medium animate-pulse">✓ Alterações salvas!</span>
          )}
          <button 
            onClick={save}
            className="flex-1 md:flex-none bg-emerald-500 text-black px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
          >
            <Save size={20} /> SALVAR ALTERAÇÕES
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Coluna Esquerda: Boxes que precisam ser compactos */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Identidade Visual */}
          <Section title="Identidade Visual" icon={<Palette />}>
            <div className="flex flex-col sm:flex-row items-center gap-8 mb-4">
               <div className="relative group">
                  <div className="w-32 h-32 rounded-[40px] overflow-hidden border-4 border-emerald-500/30 shadow-2xl">
                     <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black p-2 rounded-xl shadow-lg border-4 border-black">
                     <Check size={16} />
                  </div>
               </div>
               <div className="flex-1 space-y-4">
                  <p className="text-xs text-gray-500 italic">"Escolha sua semente visual. Seu avatar é gerado dinamicamente via Nexus Identity."</p>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_SEEDS.map(seed => (
                      <button
                        key={seed}
                        onClick={() => handleChange('avatarSeed', seed)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                          localProfile.avatarSeed === seed 
                            ? 'bg-emerald-500 text-black' 
                            : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {seed}
                      </button>
                    ))}
                    <button 
                      onClick={() => handleChange('avatarSeed', `User_${Math.floor(Math.random()*1000)}`)}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 flex items-center gap-1"
                    >
                      <RefreshCw size={10} /> ALEATÓRIO
                    </button>
                  </div>
               </div>
            </div>
          </Section>

          {/* Condition & Training */}
          <Section title="Condição & Treinamento" icon={<Activity />}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField 
                  label="Histórico" 
                  value={localProfile.trainingStatus.history} 
                  options={Object.values(TrainingHistory)} 
                  onChange={(v: any) => handleChange('trainingStatus.history', v)} 
                />
                <SelectField 
                  label="Nível Atividade" 
                  value={localProfile.activityLevel} 
                  options={Object.values(ActivityLevel)} 
                  onChange={(v: any) => handleChange('activityLevel', v)} 
                />
              </div>
              
              <SelectionGrid 
                label="Familiaridade com Treinos"
                options={['Calistenia', 'Musculação', 'Cardio', 'Esportes']}
                selectedValues={localProfile.trainingStatus.familiarity}
                onToggle={(v: string[]) => handleChange('trainingStatus.familiarity', v)}
              />

              <div className="p-5 bg-orange-500/5 border border-orange-500/20 rounded-3xl">
                <h4 className="text-sm font-black text-orange-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
                  <ShieldAlert size={16} /> Saúde & Restrições
                </h4>
                <div className="space-y-4">
                  <InputField label="Físicas / Articulares" placeholder="Ex: Joelho esquerdo, Ombro..." value={localProfile.restrictions.physical.join(', ')} onChange={(v: string) => handleChange('restrictions.physical', v.split(',').filter(s => s).map(s => s.trim()))} />
                  <InputField label="Clínicas / Alimentares" placeholder="Ex: Diabetes, Lactose..." value={localProfile.restrictions.clinical.join(', ')} onChange={(v: string) => handleChange('restrictions.clinical', v.split(',').filter(s => s).map(s => s.trim()))} />
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Coluna Direita: Restante dos dados */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Physical Data & IMC */}
          <Section title="Dados Físicos & IMC" icon={<User />}>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Nome" value={localProfile.name} onChange={(v: string) => handleChange('name', v)} />
              <SelectField label="Sexo" value={localProfile.sex} options={['Masculino', 'Feminino', 'Outro']} onChange={(v: string) => handleChange('sex', v)} />
              <InputField label="Idade" type="number" value={localProfile.age} onChange={(v: string) => handleChange('age', parseInt(v))} />
              <InputField label="Altura" type="number" suffix="cm" value={localProfile.height} onChange={(v: string) => handleChange('height', parseInt(v))} />
              <InputField label="Peso Atual" type="number" suffix="kg" value={localProfile.weight} onChange={(v: string) => handleChange('weight', parseFloat(v))} />
              <InputField label="Peso Desejado" type="number" suffix="kg" value={localProfile.targetWeight} onChange={(v: string) => handleChange('targetWeight', parseFloat(v))} />
              
              <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20 flex flex-col justify-center">
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Status IMC</label>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-black">{imc}</p>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase">
                    {imc < 18.5 ? 'Abaixo' : imc < 25 ? 'Normal' : imc < 30 ? 'Sobrepeso' : 'Obeso'}
                  </span>
                </div>
              </div>

              <div className="bg-blue-500/5 p-4 rounded-2xl border border-blue-500/20 flex flex-col justify-center">
                <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Peso Ideal IA</label>
                <p className="text-2xl font-black">{localProfile.idealWeight} kg</p>
              </div>

              <InputField label="% Gordura" type="number" value={localProfile.bodyFatPercentage} onChange={(v: string) => handleChange('bodyFatPercentage', parseFloat(v))} />
              <InputField label="Massa Magra" type="number" value={localProfile.leanMass} onChange={(v: string) => handleChange('leanMass', parseFloat(v))} />
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-gray-400 flex items-center gap-2">
                  <Ruler size={16} /> Medidas Corporais (cm)
                </h4>
                <button 
                  onClick={() => setShowGuide(!showGuide)}
                  className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all font-black uppercase tracking-widest ${
                    showGuide ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                  }`}
                >
                  <HelpCircle size={14} /> Guia de Medição
                </button>
              </div>

              {/* Caixa de Texto explicativa (Guia de Medição) */}
              {showGuide && (
                <div className="mb-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Protocolo Técnico de Medição</h5>
                    <button onClick={() => setShowGuide(false)} className="text-emerald-500 hover:text-white transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                    <div className="text-[11px] text-gray-400 leading-relaxed italic"><strong className="text-white">Cintura:</strong> No ponto mais estreito entre o tórax e o quadril (ou no umbigo).</div>
                    <div className="text-[11px] text-gray-400 leading-relaxed italic"><strong className="text-white">Quadril:</strong> No nível de maior proeminência das nádegas.</div>
                    <div className="text-[11px] text-gray-400 leading-relaxed italic"><strong className="text-white">Peitoral:</strong> Na linha dos mamilos, com os pulmões vazios.</div>
                    <div className="text-[11px] text-gray-400 leading-relaxed italic"><strong className="text-white">Braços:</strong> No ponto médio do úmero (bíceps relaxado).</div>
                    <div className="text-[11px] text-gray-400 leading-relaxed italic"><strong className="text-white">Coxas:</strong> Ponto médio entre a dobra inguinal e o joelho.</div>
                    <div className="text-[11px] text-gray-400 leading-relaxed italic"><strong className="text-white">Panturrilha:</strong> No nível de maior circunferência lateral.</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <InputField label="Cintura" value={localProfile.measurements.waist} onChange={(v: string) => handleChange('measurements.waist', parseFloat(v))} />
                <InputField label="Quadril" value={localProfile.measurements.hips} onChange={(v: string) => handleChange('measurements.hips', parseFloat(v))} />
                <InputField label="Peitoral" value={localProfile.measurements.chest} onChange={(v: string) => handleChange('measurements.chest', parseFloat(v))} />
                <InputField label="Braços" value={localProfile.measurements.arms} onChange={(v: string) => handleChange('measurements.arms', parseFloat(v))} />
                <InputField label="Coxas" value={localProfile.measurements.thighs} onChange={(v: string) => handleChange('measurements.thighs', parseFloat(v))} />
                <InputField label="Panturr." value={localProfile.measurements.calves} onChange={(v: string) => handleChange('measurements.calves', parseFloat(v))} />
              </div>
            </div>
          </Section>

          {/* Goals */}
          <Section title="Objetivos Estruturados" icon={<Target />}>
            {['shortTerm', 'mediumTerm', 'longTerm'].map((term: any) => (
              <div key={term} className="mb-6 last:mb-0 p-5 bg-black/20 rounded-3xl border border-white/5 hover:border-emerald-500/20 transition-all group">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-black text-emerald-500 uppercase tracking-tighter">
                    {term === 'shortTerm' ? 'Curto Prazo' : term === 'mediumTerm' ? 'Médio Prazo' : 'Longo Prazo'}
                  </h4>
                  <span className="text-[10px] font-bold text-gray-600 bg-white/5 px-2 py-1 rounded-full">Meta Planejada</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Duração (Dias)" type="number" value={(localProfile.goals as any)[term].days} onChange={(v: string) => handleChange(`goals.${term}.days`, parseInt(v))} />
                  <SelectField label="Prioridade" value={(localProfile.goals as any)[term].priority} options={['low', 'medium', 'high']} onChange={(v: string) => handleChange(`goals.${term}.priority`, v)} />
                  
                  <SelectionGrid 
                    label="Tipo de Objetivo"
                    options={['Emagrecimento', 'Ganho de massa', 'Condicionamento', 'Saúde', 'Mobilidade', 'Desempenho']}
                    selectedValues={(localProfile.goals as any)[term].type}
                    onToggle={(v: string[]) => handleChange(`goals.${term}.type`, v)}
                  />

                  <div className="col-span-full pt-2">
                    <InputField label="Objetivo Descritivo" value={(localProfile.goals as any)[term].meta} onChange={(v: string) => handleChange(`goals.${term}.meta`, v)} />
                  </div>
                  <div className="col-span-full">
                    <InputField label="Meta Numérica Específica" placeholder="Ex: 5kg, 3cm de braço..." value={(localProfile.goals as any)[term].numericGoal} onChange={(v: string) => handleChange(`goals.${term}.numericGoal`, v)} />
                  </div>
                </div>
              </div>
            ))}
          </Section>

          {/* Routine & Nutrition */}
          <div className="space-y-6">
            <Section title="Rotina & Local" icon={<Clock />}>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <InputField label="Dias / Sem." type="number" value={localProfile.availability.daysPerWeek} onChange={(v: string) => handleChange('availability.daysPerWeek', parseInt(v))} />
                <InputField label="Frequência no Dia" type="number" value={localProfile.availability.frequencyPerDay} onChange={(v: string) => handleChange('availability.frequencyPerDay', parseInt(v))} />
                <div className="col-span-full">
                  <InputField label="Sessão Máxima" suffix="min" type="number" value={localProfile.availability.maxSessionTime} onChange={(v: string) => handleChange('availability.maxSessionTime', parseInt(v))} />
                </div>
                <SelectionGrid 
                  label="Locais de Treino"
                  options={['Casa', 'Rua', 'Parque', 'Academia', 'Misto']}
                  selectedValues={localProfile.availability.locations}
                  onToggle={(v: string[]) => handleChange('availability.locations', v)}
                />
              </div>
            </Section>

            <Section title="Dados Nutricionais" icon={<Coffee />}>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <SelectField label="Objetivo" value={localProfile.nutrition.objective} options={['Emagrecimento', 'Ganho de massa', 'Recomposição', 'Saúde', 'Manutenção']} onChange={(v: string) => handleChange('nutrition.objective', v)} />
                <InputField label="Refeições / Dia" type="number" value={localProfile.nutrition.mealsPerDay} onChange={(v: string) => handleChange('nutrition.mealsPerDay', parseInt(v))} />
                <SelectField label="Orçamento" value={localProfile.nutrition.budget} options={['low', 'medium', 'high']} onChange={(v: string) => handleChange('nutrition.budget', v)} />
                <SelectField label="Rotina" value={localProfile.nutrition.dietaryRoutine} options={['Regular', 'Irregular', 'Jejum', 'Turnos']} onChange={(v: string) => handleChange('nutrition.dietaryRoutine', v)} />
              </div>
              <div className="space-y-4">
                <InputField label="Alergias / Intolerâncias" value={localProfile.nutrition.allergies.join(', ')} onChange={(v: string) => handleChange('nutrition.allergies', v.split(',').filter(s => s).map(s => s.trim()))} />
                <InputField label="Acesso a Alimentos / Notas" value={localProfile.nutrition.foodAccess} onChange={(v: string) => handleChange('nutrition.foodAccess', v)} />
              </div>
            </Section>
          </div>
        </div>

      </div>
    </div>
  );
};
