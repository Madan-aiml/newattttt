import { AttendanceSession, AttendanceRecord, User, Notice } from '../types';
import { supabase, getSupabaseClient } from './supabaseClient';

export interface ScheduleRequest {
  id: string;
  faculty_id: string;
  faculty_name: string;
  subject_id: string;
  subject_name: string;
  requested_time: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Subject {
  id: string;
  name: string;
}

const isClientReady = () => !!getSupabaseClient();
const LOCAL_FACULTY_KEY = 'sankara_local_faculty';
const LOCAL_SUBJECTS_KEY = 'sankara_local_subjects';
const SUBJECTS_INITIALIZED_KEY = 'sankara_subjects_initialized';

const DEFAULT_DEPTS = ['Computer Science', 'Commerce', 'Management', 'Science', 'Arts'];
const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'CS801', name: 'Distributed Systems' },
  { id: 'CS802', name: 'Cloud Computing' },
  { id: 'CS803', name: 'Mobile Application Development' },
  { id: 'MGMT101', name: 'Principles of Management' }
];

// Helper to manage local faculty fallback
const getLocalFaculty = (): User[] => {
  const data = localStorage.getItem(LOCAL_FACULTY_KEY);
  return data ? JSON.parse(data) : [];
};

const saveLocalFaculty = (faculty: User[]) => {
  localStorage.setItem(LOCAL_FACULTY_KEY, JSON.stringify(faculty));
};

// Helper to manage local subjects with initialization logic
const getLocalSubjects = (): Subject[] => {
  const data = localStorage.getItem(LOCAL_SUBJECTS_KEY);
  const initialized = localStorage.getItem(SUBJECTS_INITIALIZED_KEY);
  
  if (data === null && !initialized) {
    localStorage.setItem(LOCAL_SUBJECTS_KEY, JSON.stringify(DEFAULT_SUBJECTS));
    localStorage.setItem(SUBJECTS_INITIALIZED_KEY, 'true');
    return DEFAULT_SUBJECTS;
  }
  
  return data ? JSON.parse(data) : [];
};

const saveLocalSubjects = (subjects: Subject[]) => {
  localStorage.setItem(LOCAL_SUBJECTS_KEY, JSON.stringify(subjects));
  localStorage.setItem(SUBJECTS_INITIALIZED_KEY, 'true');
};

