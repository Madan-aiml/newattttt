
import { CampusLocation, UserRole } from './types';

// Coordinates for Sankara College of Science and Commerce (Mocked for demonstration)
export const COLLEGE_LOCATION: CampusLocation = {
  latitude: 11.0827, // Saravanampatti, Coimbatore area
  longitude: 77.0003,
  radius: 800 // 800 meter campus radius
};

export const MOCK_STUDENTS = [
  { id: 'S101', name: 'Arun Kumar', role: UserRole.STUDENT, studentId: '20CS101', department: 'Computer Science' },
  { id: 'S102', name: 'Deepika S', role: UserRole.STUDENT, studentId: '20CS102', department: 'Computer Science' },
  { id: 'S103', name: 'Rahul V', role: UserRole.STUDENT, studentId: '20CS103', department: 'Computer Science' },
];

export const MOCK_FACULTY = [
  { id: 'F001', name: 'Dr. Ramaswamy', role: UserRole.FACULTY, facultyId: 'FAC001', department: 'Computer Science' },
  { id: 'F002', name: 'Prof. Anitha', role: UserRole.FACULTY, facultyId: 'FAC002', department: 'Management' },
];

export const SUBJECTS = [
  { id: 'CS801', name: 'Distributed Systems' },
  { id: 'CS802', name: 'Cloud Computing' },
  { id: 'CS803', name: 'Mobile Application Development' },
];
