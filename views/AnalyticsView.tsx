
import React, { useEffect, useState } from 'react';
import { User, UserRole } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const AnalyticsView: React.FC<{ user: User }> = ({ user }) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Mocking historical data based on role
    if (user.role === UserRole.STUDENT) {
      setData([
        { period: 'Week 1', rate: 85 },
        { period: 'Week 2', rate: 92 },
        { period: 'Week 3', rate: 78 },
        { period: 'Week 4', rate: 88 },
        { period: 'Week 5', rate: 95 },
      ]);
    } else {
      setData([
        { subject: 'Distributed Systems', rate: 92 },
        { subject: 'Cloud Computing', rate: 74 },
        { subject: 'Mobile Dev', rate: 88 },
        { subject: 'Data Science', rate: 81 },
      ]);
    }
  }, [user.role]);

  const COLORS = ['#38bdf8', '#fbbf24', '#800000', '#1e293b'];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-24">
      <header className="border-b border-white/5 pb-10">
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
          {user.role} <span className="text-sky-400">ANALYTICS</span>
        </h1>
        <p className="text-slate-500 font-bold mt-4 uppercase tracking-[0.4em] text-[10px]">Institutional Persistence Telemetry</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <section className="glass-panel p-12 rounded-[3.5rem] border border-white/5 h-full">
            <h3 className="text-xl font-black text-white tracking-widest mb-10 uppercase flex items-center">
              <span className="w-1.5 h-6 bg-sky-400 rounded-full mr-4"></span>
              {user.role === UserRole.STUDENT ? 'Attendance Velocity' : 'Institutional Performance Matrix'}
            </h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                {user.role === UserRole.STUDENT ? (
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                    <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#475569'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#475569'}} />
                    <Tooltip contentStyle={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155' }} />
                    <Area type="monotone" dataKey="rate" stroke="#38bdf8" strokeWidth={5} fillOpacity={1} fill="url(#colorRate)" />
                  </AreaChart>
                ) : (
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                    <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#475569'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#475569'}} />
                    <Tooltip contentStyle={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155' }} />
                    <Bar dataKey="rate" radius={[10, 10, 0, 0]}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div className="glass-panel p-10 rounded-[3rem] border border-sky-400/20 shadow-2xl">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Total Integrity Score</p>
            <p className="text-6xl font-black text-sky-400 tracking-tighter">88.2%</p>
            <div className="mt-8 h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-sky-400 w-[88.2%]"></div>
            </div>
          </div>

          <div className="glass-panel p-10 rounded-[3rem] border border-white/5">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Key Insights</h4>
            <div className="space-y-6">
              {[
                { label: 'Highest Engagement', value: 'Wednesday' },
                { label: 'Lowest Attendance', value: 'Friday PM' },
                { label: 'Response Time', value: '42 Seconds' },
              ].map((insight, i) => (
                <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{insight.label}</span>
                  <span className="text-xs font-black text-white">{insight.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
