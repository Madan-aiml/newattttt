
import React, { useState, useEffect } from 'react';
import { User, InsightReport } from '../types';
import { getAttendanceInsights } from '../services/geminiService';
import { attendanceService, ScheduleRequest } from '../services/attendanceService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [insights, setInsights] = useState<InsightReport | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [facultyRegistry, setFacultyRegistry] = useState<User[]>([]);
  const [scheduleRequests, setScheduleRequests] = useState<ScheduleRequest[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FACULTY_MANAGEMENT' | 'SCHEDULE_REQUESTS' | 'DEPARTMENTS'>('OVERVIEW');
  const [newDept, setNewDept] = useState('');

  const loadData = async () => {
    const [fac, sch, depts] = await Promise.all([
      attendanceService.getFacultyRegistry(),
      attendanceService.getScheduleRequests(),
      attendanceService.getDepartments()
    ]);
    setFacultyRegistry(fac);
    setScheduleRequests(sch);
    setDepartments(depts);
  };

  const fetchInsights = async () => {
    setLoadingInsights(true);
    const mockData = {
      institution: "Sankara College",
      period: "Active Semester",
      departmentStats: { CS: 88, BBA: 72, Commerce: 84 },
      alerts: ["Low attendance in Morning CS slots"]
    };
    const report = await getAttendanceInsights(mockData);
    setInsights(report);
    setLoadingInsights(false);
  };

  useEffect(() => { 
    loadData();
    fetchInsights(); 
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleApproveFaculty = async (id: string) => {
    await attendanceService.approveFaculty(id);
    loadData();
  };

  const handleRejectFaculty = async (id: string) => {
    await attendanceService.rejectFaculty(id);
    loadData();
  };

  const handleScheduleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    await attendanceService.updateScheduleRequest(id, status);
    loadData();
  };

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newDept.trim()) {
      await attendanceService.addDepartment(newDept.trim());
      setNewDept('');
      loadData();
    }
  };

  const handleRemoveDept = async (name: string) => {
    if (confirm(`REMOVE ${name.toUpperCase()} FROM INSTITUTIONAL REGISTRY?`)) {
      await attendanceService.removeDepartment(name);
      loadData();
    }
  };

  const attendanceTrendData = [
    { day: 'Mon', rate: 85 }, { day: 'Tue', rate: 88 }, { day: 'Wed', rate: 92 },
    { day: 'Thu', rate: 84 }, { day: 'Fri', rate: 79 }, { day: 'Sat', rate: 86 },
  ];

  const deptDistribution = [
    { name: 'CS', value: 45 },
    { name: 'Commerce', value: 30 },
    { name: 'BBA', value: 15 },
    { name: 'Science', value: 10 },
  ];

  const COLORS = ['#38bdf8', '#fbbf24', '#800000', '#1e293b'];
  const pendingFaculty = facultyRegistry.filter(u => !u.isApproved);
  const approvedFaculty = facultyRegistry.filter(u => u.isApproved);
  const pendingSchedules = scheduleRequests.filter(r => r.status === 'PENDING');

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-10 border-b border-white/5 pb-10">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">ADMIN <span className="text-sky-400">COMMAND</span></h1>
          <p className="text-slate-500 font-black mt-3 uppercase tracking-[0.5em] text-[10px] flex items-center">
            <span className="w-2 h-2 bg-sky-400 rounded-full mr-3 animate-ping"></span>
            Supabase Cluster Connected
          </p>
        </div>
        
        <div className="flex bg-white/5 p-1.5 rounded-[2rem] border border-white/10 shadow-inner overflow-x-auto">
          {['OVERVIEW', 'FACULTY_MANAGEMENT', 'SCHEDULE_REQUESTS', 'DEPARTMENTS'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-4 rounded-2xl text-[9px] font-black tracking-widest uppercase transition-all relative flex-shrink-0 ${activeTab === tab ? 'bg-sky-400 text-slate-950 shadow-2xl' : 'text-slate-500 hover:text-white'}`}
            >
              {tab.replace('_', ' ')}
              {tab === 'FACULTY_MANAGEMENT' && pendingFaculty.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-maroon text-white text-[8px] flex items-center justify-center rounded-full animate-bounce">
                  {pendingFaculty.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
               {[
                { label: 'Avg Persistence', value: '88.2%', color: 'text-sky-400' },
                { label: 'Active Faculty', value: approvedFaculty.length, color: 'text-amber-400' },
                { label: 'Departments', value: departments.length, color: 'text-white' },
              ].map((stat, idx) => (
                <div key={idx} className="glass-panel p-10 rounded-[2.5rem] border border-white/5">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">{stat.label}</p>
                  <p className={`text-4xl font-black mb-1 ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            <section className="glass-panel p-12 rounded-[3.5rem] relative overflow-hidden">
              <h3 className="text-xl font-black text-white tracking-widest mb-10 uppercase flex items-center">
                <span className="w-1.5 h-6 bg-sky-400 rounded-full mr-4"></span>
                Attendance Velocity
              </h3>
              <div className="h-72">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={attendanceTrendData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                     <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#475569'}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#475569'}} />
                     <Tooltip contentStyle={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155' }} />
                     <Area type="monotone" dataKey="rate" stroke="#38bdf8" strokeWidth={5} fill="rgba(56, 189, 248, 0.05)" />
                   </AreaChart>
                 </ResponsiveContainer>
              </div>
            </section>
          </div>
          <div className="lg:col-span-4 space-y-10">
            <section className="glass-panel p-10 rounded-[3.5rem] border border-white/5 h-full flex flex-col items-center">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10">Institutional Distribution</h3>
               <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={deptDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {deptDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
            </section>
          </div>
        </div>
      )}

      {activeTab === 'FACULTY_MANAGEMENT' && (
        <div className="space-y-10">
          <section className="glass-panel rounded-[3.5rem] p-12 border border-white/5">
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-10 flex items-center">
              <span className="w-1.5 h-6 bg-amber-400 rounded-full mr-4"></span>
              Pending Approval Requests ({pendingFaculty.length})
            </h3>
            <div className="space-y-4">
              {pendingFaculty.length === 0 ? (
                <p className="text-slate-500 font-bold uppercase text-[10px] text-center py-10 tracking-widest">No pending faculty nodes in queue</p>
              ) : (
                pendingFaculty.map(f => (
                  <div key={f.id} className="glass-card rounded-[2rem] p-8 flex items-center justify-between group">
                    <div className="flex items-center space-x-6">
                      <div className="w-14 h-14 bg-amber-400/10 border border-amber-400/30 rounded-2xl flex items-center justify-center text-amber-400 font-black text-xl">{f.name[0]}</div>
                      <div>
                        <p className="text-lg font-black text-white uppercase tracking-tight">{f.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{f.email} | {f.department}</p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button onClick={() => handleApproveFaculty(f.id)} className="px-6 py-3 bg-sky-400 text-slate-950 font-black text-[10px] uppercase rounded-xl hover:bg-white transition-all">APPROVE</button>
                      <button onClick={() => handleRejectFaculty(f.id)} className="px-6 py-3 bg-maroon/20 text-maroon font-black text-[10px] uppercase rounded-xl border border-maroon/30 hover:bg-maroon hover:text-white transition-all">REJECT</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="glass-panel rounded-[3.5rem] p-12 border border-white/5">
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-10">Institutional Faculty Registry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {approvedFaculty.map(f => (
                <div key={f.id} className="glass-card rounded-[2rem] p-8 flex items-center space-x-6">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 font-black">{f.name[0]}</div>
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-tight">{f.name}</p>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{f.department}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'SCHEDULE_REQUESTS' && (
        <section className="glass-panel rounded-[3.5rem] p-12 border border-white/5">
          <h3 className="text-xl font-black text-white uppercase tracking-widest mb-10 flex items-center">
            <span className="w-1.5 h-6 bg-sky-400 rounded-full mr-4"></span>
            Class Schedule Matrix
          </h3>
          <div className="space-y-6">
            {scheduleRequests.length === 0 ? (
              <p className="text-slate-500 font-bold uppercase text-[10px] text-center py-10 tracking-widest">Registry synchronized - No pending requests</p>
            ) : (
              scheduleRequests.map(req => (
                <div key={req.id} className="glass-card rounded-[2rem] p-8 flex items-center justify-between border-l-4 border-sky-400/50">
                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Time Vector</p>
                      <p className="text-sm font-black text-white uppercase">{new Date(req.requested_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                    <div className="w-px h-10 bg-white/5"></div>
                    <div>
                      <p className="text-lg font-black text-white uppercase tracking-tight">{req.subject_name}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Request by: {req.faculty_name}</p>
                    </div>
                  </div>
                  
                  {req.status === 'PENDING' ? (
                    <div className="flex space-x-3">
                      <button onClick={() => handleScheduleAction(req.id, 'APPROVED')} className="px-5 py-2.5 bg-sky-400 text-slate-950 font-black text-[9px] uppercase rounded-lg">AUTHORIZE</button>
                      <button onClick={() => handleScheduleAction(req.id, 'REJECTED')} className="px-5 py-2.5 bg-maroon/20 text-maroon font-black text-[9px] uppercase rounded-lg border border-maroon/30">DENY</button>
                    </div>
                  ) : (
                    <span className={`px-4 py-1.5 rounded-lg text-[8px] font-black tracking-widest uppercase border ${req.status === 'APPROVED' ? 'bg-sky-400/10 border-sky-400/20 text-sky-400' : 'bg-maroon/10 border-maroon/20 text-maroon'}`}>
                      {req.status}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === 'DEPARTMENTS' && (
        <section className="glass-panel rounded-[3.5rem] p-12 border-t-8 border-sky-400">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
             <h3 className="text-2xl font-black text-white uppercase tracking-widest flex items-center">
               <span className="w-3 h-3 bg-sky-400 rounded-full mr-5"></span>
               Institutional structure
             </h3>
             <form onSubmit={handleAddDept} className="flex space-x-4">
                <input type="text" required value={newDept} onChange={(e) => setNewDept(e.target.value)} placeholder="NEW DEPARTMENT NAME" className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-sky-400 text-[10px] font-black uppercase text-white w-64" />
                <button type="submit" className="px-6 py-3 bg-sky-400 text-slate-950 font-black text-[10px] uppercase rounded-xl hover:bg-white transition-all">ADD NODE</button>
             </form>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.length === 0 ? (
               <p className="text-slate-500 font-bold uppercase text-[10px] text-center py-10 tracking-widest col-span-full">No departments defined in registry</p>
            ) : (
              departments.map((dept, i) => (
                <div key={i} className="glass-card rounded-[2rem] p-8 flex items-center justify-between group">
                   <p className="text-lg font-black text-white uppercase tracking-tight">{dept}</p>
                   <button onClick={() => handleRemoveDept(dept)} className="p-3 bg-maroon/10 text-maroon rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-maroon hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminDashboard;
