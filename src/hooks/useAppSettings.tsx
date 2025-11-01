import { useState } from 'react';
import { getAppSettings, AppSettings, updateAppSettings } from '../utils/storage';

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());

  const updateSettings = (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    updateAppSettings(updates);
  };

  const resetSettings = () => {
    const defaultSettings = {
      appName: 'My Office',
      logoData: null,
      salarySlipLabels: {
        headerTitle: 'SLIP GAJI',
        companyName: 'My Office',
        footerText: 'Terima kasih atas dedikasi Anda',
        fieldNames: {
          employeeName: 'Nama Karyawan',
          employeeId: 'ID Karyawan',
          position: 'Posisi',
          department: 'Departemen',
          baseSalary: 'Gaji Pokok',
          allowances: 'Tunjangan',
          deductions: 'Potongan',
          grossSalary: 'Gaji Bruto',
          netSalary: 'Gaji Bersih',
          period: 'Periode',
        },
      }
    };
    setSettings(defaultSettings);
    updateAppSettings(defaultSettings);
  };

  return {
    settings,
    updateSettings,
    resetSettings
  };
};