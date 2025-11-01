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
}

export const getAppSettings = (): AppSettings => {
  const settings = getFromStorage('appSettings');
  return settings || {
    appName: 'My Office',
    logoData: null
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