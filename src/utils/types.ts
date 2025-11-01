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
  type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'emergency';
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  approvedBy?: string;
  level1Approval?: {
    approvedBy: string;
    approvedAt: string;
    notes?: string;
  };
  level2Approval?: {
    approvedBy: string;
    approvedAt: string;
    notes?: string;
  };
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'urgent' | 'appointment' | 'personal' | 'family' | 'health';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  level1Approval?: {
    approvedBy: string;
    approvedAt: string;
    notes?: string;
  };
  level2Approval?: {
    approvedBy: string;
    approvedAt: string;
    notes?: string;
  };
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Combined Attendance + Leave + Permission interface for comprehensive reporting
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  type: 'attendance' | 'leave' | 'permission';
  // For attendance
  checkIn?: string;
  checkOut?: string;
  hoursWorked?: number;
  status?: 'present' | 'absent' | 'late';
  // For leave
  leaveId?: string;
  leaveType?: string;
  leaveStatus?: 'approved' | 'pending' | 'rejected';
  // For permission  
  permissionId?: string;
  permissionType?: string;
  permissionStatus?: 'approved' | 'pending' | 'rejected';
  permissionStartTime?: string;
  permissionEndTime?: string;
  // Common fields
  approvedBy?: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
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

// Enhanced Salary Management Types

export interface SalaryDetail {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  
  // Basic Components
  baseSalary: number;
  hoursWorked: number;
  hourlyRate: number;
  
  // Allowances
  allowances: AllowanceBreakdown;
  
  // Deductions
  deductions: DeductionBreakdown;
  
  // Bonuses
  bonuses: BonusBreakdown;
  
  // Calculated Fields
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  
  // Additional Info
  workingDays: number;
  overtimeHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface AllowanceBreakdown {
  transport: number;
  meal: number;
  health: number;
  position: number;
  skill: number;
  other: number;
}

export interface DeductionBreakdown {
  incomeTax: number;
  healthInsurance: number;
  employmentInsurance: number;
  loan: number;
  other: number;
}

export interface BonusBreakdown {
  performance: number;
  annual: number;
  holiday: number;
  attendance: number;
  other: number;
}

export interface PayrollConfig {
  id: string;
  workingHoursPerDay: number;
  workingDaysPerMonth: number;
  overtimeMultiplier: number;
  standardOvertimeThreshold: number;
  monthlyTaxExemption: number;
  transportAllowanceRate: number;
  mealAllowanceRate: number;
  healthInsuranceRate: number;
  employmentInsuranceRate: number;
}

export interface SalaryStructure {
  id: string;
  level: string;
  position: string;
  department: string;
  minSalary: number;
  maxSalary: number;
  baseSalary: number;
  transportAllowance: number;
  mealAllowance: number;
  healthAllowance: number;
}

export interface AllowanceConfig {
  id: string;
  name: string;
  type: 'transport' | 'meal' | 'health' | 'position' | 'skill' | 'other';
  amount: number;
  calculationType: 'fixed' | 'percentage';
  percentageBase?: number; // base salary percentage if percentage type
  employeeSpecific?: boolean;
  positionSpecific?: boolean;
  departmentSpecific?: boolean;
}

export interface DeductionConfig {
  id: string;
  name: string;
  type: 'incomeTax' | 'healthInsurance' | 'employmentInsurance' | 'loan' | 'other';
  calculationType: 'fixed' | 'percentage';
  percentage?: number;
  fixedAmount?: number;
  taxBracket?: number; // for progressive tax calculation
  mandatory: boolean;
}

export interface BonusConfig {
  id: string;
  name: string;
  type: 'performance' | 'annual' | 'holiday' | 'attendance' | 'other';
  calculationType: 'fixed' | 'percentage';
  amount: number;
  percentage?: number;
  criteria?: string;
  frequency: 'monthly' | 'quarterly' | 'annual' | 'on-demand';
}