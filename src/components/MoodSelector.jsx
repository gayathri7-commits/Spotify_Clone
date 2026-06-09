import React from 'react';
import { Sun, Coffee, Zap, CloudRain, Brain, ArrowLeft } from 'lucide-react';

const MOODS = [
  {
    id: 'happy',
    name: 'Happy',
    tagline: 'Upbeat beats, positive energy, dance hits',
    icon: Sun,
    colorClass: 'from-orange-500 to-amber-400',
    shadowClass: 'hover:shadow-neon-orange border-orange-500/20 hover:border-orange-500/50',
    glowColor: 'bg-orange-500/20'
  },
  {
    id: 'chill',
    name: 'Chill',
    tagline: 'Lo-fi study beats, relaxing ambient waves',
    icon: Coffee,
    colorClass: 'from-cyan-500 to-teal-400',
    shadowClass: 'hover:shadow-neon-cyan border-cyan-500/20 hover:border-cyan-500/50',
    glowColor: 'bg-cyan-500/20'
  },
  {
    id: 'energetic',
    name: 'Energetic',
    tagline: 'High tempo workouts, rock rhythms, EDM',
    icon: Zap,
    colorClass: 'from-amber-600 to-yellow-500',
    shadowClass: 'hover:shadow-neon-amber border-amber-500/20 hover:border-amber-500/50',
    glowColor: 'bg-amber-500/20'
  },
  {
    id: 'sad',
    name: 'Sad',
    tagline: 'Melancholic chords, emotional vocals',
    icon: CloudRain,
    colorClass: 'from-purple-600 to-indigo-500',
    shadowClass: 'hover:shadow-neon-green border-purple-500/20 hover:border-purple-500/50', // We use custom green shadow here for deep contrast, or neon purple
    glowColor: 'bg-purple-500/20'
  },
  {
    id: 'focused',
    name: 'Focused',
    tagline: 'Classical piano, structural deep house',
    icon: Brain,
    colorClass: 'from-emerald-500 to-green-400',
    shadowClass: 'hover:shadow-neon-green border-emerald-500/20 hover:border-emerald-500/50',
    glowColor: 'bg-emerald-500/20'
  }
];

export default function MoodSelector({ userName, onSelectMood, onBack }) {
  return (
    <div className="flex flex-col justify-center min-h-[85vh] px-4 max-w-4xl mx-auto relative">
      
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-neon-orange/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="self-start flex items-center gap-2 text-spotify-textLight hover:text-white transition-colors duration-200 mb-8 px-3 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">Change Name</span>
      </button>

      {/* Greeting Title */}
      <div className="text-left mb-10">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neon-orange mb-2">
          Mood Selection
        </h2>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight pl-0 ml-0 leading-tight">
          Hi, <span className="bg-gradient-to-r from-neon-orange to-neon-amber bg-clip-text text-transparent">{userName}</span>.<br />
          What's your vibe today?
        </h1>
        <p className="text-spotify-textLight mt-3 text-base md:text-lg">
          Select a mood below to synchronize your recommendations.
        </p>
      </div>

      {/* Mood Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {MOODS.map((mood) => {
          const IconComponent = mood.icon;
          return (
            <button
              key={mood.id}
              onClick={() => onSelectMood(mood.id)}
              className={`group relative text-left glass-panel p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between ${mood.shadowClass} overflow-hidden`}
            >
              {/* Card background radial glow */}
              <div className={`absolute -top-12 -right-12 w-28 h-28 rounded-full ${mood.glowColor} blur-2xl group-hover:scale-150 transition-all duration-500`}></div>
              
              <div>
                {/* Mood Icon */}
                <div className={`inline-flex items-center justify-center p-3 rounded-xl bg-gradient-to-tr ${mood.colorClass} mb-4 text-white shadow-md transition-transform duration-300 group-hover:scale-110`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                
                {/* Mood Name */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-neon-amber transition-colors duration-200">
                  {mood.name}
                </h3>
                
                {/* Tagline */}
                <p className="text-spotify-textLight text-xs leading-relaxed">
                  {mood.tagline}
                </p>
              </div>

              {/* Action Indicator */}
              <div className="mt-8 flex items-center justify-end text-[10px] uppercase font-bold tracking-widest text-spotify-textLight group-hover:text-neon-orange transition-colors duration-200">
                <span>Select Vibe &rarr;</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
