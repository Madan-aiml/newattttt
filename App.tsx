
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole } from './types';
import Navigation from './components/Navigation';
import LoginView from './views/LoginView';
import AdminDashboard from './views/AdminDashboard';
import FacultyDashboard from './views/FacultyDashboard';
import StudentDashboard from './views/StudentDashboard';
import ParentDashboard from './views/ParentDashboard';
import ProfileView from './views/ProfileView';
import AnalyticsView from './views/AnalyticsView';
import NoticesView from './views/NoticesView';
import { getSupabaseKey } from './services/supabaseClient';

const STUDENT_SESSION_KEY = 'sankara_student_session';

const App: React.FC = () => {
  const [hasConfig, setHasConfig] = useState(!!getSupabaseKey());
  const [configKey, setConfigKey] = useState('');
  const [user, setUser] = useState<User | null>(() => {
    const persisted = localStorage.getItem(STUDENT_SESSION_KEY);
    if (persisted) {
      try {
        const { userData } = JSON.parse(persisted);
        return userData;
      } catch (e) {
        console.error("Session restore failed", e);
      }
    }
    return null;
  });

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (configKey.trim()) {
      localStorage.setItem('SANKARA_SUPABASE_KEY', configKey.trim());
      setHasConfig(true);
      window.location.reload(); 
    }
  };

  const handleLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify({
      userData: authenticatedUser,
      loginTimestamp: new Date().toISOString()
    }));
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify({
      userData: updatedUser,
      loginTimestamp: new Date().toISOString()
    }));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(STUDENT_SESSION_KEY);
  };

  if (!hasConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#0f172a] gradient-bg">
        <div className="w-full max-w-md glass-panel rounded-[3rem] p-12 border-t-8 border-sky-400 shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-sky-400/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-sky-400/20">
              <svg className="w-10 h-10 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">DATABASE LINK</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Institutional Configuration</p>
          </div>
          <form onSubmit={handleSaveConfig} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Supabase Public Key</label>
              <textarea 
                required
                value={configKey}
                onChange={(e) => setConfigKey(e.target.value)}
                placeholder="Institutional Secret..."
                className="w-full h-32 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-sky-400 transition-all text-white font-mono text-xs outline-none resize-none"
              />
            </div>
            <button type="submit" className="w-full py-5 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95">
              ESTABLISH PORTAL UPLINK
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-[#0f172a] text-slate-300">
        {user && <Navigation user={user} onLogout={handleLogout} />}
        
        <main className={`flex-grow container mx-auto px-4 ${user ? 'py-12' : 'py-8'}`}>
          {!user ? (
            <div className="flex justify-center items-center min-h-[80vh]">
              <LoginView onLogin={handleLogin} />
            </div>
          ) : (
            <Routes>
              <Route path="/" element={
                user.role === UserRole.ADMIN ? <AdminDashboard user={user} /> :
                user.role === UserRole.FACULTY ? <FacultyDashboard user={user} /> :
                user.role === UserRole.STUDENT ? <StudentDashboard user={user} /> :
                <ParentDashboard user={user} />
              } />
              <Route path="/profile" element={<ProfileView user={user} onUpdate={handleUpdateUser} />} />
              <Route path="/analytics" element={<AnalyticsView user={user} />} />
              <Route path="/notices" element={<NoticesView user={user} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          )}
        </main>
        
        <footer className="w-full bg-slate-950 py-24 border-t border-white/5">
          <div className="container mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2 space-y-6">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-sky-400 rounded-xl flex items-center justify-center text-slate-950 font-black text-xl">S</div>
                    <h3 className="text-white font-black text-xl uppercase tracking-tighter">SANKARA WEB PORTAL</h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed max-w-md">
                    The official Next-Generation Attendance Ecosystem for Sankara College of Science and Commerce. Fully automated, high-security presence management for the academic community.
                </p>
                <div className="flex space-x-4">
                    <span className="px-3 py-1 bg-sky-400/10 border border-sky-400/30 text-sky-400 text-[8px] font-black uppercase rounded-lg tracking-widest">v4.2 Stable Node</span>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 text-slate-500 text-[8px] font-black uppercase rounded-lg tracking-widest">TLS 1.3 Secure</span>
                </div>
            </div>
            <div className="space-y-4">
                <h4 className="text-white font-black text-[10px] uppercase tracking-[0.3em]">Institutional Links</h4>
                <ul className="space-y-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                    <li className="hover:text-sky-400 cursor-pointer transition-colors">College Website</li>
                    <li className="hover:text-sky-400 cursor-pointer transition-colors">Academic Calendar</li>
                    <li className="hover:text-sky-400 cursor-pointer transition-colors">Library Hub</li>
                    <li className="hover:text-sky-400 cursor-pointer transition-colors">Privacy Policy</li>
                </ul>
            </div>
            <div className="space-y-4">
                <h4 className="text-white font-black text-[10px] uppercase tracking-[0.3em]">Institutional Contact</h4>
                <p className="text-slate-500 text-[10px] font-bold uppercase leading-relaxed tracking-widest">
                    Saravanampatti, Coimbatore,<br/>
                    Tamil Nadu - 641035<br/>
                    +91 422 431 3500<br/>
                    info@sankara.ac.in
                </p>
            </div>
          </div>
          <div className="container mx-auto px-8 mt-20 pt-10 border-t border-white/5 text-center">
            <p className="text-slate-700 font-black text-[9px] uppercase tracking-[0.8em]">
                &copy; {new Date().getFullYear()} Sankara College of Science and Commerce. All Institutional Rights Reserved.
            </p>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
