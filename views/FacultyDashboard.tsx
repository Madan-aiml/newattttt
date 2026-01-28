
import React, { useState, useEffect } from 'react';
import { User, AttendanceSession, AttendanceRecord } from '../types';
import { attendanceService, Subject } from '../services/attendanceService';

const FacultyDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'SESSION' | 'SUBJECTS'>('SESSION');
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [duration, setDuration] = useState(15);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  // Subject Management States
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [newSubjId, setNewSubjId] = useState('');
  const [newSubjName, setNewSubjName] = useState('');
  const [loading, setLoading] = useState(false);

  const loadInitial = async () => {
    try {
      const [subjs, depts, active] = await Promise.all([
        attendanceService.getSubjects(),
        attendanceService.getDepartments(),
        attendanceService.getActiveSession()
      ]);
      setSubjects(subjs);
      setDepartments(depts);
      setActiveSession(active);
      
      // Auto-select if not set
      if (subjs.length > 0 && !selectedSubject) setSelectedSubject(subjs[0].id);
      if (depts.length > 0 && !selectedDept) setSelectedDept(depts[0]);
    } catch (err) {
      console.error("Dashboard Sync Failed", err);
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    let interval: number;
    if (activeSession) {
      const fetchRecords = async () => { 
        const recs = await attendanceService.getRecords(activeSession.id);
        setRecords(recs);
      };
      fetchRecords();
      interval = window.setInterval(fetchRecords, 5000);
    } else {
      setRecords([]);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const startSession = async () => {
    if (!selectedSubject || !selectedDept) return;
    setLoading(true);
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const subj = subjects.find(s => s.id === selectedSubject);
      const session: AttendanceSession = {
        id: 'SESS_' + Date.now(),
        subjectId: selectedSubject,
        subjectName: subj?.name || 'Unknown',
        department: selectedDept,
        facultyId: user.id,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + duration * 60000).toISOString(),
        otp: otp,
        qrCode: 'SANKARA_SESS_' + Date.now() + '_' + otp,
        isActive: true
      };
      await attendanceService.createSession(session);
      setActiveSession(session);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (activeSession) {
      setLoading(true);
      await attendanceService.endSession(activeSession.id);
      setActiveSession(null);
      setLoading(false);
    }
  };

  // Subject Actions
  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjId || !newSubjName) return;
    setLoading(true);
    const subj = { id: newSubjId.toUpperCase().trim(), name: newSubjName.trim() };
    await attendanceService.addSubject(subj);
    setNewSubjId('');
    setNewSubjName('');
    await loadInitial();
    setLoading(false);
  };

  const handleDeleteSubject = async (id: string) => {
    if (confirm(`REMOVE SUBJECT ${id} FROM REGISTRY?`)) {
      setLoading(true);
      await attendanceService.deleteSubject(id);
      await loadInitial();
      setLoading(false);
    }
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;
    setLoading(true);
    await attendanceService.updateSubject(editingSubject.id, editingSubject.name.trim());
    setEditingSubject(null);
    await loadInitial();
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-white/5 pb-12">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">FACULTY <span className="text-amber-400">COMMAND</span></h1>
          <p className="text-slate-500 font-bold mt-4 uppercase tracking-[0.4em] text-[10px]">Supabase Realtime Sync Enabled</p>
        </div>
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
          <button 
            onClick={() => setActiveTab('SESSION')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'SESSION' ? 'bg-amber-400 text-slate-950 shadow-xl' : 'text-slate-500 hover:text-white'}`}
          >
            SESSION CONTROL
          </button>
          <button 
            onClick={() => setActiveTab('SUBJECTS')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'SUBJECTS' ? 'bg-amber-400 text-slate-950 shadow-xl' : 'text-slate-500 hover:text-white'}`}
          >
            SUBJECT REGISTRY
          </button>
        </div>
      </header>

      {activeTab === 'SESSION' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          <div className="xl:col-span-5">
            <section className="glass-panel rounded-[3.5rem] p-12 border-t-8 border-amber-400 shadow-2xl">
              {!activeSession ? (
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Academic Department</label>
                    <select 
                      value={selectedDept} 
                      onChange={(e) => setSelectedDept(e.target.value)} 
                      className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-amber-400 font-bold cursor-pointer"
                    >
                      {departments.map(d => <option key={d} value={d} className="bg-[#0f172a]">{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Subject Node</label>
                    <select 
                      value={selectedSubject} 
                      onChange={(e) => setSelectedSubject(e.target.value)} 
                      className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-amber-400 font-bold cursor-pointer"
                    >
                      {subjects.length === 0 ? (
                        <option disabled className="bg-[#0f172a]">NO SUBJECTS REGISTERED</option>
                      ) : (
                        subjects.map(s => <option key={s.id} value={s.id} className="bg-[#0f172a]">{s.name} ({s.id})</option>)
                      )}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Slot Duration (Minutes)</label>
                    <input type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value))} className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-amber-400 font-bold" />
                  </div>
                  <button 
                    disabled={loading || subjects.length === 0}
                    onClick={startSession} 
                    className="w-full py-8 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-[2.5rem] font-black text-lg uppercase tracking-widest shadow-[0_20px_60px_rgba(245,158,11,0.2)] transition-all active:scale-95"
                  >
                    {loading ? 'INITIALIZING...' : 'INITIALIZE SLOT'}
                  </button>
                </div>
              ) : (
                <div className="space-y-12 text-center">
                   <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10">OPTICAL VERIFICATION TARGET</p>
                      <div className="bg-white p-6 rounded-[2.5rem] inline-block shadow-2xl neo-glow-sky border-4 border-amber-400/20">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(activeSession.qrCode)}`}
                          alt="Session QR"
                          className="w-56 h-56"
                        />
                      </div>
                   </div>
                   <div className="p-8 bg-white/5 rounded-[3rem] border border-white/10">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">IDENTITY TOKEN</p>
                      <p className="text-7xl font-black text-amber-400 tracking-[0.2em]">{activeSession.otp}</p>
                   </div>
                   <button 
                    disabled={loading}
                    onClick={endSession} 
                    className="w-full py-6 border-2 border-red-600/50 text-red-500 font-black uppercase text-xs tracking-widest rounded-3xl hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                  >
                    TERMINATE UPLINK
                  </button>
                </div>
              )}
            </section>
          </div>
          
          <div className="xl:col-span-7">
             <section className="glass-panel rounded-[3.5rem] p-12 border border-white/5">
                <div className="flex items-center justify-between mb-12">
                   <h3 className="text-2xl font-black text-white uppercase tracking-widest flex items-center">
                     <span className="w-2 h-8 bg-amber-400 rounded-full mr-5"></span>
                     Presence Telemetry
                   </h3>
                   <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
                      <span className="text-amber-400 font-black text-xl">{records.length}</span>
                      <span className="text-[10px] text-slate-500 font-black uppercase ml-3">Authenticated Nodes</span>
                   </div>
                </div>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                   {records.length === 0 ? (
                     <div className="text-center py-32 space-y-4 opacity-50">
                        <p className="text-slate-500 font-black uppercase tracking-[0.5em]">Awaiting Data Input</p>
                        <p className="text-[10px] text-slate-600 font-bold uppercase">Broadcast OTP & QR to Students</p>
                     </div>
                   ) : (
                     records.slice().reverse().map((rec) => (
                       <div key={rec.id} className="glass-card rounded-[2.5rem] p-8 flex items-center justify-between animate-in slide-in-from-right-8 duration-500">
                          <div className="flex items-center space-x-8">
                            <div className="w-16 h-16 bg-amber-400 text-slate-950 rounded-[1.25rem] flex items-center justify-center font-black text-xl shadow-lg">{rec.studentName[0]}</div>
                            <div>
                              <p className="text-xl font-black text-white uppercase tracking-tight">{rec.studentName}</p>
                              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{rec.studentId}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-amber-400">{new Date(rec.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                       </div>
                     ))
                   )}
                </div>
             </section>
          </div>
        </div>
      )}

      {activeTab === 'SUBJECTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <section className="glass-panel rounded-[3.5rem] p-10 border border-white/5">
              <h3 className="text-xl font-black text-white uppercase tracking-widest mb-10 flex items-center">
                <span className="w-1.5 h-6 bg-amber-400 rounded-full mr-4"></span>
                {editingSubject ? 'MODIFY SUBJECT' : 'NEW SUBJECT'}
              </h3>
              
              <form onSubmit={editingSubject ? handleUpdateSubject : handleAddSubject} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Subject Code</label>
                  <input 
                    type="text" 
                    required
                    disabled={!!editingSubject}
                    value={editingSubject ? editingSubject.id : newSubjId}
                    onChange={(e) => setNewSubjId(e.target.value)}
                    placeholder="e.g. CS805"
                    className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-amber-400 font-black disabled:opacity-50"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Subject Name</label>
                  <input 
                    type="text" 
                    required
                    value={editingSubject ? editingSubject.name : newSubjName}
                    onChange={(e) => editingSubject ? setEditingSubject({...editingSubject, name: e.target.value}) : setNewSubjName(e.target.value)}
                    placeholder="e.g. Artificial Intelligence"
                    className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-amber-400 font-bold"
                  />
                </div>
                <div className="pt-6 space-y-3">
                  <button type="submit" disabled={loading} className="w-full py-5 bg-amber-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all disabled:opacity-50">
                    {editingSubject ? 'UPDATE REGISTRY' : 'REGISTER SUBJECT'}
                  </button>
                  {editingSubject && (
                    <button type="button" onClick={() => setEditingSubject(null)} className="w-full py-5 bg-white/5 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10">
                      CANCEL EDIT
                    </button>
                  )}
                </div>
              </form>
            </section>
          </div>

          <div className="lg:col-span-8">
            <section className="glass-panel rounded-[3.5rem] p-10 border border-white/5">
               <h3 className="text-xl font-black text-white uppercase tracking-widest mb-10">Institutional Subject Registry</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {subjects.length === 0 ? (
                   <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest py-10 text-center col-span-full">No nodes found in subject cluster</p>
                 ) : (
                   subjects.map(s => (
                     <div key={s.id} className="glass-card p-6 rounded-3xl flex items-center justify-between group hover:border-amber-400/40">
                        <div className="flex items-center space-x-5">
                          <div className="w-12 h-12 bg-amber-400/10 border border-amber-400/20 rounded-xl flex items-center justify-center text-amber-400 font-black text-xs">
                             {s.id.slice(0, 3)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-white uppercase leading-tight">{s.name}</p>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">{s.id}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                            onClick={() => setEditingSubject(s)}
                            className="p-2 bg-amber-400/10 text-amber-400 rounded-lg hover:bg-amber-400 hover:text-slate-950 transition-all"
                           >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                           </button>
                           <button 
                            onClick={() => handleDeleteSubject(s.id)}
                            className="p-2 bg-[#800000]/10 text-[#800000] rounded-lg hover:bg-[#800000] hover:text-white transition-all"
                           >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                           </button>
                        </div>
                     </div>
                   ))
                 )}
               </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
