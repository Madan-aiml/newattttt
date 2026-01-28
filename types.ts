
export enum UserRole {
  ADMIN = 'ADMIN',
  FACULTY = 'FACULTY',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  department?: string;
  studentId?: string;
  facultyId?: string;
  isApproved?: boolean;
}

export interface AttendanceSession {
  id: string;
  subjectId: string;
  subjectName: string;
  department: string;
  facultyId: string;
  startTime: string;
  endTime: string;
  otp: string;
  qrCode: string;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  sessionId: string;
  timestamp: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  locationVerified: boolean;
  otpVerified: boolean;
  qrVerified: boolean;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'URGENT' | 'ACADEMIC' | 'EVENT';
  timestamp: string;
  author: string;
}

export interface CampusLocation {
  latitude: number;
  longitude: number;
  radius: number; // In meters
}

export interface InsightReport {
  summary: string;
  atRiskStudents: string[];
  recommendations: string[];
}
