
import React from 'react';
import { NavigationTab } from '../types';
import { APP_NAME } from '../constants';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  streak: number;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, streak }) => {
  const menuItems = [
    { id: NavigationTab.CHAT, icon: 'fa-book-open-reader', label: 'Study Chat' },
    { id: NavigationTab.QUIZ, icon: 'fa-circle-check', label: 'Quiz Prep' },
    { id: NavigationTab.HISTORY, icon: 'fa-calendar-days', label: 'My Sessions' },
    { id: NavigationTab.DASHBOARD, icon: 'fa-chart-simple', label: 'Goal Track' },
  ];

  return (
    <div className="w-64 bg-slate-950/60 backdrop-blur-xl text-white flex flex-col h-full border-r border-white/10">
      <div className="p-8 flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl glow-shadow glow-border">
          FB
        </div>
        <span className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">{APP_NAME}</span>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
              activeTab === item.id
                ? 'bg-blue-600/20 text-blue-400 glow-border glow-shadow'
                : 'text-slate-500 hover:bg-white/5 hover:text-slate-200 border border-transparent'
            }`}
          >
            <i className={`fas ${item.icon} w-5 group-hover:scale-110 transition-transform ${activeTab === item.id ? 'text-blue-400' : 'text-slate-500'}`}></i>
            <span className="font-bold tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6">
        <div className="bg-gradient-to-br from-blue-600/10 to-cyan-500/10 glow-border rounded-2xl p-5 flex items-center space-x-4 shadow-inner glow-shadow">
          <div className="text-blue-400 text-3xl drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]">
            <i className="fas fa-fire animate-pulse"></i>
          </div>
          <div>
            <div className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em] mb-0.5">Study Streak</div>
            <div className="text-2xl font-black text-white">{streak} Days</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
