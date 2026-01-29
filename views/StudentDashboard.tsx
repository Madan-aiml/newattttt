
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, AttendanceSession, AttendanceRecord } from '../types';
import { COLLEGE_LOCATION } from '../constants';
import { isWithinCampus } from '../utils/geoUtils';
import { attendanceService } from '../services/attendanceService';
import { Html5QrcodeScanner } from 'html5-qrcode';

const StudentDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'VERIFYING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [isScanning, setIsScanning] = useState(false);
  
  const [qrVerified, setQrVerified] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [isWithinTime, setIsWithinTime] = useState(true);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const calendarData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push({ day: null, date: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = new Date(year, month, d).toDateString();
      const record = history.find(r => new Date(r.timestamp).toDateString() === dateStr);
      days.push({ day: d, date: dateStr, status: record?.status });
    }
    return days;
  }, [history]);

  const checkTimeWindow = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const start = 8 * 60 + 30; // 08:30
    const end = 15 * 60 + 45; // 15:45
    return currentTime >= start && currentTime <= end;
  };

  const loadData = async () => {
    const validTime = checkTimeWindow();
    setIsWithinTime(validTime);
    if (!validTime) {
        setActiveSession(null);
        return;
    }
    try {
      const session = await attendanceService.getActiveSession();
      if (session) {
        const records = await attendanceService.getRecords(session.id);
        const alreadyMarked = records.some(r => r.studentId === user.id);
        setActiveSession(alreadyMarked ? null : session);
      } else {
        setActiveSession(null);
        setQrVerified(false);
      }
      const hist = await attendanceService.getStudentHistory(user.id);
      setHistory(hist);
    } catch (e) {
      console.error("Portal Data Sync Fail", e);
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const inCampus = isWithinCampus(pos.coords.latitude, pos.coords.longitude, COLLEGE_LOCATION);
          setLocationVerified(inCampus);
          if (!inCampus) setLocationError('OUTSIDE INSTITUTIONAL BOUNDARIES');
          else setLocationError('');
        },
        (err) => {
          setLocationError('GPS HARDWARE DENIED');
          setLocationVerified(false);
        },
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  useEffect(() => {
    loadData();
    const poll = setInterval(loadData, 5000);
    return () => clearInterval(poll);
  }, [user.id]);

  useEffect(() => {
    if (isScanning && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
      scanner.render(onScanSuccess, onScanError);
      scannerRef.current = scanner;
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Scanner Exit Error", e));
        scannerRef.current = null;
      }
    };
  }, [isScanning]);

  function onScanSuccess(decodedText: string) {
    if (activeSession && decodedText === activeSession.qrCode) {
      setQrVerified(true);
      setIsScanning(false);
      setErrorMsg('');
    } else {
      setErrorMsg('CRYPTOGRAPHIC QR MISMATCH');
    }
  }

  function onScanError(err: any) {}

  const handleMarkAttendance = async () => {
    if (!activeSession) return;
    if (!checkTimeWindow()) {
        setErrorMsg('INSTITUTIONAL HOURS EXPIRED');
        return;
    }
    if (!locationVerified) {
      setErrorMsg('GEOLOCATION FAILED: MUST BE ON CAMPUS');
      setStatus('ERROR');
      return;
    }
    if (!qrVerified) {
      setErrorMsg('OPTICAL VERIFICATION REQUIRED');
      setStatus('ERROR');
      return;
    }
    if (otpInput.trim() !== activeSession.otp) {
      setErrorMsg('SESSION TOKEN INVALID');
      setStatus('ERROR');
      return;
    }

    setStatus('VERIFYING');
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
      await attendanceService.markPresent(record);
      setStatus('SUCCESS');
      setOtpInput('');
      setQrVerified(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message.toUpperCase());
      setStatus('ERROR');
    }
  };

  if (!isWithinTime) {
    return (
      <div className="max-w-4xl mx-auto py-24 animate-in fade-in duration-1000">
        <div className="glass-panel p-20 rounded-[4rem] text-center border-t-8 border-maroon shadow-2xl">
          <div className="w-24 h-24 bg-maroon/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-maroon/20">
             <svg className="w-12 h-12 text-maroon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">WEBSITE OFFLINE</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs leading-relaxed max-w-sm mx-auto">
            Operational Window: <span className="text-sky-400">08:30 AM</span> to <span className="text-sky-400">03:45 PM</span>.
          </p>
          <div className="mt-12 pt-10 border-t border-white/5">
            <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.4em]">SANKARA INSTITUTIONAL SECURITY GATE</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto px-4 lg:px-0">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">STUDENT <span className="text-sky-400">PORTAL</span></h1>
          <p className="text-slate-500 font-black mt-3 uppercase tracking-[0.4em] text-[10px] flex items-center">
            <span className="w-2 h-2 bg-sky-400 rounded-full mr-3 animate-pulse"></span>
            Identity Node Authenticated
          </p>
        </div>
        <div className="flex bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="text-right">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sankara ID</p>
                <p className="text-xs font-black text-white">{user.studentId}</p>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Col: Security HUD & History */}
        <div className="lg:col-span-4 space-y-10">
          <section className="glass-panel p-8 rounded-[2.5rem] border border-white/5">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Security Context</h3>
            <div className="space-y-3">
                {[
                    { label: 'Campus Presence', status: locationVerified, err: locationError || 'WAITING...' },
                    { label: 'Optical Link', status: qrVerified, err: 'SCAN REQUIRED' },
                    { label: 'Temporal Sync', status: isWithinTime, err: 'GATE CLOSED' }
                ].map((item, i) => (
                    <div key={i} className={`p-4 rounded-xl border flex items-center justify-between ${item.status ? 'bg-sky-400/5 border-sky-400/20 text-sky-400' : 'bg-white/2 border-white/5 text-slate-600'}`}>
                        <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                        <div className="flex items-center space-x-2">
                             <span className="text-[8px] font-black">{item.status ? 'VERIFIED' : item.err}</span>
                             <div className={`w-2 h-2 rounded-full ${item.status ? 'bg-sky-400' : 'bg-slate-800'}`}></div>
                        </div>
                    </div>
                ))}
            </div>
          </section>

          <section className="glass-panel p-8 rounded-[2.5rem] border border-white/5">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Attendance Log</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {history.slice().reverse().map(rec => (
                    <div key={rec.id} className="p-5 bg-white/2 border border-white/5 rounded-2xl flex justify-between items-center group hover:border-sky-400/30 transition-all">
                        <div>
                            <p className="text-[10px] font-black text-white">{new Date(rec.timestamp).toLocaleDateString()}</p>
                            <p className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">{new Date(rec.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                        </div>
                        <span className="px-3 py-1 bg-sky-400/10 border border-sky-400/30 text-sky-400 text-[8px] font-black uppercase rounded-lg">PRESENT</span>
                    </div>
                ))}
            </div>
          </section>
        </div>

        {/* Right Col: Active Session & Matrix */}
        <div className="lg:col-span-8 space-y-10">
          <section className="glass-panel rounded-[3.5rem] p-10 border-t-8 border-sky-400 shadow-2xl min-h-[400px] flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/5 rounded-full blur-[100px] pointer-events-none"></div>
            
            {activeSession ? (
              <div className="space-y-10 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="text-center md:text-left">
                        <p className="text-[10px] font-black text-sky-400 uppercase tracking-[0.4em] mb-4">Broadcast Detected</p>
                        <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">{activeSession.subjectName}</h2>
                        <p className="text-slate-500 font-black uppercase text-[10px] mt-4 tracking-widest">{activeSession.department}</p>
                    </div>

                    {!qrVerified ? (
                        <div className="w-full md:w-auto">
                            <div id="reader" className={`w-full md:w-64 ${!isScanning ? 'hidden' : 'block'}`}></div>
                            {!isScanning ? (
                                <button 
                                    onClick={() => setIsScanning(true)}
                                    className="w-full md:w-64 h-64 border-2 border-dashed border-sky-400/20 rounded-[2.5rem] flex flex-col items-center justify-center space-y-4 hover:border-sky-400 hover:bg-sky-400/5 transition-all group"
                                >
                                    <svg className="w-12 h-12 text-sky-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Activate Camera</span>
                                </button>
                            ) : (
                                <button onClick={() => setIsScanning(false)} className="w-full text-center py-4 text-[9px] font-black text-slate-700 uppercase tracking-widest">Disable Scanner</button>
                            )}
                        </div>
                    ) : (
                        <div className="w-full md:w-auto space-y-6">
                             <div className="w-full md:w-64 p-8 bg-sky-400/10 border border-sky-400/30 rounded-[2.5rem] text-center">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-4">Manual Entry</label>
                                <input 
                                    type="text" maxLength={6} value={otpInput} 
                                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                                    placeholder="XXXXXX"
                                    className="w-full bg-transparent text-4xl font-black text-sky-400 text-center outline-none tracking-[0.2em] placeholder:text-slate-800"
                                />
                             </div>
                             <button 
                                onClick={handleMarkAttendance}
                                disabled={status === 'VERIFYING' || otpInput.length !== 6}
                                className="w-full py-6 bg-sky-400 text-slate-950 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-white transition-all disabled:opacity-20"
                             >
                                {status === 'VERIFYING' ? 'SYNCING...' : 'COMMIT ATTENDANCE'}
                             </button>
                        </div>
                    )}
                </div>
                {errorMsg && <p className="text-center text-[10px] font-black text-maroon uppercase tracking-widest">{errorMsg}</p>}
              </div>
            ) : (
              <div className="text-center py-20 relative z-10 opacity-30">
                <p className="text-slate-500 font-black uppercase tracking-[0.8em] text-[10px]">Awaiting Active Hub Broadcast</p>
                <p className="text-[10px] text-slate-700 font-bold uppercase mt-4 italic">Institutional security gate is monitoring for node signals.</p>
              </div>
            )}
          </section>

          <section className="glass-panel p-10 rounded-[3rem] border border-white/5">
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-12 flex items-center">
                <span className="w-1.5 h-6 bg-sky-400 rounded-full mr-4"></span>
                Monthly Presence Matrix
            </h3>
            <div className="grid grid-cols-7 gap-4">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                    <div key={d} className="text-center text-[9px] font-black text-slate-600 tracking-widest mb-4">{d}</div>
                ))}
                {calendarData.map((day, idx) => (
                    <div 
                        key={idx} 
                        className={`aspect-square rounded-2xl flex items-center justify-center text-xs font-black transition-all border ${
                            day.day ? (
                                day.status === 'PRESENT' ? 'bg-sky-400/20 border-sky-400/40 text-sky-400 shadow-[inset_0_0_20px_rgba(56,189,248,0.1)]' :
                                day.status === 'ABSENT' ? 'bg-maroon/20 border-maroon/40 text-maroon' :
                                'bg-white/2 border-white/5 text-slate-800'
                            ) : 'border-transparent'
                        }`}
                    >
                        {day.day}
                    </div>
                ))}
            </div>
          </section>
        </div>
      </div>

      {status === 'SUCCESS' && (
        <div className="fixed inset-0 bg-[#0f172a]/95 z-[500] flex items-center justify-center p-6 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="glass-panel p-20 rounded-[4rem] text-center max-w-lg w-full border border-sky-400/30">
            <div className="w-24 h-24 bg-sky-400 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_60px_rgba(56,189,248,0.3)] animate-bounce">
               <svg className="w-12 h-12 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-white text-3xl font-black mb-4 uppercase tracking-tighter">DATA COMMITTED</h3>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-10 leading-relaxed">
              Attendance node synchronized with Institutional Core.
            </p>
            <button 
              onClick={() => setStatus('IDLE')} 
              className="w-full py-5 bg-white text-slate-950 font-black rounded-2xl uppercase tracking-widest hover:bg-sky-400 transition-all shadow-xl"
            >
              CLOSE UPLINK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
