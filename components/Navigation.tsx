
import React from 'react';
import { User } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavProps { user: User; onLogout: () => void; }

const Navigation: React.FC<NavProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'DASHBOARD', path: '/', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
    { label: 'PROFILE', path: '/profile', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { label: 'ANALYTICS', path: '/analytics', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { label: 'NOTICES', path: '/notices', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block sticky top-0 z-50 px-6 py-4">
        <div className="container mx-auto glass-panel rounded-2xl border border-white/10 px-8 py-4 flex justify-between items-center shadow-2xl">
          <div className="flex items-center space-x-12">
            <div className="cursor-pointer group" onClick={() => navigate('/')}>
              <h1 className="font-extrabold text-xl tracking-tighter leading-none text-white transition-all group-hover:text-sky-400">
                SANKARA <span className="text-sky-400 font-light">CORE</span>
              </h1>
              <div className="h-0.5 w-0 group-hover:w-full bg-sky-400 transition-all duration-300"></div>
            </div>
            
            <div className="flex items-center space-x-8">
              {navItems.map(item => (
                <button 
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`text-[10px] font-black tracking-widest uppercase transition-all flex items-center space-x-2 ${location.pathname === item.path ? 'text-sky-400' : 'text-slate-400 hover:text-white'}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right border-r border-white/10 pr-6">
              <p className="text-xs font-bold text-white uppercase">{user.name}</p>
              <p className="text-[9px] text-sky-400 font-black tracking-tighter">{user.role} INTERFACE</p>
            </div>
            <button 
              onClick={onLogout}
              className="px-5 py-2.5 bg-maroon rounded-xl text-[10px] font-black tracking-widest hover:bg-red-800 transition-all active:scale-95 border border-white/10 shadow-lg shadow-maroon/20"
            >
              TERMINATE
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Top App Bar */}
      <div className="md:hidden sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="font-black text-lg tracking-tighter text-white uppercase leading-none">
            SANKARA <span className="text-sky-400 font-light">HUB</span>
          </h1>
          <p className="text-[7px] text-sky-400/80 font-bold tracking-[0.3em] uppercase mt-1">Institutional Node</p>
        </div>
        <button onClick={onLogout} className="w-10 h-10 flex items-center justify-center bg-maroon/20 border border-maroon/30 rounded-full text-maroon">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
        </button>
      </div>

      {/* Mobile Bottom Dock Navigation */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm glass-panel rounded-[2rem] border border-white/15 px-6 py-3 flex justify-around items-center shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-sky-400/10 text-sky-400 scale-110 shadow-inner' : 'text-slate-500'}`}
            >
              {item.icon}
              <span className="text-[8px] font-black mt-1 uppercase tracking-tighter">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default Navigation;
