import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAppContext } from '../contexts/AppContext';
import { getFromStorage, setToStorage } from '../utils/storage';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { settings, updateSettings } = useAppContext();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [appName, setAppName] = useState(settings?.appName || 'My Office HRD');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Salary slip label customization
  const [salaryLabels, setSalaryLabels] = useState(settings?.salarySlipLabels || {
    headerTitle: 'SLIP GAJI',
    companyName: 'My Office HRD',
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
      period: 'Periode'
    }
  });

  // Company identity settings
  const [companyIdentity, setCompanyIdentity] = useState(settings?.companyIdentity || {
    name: 'My Office HRD',
    address: '',
    phone: '',
    email: '',
    website: '',
    taxId: '',
    registrationNumber: '',
    description: '',
    foundedYear: ''
  });

  useEffect(() => {
    // Load notification settings
    const appSettings = getFromStorage('settings') || {};
    setNotificationsEnabled(appSettings.notificationsEnabled || false);

    // Load profile data (mock data for demo)
    if (user) {
      setProfileData({
        name: user.username,
        email: `${user.username}@company.com`,
        phone: '+62-812-3456-7890',
      });
    }
    
    // Initialize salary labels from settings
    if (settings?.salarySlipLabels) {
      setSalaryLabels(settings.salarySlipLabels);
    }

    // Initialize company identity from settings
    if (settings?.companyIdentity) {
      setCompanyIdentity(settings.companyIdentity);
    }
  }, [user, settings]);

  const handleAppNameChange = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ appName });
    alert('Nama aplikasi berhasil diperbarui!');
  };

  const handleSalaryLabelsChange = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ salarySlipLabels: salaryLabels });
    alert('Label slip gaji berhasil diperbarui!');
  };

  const handleCompanyIdentityChange = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ companyIdentity });
    alert('Identitas perusahaan berhasil diperbarui!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|png)$/)) {
        alert('Hanya file JPEG dan PNG yang diizinkan!');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file maksimal 2MB!');
        return;
      }

      // Load and validate image
      const img = new Image();
      img.onload = () => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          updateSettings({ logoData: result });
          alert('Logo berhasil diperbarui!');
        };
        reader.readAsDataURL(file);
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const handleRemoveLogo = () => {
    updateSettings({ logoData: null });
    alert('Logo berhasil dihapus!');
  };

  const handleNotificationToggle = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);

    const settings = getFromStorage('settings') || {};
    settings.notificationsEnabled = newValue;
    setToStorage('settings', settings);

    if (newValue && 'Notification' in window) {
      Notification.requestPermission();
    }
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would update the user profile
    alert('Profil berhasil diperbarui!');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Password baru tidak cocok!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password harus minimal 6 karakter!');
      return;
    }

    // In a real app, this would update the password
    alert('Password berhasil diubah!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleExportData = () => {
    const data = {
      employees: getFromStorage('employees') || [],
      attendance: getFromStorage('attendance') || [],
      salaries: getFromStorage('salaries') || [],
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-office-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.')) {
      localStorage.clear();
      alert('Semua data telah dihapus. Aplikasi akan dimuat ulang.');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">⚙️ Pengaturan</h1>
        <p className="mt-1 text-sm text-gray-600">Kelola profil, branding, dan pengaturan aplikasi</p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <span className="text-2xl">🎨</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-blue-900">Branding Aplikasi</h3>
              <p className="text-sm text-blue-700">Upload logo dan ubah nama aplikasi</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <span className="text-2xl">🏢</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-green-900">Identitas Perusahaan</h3>
              <p className="text-sm text-green-700">Atur informasi dan branding perusahaan</p>
            </div>
          </div>
        </div>
      </div>

      {/* App Branding Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Branding Aplikasi</h2>
        </div>
        <div className="p-6 space-y-6">
          {/* App Name */}
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-4">Nama Aplikasi</h3>
            <form onSubmit={handleAppNameChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Aplikasi (tampil di sidebar dan judul)
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Masukkan nama aplikasi"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Simpan Nama
                </button>
              </div>
            </form>
          </div>

          {/* Logo Upload */}
          <div className="border-t pt-6">
            <h3 className="text-md font-medium text-gray-800 mb-4">Logo Aplikasi</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0">
                  {settings.logoData ? (
                    <img
                      src={settings.logoData}
                      alt="Current Logo"
                      className="h-16 w-16 rounded-lg object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-sm">No Logo</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block">
                    <span className="sr-only">Pilih Logo</span>
                    <input
                      type="file"
                      accept=".jpeg,.jpg,.png"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      onChange={handleLogoUpload}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Format: JPEG, PNG. Ukuran maksimal 2MB. Mendukung berbagai aspek rasio.
                  </p>
                </div>
              </div>
              
              {settings.logoData && (
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Hapus Logo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Company Identity Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">🏢 Identitas Perusahaan</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleCompanyIdentityChange} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-4">Informasi Dasar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Perusahaan</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={companyIdentity.name}
                    onChange={(e) => setCompanyIdentity({
                      ...companyIdentity,
                      name: e.target.value
                    })}
                    placeholder="Nama perusahaan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tahun Berdiri</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={companyIdentity.foundedYear}
                    onChange={(e) => setCompanyIdentity({
                      ...companyIdentity,
                      foundedYear: e.target.value
                    })}
                    placeholder="2020"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t pt-6">
              <h3 className="text-md font-medium text-gray-800 mb-4">Informasi Kontak</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                  <textarea
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    rows={3}
                    value={companyIdentity.address}
                    onChange={(e) => setCompanyIdentity({
                      ...companyIdentity,
                      address: e.target.value
                    })}
                    placeholder="Alamat lengkap perusahaan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
                  <input
                    type="tel"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={companyIdentity.phone}
                    onChange={(e) => setCompanyIdentity({
                      ...companyIdentity,
                      phone: e.target.value
                    })}
                    placeholder="+62-21-xxxx-xxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={companyIdentity.email}
                    onChange={(e) => setCompanyIdentity({
                      ...companyIdentity,
                      email: e.target.value
                    })}
                    placeholder="info@perusahaan.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={companyIdentity.website}
                    onChange={(e) => setCompanyIdentity({
                      ...companyIdentity,
                      website: e.target.value
                    })}
                    placeholder="https://www.perusahaan.com"
                  />
                </div>
              </div>
            </div>

            {/* Legal Information */}
            <div className="border-t pt-6">
              <h3 className="text-md font-medium text-gray-800 mb-4">Informasi Legal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NPWP</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={companyIdentity.taxId}
                    onChange={(e) => setCompanyIdentity({
                      ...companyIdentity,
                      taxId: e.target.value
                    })}
                    placeholder="01.234.567.8-901.000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Registrasi</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={companyIdentity.registrationNumber}
                    onChange={(e) => setCompanyIdentity({
                      ...companyIdentity,
                      registrationNumber: e.target.value
                    })}
                    placeholder="AHU-xxxx-xx-xxxx"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-t pt-6">
              <h3 className="text-md font-medium text-gray-800 mb-4">Deskripsi Perusahaan</h3>
              <div>
                <textarea
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  rows={4}
                  value={companyIdentity.description}
                  onChange={(e) => setCompanyIdentity({
                    ...companyIdentity,
                    description: e.target.value
                  })}
                  placeholder="Deskripsi singkat tentang perusahaan"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Simpan Identitas Perusahaan
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Salary Slip Label Customization */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Customization Label Slip Gaji</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSalaryLabelsChange} className="space-y-6">
            {/* Header Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Header Slip
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={salaryLabels.headerTitle}
                  onChange={(e) => setSalaryLabels({
                    ...salaryLabels,
                    headerTitle: e.target.value
                  })}
                  placeholder="SLIP GAJI"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Perusahaan
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={salaryLabels.companyName}
                  onChange={(e) => setSalaryLabels({
                    ...salaryLabels,
                    companyName: e.target.value
                  })}
                  placeholder="My Office HRD"
                />
              </div>
            </div>

            {/* Footer Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teks Footer Slip
              </label>
              <input
                type="text"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={salaryLabels.footerText}
                onChange={(e) => setSalaryLabels({
                  ...salaryLabels,
                  footerText: e.target.value
                })}
                placeholder="Terima kasih atas dedikasi Anda"
              />
            </div>

            {/* Field Names Customization */}
            <div className="border-t pt-6">
              <h3 className="text-md font-medium text-gray-800 mb-4">Customization Nama Field</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Karyawan</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={salaryLabels.fieldNames.employeeName}
                    onChange={(e) => setSalaryLabels({
                      ...salaryLabels,
                      fieldNames: {
                        ...salaryLabels.fieldNames,
                        employeeName: e.target.value
                      }
                    })}
                    placeholder="Nama Karyawan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID Karyawan</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={salaryLabels.fieldNames.employeeId}
                    onChange={(e) => setSalaryLabels({
                      ...salaryLabels,
                      fieldNames: {
                        ...salaryLabels.fieldNames,
                        employeeId: e.target.value
                      }
                    })}
                    placeholder="ID Karyawan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Posisi</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={salaryLabels.fieldNames.position}
                    onChange={(e) => setSalaryLabels({
                      ...salaryLabels,
                      fieldNames: {
                        ...salaryLabels.fieldNames,
                        position: e.target.value
                      }
                    })}
                    placeholder="Posisi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Departemen</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={salaryLabels.fieldNames.department}
                    onChange={(e) => setSalaryLabels({
                      ...salaryLabels,
                      fieldNames: {
                        ...salaryLabels.fieldNames,
                        department: e.target.value
                      }
                    })}
                    placeholder="Departemen"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gaji Pokok</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={salaryLabels.fieldNames.baseSalary}
                    onChange={(e) => setSalaryLabels({
                      ...salaryLabels,
                      fieldNames: {
                        ...salaryLabels.fieldNames,
                        baseSalary: e.target.value
                      }
                    })}
                    placeholder="Gaji Pokok"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tunjangan</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={salaryLabels.fieldNames.allowances}
                    onChange={(e) => setSalaryLabels({
                      ...salaryLabels,
                      fieldNames: {
                        ...salaryLabels.fieldNames,
                        allowances: e.target.value
                      }
                    })}
                    placeholder="Tunjangan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Potongan</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={salaryLabels.fieldNames.deductions}
                    onChange={(e) => setSalaryLabels({
                      ...salaryLabels,
                      fieldNames: {
                        ...salaryLabels.fieldNames,
                        deductions: e.target.value
                      }
                    })}
                    placeholder="Potongan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gaji Bruto</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={salaryLabels.fieldNames.grossSalary}
                    onChange={(e) => setSalaryLabels({
                      ...salaryLabels,
                      fieldNames: {
                        ...salaryLabels.fieldNames,
                        grossSalary: e.target.value
                      }
                    })}
                    placeholder="Gaji Bruto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gaji Bersih</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={salaryLabels.fieldNames.netSalary}
                    onChange={(e) => setSalaryLabels({
                      ...salaryLabels,
                      fieldNames: {
                        ...salaryLabels.fieldNames,
                        netSalary: e.target.value
                      }
                    })}
                    placeholder="Gaji Bersih"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Periode</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={salaryLabels.fieldNames.period}
                    onChange={(e) => setSalaryLabels({
                      ...salaryLabels,
                      fieldNames: {
                        ...salaryLabels.fieldNames,
                        period: e.target.value
                      }
                    })}
                    placeholder="Periode"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Simpan Label
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Profil Pengguna</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama</label>
                <input
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telepon</label>
                <input
                  type="tel"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Update Profil
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Ubah Password</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Password Saat Ini</label>
              <input
                type="password"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Password Baru</label>
                <input
                  type="password"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Ubah Password
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Pengaturan Notifikasi</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Notifikasi Browser</h3>
              <p className="text-sm text-gray-500">Terima notifikasi untuk check-in/check-out dan pengingat</p>
            </div>
            <button
              onClick={handleNotificationToggle}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                notificationsEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Manajemen Data</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Ekspor Data</h3>
            <p className="text-sm text-gray-500 mb-3">Unduh semua data aplikasi dalam format JSON</p>
            <button
              onClick={handleExportData}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Export Data
            </button>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Reset Data</h3>
            <p className="text-sm text-gray-500 mb-3">Hapus semua data aplikasi (tidak dapat dibatalkan)</p>
            <button
              onClick={handleClearData}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Hapus Semua Data
            </button>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Tentang Aplikasi</h2>
        </div>
        <div className="p-6">
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>My-Office HRD</strong> v1.0.0</p>
            <p>Aplikasi manajemen sumber daya manusia untuk perusahaan kecil hingga menengah</p>
            <p>Dibuat dengan React, TypeScript, dan Tailwind CSS</p>
            <p>Data disimpan secara lokal menggunakan localStorage</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;