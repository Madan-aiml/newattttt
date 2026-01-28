
import React from 'react';
import { User } from '../types';

const ParentDashboard: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-12 duration-700">
      <div className="glass-blue rounded-[4rem] p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-maroon/20 rounded-bl-full pointer-events-none"></div>
        <h2 className="text-5xl font-black text-white mb-4 uppercase tracking-tighter">WARD STATUS REPORT</h2>
        <p className="text-slate-500 font-black text-xs uppercase tracking-widest">STUDENT NODE: <span className="text-sky-400">ARUN KUMAR (20CS101)</span></p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="glass-maroon rounded-[3rem] p-10">
             <p className="text-[10px] font-black text-sky-300 uppercase tracking-widest mb-3">PERSISTENCE</p>
             <p className="text-5xl font-black text-white">88.4%</p>
             <p className="text-[10px] text-sky-400/50 mt-4 font-black uppercase tracking-widest">ABOVE THRESHOLD</p>
          </div>
          <div className="bg-black/40 rounded-[3rem] p-10 border border-white/5">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">TOTAL UPLINKS</p>
             <p className="text-5xl font-black text-white">142</p>
             <p className="text-[10px] text-slate-600 mt-4 font-black uppercase tracking-widest">SESSIONS LOGGED</p>
          </div>
          <div className="bg-black/40 rounded-[3rem] p-10 border border-white/5">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">EXCEPTIONS</p>
             <p className="text-5xl font-black text-white">18</p>
             <p className="text-[10px] text-slate-600 mt-4 font-black uppercase tracking-widest">ABSENTEE NODES</p>
          </div>
        </div>
      </div>

      <div className="glass-blue rounded-[4rem] p-16 border border-white/5">
        <h3 className="text-xl font-black mb-12 text-white flex items-center space-x-4 uppercase tracking-widest">
           <span className="w-2 h-6 bg-maroon rounded-full"></span>
           <span>ACADEMIC VECTOR ANALYSIS</span>
        </h3>
        <div className="space-y-6">
          {[
            { name: 'Distributed Systems', attendance: '95%', total: '20/21' },
            { name: 'Cloud Computing', attendance: '82%', total: '18/22' },
            { name: 'Mobile App Dev', attendance: '88%', total: '15/17' },
          ].map((sub, i) => (
            <div key={i} className="flex items-center justify-between p-10 bg-black/40 rounded-[3rem] group border border-white/5 hover:border-sky-400/30 transition-all">
               <div className="flex items-center space-x-8">
                  <div className="w-16 h-16 bg-maroon/20 rounded-2xl flex items-center justify-center text-2xl font-black text-maroon border border-maroon/30 shadow-inner">{sub.name[0]}</div>
                  <div>
                    <h4 className="font-black text-white text-lg uppercase tracking-tight">{sub.name}</h4>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">{sub.total} UNITS COMPLETED</p>
                  </div>
               </div>
               <div className="text-right">
                  <span className="text-3xl font-black text-sky-400">{sub.attendance}</span>
               </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-maroon p-12 rounded-[3.5rem]">
         <div className="flex items-start space-x-6">
            <div className="p-4 bg-maroon rounded-2xl">
               <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
            <div>
               <h4 className="font-black text-white mb-2 uppercase tracking-widest">BIO-PUSH NOTIFICATIONS ACTIVE</h4>
               <p className="text-sm text-slate-400 leading-relaxed uppercase tracking-wider font-bold">Automatic alerts will be triggered if persistence drops below the <span className="text-sky-400">75% Institutional Threshold</span>.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
