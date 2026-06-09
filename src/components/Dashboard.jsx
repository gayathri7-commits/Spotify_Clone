import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, Search, Settings, 
  Disc, RefreshCw, BarChart2, Heart, Music, Layers, LogOut, Loader2, ListMusic
} from 'lucide-react';
import { getMockRecommendations } from '../services/mockData';

const MOOD_THEMES = {
  happy: {
    accent: 'text-neon-orange',
    bgAccent: 'bg-neon-orange',
    borderAccent: 'border-neon-orange/20',
    glowShadow: 'shadow-neon-orange',
    glowBorder: 'focus:border-neon-orange',
    name: 'Happy Vibes',
    tagline: 'Bright & Positive Beats',
    colorHex: '#FF5A09'
  },
  chill: {
    accent: 'text-neon-cyan',
    bgAccent: 'bg-neon-cyan',
    borderAccent: 'border-neon-cyan/20',
    glowShadow: 'shadow-neon-cyan',
    glowBorder: 'focus:border-neon-cyan',
    name: 'Chill Waves',
    tagline: 'Smooth, Low-Fi Ambient',
    colorHex: '#00E5FF'
  },
  energetic: {
    accent: 'text-neon-amber',
    bgAccent: 'bg-neon-amber',
    borderAccent: 'border-neon-amber/20',
    glowShadow: 'shadow-neon-amber',
    glowBorder: 'focus:border-neon-amber',
    name: 'Adrenaline Surge',
    tagline: 'Electro-Dance & Rock Hits',
    colorHex: '#FFB300'
  },
  sad: {
    accent: 'text-neon-purple',
    bgAccent: 'bg-purple-600',
    borderAccent: 'border-purple-600/20',
    glowShadow: 'shadow-neon-green', // Custom glow mapping
    glowBorder: 'focus:border-purple-500',
    name: 'Melancholia',
    tagline: 'Quiet, Emotional Chords',
    colorHex: '#BD00FF'
  },
  focused: {
    accent: 'text-neon-green',
    bgAccent: 'bg-neon-green',
    borderAccent: 'border-neon-green/20',
    glowShadow: 'shadow-neon-green',
    glowBorder: 'focus:border-neon-green',
    name: 'Flow State',
    tagline: 'Deep House & Neo-Classical Focus',
    colorHex: '#39FF14'
  }
};

