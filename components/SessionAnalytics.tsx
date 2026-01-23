
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { Candidate } from '../types';

interface SessionAnalyticsProps {
  candidates: Candidate[];
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const SessionAnalytics: React.FC<SessionAnalyticsProps> = ({ candidates }) => {
  const completed = candidates.filter(c => c.status === 'completed' && c.result);
  
  if (completed.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400 bg-white rounded-[2.5rem] border border-slate-100">
        <i className="fas fa-chart-line text-6xl mb-4 opacity-20"></i>
        <p className="font-black uppercase tracking-widest">No completed screenings yet</p>
      </div>
    );
  }

  // Score Distribution Data
  const scoreData = completed.map(c => ({
    name: c.result?.candidateName.split(' ')[0],
    score: c.result?.finalScore
  }));

  // Domain Distribution Data
  const domainCounts = completed.reduce((acc: any, c) => {
    const d = c.result?.domain || 'Unknown';
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});
  const domainData = Object.keys(domainCounts).map(key => ({ name: key, value: domainCounts[key] }));

  // Readiness Distribution
  const readinessCounts = completed.reduce((acc: any, c) => {
    const r = c.result?.hiringReadiness || 'Unknown';
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {});
  const readinessData = Object.keys(readinessCounts).map(key => ({ name: key, value: readinessCounts[key] }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Total Screened</span>
          <div className="text-4xl font-black text-indigo-600">{completed.length}</div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Avg. Match Score</span>
          <div className="text-4xl font-black text-emerald-500">
            {(completed.reduce((acc, c) => acc + (c.result?.overallMatchScore || 0), 0) / completed.length).toFixed(1)}%
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Avg. Final Grade</span>
          <div className="text-4xl font-black text-amber-500">
            {(completed.reduce((acc, c) => acc + (c.result?.finalScore || 0), 0) / completed.length).toFixed(1)}/10
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8">Candidate Score Comparison</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800}}
                />
                <Bar dataKey="score" fill="#4f46e5" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Domain Distribution */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8">Domain Distribution</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={domainData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {domainData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '16px', fontWeight: 800}} />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Readiness Distribution */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8">Hiring Readiness Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={readinessData}>
                <defs>
                  <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <Tooltip contentStyle={{borderRadius: '16px', fontWeight: 800}} />
                <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorReadiness)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionAnalytics;
