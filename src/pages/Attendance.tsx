import React, { useState, useEffect, useCallback } from 'react';
import { getFromStorage, setToStorage } from '../utils/storage';
import { Attendance, Employee } from '../utils/types';

const AttendancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('daily-attendance');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [currentAttendance, setCurrentAttendance] = useState<Attendance | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const tabs = [
    { id: 'daily-attendance', name: 'Absensi Harian', icon: '📅' },
    { id: 'reports-analytics', name: 'Laporan & Analisis', icon: '📊' },
    { id: 'settings-config', name: 'Pengaturan', icon: '⚙️' },
    { id: 'leave-management', name: 'Cuti & Izin', icon: '📋' },
    { id: 'overtime-management', name: 'Lembur', icon: '⏰' },
  ];

  const loadData = () => {
    const employeesData = getFromStorage('employees') || [];
    const attendanceData = getFromStorage('attendance') || [];
    setEmployees(employeesData);
    setAttendance(attendanceData);
  };

  const checkCurrentAttendance = useCallback(() => {
    if (!selectedEmployee) return;

    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.find(
      att => att.employeeId === selectedEmployee && att.date === today
    );
    setCurrentAttendance(todayAttendance || null);
  }, [selectedEmployee, attendance]);

  const handleCheckIn = () => {
    if (!selectedEmployee) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);

    const newAttendance: Attendance = {
      id: Date.now().toString(),
      employeeId: selectedEmployee,
      date: today,
      checkIn: time,
      hoursWorked: 0,
      status: 'present',
    };

    const updatedAttendance = [...attendance, newAttendance];
    setAttendance(updatedAttendance);
    setToStorage('attendance', updatedAttendance);
    setCurrentAttendance(newAttendance);

    // Request notification permission and show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Check-in Berhasil', {
        body: `Selamat datang! Anda check-in pada ${time}`,
        icon: '/favicon.ico'
      });
    }
  };

  const handleCheckOut = () => {
    if (!currentAttendance) return;

    const now = new Date();
    const time = now.toTimeString().slice(0, 5);
    const checkInTime = new Date(`${currentAttendance.date}T${currentAttendance.checkIn}`);
    const checkOutTime = now;
    const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    const updatedAttendance = attendance.map(att =>
      att.id === currentAttendance.id
        ? { ...att, checkOut: time, hoursWorked: Math.round(hoursWorked * 100) / 100 }
        : att
    );

    setAttendance(updatedAttendance);
    setToStorage('attendance', updatedAttendance);
    setCurrentAttendance({ ...currentAttendance, checkOut: time, hoursWorked: Math.round(hoursWorked * 100) / 100 });

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Check-out Berhasil', {
        body: `Terima kasih! Anda bekerja selama ${Math.round(hoursWorked * 100) / 100} jam`,
        icon: '/favicon.ico'
      });
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    checkCurrentAttendance();
  }, [checkCurrentAttendance]);

  const getMonthlyAttendance = () => {
    const [year, month] = selectedMonth.split('-');
    return attendance.filter(att => {
      const attDate = new Date(att.date);
      return attDate.getFullYear() === parseInt(year) && attDate.getMonth() === parseInt(month) - 1;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const getMonthName = (month: string) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const [year, monthNum] = month.split('-');
    return `${months[parseInt(monthNum) - 1]} ${year}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🎯 Manajemen Absensi</h1>
        <p className="mt-1 text-sm text-gray-600">Kelola absensi karyawan dengan fitur lengkap</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'daily-attendance' && (
          <DailyAttendanceComponent
            employees={employees}
            attendance={attendance}
            selectedEmployee={selectedEmployee}
            setSelectedEmployee={setSelectedEmployee}
            currentAttendance={currentAttendance}
            handleCheckIn={handleCheckIn}
            handleCheckOut={handleCheckOut}
            requestNotificationPermission={requestNotificationPermission}
          />
        )}
        {activeTab === 'reports-analytics' && (
          <ReportsAnalyticsComponent
            employees={employees}
            attendance={attendance}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            formatCurrency={formatCurrency}
            getMonthName={getMonthName}
          />
        )}
        {activeTab === 'settings-config' && (
          <SettingsConfigComponent />
        )}
        {activeTab === 'leave-management' && (
          <LeaveManagementComponent
            employees={employees}
            formatCurrency={formatCurrency}
          />
        )}
        {activeTab === 'overtime-management' && (
          <OvertimeManagementComponent
            employees={employees}
            attendance={attendance}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
    </div>
  );
};

// Daily Attendance Component with Enhanced Features
const DailyAttendanceComponent = ({
  employees, attendance, selectedEmployee, setSelectedEmployee,
  currentAttendance, handleCheckIn, handleCheckOut, requestNotificationPermission
}: any) => {
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log('Location error:', error)
      );
    }
  }, []);

  const handleCameraCapture = () => {
    // Simulate camera capture for demo
    setSelectedPhoto('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📅 Absensi Harian</h2>
          <p className="mt-1 text-sm text-gray-600">Check-in/Check-out dengan fitur geolocation & camera</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowBulkForm(!showBulkForm)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 font-medium"
          >
            👥 Bulk Attendance
          </button>
          <button 
            onClick={requestNotificationPermission}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
          >
            🔔 Enable Notifications
          </button>
        </div>
      </div>

      {/* Geo-location Status */}
      {location && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-green-600 text-xl">📍</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Lokasi Terdetect</h3>
              <p className="text-sm text-green-600">Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Employee Selection */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">👤 Pilih Karyawan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Karyawan
            </label>
            <select
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">Pilih karyawan...</option>
              {employees.filter((emp: Employee) => emp.status === 'active').map((employee: Employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.position}
                </option>
              ))}
            </select>
          </div>
          {selectedEmployee && (
            <div className="flex items-center">
              {(() => {
                const emp = employees.find((e: Employee) => e.id === selectedEmployee);
                return emp?.photoUrl ? (
                  <img 
                    src={emp.photoUrl} 
                    alt={emp.name}
                    className="h-12 w-12 rounded-full object-cover border-2 border-gray-300"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {employees.find((e: Employee) => e.id === selectedEmployee)?.name?.charAt(0)}
                    </span>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Camera Check-in */}
      {selectedEmployee && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📸 Camera Verification</h3>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleCameraCapture}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              📷 Capture Photo
            </button>
            {selectedPhoto && (
              <img 
                src={selectedPhoto} 
                alt="Captured"
                className="h-16 w-16 rounded-lg object-cover border-2 border-gray-300"
              />
            )}
          </div>
        </div>
      )}

      {/* Check-in/Check-out Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">⏰ Check-in/Check-out</h3>
        <div className="flex space-x-4">
          {!currentAttendance ? (
            <button
              onClick={handleCheckIn}
              disabled={!selectedEmployee}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              ✅ Check-in Sekarang
            </button>
          ) : (
            <button
              onClick={handleCheckOut}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-medium"
            >
              🚪 Check-out Sekarang
            </button>
          )}
        </div>

        {currentAttendance && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">📋 Status Hari Ini</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Check-in:</span><br />
                <span className="text-blue-600">{currentAttendance.checkIn}</span>
              </div>
              {currentAttendance.checkOut && (
                <div>
                  <span className="font-medium">Check-out:</span><br />
                  <span className="text-red-600">{currentAttendance.checkOut}</span>
                </div>
              )}
              {currentAttendance.hoursWorked > 0 && (
                <div>
                  <span className="font-medium">Jam Kerja:</span><br />
                  <span className="text-green-600">{currentAttendance.hoursWorked} jam</span>
                </div>
              )}
              <div>
                <span className="font-medium">Status:</span><br />
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  currentAttendance.status === 'present'
                    ? 'bg-green-100 text-green-800'
                    : currentAttendance.status === 'late'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {currentAttendance.status === 'present' ? 'Hadir' : 
                   currentAttendance.status === 'late' ? 'Terlambat' : 'Tidak Hadir'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Attendance Form */}
      {showBulkForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">👥 Bulk Attendance Entry</h3>
          <p className="text-sm text-gray-600 mb-4">Input absensi untuk multiple karyawan sekaligus</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">⚠️ Fitur Bulk Attendance sedang dalam pengembangan. Coming Soon!</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Reports & Analytics Component
const ReportsAnalyticsComponent = ({
  employees, attendance, selectedMonth, setSelectedMonth,
  formatCurrency, getMonthName
}: any) => {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const getFilteredAttendance = () => {
    return attendance.filter((att: Attendance) => {
      const attDate = new Date(att.date);
      return attDate >= new Date(dateRange.start) && attDate <= new Date(dateRange.end);
    });
  };

  const getAttendanceStats = () => {
    const filtered = getFilteredAttendance();
    const total = filtered.length;
    const present = filtered.filter((att: Attendance) => att.status === 'present').length;
    const late = filtered.filter((att: Attendance) => att.status === 'late').length;
    const absent = filtered.filter((att: Attendance) => att.status === 'absent').length;
    
    return {
      total,
      present,
      late,
      absent,
      attendanceRate: total > 0 ? ((present + late) / total * 100).toFixed(1) : '0.0'
    };
  };

  const stats = getAttendanceStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📊 Laporan & Analisis</h2>
          <p className="mt-1 text-sm text-gray-600">Dashboard lengkap absensi dengan charts dan export</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
            📄 Export PDF
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            📊 Export Excel
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">📅 Filter Rentang Tanggal</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dari</label>
            <input
              type="date"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sampai</label>
            <input
              type="date"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => setDateRange({
                start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0]
              })}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-green-600 text-2xl">✅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Hadir</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.present}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-yellow-600 text-2xl">⏰</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Telat</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.late}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-red-600 text-2xl">❌</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Tidak Hadir</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.absent}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-blue-600 text-2xl">📈</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Attendance Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.attendanceRate}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Attendance Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">📋 Detail Absensi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Karyawan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jam Kerja
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredAttendance().map((att: Attendance) => {
                const employee = employees.find((emp: Employee) => emp.id === att.employeeId);
                return (
                  <tr key={att.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(att.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {att.checkIn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {att.checkOut || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {att.hoursWorked > 0 ? `${att.hoursWorked} jam` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        att.status === 'present'
                          ? 'bg-green-100 text-green-800'
                          : att.status === 'late'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {att.status === 'present' ? 'Hadir' : att.status === 'late' ? 'Terlambat' : 'Tidak Hadir'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {getFilteredAttendance().length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Tidak ada data absensi untuk rentang tanggal ini</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Settings Config Component
const SettingsConfigComponent = () => {
  const [settings, setSettings] = useState({
    workingHours: 8,
    lateTolerance: 15,
    breakTime: 60,
    overtimeMultiplier: 1.5,
    geoFence: {
      enabled: true,
      radius: 100,
      center: { lat: -6.2088, lng: 106.8456 } // Jakarta
    },
    notifications: {
      checkInReminder: true,
      checkOutReminder: true,
      lateAlert: true
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">⚙️ Pengaturan & Konfigurasi</h2>
        <p className="mt-1 text-sm text-gray-600">Konfigurasi sistem absensi</p>
      </div>

      {/* Working Hours */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">⏰ Jam Kerja</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jam Kerja per Hari</label>
            <input
              type="number"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={settings.workingHours}
              onChange={(e) => setSettings({...settings, workingHours: Number(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Toleransi Keterlambatan (menit)</label>
            <input
              type="number"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={settings.lateTolerance}
              onChange={(e) => setSettings({...settings, lateTolerance: Number(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Break Time (menit)</label>
            <input
              type="number"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={settings.breakTime}
              onChange={(e) => setSettings({...settings, breakTime: Number(e.target.value)})}
            />
          </div>
        </div>
      </div>

      {/* Geo-fence Settings */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">📍 Geo-fence Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="geoFence"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={settings.geoFence.enabled}
              onChange={(e) => setSettings({
                ...settings, 
                geoFence: {...settings.geoFence, enabled: e.target.checked}
              })}
            />
            <label htmlFor="geoFence" className="ml-2 block text-sm text-gray-900">
              Aktifkan Geo-fence validation
            </label>
          </div>
          {settings.geoFence.enabled && (
            <div className="ml-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Radius (meter)</label>
                <input
                  type="number"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={settings.geoFence.radius}
                  onChange={(e) => setSettings({
                    ...settings, 
                    geoFence: {...settings.geoFence, radius: Number(e.target.value)}
                  })}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          💾 Simpan Pengaturan
        </button>
      </div>
    </div>
  );
};

// Leave Management Component
const LeaveManagementComponent = ({ employees, formatCurrency }: any) => {
  const [leaveTypes] = useState([
    { id: 'annual', name: 'Cuti Tahunan', days: 12, color: 'blue' },
    { id: 'sick', name: 'Cuti Sakit', days: 0, color: 'red' },
    { id: 'emergency', name: 'Cuti Darurat', days: 0, color: 'yellow' },
    { id: 'maternity', name: 'Cuti Melahirkan', days: 90, color: 'pink' },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">📋 Manajemen Cuti & Izin</h2>
        <p className="mt-1 text-sm text-gray-600">Kelola cuti dan izin karyawan</p>
      </div>

      {/* Leave Types */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">📅 Tipe Cuti</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {leaveTypes.map((type) => (
              <div key={type.id} className={`border-l-4 border-${type.color}-500 bg-${type.color}-50 p-4 rounded-lg`}>
                <h4 className="font-medium text-gray-900">{type.name}</h4>
                <p className="text-sm text-gray-600">
                  {type.days > 0 ? `${type.days} hari/tahun` : 'Unlimited'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">🚧 Fitur Coming Soon</h3>
        <p className="text-yellow-700">
          Fitur manajemen cuti lengkap sedang dalam pengembangan. Akan includes:
        </p>
        <ul className="mt-2 text-yellow-700 list-disc list-inside">
          <li>Leave request form dengan approval workflow</li>
          <li>Leave balance tracking real-time</li>
          <li>Multi-level approval process</li>
          <li>Leave calendar & planning</li>
        </ul>
      </div>
    </div>
  );
};

// Overtime Management Component
const OvertimeManagementComponent = ({ employees, attendance, formatCurrency }: any) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">⏰ Manajemen Lembur</h2>
        <p className="mt-1 text-sm text-gray-600">Kelola jam lembur karyawan</p>
      </div>

      {/* Coming Soon */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">🚧 Fitur Coming Soon</h3>
        <p className="text-yellow-700">
          Fitur manajemen lembur lengkap sedang dalam pengembangan. Akan includes:
        </p>
        <ul className="mt-2 text-yellow-700 list-disc list-inside">
          <li>Overtime request dengan lokasi & alasan</li>
          <li>Multi-step approval workflow</li>
          <li>Auto-calculation jam lembur</li>
          <li>Batch approval untuk multiple karyawan</li>
          <li>Overtime reports untuk payroll</li>
        </ul>
      </div>
    </div>
  );
};

export default AttendancePage;