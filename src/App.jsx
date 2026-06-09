import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import MoodSelector from './components/MoodSelector';
import Dashboard from './components/Dashboard';

export default function App() {
  const [step, setStep] = useState(1); // 1: Welcome, 2: Mood, 3: Dashboard
  const [userName, setUserName] = useState('');
  const [selectedMood, setSelectedMood] = useState('');

  // Restore session from localStorage on load
  useEffect(() => {
    const savedName = localStorage.getItem('user_name') || '';
    const savedMood = localStorage.getItem('active_mood') || '';

    if (savedName) {
      setUserName(savedName);
      if (savedMood) {
        setSelectedMood(savedMood);
        setStep(3); // Auto-resume dashboard
      } else {
        setStep(2); // Go to mood selection
      }
    } else {
      setStep(1);
    }
  }, []);

  const handleNameSubmit = (name) => {
    setUserName(name);
    localStorage.setItem('user_name', name);
    setStep(2);
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    localStorage.setItem('active_mood', mood);
    setStep(3);
  };

  const handleBackToName = () => {
    setStep(1);
  };

  const handleBackToMood = () => {
    setStep(2);
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-6 px-4 md:px-8 relative min-h-screen">
      
      {/* Dynamic Header Badge (Floating Info) */}
      <header className="flex justify-between items-center max-w-7xl mx-auto w-full select-none z-10 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-neon-orange animate-pulse"></span>
          <span className="text-xs font-extrabold uppercase tracking-widest text-spotify-textLight">VibeSync Player</span>
        </div>
      </header>

      {/* Main Screen Router */}
      <main className="flex-1 flex flex-col justify-center w-full z-10">
        {step === 1 && (
          <WelcomeScreen onSubmitName={handleNameSubmit} />
        )}
        
        {step === 2 && (
          <MoodSelector 
            userName={userName} 
            onSelectMood={handleMoodSelect} 
            onBack={handleBackToName} 
          />
        )}
        
        {step === 3 && (
          <Dashboard 
            userName={userName} 
            selectedMood={selectedMood} 
            onBackToMood={handleBackToMood}
          />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="text-center text-[10px] text-spotify-textLight/40 tracking-wider font-semibold py-4 select-none z-10">
        &copy; {new Date().getFullYear()} VIBESYNC LABS. UNLEASH THE VIBE.
      </footer>
      
    </div>
  );
}
