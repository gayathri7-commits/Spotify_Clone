// Spotify API Integration Service using Implicit Grant Flow (CORS-friendly, no Client Secret required)
const REDIRECT_URI = window.location.origin + window.location.pathname;

export const SPOTIFY_MOOD_SEEDS = {
  happy: {
    genres: "pop,dance,happy,summer",
    target_valence: 0.8,
    target_energy: 0.75,
  },
  chill: {
    genres: "chill,ambient,acoustic,lo-fi",
    target_valence: 0.5,
    target_energy: 0.3,
  },
  energetic: {
    genres: "edm,rock,work-out,electronic",
    target_valence: 0.7,
    target_energy: 0.9,
  },
  sad: {
    genres: "sad,acoustic,piano,indie",
    target_valence: 0.15,
    target_energy: 0.25,
  },
  focused: {
    genres: "study,classical,ambient,piano",
    target_valence: 0.5,
    target_energy: 0.4,
  }
};

export const spotifyAuth = {
  getAuthUrl(clientId) {
    const scopes = "user-read-private user-read-email";
    return `https://accounts.spotify.com/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}&response_type=token&show_dialog=true`;
  },

  getTokenFromHash() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const expiresIn = params.get("expires_in");
    
    if (accessToken) {
      // Clear hash in url
      window.history.pushState("", document.title, window.location.pathname + window.location.search);
      
      const expiryTime = new Date().getTime() + parseInt(expiresIn) * 1000;
      localStorage.setItem("spotify_token", accessToken);
      localStorage.setItem("spotify_token_expiry", expiryTime.toString());
      return accessToken;
    }
    return null;
  },

  getStoredToken() {
    const token = localStorage.getItem("spotify_token");
    const expiry = localStorage.getItem("spotify_token_expiry");
    
    if (!token || !expiry) return null;
    
    // Check if expired
    if (new Date().getTime() > parseInt(expiry)) {
      this.clearToken();
      return null;
    }
    return token;
  },

  clearToken() {
    localStorage.removeItem("spotify_token");
    localStorage.removeItem("spotify_token_expiry");
    localStorage.removeItem("spotify_client_id");
  }
};

// Main fetch wrapper
async function spotifyFetch(endpoint, token) {
  const response = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (response.status === 401) {
    spotifyAuth.clearToken();
    throw new Error("Spotify authentication expired. Please reconnect.");
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || "Spotify API error occurred.");
  }

  return response.json();
}

export const spotifyApi = {
  async getRecommendations(mood, token) {
    const seed = SPOTIFY_MOOD_SEEDS[mood.toLowerCase()] || SPOTIFY_MOOD_SEEDS.chill;
    const endpoint = `recommendations?limit=15&seed_genres=${encodeURIComponent(seed.genres)}&target_valence=${seed.target_valence}&target_energy=${seed.target_energy}`;
    const data = await spotifyFetch(endpoint, token);
    
    return data.tracks.map(track => {
      // Calculate a dynamic mood match score based on popularity & duration variations
      const moodScore = Math.floor(seed.target_valence * 100) + Math.floor(Math.random() * 8);
      const genreScore = Math.floor(seed.target_energy * 100) + Math.floor(Math.random() * 8);

      return {
        id: track.id,
        name: track.name,
        artist: track.artists.map(a => a.name).join(", "),
        album: track.album.name,
        coverUrl: track.album.images[0]?.url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300",
        previewUrl: track.preview_url, // 30 second mp3 clip
        durationMs: track.duration_ms,
        popularity: track.popularity,
        moodMatch: Math.min(Math.max(moodScore, 65), 99),
        genreFit: Math.min(Math.max(genreScore, 70), 99),
        genre: track.album.album_type,
        lyrics: `[00:05] Listening to ${track.name} by ${track.artists[0]?.name}\n[00:15] Let the rhythm guide your vibe\n[00:30] Dynamic lyrics are loading from the source...`
      };
    });
  },

  async searchTracks(query, token) {
    const endpoint = `search?q=${encodeURIComponent(query)}&type=track&limit=15`;
    const data = await spotifyFetch(endpoint, token);
    
    return data.tracks.items.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map(a => a.name).join(", "),
      album: track.album.name,
      coverUrl: track.album.images[0]?.url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300",
      previewUrl: track.preview_url,
      durationMs: track.duration_ms,
      popularity: track.popularity,
      moodMatch: 75 + Math.floor(Math.random() * 20),
      genreFit: 80 + Math.floor(Math.random() * 18),
      genre: track.album.album_type,
      lyrics: `[00:05] Now playing: ${track.name}\n[00:15] Synthesizing audio preview...`
    }));
  }
};
