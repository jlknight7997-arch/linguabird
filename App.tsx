
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Onboarding } from './components/Onboarding';
import { ExerciseRenderer } from './components/ExerciseRenderer';
import { Profile } from './components/Profile';
import { AppState, UserStats, Exercise, Language, Difficulty, ExerciseType } from './types';
import { INITIAL_STATS } from './constants';
import { generateLesson } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.START);
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean, explanation?: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('linguabird_user');
    if (saved) {
      const data = JSON.parse(saved);
      setStats(data.stats);
      setCurrentLanguage(data.language);
      setAppState(AppState.DASHBOARD);
    }
  }, []);

  const saveProfile = (lang: Language, profileStats: Partial<UserStats>) => {
    const newStats = { ...stats, ...profileStats, streak: 1 };
    setStats(newStats);
    setCurrentLanguage(lang);
    localStorage.setItem('linguabird_user', JSON.stringify({ stats: newStats, language: lang }));
    setAppState(AppState.DASHBOARD);
  };

  const startLesson = async (lang: Language, difficulty: Difficulty) => {
    setLoading(true);
    setCurrentDifficulty(difficulty);
    try {
      const generated = await generateLesson(lang.name, difficulty);
      setExercises(generated);
      setCurrentIndex(0);
      setAppState(AppState.LESSON);
    } catch (error) {
      console.error("Erro ao carregar lição", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (correct: boolean) => {
    const exercise = exercises[currentIndex];
    setFeedback({ correct, explanation: exercise.explanation });
    
    if (correct) {
      setStats(prev => ({ ...prev, xp: prev.xp + 10, coins: prev.coins + 3 }));
    } else {
      setStats(prev => ({ ...prev, hearts: Math.max(0, prev.hearts - 1) }));
    }
  };

  const nextExercise = () => {
    setFeedback(null);
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setAppState(AppState.COMPLETED);
    }
  };

  const resetToDashboard = () => {
    setAppState(AppState.DASHBOARD);
    setExercises([]);
    setCurrentIndex(0);
    setFeedback(null);
  };

  const mascotQuote = useMemo(() => {
    if (!exercises[currentIndex]) return "Vamos começar! 🦜";
    switch(exercises[currentIndex].type) {
      case ExerciseType.LEARN: return "Observe e aprenda! 🦜";
      case ExerciseType.LISTEN: return "Escutou direitinho? 🦜";
      case ExerciseType.PRACTICE: return "Agora é praticar! 🦜";
      case ExerciseType.TRANSLATE: return "Traduza essa! 🦜";
      case ExerciseType.SPEAK: return "Sua vez de falar! 🦜";
      default: return "Tá indo muito bem! 😉";
    }
  }, [currentIndex, exercises]);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-screen space-y-10 p-12 text-center bg-white">
          <div className="relative scale-150 mb-10">
            <div className="text-[100px] animate-bounce-slow">🦜</div>
            <div className="absolute -top-4 -right-4 text-4xl animate-pulse">🤓</div>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-linguabird-blue uppercase tracking-tighter">O LinguaBird está lendo...</h2>
            <p className="text-gray-400 font-bold text-lg">Preparando sua trilha pedagógica.</p>
          </div>
          <div className="w-64 h-4 bg-gray-100 rounded-full overflow-hidden border-2 border-gray-50 shadow-inner">
            <div className="h-full bg-linguabird-green w-full animate-progress-stripes" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {appState === AppState.START && (
        <div className="flex flex-col items-center justify-center h-screen p-10 text-center animate-fadeIn bg-white">
          <div className="text-[160px] mb-8 animate-bounce-slow relative">
            🦜<div className="absolute top-0 right-0 text-5xl">🤓</div>
          </div>
          <h1 className="text-6xl font-black mb-4 tracking-tighter flex flex-col leading-none">
            <span className="text-linguabird-blue">Lingua</span>
            <span className="text-linguabird-green">Bird</span>
          </h1>
          <p className="text-gray-400 font-bold text-xl mb-16">Escute antes de falar.<br/>Entenda antes de traduzir.</p>
          <button
            onClick={() => setAppState(AppState.ONBOARDING)}
            className="w-full py-6 bg-linguabird-green text-white rounded-[2.5rem] font-black text-2xl shadow-xl hover:bg-green-500 active:scale-95 transition-all uppercase tracking-widest border-b-8 border-green-700"
          >
            COMEÇAR
          </button>
        </div>
      )}

      {appState === AppState.ONBOARDING && (
        <Onboarding onComplete={saveProfile} />
      )}

      {(appState === AppState.DASHBOARD || appState === AppState.PROFILE || appState === AppState.LESSON || appState === AppState.COMPLETED) && (
        <Header 
          stats={stats} 
          onExit={appState === AppState.LESSON ? resetToDashboard : undefined}
          showProgress={appState === AppState.LESSON}
          progressPercent={(currentIndex / exercises.length) * 100}
        />
      )}

      <main className="flex-1 overflow-y-auto">
        {appState === AppState.DASHBOARD && (
          <Dashboard 
            stats={stats} 
            currentLanguage={currentLanguage} 
            onStartLesson={startLesson} 
            onChangeLanguage={() => setAppState(AppState.ONBOARDING)}
            setAppState={setAppState}
          />
        )}

        {appState === AppState.PROFILE && (
          <Profile stats={stats} language={currentLanguage} onReset={() => setAppState(AppState.START)} />
        )}

        {appState === AppState.LESSON && exercises[currentIndex] && (
          <div className="h-full relative">
            <ExerciseRenderer exercise={exercises[currentIndex]} onAnswer={handleAnswer} />

            {feedback && (
              <div className={`fixed bottom-0 left-0 right-0 p-8 animate-slideUp z-50 shadow-2xl border-t-4 ${feedback.correct ? 'bg-green-50 border-linguabird-green' : 'bg-red-50 border-red-500'}`}>
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-start gap-6 mb-8">
                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-white text-5xl font-black shadow-lg ${feedback.correct ? 'bg-linguabird-green' : 'bg-red-500'}`}>
                      {feedback.correct ? '✓' : '✗'}
                    </div>
                    <div>
                      <h4 className={`text-3xl font-black ${feedback.correct ? 'text-green-800' : 'text-red-800'}`}>
                        {feedback.correct ? 'Incrível!' : 'Quase lá!'}
                      </h4>
                      <p className="text-gray-600 font-bold text-xl mt-2">{feedback.correct ? mascotQuote : (feedback.explanation || 'Tente de novo para fixar!')}</p>
                    </div>
                  </div>
                  <button
                    onClick={nextExercise}
                    className={`w-full py-6 rounded-[2.5rem] font-black text-2xl text-white shadow-xl transition-all border-b-8 ${feedback.correct ? 'bg-linguabird-green border-green-700 hover:bg-green-500' : 'bg-red-500 border-red-700 hover:bg-red-400'}`}
                  >
                    CONTINUAR
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {appState === AppState.COMPLETED && (
          <div className="flex flex-col items-center justify-center h-full p-10 text-center animate-fadeIn bg-white">
            <div className="relative mb-14">
               <div className="text-[140px] animate-bounce-slow">🦜</div>
               <div className="absolute -top-6 -right-6 text-6xl">🏆</div>
               <div className="absolute -bottom-6 -left-6 text-5xl">✨</div>
            </div>
            <h1 className="text-5xl font-black text-linguabird-blue mb-4 leading-tight">MENSAGEM DO<br/>LINGUABIRD</h1>
            <p className="text-gray-400 text-2xl font-bold mb-16 leading-relaxed">Você escutou, entendeu e falou!<br/>Fluência é questão de tempo.</p>
            
            <div className="grid grid-cols-2 gap-6 w-full mb-16">
              <div className="bg-orange-50 p-10 rounded-[3rem] border-2 border-orange-100">
                <div className="text-orange-600 font-black text-5xl">+50</div>
                <div className="text-orange-400 font-black text-sm uppercase mt-2 tracking-widest">XP</div>
              </div>
              <div className="bg-yellow-50 p-10 rounded-[3rem] border-2 border-yellow-100">
                <div className="text-yellow-600 font-black text-5xl">+20</div>
                <div className="text-yellow-400 font-black text-sm uppercase mt-2 tracking-widest">MOEDAS</div>
              </div>
            </div>

            <button
              onClick={resetToDashboard}
              className="w-full py-6 bg-linguabird-green text-white rounded-[2.5rem] font-black text-2xl border-b-8 border-green-700 uppercase tracking-widest"
            >
              VOAR DE VOLTA
            </button>
          </div>
        )}
      </main>

      <style>{`
        @keyframes progress-stripes {
          from { background-position: 40px 0; }
          to { background-position: 0 0; }
        }
        .animate-progress-stripes {
          background-size: 40px 40px;
          background-image: linear-gradient(45deg, rgba(255,255,255,.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.2) 50%, rgba(255,255,255,.2) 75%, transparent 75%, transparent);
          animation: progress-stripes 0.8s linear infinite;
        }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }
        .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
      `}</style>
    </Layout>
  );
};

export default App;
