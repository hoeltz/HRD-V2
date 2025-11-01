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