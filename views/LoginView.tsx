import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { attendanceService } from '../services/attendanceService';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

type PortalType = 'SELECT' | 'STUDENT' | 'FACULTY' | 'ADMIN';

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [portal, setPortal] = useState<PortalType>('SELECT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // ADMIN PORTAL LOGIC
    if (portal === 'ADMIN') {
      setTimeout(() => {
        if (password === 'admin@123') {
          onLogin({
            id: 'ADMIN_001',
            name: 'System Administrator',
            email: 'admin@sankara.ac.in',
            role: UserRole.ADMIN,
            department: 'Central Administration'
          });
        } else {
          setError('INVALID ADMINISTRATIVE OVERRIDE PASSWORD');
          setLoading(false);
        }
      }, 800);
      return;
    }

    // STUDENT & FACULTY LOGIC
    const emailLower = email.toLowerCase();
    if (!emailLower.endsWith('@sankara.ac.in')) {
      setError('INSTITUTIONAL DOMAIN REQUIRED (@sankara.ac.in)');
      setLoading(false);
      return;
    }

    const namePart = emailLower.split('@')[0];
    
    // Use async callback for setTimeout to handle await operations
    setTimeout(async () => {
      if (portal === 'FACULTY') {
        const userObj: User = {
          id: 'F_' + Math.floor(Math.random() * 1000),
          name: "Prof. " + namePart.charAt(0).toUpperCase() + namePart.slice(1),
          email: emailLower,
          role: UserRole.FACULTY,
          department: 'Academic Faculty',
          facultyId: 'FAC_' + namePart.toUpperCase(),
        };

        // Await the asynchronous faculty verification from database
        const existingFaculty = await attendanceService.getFacultyByEmail(emailLower);
        if (!existingFaculty || !existingFaculty.isApproved) {
          // If not found in registry, submit a registration request
          if (!existingFaculty) await attendanceService.registerFacultyRequest(userObj);
          setPendingApproval(true);
          setLoading(false);
        } else {
          onLogin(existingFaculty);
        }
      } else if (portal === 'STUDENT') {
        // Time restriction removed for development as requested
        onLogin({
          id: 'S_' + Math.floor(Math.random() * 1000),
          name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
          email: emailLower,
          role: UserRole.STUDENT,
          department: 'Student Body',
          studentId: '24' + namePart.toUpperCase(),
        });
      }
    }, 1000);
  };

  if (pendingApproval) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-700">
        <div className="glass-panel rounded-[3rem] p-12 text-center border-t-8 border-amber-500 shadow-2xl">
          <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-amber-500/20">
            <svg className="w-12 h-12 text-amber-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">PENDING APPROVAL</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-10 font-medium">
            Your Faculty node is registered. Institutional Admin approval is required in the Admin Block before dashboard activation.
          </p>
          <button onClick={() => setPendingApproval(false)} className="w-full py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 transition-all">
            BACK TO PORTALS
          </button>
        </div>
      </div>
    );
  }

  if (portal === 'SELECT') {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-12 animate-in fade-in duration-700">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none">
            SANKARA<br/><span className="text-sky-400">NEXT-GEN HUB</span>
          </h1>
          <p className="text-slate-500 font-black tracking-[0.8em] text-[10px] uppercase">Select Your Institutional Node</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <button onClick={() => setPortal('STUDENT')} className="group glass-panel rounded-[3rem] p-12 text-center border-2 border-white/5 hover:border-sky-400/40 transition-all duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-sky-400/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-20 h-20 bg-sky-400/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-sky-400/20 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
            </div>
            <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">STUDENT</h3>
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Mark Presence & Progress</p>
            <p className="text-sky-400/50 text-[7px] font-black uppercase mt-4 tracking-widest">Shift restrictions temporarily suspended</p>
          </button>

          <button onClick={() => setPortal('FACULTY')} className="group glass-panel rounded-[3rem] p-12 text-center border-2 border-white/5 hover:border-amber-400/40 transition-all duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-amber-400/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-20 h-20 bg-amber-400/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-amber-400/20 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
            </div>
            <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">FACULTY</h3>
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Orchestrate Sessions</p>
          </button>

          <button onClick={() => setPortal('ADMIN')} className="group glass-panel rounded-[3rem] p-12 text-center border-2 border-white/5 hover:border-maroon/40 transition-all duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-maroon/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-20 h-20 bg-maroon/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-maroon/20 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-maroon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">ADMIN</h3>
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Institutional Block Access</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 flex flex-col items-center justify-center min-h-[85vh] animate-in slide-in-from-bottom-12 duration-700">
      <div className="w-full flex justify-between items-center mb-8">
        <button onClick={() => setPortal('SELECT')} className="text-slate-600 hover:text-white flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span>Portals</span>
        </button>
        <span className={`px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${portal === 'STUDENT' ? 'bg-sky-400/10 border-sky-400/30 text-sky-400' : portal === 'FACULTY' ? 'bg-amber-400/10 border-amber-400/30 text-amber-400' : 'bg-maroon/10 border-maroon/30 text-maroon'}`}>
          {portal} Node
        </span>
      </div>

      <div className="w-full glass-panel rounded-[2.5rem] p-10 md:p-14 shadow-2xl relative overflow-hidden">
        <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-10 ${portal === 'STUDENT' ? 'bg-sky-400' : portal === 'FACULTY' ? 'bg-amber-400' : 'bg-maroon'}`}></div>
        
        <form onSubmit={handleAuth} className="space-y-8 relative z-10">
          {portal !== 'ADMIN' ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Institutional Email</label>
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="id@sankara.ac.in"
                  className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:border-sky-400 transition-all text-white font-bold outline-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:border-sky-400 transition-all text-white font-bold outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-[10px] font-black text-maroon uppercase tracking-widest ml-1">Admin Access Code</label>
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Institutional Override Pin"
                className="w-full px-6 py-5 bg-white/5 border border-maroon/30 rounded-2xl focus:border-maroon transition-all text-white font-bold outline-none text-center tracking-[0.5em]"
              />
            </div>
          )}

          {error && (
            <div className="p-4 bg-maroon/20 border border-maroon/40 text-red-400 rounded-xl text-[9px] font-black uppercase tracking-widest text-center animate-pulse">
              {error}
            </div>
          )}

          <button 
            type="submit" disabled={loading}
            className={`w-full py-6 text-white rounded-2xl font-black text-xl shadow-2xl transition-all flex items-center justify-center space-x-4 active:scale-95 disabled:opacity-50 ${portal === 'STUDENT' ? 'bg-sky-600 hover:bg-sky-500' : portal === 'FACULTY' ? 'bg-amber-600 hover:bg-amber-500' : 'bg-maroon hover:bg-red-800'}`}
          >
            {loading ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : <span>UPLINK DATA</span>}
          </button>
          
          <p className="text-center text-[8px] text-slate-700 font-bold uppercase tracking-[0.4em] leading-relaxed italic">
            {portal === 'ADMIN' ? 'Secure Admin Block Access: admin@123' : '*Institutional security protocols active'}
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginView;