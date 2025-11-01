// Utility functions for localStorage operations

export const getFromStorage = (key: string): any => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

export const setToStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// App settings management
export interface AppSettings {
  appName: string;
  logoData: string | null;
  salarySlipLabels: {
    headerTitle: string;
    companyName: string;
    footerText: string;
    fieldNames: {
      employeeName: string;
      employeeId: string;
      position: string;
      department: string;
      baseSalary: string;
      allowances: string;
      deductions: string;
      grossSalary: string;
      netSalary: string;
      period: string;
    };
  };
  companyIdentity: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    taxId: string;
    registrationNumber: string;
    description: string;
    foundedYear: string;
  };
}

export const getAppSettings = (): AppSettings => {
  const settings = getFromStorage('appSettings');
  return settings || {
    appName: 'My Office',
    logoData: null,
    companyIdentity: {
      name: 'My Office HRD',
      address: '',
      phone: '',
      email: '',
      website: '',
      taxId: '',
      registrationNumber: '',
      description: '',
      foundedYear: ''
    }
  };
};

export const saveAppSettings = (settings: AppSettings): void => {
  setToStorage('appSettings', settings);
};

export const updateAppSettings = (updates: Partial<AppSettings>): void => {
  const currentSettings = getAppSettings();
  const newSettings = { ...currentSettings, ...updates };
  saveAppSettings(newSettings);
};

// Enhanced Salary Management Storage
export interface PayrollSettings {
  payrollConfigs: any[];
  salaryStructures: any[];
  allowanceConfigs: any[];
  deductionConfigs: any[];
  bonusConfigs: any[];
}

export const getPayrollSettings = (): PayrollSettings => {
  const settings = getFromStorage('payrollSettings');
  return settings || {
    payrollConfigs: [],
    salaryStructures: [],
    allowanceConfigs: [],
    deductionConfigs: [],
    bonusConfigs: []
  };
};

export const savePayrollSettings = (settings: PayrollSettings): void => {
  setToStorage('payrollSettings', settings);
};

export const updatePayrollSettings = (updates: Partial<PayrollSettings>): void => {
  const currentSettings = getPayrollSettings();
  const newSettings = { ...currentSettings, ...updates };
  savePayrollSettings(newSettings);
};

// Salary Detail Management
export interface SalaryDetail {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  baseSalary: number;
  allowances: number;
  deductions: number;
  bonuses: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  createdAt: string;
  updatedAt: string;
}

export const getSalaryDetails = (): SalaryDetail[] => {
  return getFromStorage('salaryDetails') || [];
};

export const saveSalaryDetails = (details: SalaryDetail[]): void => {
  setToStorage('salaryDetails', details);
};

export const addSalaryDetail = (detail: SalaryDetail): void => {
  const details = getSalaryDetails();
  const updatedDetails = [...details, detail];
  saveSalaryDetails(updatedDetails);
};

export const updateSalaryDetail = (updatedDetail: SalaryDetail): void => {
  const details = getSalaryDetails();
  const index = details.findIndex(d => d.id === updatedDetail.id);
  if (index !== -1) {
    details[index] = updatedDetail;
    saveSalaryDetails(details);
  }
};

export const deleteSalaryDetail = (id: string): void => {
  const details = getSalaryDetails();
  const updatedDetails = details.filter(d => d.id !== id);
  saveSalaryDetails(updatedDetails);
};

// Performance Management Storage
export interface PerformanceData {
  reviews: any[];
  goals: any[];
}

export interface SkillData {
  skills: any[];
  trainingRecords: any[];
  certifications: any[];
  skillGaps: any[];
  categories: any[];
}

export const getPerformanceData = (): PerformanceData => {
  const data = getFromStorage('performanceData');
  return data || {
    reviews: [],
    goals: []
  };
};

export const savePerformanceData = (data: PerformanceData): void => {
  setToStorage('performanceData', data);
};

export const addPerformanceReview = (review: any): void => {
  const data = getPerformanceData();
  const updatedData = { ...data, reviews: [...data.reviews, review] };
  savePerformanceData(updatedData);
};

export const updatePerformanceReview = (updatedReview: any): void => {
  const data = getPerformanceData();
  const index = data.reviews.findIndex((r: any) => r.id === updatedReview.id);
  if (index !== -1) {
    data.reviews[index] = updatedReview;
    savePerformanceData(data);
  }
};

