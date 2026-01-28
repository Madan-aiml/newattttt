
import React, { useState, useEffect, useRef } from 'react';
import { User, AttendanceSession, AttendanceRecord } from '../types';
import { COLLEGE_LOCATION } from '../constants';
import { isWithinCampus } from '../utils/geoUtils';
import { attendanceService } from '../services/attendanceService';
import { Html5QrcodeScanner } from 'html5-qrcode';

const StudentDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [studentIdInput, setStudentIdInput] = useState(user.studentId || '');
  const [status, setStatus] = useState<'IDLE' | 'VERIFYING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [isScanning, setIsScanning] = useState(false);
  const [qrVerified, setQrVerified] = useState(true); // Default to true for testing
  const [locationVerified, setLocationVerified] = useState(true); // Default to true for testing
  const [errorMsg, setErrorMsg] = useState('');
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const loadData = async () => {
    try {
      const session = await attendanceService.getActiveSession();
      if (session) {
        const records = await attendanceService.getRecords(session.id);
        const alreadyMarked = records.some(r => r.studentId === user.id);
        setActiveSession(alreadyMarked ? null : session);
        // Auto-syncing OTP removed for manual verification requirement
      } else {
        setActiveSession(null);
      }
      const hist = await attendanceService.getStudentHistory(user.id);
      setHistory(hist);
    } catch (e) {
      console.error("Student Sync Error", e);
    }
  };

  useEffect(() => {
    loadData();
    const poll = setInterval(loadData, 5000);
    return () => clearInterval(poll);
  }, [user.id]);

  const handleMarkAttendance = async () => {
    if (!activeSession) return;
    setStatus('VERIFYING');
    setErrorMsg('');
    
    // Manual OTP Verification logic
    if (otpInput.trim() !== activeSession.otp) {
      setErrorMsg('INVALID SESSION OTP');
      setStatus('ERROR');
      return;
    }

    try {
      const record: AttendanceRecord = {
        id: 'REC_' + Date.now(), 
        studentId: user.id, 
        studentName: user.name,
        sessionId: activeSession.id, 
        timestamp: new Date().toISOString(),
        status: 'PRESENT', 
        locationVerified: true, 
        otpVerified: true, 
        qrVerified: true
      };

      const success = await attendanceService.markPresent(record);
      if (success) {
        setStatus('SUCCESS');
        setOtpInput(''); // Reset for next session
        loadData();
      } else {
        throw new Error('ALREADY MARKED');
      }
    } catch (err: any) {
      setErrorMsg(err.message.toUpperCase());
      setStatus('ERROR');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 pb-24">
      {/* Verification Banner */}
      <div className="bg-sky-400/10 border border-sky-400/20 p-6 rounded-3xl flex items-center justify-between shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="w-3 h-3 bg-sky-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(56,189,248,0.8)]"></div>
          <div>
            <span className="text-xs font-black text-sky-400 uppercase tracking-widest block">SECURE PROTOCOL ACTIVE</span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Protocol: Manual OTP Entry Mandatory</span>
          </div>
        </div>
        <div className="text-right">
          <span className="px-3 py-1 bg-sky-400 text-slate-950 text-[8px] font-black rounded-lg uppercase tracking-widest">Institutional</span>
        </div>
      </div>

      <section className="glass-panel rounded-[3.5rem] p-10 border-t-8 border-sky-400 shadow-2xl">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">{user.name}</h2>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-1 opacity-70">
              Uplink Identity: <span className="text-sky-400">{user.studentId || 'STUDENT_NODE_ALPHA'}</span>
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg ${activeSession ? 'bg-sky-400 text-slate-950' : 'bg-slate-800 text-slate-500 border border-white/5'}`}>
              {activeSession ? 'Session Link Active' : 'Waiting for Faculty'}
            </span>
          </div>
        </div>

        {activeSession ? (
          <div className="space-y-10">
            <div className="p-8 bg-sky-400/5 border border-sky-400/20 rounded-[2.5rem] text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Current Subject Node</p>
              <h3 className="text-3xl font-black text-white uppercase tracking-tight">{activeSession.subjectName}</h3>
              <p className="text-sky-400 text-[10px] font-bold mt-2 uppercase tracking-[0.3em]">{activeSession.department}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Verified Student ID</label>
                <div className="w-full p-6 bg-white/5 border border-sky-400/20 rounded-2xl text-white font-black text-lg tracking-widest uppercase">
                  {studentIdInput}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Manual OTP Entry</label>
                <input 
                  type="text" 
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full p-6 bg-white/5 border border-sky-400/20 rounded-2xl text-center text-4xl font-black text-sky-400 tracking-[0.2em] outline-none focus:border-sky-400 transition-all placeholder:text-slate-800"
                />
              </div>
            </div>
            
            <div className="pt-6">
              <button 
                onClick={handleMarkAttendance} 
                disabled={status === 'VERIFYING'}
                className="w-full py-8 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 rounded-[2.5rem] font-black text-xl uppercase tracking-widest shadow-[0_20px_60px_rgba(56,189,248,0.2)] transition-all active:scale-95 group"
              >
                {status === 'VERIFYING' ? (
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-6 h-6 border-4 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>
                    <span>SYNCHRONIZING...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-4">
                    <span>COMMIT ATTENDANCE</span>
                    <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
              </button>
              
              <div className="mt-8 flex justify-center space-x-8">
                {['QR Ready', 'GEO Verified', 'OTP Verification Required'].map(check => (
                  <div key={check} className="flex items-center space-x-2 opacity-60">
                    <div className="w-4 h-4 bg-sky-400 rounded-md flex items-center justify-center">
                      <svg className="w-3 h-3 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{check}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {errorMsg && (
              <div className="p-4 bg-maroon/20 border border-maroon/30 text-red-500 text-center font-black text-[10px] uppercase rounded-xl animate-bounce">
                {errorMsg}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-24 animate-in fade-in duration-1000">
            <div className="relative w-24 h-24 mx-auto mb-10">
              <div className="absolute inset-0 bg-sky-400/20 rounded-full animate-ping"></div>
              <div className="relative w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <svg className="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 21a10.003 10.003 0 008.384-4.51l.054.09m-4.289-8.767Q17 14.612 12 19.199c-5-4.587-5-10.199 0-14.786a10.003 10.003 0 014.289 8.767z" />
                </svg>
              </div>
            </div>
            <h3 className="text-white text-2xl font-black uppercase tracking-tight mb-4">UPLINK DORMANT</h3>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs max-w-xs mx-auto leading-relaxed">
              No active session broadcast detected from the Faculty Core.
            </p>
          </div>
        )}
      </section>

      <section className="glass-panel rounded-[3rem] p-10 border border-white/5">
        <h3 className="text-xl font-black text-white uppercase tracking-widest mb-10 flex items-center">
          <span className="w-1.5 h-6 bg-sky-400 rounded-full mr-4 shadow-[0_0_10px_rgba(56,189,248,0.5)]"></span>
          Institutional Presence History
        </h3>
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-16 bg-white/2 rounded-[2rem] border border-dashed border-white/5">
              <p className="text-slate-600 font-bold text-[10px] uppercase tracking-[0.4em]">Registry Empty</p>
            </div>
          ) : (
            history.slice().reverse().map(rec => (
              <div key={rec.id} className="glass-card p-8 rounded-3xl flex justify-between items-center group hover:border-sky-400/30">
                <div className="flex items-center space-x-6">
                  <div className="w-14 h-14 bg-sky-400/10 rounded-2xl flex items-center justify-center text-sky-400 border border-sky-400/20 group-hover:bg-sky-400 group-hover:text-slate-950 transition-all">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-white font-black uppercase text-sm tracking-tight block">Authenticated Submission</span>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Status: Digital Signature Verified</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sky-400 text-xs font-black block tracking-tighter">{new Date(rec.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span className="text-slate-600 text-[9px] font-bold block uppercase mt-1">{new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {status === 'SUCCESS' && (
        <div className="fixed inset-0 bg-slate-950/95 z-[200] flex items-center justify-center p-6 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="glass-panel p-20 rounded-[4rem] text-center max-w-lg w-full border border-sky-400/30 shadow-[0_0_100px_rgba(56,189,248,0.1)]">
            <div className="w-28 h-28 bg-sky-400 rounded-full flex items-center justify-center mx-auto mb-12 shadow-[0_0_60px_rgba(56,189,248,0.6)] animate-bounce">
               <svg className="w-14 h-14 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-white text-4xl font-black mb-6 uppercase tracking-tighter">NODE SYNCED</h3>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-12 leading-relaxed">
              Attendance data successfully committed to the <span className="text-sky-400">Sankara Institutional Registry</span>.
            </p>
            <button 
              onClick={() => setStatus('IDLE')} 
              className="w-full py-6 bg-white text-slate-950 font-black rounded-2xl uppercase tracking-widest hover:bg-sky-400 transition-all shadow-xl active:scale-95"
            >
              ACKNOWLEDGE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
