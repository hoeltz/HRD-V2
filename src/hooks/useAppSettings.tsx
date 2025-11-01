import { useState, useEffect } from 'react';
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
      logoData: null
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