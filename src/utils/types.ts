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

// Performance Management Types
export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerName: string;
  reviewPeriod: {
    startDate: string;
    endDate: string;
    type: 'quarterly' | 'annual' | 'project-based' | 'mid-year';
  };
  overallRating: 1 | 2 | 3 | 4 | 5;
  selfAssessment: {
    communication: 1 | 2 | 3 | 4 | 5;
    teamwork: 1 | 2 | 3 | 4 | 5;
    leadership: 1 | 2 | 3 | 4 | 5;
    problemSolving: 1 | 2 | 3 | 4 | 5;
    productivity: 1 | 2 | 3 | 4 | 5;
    quality: 1 | 2 | 3 | 4 | 5;
    initiative: 1 | 2 | 3 | 4 | 5;
    adaptability: 1 | 2 | 3 | 4 | 5;
  };
  managerAssessment: {
    communication: 1 | 2 | 3 | 4 | 5;
    teamwork: 1 | 2 | 3 | 4 | 5;
    leadership: 1 | 2 | 3 | 4 | 5;
    problemSolving: 1 | 2 | 3 | 4 | 5;
    productivity: 1 | 2 | 3 | 4 | 5;
    quality: 1 | 2 | 3 | 4 | 5;
    initiative: 1 | 2 | 3 | 4 | 5;
    adaptability: 1 | 2 | 3 | 4 | 5;
  };
  keyAchievements: string[];
  areasForImprovement: string[];
  goalsForNextPeriod: string[];
  comments: string;
  actionItems: ActionItem[];
  status: 'draft' | 'in-review' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ActionItem {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface SmartGoal {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
  targetCompletionDate: string;
  progress: number; // 0-100
  priority: 'low' | 'medium' | 'high';
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  keyMilestones: string[];
  successCriteria: string;
  assignedBy: string;
  createdAt: string;
  updatedAt: string;
}

// Skills Management Types (Enhanced)
export interface EnhancedSkill {
  id: string;
  employeeId: string;
  skillName: string;
  category: 'technical' | 'soft' | 'language' | 'license' | 'certification';
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  lastUsedDate?: string;
  certificationStatus?: 'none' | 'in-progress' | 'certified' | 'expired';
  certificationExpiry?: string;
  skillSource: 'self-assessment' | 'training' | 'work-experience' | 'formal-education';
  proofOfCompetency?: string; // URL or description
  notes?: string;
  rating: 1 | 2 | 3 | 4 | 5; // Self-assessment rating
  createdAt: string;
  updatedAt: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  description: string;
  skills: string[]; // List of skill names in this category
}

export interface TrainingRecord {
  id: string;
  employeeId: string;
  trainingName: string;
  provider: string;
  trainingType: 'internal' | 'external' | 'online' | 'workshop' | 'conference';
  duration: {
    hours?: number;
    days?: number;
    weeks?: number;
  };
  completionDate?: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  outcome?: string;
  score?: number;
  certificateReceived: boolean;
  certificateNumber?: string;
  cost?: number;
  nextTrainingNeeded?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Certification {
  id: string;
  employeeId: string;
  certificationName: string;
  issuingOrganization: string;
  certificationType: 'professional' | 'technical' | 'language' | 'safety' | 'compliance';
  issueDate: string;
  expiryDate?: string;
  certificateNumber?: string;
  status: 'active' | 'expired' | 'expiring-soon' | 'renewal-required';
  renewalCost?: number;
  fileUrl?: string; // URL to uploaded certificate
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SkillGap {
  id: string;
  employeeId: string;
  skillRequired: string;
  currentLevel: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  requiredLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  gapPercentage: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  recommendedActions: string[];
  targetCompletionDate?: string;
  status: 'identified' | 'in-progress' | 'addressed';
  createdAt: string;
  updatedAt: string;
}