
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { StudyEntry, UserProgress } from '../types';
import { SUBJECT_COLORS } from '../constants';

interface DashboardProps {
  progress: UserProgress;
  history: StudyEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ progress, history }) => {
  const chartData = Object.entries(progress.topicsMastered).map(([name, value]) => ({
    name,
    value,
    color: SUBJECT_COLORS[name] || SUBJECT_COLORS['Other']
  }));

  const last5Days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = history.filter(h => new Date(h.timestamp).toISOString().split('T')[0] === dateStr).length;
    return { date: dateStr.split('-').slice(1).join('/'), count };
  }).reverse();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-xl">
          <p className="text-slate-300 text-xs font-black uppercase tracking-widest mb-1">{label}</p>
          <p className="text-blue-400 font-bold text-lg">{payload[0].value} Questions</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full scroll-smooth">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl glow-border shadow-inner glow-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-blue-500/20 text-blue-400 rounded-2xl text-xl border border-blue-500/30">
              <i className="fas fa-brain"></i>
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Questions Asked</div>
              <div className="text-3xl font-black text-white">{progress.totalQuestions}</div>
            </div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl glow-border shadow-inner glow-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-cyan-500/20 text-cyan-400 rounded-2xl text-xl border border-cyan-500/30">
              <i className="fas fa-hourglass-start"></i>
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Study Time</div>
              <div className="text-3xl font-black text-white">{progress.studyHours}h</div>
            </div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl glow-border shadow-inner glow-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-blue-400/20 text-blue-300 rounded-2xl text-xl border border-blue-400/30">
              <i className="fas fa-calendar-check"></i>
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Study Streak</div>
              <div className="text-3xl font-black text-white">{progress.streak}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] glow-border shadow-2xl min-h-[420px] glow-shadow">
          <h3 className="text-lg font-bold text-white mb-8 flex items-center">
            <i className="fas fa-book-open text-blue-400 mr-3 text-xl"></i>
            Subject Focus
          </h3>
          <div className="h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    formatter={(value) => <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{value}</span>}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
                <i className="fas fa-ghost text-4xl mb-2 opacity-50"></i>
                <p className="text-sm font-bold uppercase tracking-widest opacity-50">No Data Yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] glow-border shadow-2xl min-h-[420px] glow-shadow">
          <h3 className="text-lg font-bold text-white mb-8 flex items-center">
            <i className="fas fa-chart-line text-blue-400 mr-3 text-xl"></i>
            Study Pace
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last5Days}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 10, fontWeight: 800}}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(59,130,246,0.05)'}} />
                <Bar 
                  dataKey="count" 
                  fill="#3b82f6" 
                  radius={[8, 8, 8, 8]} 
                  barSize={32}
                  className="drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-950/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
        <h3 className="text-lg font-bold text-white mb-8 flex items-center">
          <i className="fas fa-clock-rotate-left text-blue-400 mr-3 text-xl"></i>
          Recent Activity
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-slate-500 uppercase text-[10px] font-black tracking-widest">
                <th className="pb-6 px-4">Subject Matter</th>
                <th className="pb-6 px-4">Topic Area</th>
                <th className="pb-6 px-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {history.length > 0 ? history.slice(0, 5).map((item) => (
                <tr key={item.id} className="group hover:bg-white/5 transition-all cursor-default">
                  <td className="py-6 px-4">
                    <div className="font-bold text-slate-200 group-hover:text-white transition-colors truncate max-w-md">{item.question}</div>
                  </td>
                  <td className="py-6 px-4">
                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg text-[10px] font-black uppercase text-blue-400 tracking-wider">
                      {item.topic}
                    </span>
                  </td>
                  <td className="py-6 px-4 text-right text-slate-500 text-xs font-bold tabular-nums">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-600 font-black uppercase tracking-widest text-xs opacity-50">Empty Activity</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
