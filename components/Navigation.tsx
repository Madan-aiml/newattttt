
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { useNavigate, useLocation, Link } from 'react-router-dom';

interface NavProps { user: User; onLogout: () => void; }

const Navigation: React.FC<NavProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isStudent = user.role === UserRole.STUDENT;

  const navItems = [
    { label: 'DASHBOARD', path: '/', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { label: 'ACADEMIC PROFILE', path: '/profile', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { label: 'PRESENCE ANALYTICS', path: '/analytics', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 022 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { label: 'INSTITUTIONAL NOTICES', path: '/notices', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
  ];

  return (
    <nav className="sticky top-0 z-[100] w-full bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-sky-400 rounded-xl flex items-center justify-center text-slate-950 font-black text-xl shadow-lg">S</div>
            <div>
                <h1 className="text-white font-black text-lg tracking-tighter leading-none uppercase">
                    SANKARA <span className="text-sky-400 font-light">COLLEGE</span>
                </h1>
                <p className="text-[8px] text-slate-500 font-black tracking-[0.3em] uppercase mt-0.5">Academic Web Portal</p>
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`px-5 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all flex items-center space-x-2 ${isActive ? 'bg-sky-400/10 text-sky-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-6">
            <div className="hidden sm:flex flex-col items-end pr-6 border-r border-white/10">
              <span className="text-[11px] font-black text-white uppercase tracking-tight">{user.name}</span>
              <span className="text-[8px] text-sky-400 font-black uppercase tracking-widest">{user.role} ACCESS</span>
            </div>
            
            {!isStudent && (
              <button 
                onClick={onLogout}
                className="hidden sm:block px-5 py-2.5 bg-maroon/20 hover:bg-maroon text-maroon hover:text-white border border-maroon/30 rounded-xl text-[9px] font-black tracking-widest transition-all"
              >
                SIGN OUT
              </button>
            )}

            {/* Mobile Burger */}
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 bg-slate-900 border-b border-white/5 ${isMobileMenuOpen ? 'max-h-96 py-4' : 'max-h-0'}`}>
        <div className="px-4 space-y-2">
            {navItems.map((item) => (
                <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block p-4 rounded-xl text-[10px] font-black text-slate-400 hover:bg-white/5 hover:text-sky-400 tracking-widest uppercase"
                >
                    {item.label}
                </Link>
            ))}
            {!isStudent && (
                <button 
                    onClick={onLogout}
                    className="w-full text-left p-4 rounded-xl text-[10px] font-black text-maroon hover:bg-maroon/10 tracking-widest uppercase"
                >
                    SIGN OUT
                </button>
            )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
