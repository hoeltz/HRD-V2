// Type definitions for the HRD application

export interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  joinDate: string;
  phone: string;
  birthDate: string;
  status: 'active' | 'inactive';
  salary?: number;
  nip?: string; // Nomor Induk Pegawai
  photoUrl?: string;
}

// Enhanced Employee interface (for future use)
export interface EnhancedEmployee {
  id: string;
  personalInfo: PersonalInfo;
  personalDetails?: PersonalDetails;
  education: Education[];
  skills: Skill[];
  createdAt: string;
  updatedAt: string;
}

// Personal Information (for future tabs)
export interface PersonalInfo {
  id: string;
  nip: string;
  name: string;
  email: string;
  emailKantor?: string;
  phone: string;
  position: string;
  department: string;
  joinDate: string;
  status: 'active' | 'inactive';
  baseSalary?: number;
  photoUrl?: string;
}

// Personal Details (for future tabs)
export interface PersonalDetails {
  employeeId: string;
  // Basic Info
  nik?: string;
  npwp?: string;
  birthDate: string;
  birthPlace: string;
  gender: 'male' | 'female';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  religion?: string;
  bloodType?: string;
  height?: number; // cm
  weight?: number; // kg
  
  // Address
  address: string;
  rtRw?: string;
  village?: string;
  subDistrict?: string;
  city: string;
  province: string;
  postalCode?: string;
  
  // Family
  spouseName?: string;
  spouseJob?: string;
  numberOfChildren?: number;
  childrenNames?: string[];
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
}

// Education (for future tabs)
export interface Education {
  id: string;
  employeeId: string;
  type: 'formal' | 'nonformal';
  level: 'sd' | 'smp' | 'sma' | 'smk' | 'diploma' | 's1' | 's2' | 's3';
  institutionName: string;
  major?: string;
  entryYear: string;
  graduationYear: string;
  grade?: string;
  description?: string;
}

// Skills & Competencies (for future tabs)
export interface Skill {
  id: string;
  employeeId: string;
  type: 'hard' | 'soft' | 'language' | 'license';
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description?: string;
  certificate?: boolean;
  certificateNumber?: string;
  validUntil?: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  hoursWorked: number;
  status: 'present' | 'absent' | 'late';
}

export interface Leave {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  type: 'annual' | 'sick' | 'personal';
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
}

export interface Salary {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'employee';
  employeeId?: string;
}