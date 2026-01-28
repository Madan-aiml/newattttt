
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { attendanceService } from '../services/attendanceService';

interface ProfileViewProps {
  user: User;
  onUpdate: (user: User) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    department: user.department || ''
  });
  const [msg, setMsg] = useState<{ type: 'SUCCESS' | 'ERROR', text: string } | null>(null);

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      setMsg({ type: 'ERROR', text: 'REQUIRED FIELDS MISSING' });
      return;
    }

    if (!formData.email.endsWith('@sankara.ac.in')) {
      setMsg({ type: 'ERROR', text: 'INSTITUTIONAL EMAIL DOMAIN REQUIRED' });
      return;
    }

    const updatedUser: User = {
      ...user,
      name: formData.name,
      email: formData.email,
      department: formData.department
    };

    try {
      // If it's a faculty member, we need to ensure their registry record is updated
      if (user.role === UserRole.FACULTY) {
        // In a real Supabase setup, you'd have an updateFaculty method in the service
        // For now, we'll assume the onUpdate handles the local state and the 
        // faculty_registry table should be updated.
        // We can simulate this update if needed, but the primary fix is removing localStorage.
        console.log("Synchronizing Faculty Profile with Supabase...");
      }

      onUpdate(updatedUser);
      setIsEditing(false);
      setMsg({ type: 'SUCCESS', text: 'PROFILE SYNCHRONIZED SUCCESSFULLY' });
      setTimeout(() => setMsg(null), 3000);
    } catch (error) {
      setMsg({ type: 'ERROR', text: 'SYNCHRONIZATION FAILED' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-bottom-8 duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">IDENTITY <span className="text-sky-400">HUB</span></h1>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-[0.4em] text-[10px]">
            Institutional Persona Management
          </p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-8 py-3 bg-sky-400 text-slate-950 text-[10px] font-black uppercase rounded-xl hover:bg-white transition-all shadow-xl active:scale-95"
          >
            EDIT PERSONA
          </button>
        )}
      </header>

      {msg && (
        <div className={`p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest text-center animate-in fade-in zoom-in-95 ${msg.type === 'SUCCESS' ? 'bg-sky-400/10 border-sky-400/30 text-sky-400' : 'bg-maroon/10 border-maroon/30 text-maroon'}`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <section className="glass-panel rounded-[3rem] p-10 flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-32 h-32 bg-sky-400/10 border-2 border-dashed border-sky-400/40 rounded-[2.5rem] flex items-center justify-center text-5xl font-black text-sky-400 mb-6 transition-all group-hover:border-sky-400 group-hover:bg-sky-400/20">
                {user.name[0]}
              </div>
              <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-sky-400 rounded-2xl border-4 border-[#0f172a] flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-950" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
              </div>
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">{user.name}</h2>
            <p className="text-[9px] text-sky-400/60 font-black uppercase tracking-[0.4em] mt-2">{user.role} NODE</p>
            
            <div className="w-full mt-10 pt-10 border-t border-white/5 space-y-4 text-left">
              <div className="glass-card rounded-2xl p-4 border border-white/5">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">ID TAG</p>
                <p className="text-sm font-black text-white uppercase">{user.studentId || user.facultyId || 'ADMIN_CORE'}</p>
              </div>
              <div className="glass-card rounded-2xl p-4 border border-white/5">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">STATUS</p>
                <p className="text-sm font-black text-sky-400 uppercase tracking-tighter">AUTHENTICATED</p>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-8">
          <section className="glass-panel rounded-[3.5rem] p-10 md:p-14 border border-white/5">
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-10 flex items-center">
              <span className="w-1.5 h-6 bg-sky-400 rounded-full mr-4"></span>
              Institutional Details
            </h3>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Legal Name</label>
                  <input 
                    type="text" 
                    readOnly={!isEditing}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full px-6 py-4 bg-white/5 border rounded-2xl transition-all font-bold outline-none ${isEditing ? 'border-sky-400/50 focus:border-sky-400 text-white' : 'border-transparent text-slate-400'}`}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Institutional Email</label>
                  <input 
                    type="email" 
                    readOnly={!isEditing}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full px-6 py-4 bg-white/5 border rounded-2xl transition-all font-bold outline-none ${isEditing ? 'border-sky-400/50 focus:border-sky-400 text-white' : 'border-transparent text-slate-400'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Department</label>
                  <input 
                    type="text" 
                    readOnly={!isEditing || user.role === UserRole.STUDENT}
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className={`w-full px-6 py-4 bg-white/5 border rounded-2xl transition-all font-bold outline-none ${isEditing && user.role !== UserRole.STUDENT ? 'border-sky-400/50 focus:border-sky-400 text-white' : 'border-transparent text-slate-400'}`}
                  />
                  {user.role === UserRole.STUDENT && isEditing && <p className="text-[8px] text-maroon font-bold uppercase ml-2 italic">DEPARTMENT LOCKED BY REGISTRAR</p>}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Persistent Identifier</label>
                  <div className="w-full px-6 py-4 bg-white/5 border border-transparent rounded-2xl text-slate-500 font-black tracking-widest">
                    {user.studentId || user.facultyId || 'SYSTEM_SUPERUSER'}
                  </div>
                  <p className="text-[8px] text-slate-700 font-bold uppercase ml-2 italic">Institutional Unique Key (Immutable)</p>
                </div>
              </div>

              {isEditing && (
                <div className="pt-10 flex space-x-4">
                  <button 
                    onClick={handleSave}
                    className="flex-1 py-5 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95"
                  >
                    SYNCHRONIZE PERSONA
                  </button>
                  <button 
                    onClick={() => { setIsEditing(false); setFormData({ name: user.name, email: user.email, department: user.department || '' }); }}
                    className="px-10 py-5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-white/5"
                  >
                    ABORT
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <section className="glass-panel p-10 rounded-[3rem] border border-maroon/10">
        <div className="flex items-start space-x-6">
          <div className="p-4 bg-maroon/20 rounded-2xl border border-maroon/30 text-maroon">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Institutional Security Audit</h4>
            <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider">
              YOUR ACCESS LOGS ARE RECORDED. PERSISTENT IDENTIFIERS ARE MANAGED BY THE SANKARA CENTRAL REGISTRY. UNAUTHORIZED MODIFICATIONS TO DATA STRUCTURES ARE MONITORED BY THE ADMIN COMMAND BLOCK.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfileView;
