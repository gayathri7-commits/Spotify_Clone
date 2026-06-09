import React, { useState } from 'react';
import { Sparkles, Music } from 'lucide-react';

export default function WelcomeScreen({ onSubmitName }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please share your name with us to customize your vibe.");
      return;
    }
    onSubmitName(name.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      {/* Glow Effect Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-neon-orange/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-neon-cyan/15 rounded-full blur-[90px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-glass border border-white/10 text-center relative z-10 transition-all duration-500 hover:border-neon-orange/30">
        
        {/* Logo Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-neon-orange to-neon-amber p-[2px] mb-6 shadow-neon-orange/20 shadow-lg animate-bounce duration-1000">
          <div className="w-full h-full rounded-full bg-spotify-black flex items-center justify-center">
            <Music className="w-8 h-8 text-neon-orange" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 font-sans">
          Welcome to <span className="bg-gradient-to-r from-neon-orange via-neon-amber to-spotify-green bg-clip-text text-transparent">VibeSync</span>
        </h1>
        <p className="text-spotify-textLight text-sm mb-8">
          A Spotify Song Recommender tuned to your emotional frequency.
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-left">
            <label htmlFor="name-input" className="block text-xs font-semibold uppercase tracking-wider text-spotify-textLight mb-2 pl-1">
              What should we call you?
            </label>
            <div className="relative">
              <input
                id="name-input"
                type="text"
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-neon-orange focus:ring-1 focus:ring-neon-orange transition-all duration-300 shadow-inner"
              />
            </div>
            {error && (
              <p className="text-red-500 text-xs mt-2 pl-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-neon-orange to-neon-amber hover:shadow-neon-orange hover:shadow-lg transition-all duration-300 active:scale-[0.98] border border-neon-orange/30 flex items-center justify-center gap-2"
          >
            Enter Dashboard
            <Sparkles className="w-4 h-4 text-white" />
          </button>
        </form>

        {/* Tech Badges */}
        <div className="mt-8 pt-6 border-t border-white/5 flex justify-center items-center gap-3 text-[10px] text-spotify-textLight tracking-widest font-semibold uppercase">
          <span>ReactJS</span>
          <span className="w-1 h-1 rounded-full bg-white/30"></span>
          <span>TailwindCSS</span>
          <span className="w-1 h-1 rounded-full bg-white/30"></span>
          <span>Spotify API</span>
        </div>
      </div>
    </div>
  );
}
