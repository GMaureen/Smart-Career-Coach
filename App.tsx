
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import Dashboard from './components/Dashboard';
import QuizGenerator from './components/QuizGenerator';
import { NavigationTab, StudyEntry, UserProgress } from './types';
import { dbService } from './services/dbService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.CHAT);
  const [history, setHistory] = useState<StudyEntry[]>([]);
  const [progress, setProgress] = useState<UserProgress>(dbService.getProgress());

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setHistory(dbService.getHistory());
    setProgress(dbService.getProgress());
  };

  const renderContent = () => {
    switch (activeTab) {
      case NavigationTab.CHAT:
        return <ChatInterface onActivity={refreshData} />;
      case NavigationTab.QUIZ:
        return <QuizGenerator />;
      case NavigationTab.DASHBOARD:
        return <Dashboard progress={progress} history={history} />;
      case NavigationTab.HISTORY:
        return (
          <div className="p-12 max-w-5xl mx-auto space-y-10 overflow-y-auto h-full scroll-smooth">
            <header>
              <h1 className="text-4xl font-black text-white tracking-tight">Session History</h1>
              <p className="text-slate-500 mt-2 font-medium">Revisit your past study chats and visual aids from FundaBuddy.</p>
            </header>
            
            {history.length === 0 ? (
              <div className="bg-white/5 p-24 rounded-[3rem] border border-white/5 text-center flex flex-col items-center backdrop-blur-md shadow-inner">
                <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mb-8">
                  <i className="fas fa-folder-open text-4xl text-blue-900/50"></i>
                </div>
                <h3 className="text-2xl font-black text-slate-400">Nothing here yet</h3>
                <p className="text-slate-600 mt-3 font-medium max-w-xs">Ask FundaBuddy your first question to start building your study archive!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 pb-12">
                {history.map((item) => (
                  <div key={item.id} className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-white/5 hover:border-white/10 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <span className="bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                        {item.topic}
                      </span>
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest tabular-nums">
                        {new Date(item.timestamp).toLocaleDateString()} — {new Date(item.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4 leading-tight group-hover:text-blue-300 transition-colors">{item.question}</h3>
                    <div className="bg-black/20 p-6 rounded-2xl text-slate-400 text-sm whitespace-pre-wrap leading-relaxed border border-white/5 shadow-inner">
                      {item.answer.length > 400 ? item.answer.substring(0, 400) + "..." : item.answer}
                    </div>
                    {item.notesUsed && (
                      <div className="mt-6 flex items-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        <i className="fas fa-link mr-2 text-blue-500/50"></i>
                        Referenced: {item.notesUsed}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return <ChatInterface onActivity={refreshData} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans antialiased bg-[#020617] text-slate-200">
      {/* Dynamic Background Gradient (Blue/Cyan focus) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/5 blur-[120px] rounded-full"></div>
      </div>

      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        streak={progress.streak} 
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