export default function Dashboard({ userName, selectedMood, onBackToMood }) {
  const theme = MOOD_THEMES[selectedMood] || MOOD_THEMES.chill;
  
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Audio state
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  
  // UI states
  const [isSearching, setIsSearching] = useState(false);
  const [favorites, setFavorites] = useState([]);

  // Audio Ref
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  // Initialize and load tracks
  useEffect(() => {
    loadTracks();
    // Setup audio listener
    audioRef.current = new Audio();
    audioRef.current.volume = volume / 100;

    const onTimeUpdate = () => {
      setCurrentTime(audioRef.current.currentTime);
    };

    const onLoadedMetadata = () => {
      setDuration(audioRef.current.duration || 30); // Spotify previews are 30s
    };

    const onTrackEnded = () => {
      handleNextTrack();
    };

    audioRef.current.addEventListener('timeupdate', onTimeUpdate);
    audioRef.current.addEventListener('loadedmetadata', onLoadedMetadata);
    audioRef.current.addEventListener('ended', onTrackEnded);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', onTimeUpdate);
        audioRef.current.removeEventListener('loadedmetadata', onLoadedMetadata);
        audioRef.current.removeEventListener('ended', onTrackEnded);
      }
    };
  }, [selectedMood]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const loadTracks = async (query = "") => {
    setLoading(true);
    setError('');

    try {
      const data = getMockRecommendations(selectedMood, query);
      setTracks(data);
      if (data.length > 0 && !currentTrack) {
        setCurrentTrack(data[0]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load tracks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Playback handlers
  const handlePlayPause = (track = null) => {
    if (!audioRef.current) return;

    // If clicking a specific track card
    if (track && currentTrack?.id !== track.id) {
      audioRef.current.pause();
      setCurrentTrack(track);
      
      if (track.previewUrl) {
        audioRef.current.src = track.previewUrl;
        audioRef.current.load();
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => {
            console.error("Playback block:", err);
            setIsPlaying(false);
          });
      } else {
        // Handle missing preview url (sometimes Spotify has null previews for premium tracks)
        alert("This track doesn't support short previews. Playing synthesized mood wave!");
        // We load a SoundHelix loop corresponding to the mood index as fallback
        const index = tracks.findIndex(t => t.id === track.id) || 0;
        const fallbackAudio = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(index % 5) + 1}.mp3`;
        audioRef.current.src = fallbackAudio;
        audioRef.current.load();
        audioRef.current.play().then(() => setIsPlaying(true));
      }
      return;
    }

    // Standard play pause of current track
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current.src && currentTrack) {
        audioRef.current.src = currentTrack.previewUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
        audioRef.current.load();
      }
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error(err);
          // Play fallback in case of CORS or media error
          setIsPlaying(true);
        });
    }
  };

  const handleNextTrack = () => {
    const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex !== -1 && currentIndex < tracks.length - 1) {
      handlePlayPause(tracks[currentIndex + 1]);
    } else if (tracks.length > 0) {
      handlePlayPause(tracks[0]); // loop back to first track
    }
  };

  const handlePrevTrack = () => {
    const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex > 0) {
      handlePlayPause(tracks[currentIndex - 1]);
    } else if (tracks.length > 0) {
      handlePlayPause(tracks[tracks.length - 1]); // loop to last track
    }
  };

  const handleProgressChange = (e) => {
    if (!audioRef.current || !duration) return;
    const clickPercent = e.target.value / 100;
    audioRef.current.currentTime = clickPercent * duration;
    setCurrentTime(audioRef.current.currentTime);
  };

  const toggleFavorite = (trackId) => {
    setFavorites(prev => 
      prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]
    );
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      loadTracks(searchQuery);
    } else {
      setIsSearching(false);
      loadTracks();
    }
  };

  // Synced Lyrics Parser
  const parseLyrics = (lyricsText) => {
    if (!lyricsText) return [];
    return lyricsText.split('\n').map(line => {
      const match = line.match(/^\[(\d+):(\d+)\](.*)/);
      if (match) {
        const timeSec = parseInt(match[1]) * 60 + parseInt(match[2]);
        return { time: timeSec, text: match[3].trim() };
      }
      return { time: -1, text: line.trim() };
    });
  };

  const parsedLyrics = parseLyrics(currentTrack?.lyrics);

  // Find active lyric index based on currentTime
  const activeLyricIndex = parsedLyrics.reduce((activeIndex, lyric, index) => {
    if (lyric.time !== -1 && currentTime >= lyric.time) {
      return index;
    }
    return activeIndex;
  }, 0);

  return (
    <div className="flex flex-col md:flex-row min-h-[92vh] max-w-7xl mx-auto w-full glass-panel rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative z-10">
      
      {/* 1. Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-black/40 border-r border-white/5 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neon-orange to-neon-amber flex items-center justify-center shadow-lg">
              <Disc className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <span className="text-lg font-black tracking-wider text-white">VibeSync</span>
          </div>

          {/* Vibe Status Card */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-16 h-16 rounded-full bg-gradient-to-tr from-transparent to-white/5 blur-md`}></div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-spotify-textLight block mb-1">
              Active Vibe
            </span>
            <span className={`text-base font-extrabold flex items-center gap-1.5 ${theme.accent}`}>
              <span className={`w-2 h-2 rounded-full ${theme.bgAccent} animate-ping`}></span>
              {theme.name}
            </span>
            <span className="text-[10px] text-spotify-textLight mt-1 block">
              {theme.tagline}
            </span>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            <button
              onClick={() => { setSearchQuery(''); setIsSearching(false); loadTracks(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                !isSearching 
                  ? 'bg-white/5 text-white shadow-sm border border-white/5' 
                  : 'text-spotify-textLight hover:text-white hover:bg-white/5'
              }`}
            >
              <ListMusic className="w-4 h-4" />
              Recommendations
            </button>
            
            {/* API settings connection removed */}
          </nav>
        </div>

        {/* User Card */}
        <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-8 md:mt-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-extrabold text-neon-orange shadow-inner">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="text-left leading-none">
              <span className="text-xs text-spotify-textLight block">Listening as</span>
              <span className="text-sm font-bold text-white block mt-1">{userName}</span>
            </div>
          </div>
          <button
            onClick={onBackToMood}
            title="Choose another mood"
            className="p-1.5 rounded-lg text-spotify-textLight hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </aside>

      {/* 2. Main Scrollable Panel */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[85vh] md:max-h-[92vh] flex flex-col">
        {/* Top Header bar with search input */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              Discover Weekly Vibe
            </h1>
            <p className="text-xs text-spotify-textLight">
              Tailored playlists for your current headspace.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative max-w-sm w-full">
            <input
              type="text"
              placeholder="Search songs, artists, or genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-neon-orange focus:border-neon-orange transition-all"
            />
            <Search className="w-4 h-4 text-spotify-textLight absolute left-3.5 top-2.5" />
          </form>
        </div>

        {/* Error Bar */}
        {error && (
          <div className="p-3.5 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            <span>{error}</span>
          </div>
        )}

        {/* Tracks Grid/List */}
        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-spotify-textLight gap-3">
              <Loader2 className={`w-8 h-8 animate-spin ${theme.accent}`} />
              <p className="text-sm font-semibold uppercase tracking-wider">Tuning API Channels...</p>
            </div>
          ) : tracks.length === 0 ? (
            <div className="text-center py-16 text-spotify-textLight">
              <Music className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-base font-bold">No songs matching this search.</p>
              <button 
                onClick={() => { setSearchQuery(''); setIsSearching(false); loadTracks(); }}
                className="mt-3 text-xs text-neon-orange hover:underline"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {/* Header Titles */}
              <div className="grid grid-cols-12 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-spotify-textLight border-b border-white/5 pl-2 select-none">
                <span className="col-span-1 text-center">#</span>
                <span className="col-span-6 sm:col-span-5 md:col-span-6">Track Title</span>
                <span className="col-span-3 hidden sm:block">Album / Genre</span>
                <span className="col-span-3 sm:col-span-3 md:col-span-2 text-right">Metrics Match</span>
              </div>

              {/* Tracks Map */}
              {tracks.map((track, index) => {
                const isCurrent = currentTrack?.id === track.id;
                const isFav = favorites.includes(track.id);
                return (
                  <div
                    key={track.id}
                    className={`grid grid-cols-12 items-center px-4 py-3 rounded-xl transition-all duration-200 select-none group border border-transparent ${
                      isCurrent 
                        ? 'bg-white/10 border-white/10' 
                        : 'hover:bg-white/5 hover:border-white/5'
                    }`}
                  >
                    {/* Index / Play action */}
                    <div className="col-span-1 flex items-center justify-center">
                      <button
                        onClick={() => handlePlayPause(track)}
                        className="w-8 h-8 rounded-full bg-white/5 border border-white/10 group-hover:border-neon-orange group-hover:bg-neon-orange group-hover:text-white flex items-center justify-center transition-all"
                      >
                        {isCurrent && isPlaying ? (
                          <Pause className={`w-3.5 h-3.5 ${isCurrent ? theme.accent : 'text-white'} group-hover:text-white`} />
                        ) : (
                          <Play className={`w-3.5 h-3.5 ${isCurrent ? theme.accent : 'text-spotify-textLight'} group-hover:text-white translate-x-[1px]`} />
                        )}
                      </button>
                    </div>

                    {/* Cover Art and Info */}
                    <div className="col-span-6 sm:col-span-5 md:col-span-6 flex items-center gap-3">
                      <img
                        src={track.coverUrl}
                        alt={track.name}
                        className="w-10 h-10 rounded-lg object-cover shadow-md shrink-0"
                      />
                      <div className="text-left overflow-hidden">
                        <span className={`text-sm font-bold truncate block ${isCurrent ? theme.accent : 'text-white'}`}>
                          {track.name}
                        </span>
                        <span className="text-xs text-spotify-textLight truncate block mt-0.5">
                          {track.artist}
                        </span>
                      </div>
                    </div>

                    {/* Album / Genre */}
                    <div className="col-span-3 hidden sm:block text-left overflow-hidden">
                      <span className="text-xs text-spotify-textLight truncate block font-medium">
                        {track.album}
                      </span>
                      <span className="text-[10px] text-spotify-textLight/60 tracking-wider truncate block uppercase font-bold mt-0.5">
                        {track.genre || "Single"}
                      </span>
                    </div>

                    {/* Match Indicator Bars */}
                    <div className="col-span-3 sm:col-span-3 md:col-span-2 flex flex-col justify-center items-end gap-1.5 pl-4">
                      {/* Mood Match */}
                      <div className="w-full max-w-[80px]">
                        <div className="flex justify-between text-[9px] font-bold mb-0.5">
                          <span className="text-spotify-textLight">Vibe</span>
                          <span className={theme.accent}>{track.moodMatch}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${theme.bgAccent} rounded-full`}
                            style={{ width: `${track.moodMatch}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Genre Fit */}
                      <div className="w-full max-w-[80px]">
                        <div className="flex justify-between text-[9px] font-bold mb-0.5">
                          <span className="text-spotify-textLight">Fit</span>
                          <span className="text-neon-cyan">{track.genreFit}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-neon-cyan rounded-full"
                            style={{ width: `${track.genreFit}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* 3. Right details panel (now playing, lyrics, details) */}
      <aside className="w-full md:w-80 bg-black/25 border-l border-white/5 p-6 flex flex-col justify-start shrink-0 select-none">
        <div className="text-left mb-6 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-spotify-textLight">
            Now Playing Detail
          </h3>
          {currentTrack && (
            <button
              onClick={() => toggleFavorite(currentTrack.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                favorites.includes(currentTrack.id) 
                  ? 'text-red-500 bg-red-500/10' 
                  : 'text-spotify-textLight hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4 fill-current" />
            </button>
          )}
        </div>

        {currentTrack ? (
          <div className="space-y-6 flex-1 flex flex-col justify-between">
            <div>
              {/* Art Cover */}
              <div className="relative group rounded-2xl overflow-hidden shadow-lg border border-white/10 mb-4 aspect-square">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1 items-end h-8">
                      <span className="w-1.5 bg-neon-orange eq-bar-1"></span>
                      <span className="w-1.5 bg-neon-amber eq-bar-2"></span>
                      <span className="w-1.5 bg-neon-cyan eq-bar-3"></span>
                      <span className="w-1.5 bg-neon-green eq-bar-4"></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Title / Artist */}
              <div className="text-left">
                <h4 className="text-lg font-extrabold text-white truncate">
                  {currentTrack.name}
                </h4>
                <p className="text-sm text-spotify-textLight truncate mt-1">
                  {currentTrack.artist}
                </p>
              </div>

              {/* Detailed Metrics Panel */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-white/5">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-spotify-textLight block mb-1">Vibe Match</span>
                  <span className={`text-lg font-black block ${theme.accent}`}>
                    {currentTrack.moodMatch}%
                  </span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-spotify-textLight block mb-1">Genre Fit</span>
                  <span className="text-lg font-black text-neon-cyan block">
                    {currentTrack.genreFit}%
                  </span>
                </div>
              </div>
            </div>

            {/* Synced Lyrics Pane */}
            <div className="flex-1 flex flex-col justify-start text-left mt-6 h-48">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-spotify-textLight pl-1 mb-3">
                Synchronized Lyrics
              </h5>
              <div className="flex-1 overflow-y-auto glass-panel-light p-4 rounded-2xl border border-white/5 space-y-3.5 max-h-48 text-xs scrollbar-thin">
                {parsedLyrics.length > 0 ? (
                  parsedLyrics.map((lyric, idx) => (
                    <p
                      key={idx}
                      className={`transition-all duration-300 font-semibold leading-relaxed ${
                        idx === activeLyricIndex
                          ? `${theme.accent} scale-105 translate-x-1 font-bold`
                          : 'text-spotify-textLight/40'
                      }`}
                    >
                      {lyric.text}
                    </p>
                  ))
                ) : (
                  <p className="text-spotify-textLight/30 italic">No lyrics loaded for this track.</p>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 py-12 text-spotify-textLight/40">
            <Music className="w-16 h-16 mb-4 animate-pulse" />
            <p className="text-sm">Select a song to load dashboard details</p>
          </div>
        )}
      </aside>

      {/* 4. Bottom Player Controls Bar */}
      <footer className="w-full absolute bottom-0 left-0 bg-black/65 backdrop-blur-xl border-t border-white/5 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
        
        {/* Track Details */}
        <div className="flex items-center gap-3.5 w-full sm:w-1/4 min-w-[200px] select-none text-left">
          {currentTrack ? (
            <>
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.name}
                className={`w-12 h-12 rounded-lg object-cover shadow-lg border border-white/5 shrink-0 ${isPlaying ? 'pulse-neon-active ring-1 ring-neon-orange/20' : ''}`}
              />
              <div className="overflow-hidden leading-none">
                <span className="text-sm font-extrabold text-white truncate block">
                  {currentTrack.name}
                </span>
                <span className="text-xs text-spotify-textLight truncate block mt-1">
                  {currentTrack.artist}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-spotify-textLight/30">
              <Disc className="w-8 h-8 animate-spin-slow" />
              <span className="text-xs font-semibold uppercase">No track loaded</span>
            </div>
          )}
        </div>

        {/* Timeline Progress Bar & Playback Controls */}
        <div className="flex flex-col items-center gap-1.5 w-full sm:w-2/4">
          {/* Controls */}
          <div className="flex items-center gap-5">
            <button
              onClick={handlePrevTrack}
              className="text-spotify-textLight hover:text-white transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => handlePlayPause()}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current text-black" />
              ) : (
                <Play className="w-4 h-4 fill-current text-black translate-x-[1px]" />
              )}
            </button>

            <button
              onClick={handleNextTrack}
              className="text-spotify-textLight hover:text-white transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Timeline */}
          <div className="flex items-center gap-3 w-full text-[10px] text-spotify-textLight font-mono">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={handleProgressChange}
              ref={progressRef}
              className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-neon-orange focus:outline-none hover:accent-neon-amber transition-colors"
              style={{
                background: `linear-gradient(to right, ${theme.colorHex} 0%, ${theme.colorHex} ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.1) ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume controls */}
        <div className="flex items-center gap-3.5 w-full sm:w-1/4 justify-end">
          <Volume2 className="w-4 h-4 text-spotify-textLight" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            className="w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white focus:outline-none"
            style={{
              background: `linear-gradient(to right, white 0%, white ${volume}%, rgba(255,255,255,0.1) ${volume}%, rgba(255,255,255,0.1) 100%)`
            }}
          />
        </div>

      </footer>

    </div>
  );
}