export const attendanceService = {
  getNotices: async (): Promise<Notice[]> => {
    return [
      { id: '1', title: 'NAAC PEER TEAM VISIT', content: 'All departments are requested to keep records updated for the upcoming audit.', category: 'URGENT', timestamp: new Date().toISOString(), author: 'Principal' },
      { id: '2', title: 'SYLLABUS UPDATE: CS801', content: 'Distributed Systems unit 5 has been updated with new cloud architecture modules.', category: 'ACADEMIC', timestamp: new Date(Date.now() - 86400000).toISOString(), author: 'HOD CS' },
      { id: '3', title: 'ANNUAL SPORTS MEET', content: 'Registrations are now open for the Sankara Athletic Meet 2024.', category: 'EVENT', timestamp: new Date(Date.now() - 172800000).toISOString(), author: 'Physical Director' },
    ];
  },

  getFacultyRegistry: async (): Promise<User[]> => {
    let faculty = getLocalFaculty();
    if (isClientReady()) {
      try {
        const { data, error } = await supabase.from('faculty_registry').select('*');
        if (!error && data) {
          const dbFaculty = data.map(f => ({
            id: f.id, name: f.name, email: f.email, role: f.role as any,
            department: f.department, facultyId: f.faculty_id, isApproved: f.is_approved
          }));
          const combined = [...dbFaculty];
          faculty.forEach(local => {
            if (!combined.find(c => c.email === local.email)) combined.push(local);
          });
          return combined;
        }
      } catch (e) { console.error(e); }
    }
    return faculty;
  },

  registerFacultyRequest: async (user: User) => {
    const faculty = getLocalFaculty();
    if (!faculty.find(f => f.email === user.email)) {
      faculty.push({ ...user, isApproved: false });
      saveLocalFaculty(faculty);
    }
    if (isClientReady()) {
      try {
        await supabase.from('faculty_registry').insert([{
          id: user.id, name: user.name, email: user.email, role: user.role,
          department: user.department, faculty_id: user.facultyId, is_approved: false
        }]);
      } catch (e) { console.error(e); }
    }
  },

  approveFaculty: async (userId: string) => {
    const faculty = getLocalFaculty();
    const index = faculty.findIndex(f => f.id === userId);
    if (index !== -1) {
      faculty[index].isApproved = true;
      saveLocalFaculty(faculty);
    }
    if (isClientReady()) {
      try {
        await supabase.from('faculty_registry').update({ is_approved: true }).eq('id', userId);
      } catch (e) { console.error(e); }
    }
  },

  rejectFaculty: async (userId: string) => {
    const faculty = getLocalFaculty();
    const filtered = faculty.filter(f => f.id !== userId);
    saveLocalFaculty(filtered);
    if (isClientReady()) {
      try {
        await supabase.from('faculty_registry').delete().eq('id', userId);
      } catch (e) { console.error(e); }
    }
  },

  getFacultyByEmail: async (email: string): Promise<User | undefined> => {
    const local = getLocalFaculty().find(f => f.email === email);
    if (isClientReady()) {
      try {
        const { data, error } = await supabase.from('faculty_registry').select('*').eq('email', email).maybeSingle();
        if (!error && data) {
          return {
            id: data.id, name: data.name, email: data.email, role: data.role as any,
            department: data.department, facultyId: data.faculty_id, isApproved: data.is_approved
          };
        }
      } catch (e) { console.error(e); }
    }
    return local;
  },

  getDepartments: async (): Promise<string[]> => {
    if (!isClientReady()) return DEFAULT_DEPTS;
    try {
      const { data, error } = await supabase.from('departments').select('name');
      if (error || !data || data.length === 0) return DEFAULT_DEPTS;
      return [...new Set([...DEFAULT_DEPTS, ...data.map(d => d.name)])];
    } catch { return DEFAULT_DEPTS; }
  },

  addDepartment: async (name: string) => {
    if (isClientReady()) {
      try { await supabase.from('departments').insert([{ name }]); } catch (e) {}
    }
  },

  removeDepartment: async (name: string) => {
    if (isClientReady()) {
      try { await supabase.from('departments').delete().eq('name', name); } catch (e) {}
    }
  },

  getSubjects: async (): Promise<Subject[]> => {
    // If we have a cloud client, try to fetch from cloud first
    if (isClientReady()) {
      try {
        const { data, error } = await supabase.from('subjects').select('*');
        if (!error && data) {
          // If table exists but is empty, we respect that empty state from the cloud
          // unless the user is specifically in a "first run" local state
          return data;
        }
      } catch (e) { 
        console.warn("Supabase Subject Fetch Failed, falling back to local registry");
      }
    }
    return getLocalSubjects();
  },

  addSubject: async (subject: Subject) => {
    const local = getLocalSubjects();
    if (!local.find(s => s.id === subject.id)) {
      local.push(subject);
      saveLocalSubjects(local);
    }
    if (isClientReady()) {
      try {
        await supabase.from('subjects').upsert([subject]);
      } catch (e) { console.error(e); }
    }
  },

  updateSubject: async (id: string, name: string) => {
    const local = getLocalSubjects();
    const idx = local.findIndex(s => s.id === id);
    if (idx !== -1) {
      local[idx].name = name;
      saveLocalSubjects(local);
    }
    if (isClientReady()) {
      try {
        await supabase.from('subjects').update({ name }).eq('id', id);
      } catch (e) { console.error(e); }
    }
  },

  deleteSubject: async (id: string) => {
    const local = getLocalSubjects();
    const filtered = local.filter(s => s.id !== id);
    saveLocalSubjects(filtered);
    if (isClientReady()) {
      try {
        await supabase.from('subjects').delete().eq('id', id);
      } catch (e) { console.error(e); }
    }
  },

  getScheduleRequests: async (): Promise<ScheduleRequest[]> => {
    if (!isClientReady()) return [];
    try {
      const { data, error } = await supabase.from('schedule_requests').select('*');
      return error ? [] : data;
    } catch { return []; }
  },

  updateScheduleRequest: async (id: string, status: 'APPROVED' | 'REJECTED') => {
    if (isClientReady()) {
      try { await supabase.from('schedule_requests').update({ status }).eq('id', id); } catch {}
    }
  },

  createSession: async (session: AttendanceSession) => {
    if (isClientReady()) {
      try {
        await supabase.from('attendance_sessions').update({ is_active: false }).eq('is_active', true); 
        await supabase.from('attendance_sessions').insert([{
          id: session.id, subject_id: session.subjectId, subject_name: session.subjectName,
          department: session.department, faculty_id: session.facultyId,
          start_time: session.startTime, end_time: session.endTime,
          otp: session.otp, qr_code: session.qrCode, is_active: true
        }]);
      } catch {}
    }
  },

  endSession: async (sessionId: string) => {
    if (isClientReady()) {
      try { await supabase.from('attendance_sessions').update({ is_active: false }).eq('id', sessionId); } catch {}
    }
  },

  getActiveSession: async (): Promise<AttendanceSession | null> => {
    if (!isClientReady()) return null;
    try {
      const { data, error } = await supabase.from('attendance_sessions').select('*').eq('is_active', true).maybeSingle();
      if (error || !data) return null;
      return {
        id: data.id, subjectId: data.subject_id, subjectName: data.subject_name,
        department: data.department, facultyId: data.faculty_id,
        startTime: data.start_time, endTime: data.end_time,
        otp: data.otp, qrCode: data.qr_code, isActive: data.is_active
      };
    } catch { return null; }
  },

  markPresent: async (record: AttendanceRecord) => {
    if (isClientReady()) {
      try {
        // Fix: Changed record.qr_verified to record.qrVerified to match the AttendanceRecord interface
        await supabase.from('attendance_records').insert([{
          id: record.id, student_id: record.studentId, student_name: record.studentName,
          session_id: record.sessionId, timestamp: record.timestamp, status: record.status,
          location_verified: record.locationVerified, otp_verified: record.otpVerified, qr_verified: record.qrVerified
        }]);
      } catch {}
    }
    return true;
  },

  getRecords: async (sessionId: string): Promise<AttendanceRecord[]> => {
    if (!isClientReady()) return [];
    try {
      const { data, error } = await supabase.from('attendance_records').select('*').eq('session_id', sessionId);
      if (error) return [];
      return data.map(r => ({
        id: r.id, studentId: r.student_id, studentName: r.student_name,
        sessionId: r.session_id, timestamp: r.timestamp, status: r.status as any,
        locationVerified: r.location_verified, otpVerified: r.otp_verified, qrVerified: r.qr_verified
      }));
    } catch { return []; }
  },

  getStudentHistory: async (studentId: string): Promise<AttendanceRecord[]> => {
    if (!isClientReady()) return [];
    try {
      const { data, error } = await supabase.from('attendance_records').select('*').eq('student_id', studentId);
      if (error) return [];
      return data.map(r => ({
        id: r.id, studentId: r.student_id, studentName: r.student_name,
        sessionId: r.session_id, timestamp: r.timestamp, status: r.status as any,
        locationVerified: r.location_verified, otpVerified: r.otp_verified, qrVerified: r.qr_verified
      }));
    } catch { return []; }
  }
};