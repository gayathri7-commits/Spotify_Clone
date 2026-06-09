import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { spotifyAuth } from '../services/spotifyApi';

export default function SettingsModal({ onClose, onSave }) {
  const [activeApi, setActiveApi] = useState('mock'); // 'mock', 'spotify', 'lastfm'
  const [spotifyClientId, setSpotifyClientId] = useState('');
  const [lastfmApiKey, setLastfmApiKey] = useState('');
  
  const [spotifyTokenActive, setSpotifyTokenActive] = useState(false);

  useEffect(() => {
    // Read current settings
    const currentApi = localStorage.getItem('active_api_mode') || 'mock';
    setActiveApi(currentApi);

    const savedClientId = localStorage.getItem('spotify_client_id') || '';
    setSpotifyClientId(savedClientId);

    const savedLastfmKey = localStorage.getItem('lastfm_api_key') || '';
    setLastfmApiKey(savedLastfmKey);

    const token = spotifyAuth.getStoredToken();
    setSpotifyTokenActive(!!token);
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    
    localStorage.setItem('active_api_mode', activeApi);

    if (activeApi === 'spotify') {
      if (!spotifyClientId.trim()) {
        alert("Please enter a Spotify Client ID");
        return;
      }
      localStorage.setItem('spotify_client_id', spotifyClientId.trim());
      
      // If we don't have a token, or the Client ID changed, redirect to authorize
      const storedToken = spotifyAuth.getStoredToken();
      const storedClientId = localStorage.getItem('spotify_client_id');
      
      if (!storedToken || savedClientIdChanged(spotifyClientId.trim())) {
        // Redirect to Spotify Auth
        window.location.href = spotifyAuth.getAuthUrl(spotifyClientId.trim());
        return;
      }
    } else if (activeApi === 'lastfm') {
      if (!lastfmApiKey.trim()) {
        alert("Please enter a Last.fm API Key");
        return;
      }
      localStorage.setItem('lastfm_api_key', lastfmApiKey.trim());
    }

    onSave();
    onClose();
  };

  const savedClientIdChanged = (newId) => {
    const prev = localStorage.getItem('spotify_client_id_last_auth');
    if (prev !== newId) {
      localStorage.setItem('spotify_client_id_last_auth', newId);
      return true;
    }
    return false;
  };

  const handleClearSpotify = () => {
    spotifyAuth.clearToken();
    setSpotifyTokenActive(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-lg glass-panel rounded-2xl shadow-glass border border-white/10 overflow-hidden relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-neon-orange" />
            <h3 className="text-lg font-bold text-white tracking-wide">
              API Connection Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-spotify-textLight hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          
          {/* API Selection Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-spotify-textLight mb-3">
              Choose Data Provider
            </label>
            <div className="grid grid-cols-3 gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setActiveApi('mock')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  activeApi === 'mock'
                    ? 'bg-gradient-to-r from-neon-orange to-neon-amber text-white shadow-md'
                    : 'text-spotify-textLight hover:text-white hover:bg-white/5'
                }`}
              >
                Simulation Mode
              </button>
              <button
                type="button"
                onClick={() => setActiveApi('spotify')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  activeApi === 'spotify'
                    ? 'bg-spotify-green text-black font-extrabold shadow-md'
                    : 'text-spotify-textLight hover:text-white hover:bg-white/5'
                }`}
              >
                Spotify API
              </button>
              <button
                type="button"
                onClick={() => setActiveApi('lastfm')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  activeApi === 'lastfm'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-spotify-textLight hover:text-white hover:bg-white/5'
                }`}
              >
                Last.fm API
              </button>
            </div>
          </div>

          {/* Conditional Input Rendering */}
          {activeApi === 'mock' && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-sm space-y-2">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-neon-orange shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">Full Simulation Mode Active</h4>
                  <p className="text-spotify-textLight text-xs mt-1 leading-relaxed">
                    No API keys required! Runs a locally cached database of tracks with high-fidelity cover art, detailed mood match scores, lyrics, and fully playable audio clips.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeApi === 'spotify' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-spotify-green/10 border border-spotify-green/20 text-xs text-spotify-textLight leading-relaxed flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-spotify-green shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Implicit Grant Authorization: </span>
                  Connecting uses Spotify's secure browser redirect. Enter your Client ID (from Spotify Developer Dashboard), and you will be redirected to authenticate. The access token is saved locally and expires in 1 hour.
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-spotify-textLight mb-2 pl-1">
                  Spotify Client ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 7f8149e..."
                  value={spotifyClientId}
                  onChange={(e) => setSpotifyClientId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-spotify-green text-sm transition-all"
                />
              </div>

              {spotifyTokenActive ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs">
                  <span className="text-green-400 font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Connected to Spotify API
                  </span>
                  <button
                    type="button"
                    onClick={handleClearSpotify}
                    className="text-[10px] uppercase font-bold text-red-400 hover:text-red-300 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Connection pending client authorization
                </div>
              )}
            </div>
          )}

          {activeApi === 'lastfm' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-600/10 border border-red-600/20 text-xs text-spotify-textLight leading-relaxed flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Last.fm REST API Integration: </span>
                  Requires a Last.fm API Key. Tracks will be queried by tag (mood matching) directly from Last.fm's catalog. Audio previews fallback to high-quality ambient music.
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-spotify-textLight mb-2 pl-1">
                  Last.fm API Key
                </label>
                <input
                  type="password"
                  placeholder="Paste Last.fm API Key..."
                  value={lastfmApiKey}
                  onChange={(e) => setLastfmApiKey(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-red-500 text-sm transition-all"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/5 flex justify-end gap-3 text-sm font-semibold">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-spotify-textLight hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-xl font-bold text-white shadow-md active:scale-98 transition-all flex items-center gap-1.5 ${
                activeApi === 'spotify' 
                  ? 'bg-spotify-green text-black font-extrabold hover:bg-spotify-green/90' 
                  : activeApi === 'lastfm'
                    ? 'bg-red-600 hover:bg-red-500'
                    : 'bg-gradient-to-r from-neon-orange to-neon-amber hover:shadow-neon-orange'
              }`}
            >
              {activeApi === 'spotify' && !spotifyTokenActive ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin-slow" />
                  Authorize Spotify
                </>
              ) : (
                'Save Connection'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
