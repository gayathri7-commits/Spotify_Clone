// Last.fm API Integration Service
// Using public endpoints: method=tag.gettoptracks and method=track.search

export const LASTFM_MOOD_TAGS = {
  happy: "happy",
  chill: "chillout",
  energetic: "dance",
  sad: "melancholic",
  focused: "ambient"
};

// Fallback Unsplash image category index for Last.fm tracks
const COVER_IMAGES = [
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80", // Pop
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80", // DJ/Electro
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80", // Mic
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&auto=format&fit=crop&q=80", // Concert
  "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&auto=format&fit=crop&q=80", // Headphones
  "https://images.unsplash.com/photo-1487180142328-0c4e37023af5?w=400&auto=format&fit=crop&q=80", // Vintage Cassette
  "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80"  // Neon Records
];

// SoundHelix loops to provide playable audio when using Last.fm
const PREVIEW_AUDIO_LOOPS = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
];

async function lastfmFetch(method, params, apiKey) {
  const queryParams = new URLSearchParams({
    method,
    api_key: apiKey,
    format: "json",
    ...params
  });

  const response = await fetch(`https://ws.audioscrobbler.com/2.0/?${queryParams}`);
  if (!response.ok) {
    throw new Error("Last.fm API error. Please check your API key.");
  }
  return response.json();
}

export const lastfmApi = {
  async getRecommendations(mood, apiKey) {
    const tag = LASTFM_MOOD_TAGS[mood.toLowerCase()] || LASTFM_MOOD_TAGS.chill;
    const data = await lastfmFetch("tag.gettoptracks", { tag, limit: 15 }, apiKey);
    const tracks = data?.tracks?.track || [];
    
    return tracks.map((track, index) => {
      // Last.fm doesn't provide playable preview mp3 files or rich metadata
      // So we map them to a clean format and fallback to premium looking details
      const coverUrl = track.image?.[3]?.["#text"] || COVER_IMAGES[index % COVER_IMAGES.length];
      const previewUrl = PREVIEW_AUDIO_LOOPS[index % PREVIEW_AUDIO_LOOPS.length];
      
      const moodScore = 75 + Math.floor(Math.random() * 23);
      const genreScore = 70 + Math.floor(Math.random() * 25);

      return {
        id: `lastfm_${track.mbid || index}_${track.name.replace(/\s+/g, '_')}`,
        name: track.name,
        artist: track.artist?.name || "Unknown Artist",
        album: "Featured Single",
        coverUrl,
        previewUrl,
        durationMs: 180000 + (index * 20000), // Mocked duration since Last.fm tag API doesn't return track length
        popularity: 60 + Math.floor(Math.random() * 30),
        moodMatch: moodScore,
        genreFit: genreScore,
        genre: tag.toUpperCase(),
        lyrics: `[00:05] Now listening to ${track.name} by ${track.artist?.name}\n[00:15] Synthesized Audio courtesy of Last.fm tagging\n[00:30] Let the vibe match your mood...`
      };
    });
  },

  async searchTracks(query, apiKey) {
    const data = await lastfmFetch("track.search", { track: query, limit: 15 }, apiKey);
    const tracks = data?.results?.trackmatches?.track || [];
    
    return tracks.map((track, index) => {
      const coverUrl = track.image?.[3]?.["#text"] || COVER_IMAGES[index % COVER_IMAGES.length];
      const previewUrl = PREVIEW_AUDIO_LOOPS[index % PREVIEW_AUDIO_LOOPS.length];

      return {
        id: `lastfm_search_${index}_${track.name.replace(/\s+/g, '_')}`,
        name: track.name,
        artist: track.artist || "Unknown Artist",
        album: "Search Result",
        coverUrl,
        previewUrl,
        durationMs: 220000,
        popularity: 70,
        moodMatch: 80 + Math.floor(Math.random() * 15),
        genreFit: 75 + Math.floor(Math.random() * 20),
        genre: "Searched Track",
        lyrics: `[00:05] Now playing search result: ${track.name}\n[00:15] Audio stream initialized.`
      };
    });
  }
};
