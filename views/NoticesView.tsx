
import React, { useEffect, useState } from 'react';
import { User, Notice } from '../types';
import { attendanceService } from '../services/attendanceService';

const NoticesView: React.FC<{ user: User }> = ({ user }) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      const data = await attendanceService.getNotices();
      setNotices(data);
      setLoading(false);
    };
    fetchNotices();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-white/5 pb-10">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
            CENTRAL <span className="text-amber-400">BROADCAST</span>
          </h1>
          <p className="text-slate-500 font-bold mt-4 uppercase tracking-[0.4em] text-[10px]">Institutional Information Node</p>
        </div>
        <div className="flex space-x-3">
          <span className="px-4 py-1.5 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-xl text-[8px] font-black uppercase tracking-widest">Global Sync</span>
        </div>
      </header>

      <div className="space-y-8">
        {loading ? (
          <div className="py-32 text-center animate-pulse">
            <p className="text-slate-500 font-black uppercase tracking-[0.5em]">Synchronizing Stream...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="py-32 text-center opacity-50">
            <p className="text-slate-500 font-black uppercase tracking-[0.5em]">No Active Broadcasts</p>
          </div>
        ) : (
          notices.map((notice) => (
            <div key={notice.id} className="glass-panel p-10 rounded-[3rem] border border-white/5 hover:border-white/10 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <span className={`px-4 py-1.5 rounded-lg text-[8px] font-black tracking-widest uppercase border ${
                  notice.category === 'URGENT' ? 'bg-maroon/20 border-maroon/30 text-maroon' :
                  notice.category === 'ACADEMIC' ? 'bg-sky-400/20 border-sky-400/30 text-sky-400' :
                  'bg-amber-400/20 border-amber-400/30 text-amber-400'
                }`}>
                  {notice.category}
                </span>
                <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">
                  {new Date(notice.timestamp).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4 group-hover:text-sky-400 transition-colors">
                {notice.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium mb-8">
                {notice.content}
              </p>
              <div className="flex items-center space-x-4 pt-8 border-t border-white/5">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-500">
                  {notice.author[0]}
                </div>
                <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">{notice.author}</p>
                  <p className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter italic">Authorized Personnel</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <section className="glass-panel p-10 rounded-[2.5rem] border border-amber-400/10 text-center">
         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 leading-relaxed">
           YOU ARE CURRENTLY VIEWING THE INSTITUTIONAL BROADCAST LAYER. ALL BROADCASTS ARE SIGNED AND VALIDATED BY THE SANKARA CENTRAL REGISTRY.
         </p>
      </section>
    </div>
  );
};

export default NoticesView;