export const deletePerformanceReview = (id: string): void => {
  const data = getPerformanceData();
  const updatedData = { ...data, reviews: data.reviews.filter((r: any) => r.id !== id) };
  savePerformanceData(updatedData);
};

export const addSmartGoal = (goal: any): void => {
  const data = getPerformanceData();
  const updatedData = { ...data, goals: [...data.goals, goal] };
  savePerformanceData(updatedData);
};

export const updateSmartGoal = (updatedGoal: any): void => {
  const data = getPerformanceData();
  const index = data.goals.findIndex((g: any) => g.id === updatedGoal.id);
  if (index !== -1) {
    data.goals[index] = updatedGoal;
    savePerformanceData(data);
  }
};

export const deleteSmartGoal = (id: string): void => {
  const data = getPerformanceData();
  const updatedData = { ...data, goals: data.goals.filter((g: any) => g.id !== id) };
  savePerformanceData(updatedData);
};

// Skills Management Storage
export const getSkillData = (): SkillData => {
  const data = getFromStorage('skillData');
  return data || {
    skills: [],
    trainingRecords: [],
    certifications: [],
    skillGaps: [],
    categories: []
  };
};

export const saveSkillData = (data: SkillData): void => {
  setToStorage('skillData', data);
};

export const addEnhancedSkill = (skill: any): void => {
  const data = getSkillData();
  const updatedData = { ...data, skills: [...data.skills, skill] };
  saveSkillData(updatedData);
};

export const updateEnhancedSkill = (updatedSkill: any): void => {
  const data = getSkillData();
  const index = data.skills.findIndex((s: any) => s.id === updatedSkill.id);
  if (index !== -1) {
    data.skills[index] = updatedSkill;
    saveSkillData(data);
  }
};

export const deleteEnhancedSkill = (id: string): void => {
  const data = getSkillData();
  const updatedData = { ...data, skills: data.skills.filter((s: any) => s.id !== id) };
  saveSkillData(updatedData);
};

export const addTrainingRecord = (training: any): void => {
  const data = getSkillData();
  const updatedData = { ...data, trainingRecords: [...data.trainingRecords, training] };
  saveSkillData(updatedData);
};

export const updateTrainingRecord = (updatedTraining: any): void => {
  const data = getSkillData();
  const index = data.trainingRecords.findIndex((t: any) => t.id === updatedTraining.id);
  if (index !== -1) {
    data.trainingRecords[index] = updatedTraining;
    saveSkillData(data);
  }
};

export const deleteTrainingRecord = (id: string): void => {
  const data = getSkillData();
  const updatedData = { ...data, trainingRecords: data.trainingRecords.filter((t: any) => t.id !== id) };
  saveSkillData(updatedData);
};

export const addCertification = (certification: any): void => {
  const data = getSkillData();
  const updatedData = { ...data, certifications: [...data.certifications, certification] };
  saveSkillData(updatedData);
};

export const updateCertification = (updatedCertification: any): void => {
  const data = getSkillData();
  const index = data.certifications.findIndex((c: any) => c.id === updatedCertification.id);
  if (index !== -1) {
    data.certifications[index] = updatedCertification;
    saveSkillData(data);
  }
};

export const deleteCertification = (id: string): void => {
  const data = getSkillData();
  const updatedData = { ...data, certifications: data.certifications.filter((c: any) => c.id !== id) };
  saveSkillData(updatedData);
};

export const addSkillGap = (gap: any): void => {
  const data = getSkillData();
  const updatedData = { ...data, skillGaps: [...data.skillGaps, gap] };
  saveSkillData(updatedData);
};

export const updateSkillGap = (updatedGap: any): void => {
  const data = getSkillData();
  const index = data.skillGaps.findIndex((g: any) => g.id === updatedGap.id);
  if (index !== -1) {
    data.skillGaps[index] = updatedGap;
    saveSkillData(data);
  }
};

export const deleteSkillGap = (id: string): void => {
  const data = getSkillData();
  const updatedData = { ...data, skillGaps: data.skillGaps.filter((g: any) => g.id !== id) };
  saveSkillData(updatedData);
};