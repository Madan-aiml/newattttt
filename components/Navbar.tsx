
import React from 'react';
import { User } from '../types';

interface NavbarProps { user: User; onLogout: () => void; }

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <nav className="glass-blue text-white shadow-2xl sticky top-0 z-50 border-b-2 border-sky-400/30">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <div className="flex flex-col">
            <h1 className="font-black text-2xl tracking-tighter leading-none text-white">
              NEXT-GEN <span className="text-sky-400">SANKARA</span>
            </h1>
            <p className="text-[8px] text-sky-300 font-black uppercase tracking-[0.5em] mt-1">Smart Resource Portal</p>
          </div>
        </div>

        <div className="flex items-center space-x-8">
          <div className="hidden md:flex flex-col items-end border-r border-white/10 pr-8">
            <span className="text-sm font-bold text-white tracking-tight">{user.name}</span>
            <span className="text-[9px] text-sky-400 font-black uppercase tracking-widest">{user.role} ACCESS HUB</span>
          </div>
          <button 
            onClick={onLogout}
            className="bg-maroon hover:bg-red-800 transition-all px-8 py-2.5 rounded-xl text-[10px] font-black tracking-widest border border-white/10 active:scale-95 shadow-lg shadow-maroon/20"
          >
            TERMINATE SESSION
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
