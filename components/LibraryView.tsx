
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Dumbbell, ChevronDown, ChevronUp, Loader2, Library, 
  Flame, Activity, Info, Youtube, ExternalLink
} from 'lucide-react';
import { fetchLibraryItems } from '../services/geminiService';

const WORKOUT_CATEGORIES = [
  'Calistenia', 'Halteres', 'Barra', 'Kettlebell', 'Elástico', 
  'Placas', 'Barra Fixa', 'Banco', 'Ergonomia', 'Cardio', 
  'Equipamentos (Bicicleta, etc.)', 'Esportivos (Futebol, Corrida, etc.)'
];

export const LibraryView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState(WORKOUT_CATEGORIES[0]);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [expandedZone, setExpandedZone] = useState<string | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true);
      setItems([]);
      setExpandedZone(null);
      const data = await fetchLibraryItems('workout', selectedCategory);
      setItems(data);
      
      if (data.length > 0) {
        const firstGroup = data[0].muscleGroup || 'Outros';
        setExpandedZone(firstGroup);
      }
      setIsLoading(false);
    };
    loadItems();
  }, [selectedCategory]);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    return items.filter(item => 
      (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.muscleGroup || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const groupedItems = useMemo(() => {
    return filteredItems.reduce((acc: any, item) => {
      const group = item.muscleGroup || 'Outros';
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    }, {});
  }, [filteredItems]);

  const toggleZone = (zone: string) => {
    setExpandedZone(prev => prev === zone ? null : zone);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase">Biblioteca de Exercícios</h2>
          <p className="text-gray-400">Motor de busca Nexus com links de execução fit-distance e outros especialistas.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-72 flex-shrink-0 space-y-2">
          <div className="bg-neutral-900/50 p-6 rounded-[32px] border border-white/5">
            <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Library size={12} /> Categorias Nexus
            </h3>
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-4 lg:pb-0 scrollbar-hide">
              {WORKOUT_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap lg:whitespace-normal text-left px-5 py-3 rounded-2xl text-[11px] font-bold transition-all border ${
                    selectedCategory === cat 
                      ? 'bg-emerald-500 text-black border-emerald-500 shadow-lg shadow-emerald-500/20' 
                      : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1 space-y-6">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder={`Pesquisar variações em ${selectedCategory}...`}
              className="w-full bg-neutral-900/50 border border-white/5 rounded-[32px] py-5 pl-16 pr-8 text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-gray-700 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
              <Loader2 className="animate-spin text-emerald-500" size={40} />
              <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest italic">Sincronizando base muscular de elite...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.keys(groupedItems).length > 0 ? Object.entries(groupedItems).map(([zone, zoneItems]: any) => {
                const isOpen = expandedZone === zone;
                return (
                  <div key={zone} className="bg-neutral-900/20 border border-white/5 rounded-[40px] overflow-hidden transition-all duration-500">
                    <button 
                      onClick={() => toggleZone(zone)}
                      className={`w-full px-8 py-7 flex items-center justify-between transition-all ${isOpen ? 'bg-emerald-500/5' : 'hover:bg-white/5'}`}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-3 h-3 rounded-full transition-all duration-500 ${isOpen ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-neutral-700'}`} />
                        <h4 className={`text-base font-black uppercase tracking-tighter italic ${isOpen ? 'text-white' : 'text-gray-500'}`}>
                          {zone}
                        </h4>
                        <span className="text-[10px] font-black text-gray-600 bg-black/40 px-3 py-1 rounded-full uppercase tracking-widest">
                          {zoneItems.length} Exercícios
                        </span>
                      </div>
                      {isOpen ? <ChevronUp className="text-emerald-500" size={24} /> : <ChevronDown className="text-gray-700" size={24} />}
                    </button>

                    {isOpen && (
                      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-top-4 duration-500">
                        {zoneItems.map((item: any, idx: number) => (
                          <WorkoutLibraryCard key={idx} item={item} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              }) : (
                 <EmptyState message="Nenhum exercício encontrado nesta categoria." />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const WorkoutLibraryCard: React.FC<{ item: any }> = ({ item }) => {
  const getYoutubeThumbnail = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url?.match(regExp);
    if (match && match[2].length === 11) return `https://img.youtube.com/vi/${match[2]}/0.jpg`;
    return null;
  };

  const thumb = getYoutubeThumbnail(item.mediaUrl);

  return (
    <div className="bg-black/40 border border-white/5 rounded-[32px] overflow-hidden group hover:border-emerald-500/30 transition-all flex h-40">
      <div className="w-36 h-full bg-neutral-800 flex-shrink-0 relative overflow-hidden cursor-pointer" onClick={() => window.open(item.mediaUrl, '_blank')}>
        <img 
          src={thumb || item.mediaUrl || `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400`} 
          alt={item.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 grayscale group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
           <Youtube size={24} className="text-emerald-500" />
        </div>
      </div>
      <div className="p-6 flex flex-col justify-between flex-1">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h5 className="font-black text-sm tracking-tight group-hover:text-emerald-400 transition-colors uppercase italic leading-tight">{item.name}</h5>
            <button onClick={() => window.open(item.mediaUrl, '_blank')} className="text-gray-500 hover:text-white transition-colors">
              <ExternalLink size={14} />
            </button>
          </div>
          <p className="text-[10px] text-gray-500 line-clamp-2 italic leading-relaxed">"{item.description}"</p>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-[9px] font-black text-orange-500 uppercase">
            <Flame size={12} /> {item.kcalEstimate || 0} kcal
          </div>
          <div className="flex items-center gap-1 text-[9px] text-gray-600 font-bold uppercase italic">
            <Youtube size={10} /> Execução fit-distance
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="py-32 text-center bg-black/20 rounded-[48px] border border-dashed border-white/5">
    <Library className="mx-auto text-gray-700 mb-6" size={48} />
    <p className="text-gray-500 font-black text-xs uppercase tracking-[0.2em]">{message}</p>
  </div>
);
