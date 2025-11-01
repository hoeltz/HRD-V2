import React, { useState, useEffect, useCallback } from 'react';
import { getFromStorage, setToStorage } from '../utils/storage';
import { Attendance, Employee, Leave, Permission, AttendanceRecord } from '../utils/types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AttendancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('daily-attendance');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const tabs = [
    { id: 'daily-attendance', name: 'Absensi Harian', icon: '📅' },
    { id: 'detailed-reports', name: 'Detail Laporan', icon: '📊' },
    { id: 'attendance-charts', name: 'Grafik Tracking', icon: '📈' },
    { id: 'leave-permission', name: 'Cuti & Izin', icon: '📋' },
    { id: 'settings-config', name: 'Pengaturan', icon: '⚙️' },
  ];

  const loadData = () => {
    const employeesData = getFromStorage('employees') || [];
    const attendanceData = getFromStorage('attendance') || [];
    const leavesData = getFromStorage('leaves') || [];
    const permissionsData = getFromStorage('permissions') || [];
    setEmployees(employeesData);
    setAttendance(attendanceData);
    setLeaves(leavesData);
    setPermissions(permissionsData);
  };

  const checkCurrentAttendance = useCallback(() => {
    if (!selectedEmployee) return;

    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.find(
      att => att.employeeId === selectedEmployee && att.date === today
    );
    return todayAttendance || null;
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

    // Request notification permission and show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Check-in Berhasil', {
        body: `Selamat datang! Anda check-in pada ${time}`,
        icon: '/favicon.ico'
      });
    }
  };

  const handleCheckOut = () => {
    const currentAttendance = checkCurrentAttendance();
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  // Combined attendance records for comprehensive reporting
  const getCombinedAttendanceRecords = useCallback((startDate: string, endDate: string): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    
    // Add attendance records
    attendance
      .filter(att => att.date >= startDate && att.date <= endDate)
      .forEach(att => {
        records.push({
          id: att.id,
          employeeId: att.employeeId,
          date: att.date,
          type: 'attendance',
          checkIn: att.checkIn,
          checkOut: att.checkOut,
          hoursWorked: att.hoursWorked,
          status: att.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });

    // Add leave records
    leaves
      .filter(leave => leave.startDate >= startDate && leave.startDate <= endDate)
      .forEach(leave => {
        const daysInRange = Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        for (let i = 0; i < daysInRange; i++) {
          const currentDate = new Date(new Date(leave.startDate).getTime() + (i * 24 * 60 * 60 * 1000));
          const dateStr = currentDate.toISOString().split('T')[0];
          
          if (dateStr >= startDate && dateStr <= endDate) {
            records.push({
              id: `${leave.id}-${dateStr}`,
              employeeId: leave.employeeId,
              date: dateStr,
              type: 'leave',
              leaveId: leave.id,
              leaveType: leave.type,
              leaveStatus: leave.status,
              reason: leave.reason,
              approvedBy: leave.approvedBy,
              createdAt: leave.createdAt || new Date().toISOString(),
              updatedAt: leave.updatedAt || new Date().toISOString()
            });
          }
        }
      });

    // Add permission records
    permissions
      .filter(perm => perm.date >= startDate && perm.date <= endDate)
      .forEach(perm => {
        records.push({
          id: perm.id,
          employeeId: perm.employeeId,
          date: perm.date,
          type: 'permission',
          permissionId: perm.id,
          permissionType: perm.type,
          permissionStatus: perm.status,
          permissionStartTime: perm.startTime,
          permissionEndTime: perm.endTime,
          reason: perm.reason,
          approvedBy: perm.approvedBy,
          createdAt: perm.createdAt || new Date().toISOString(),
          updatedAt: perm.updatedAt || new Date().toISOString()
        });
      });

    // Sort by date and employee
    return records.sort((a, b) => {
      if (a.date === b.date) {
        return a.employeeId.localeCompare(b.employeeId);
      }
      return a.date.localeCompare(b.date);
    });
  }, [attendance, leaves, permissions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🎯 Manajemen Absensi</h1>
        <p className="mt-1 text-sm text-gray-600">Sistem absensi comprehensive dengan tracking, laporan, dan approval</p>
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
            checkCurrentAttendance={checkCurrentAttendance}
            handleCheckIn={handleCheckIn}
            handleCheckOut={handleCheckOut}
            requestNotificationPermission={requestNotificationPermission}
          />
        )}
        {activeTab === 'detailed-reports' && (
          <DetailedReportsComponent
            employees={employees}
            attendance={attendance}
            leaves={leaves}
            permissions={permissions}
            getCombinedAttendanceRecords={getCombinedAttendanceRecords}
            formatCurrency={formatCurrency}
          />
        )}
        {activeTab === 'attendance-charts' && (
          <AttendanceChartsComponent
            employees={employees}
            attendance={attendance}
            leaves={leaves}
            permissions={permissions}
            getCombinedAttendanceRecords={getCombinedAttendanceRecords}
          />
        )}
        {activeTab === 'leave-permission' && (
          <LeavePermissionComponent
            employees={employees}
            leaves={leaves}
            permissions={permissions}
            setLeaves={setLeaves}
            setPermissions={setPermissions}
            formatCurrency={formatCurrency}
          />
        )}
        {activeTab === 'settings-config' && (
          <SettingsConfigComponent />
        )}
      </div>
    </div>
  );
};

// Daily Attendance Component with Enhanced Features
const DailyAttendanceComponent = ({
  employees, attendance, selectedEmployee, setSelectedEmployee,
  checkCurrentAttendance, handleCheckIn, handleCheckOut, requestNotificationPermission
}: any) => {
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

  const currentAttendance = checkCurrentAttendance();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📅 Absensi Harian</h2>
          <p className="mt-1 text-sm text-gray-600">Check-in/Check-out dengan verifikasi geo-location & camera</p>
        </div>
        <div className="flex space-x-3">
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
    </div>
  );
};

// Detailed Reports Component with Comprehensive Tables
const DetailedReportsComponent = ({
  employees, attendance, leaves, permissions, getCombinedAttendanceRecords,
  formatCurrency
}: any) => {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const getDateRange = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    switch (selectedPeriod) {
      case 'today':
        return { start: today, end: today };
      case 'last-7-days':
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return { start: lastWeek, end: today };
      case 'current-month':
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        return { start: firstDayOfMonth, end: today };
      case 'last-month':
        const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
        const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
        return { start: firstDayOfLastMonth, end: lastDayOfLastMonth };
      default:
        return { start: today, end: today };
    }
  };

  const dateRange = getDateRange();
  const records = getCombinedAttendanceRecords(dateRange.start, dateRange.end);

  const getStatusIcon = (record: AttendanceRecord) => {
    switch (record.type) {
      case 'attendance':
        if (record.status === 'present') return '✅';
        if (record.status === 'late') return '⏰';
        return '❌';
      case 'leave':
        return '🏖️';
      case 'permission':
        return '📋';
      default:
        return '❓';
    }
  };

  const getStatusColor = (record: AttendanceRecord) => {
    switch (record.type) {
      case 'attendance':
        if (record.status === 'present') return 'bg-green-100 text-green-800';
        if (record.status === 'late') return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
      case 'leave':
        return record.leaveStatus === 'approved' ? 'bg-blue-100 text-blue-800' : 
               record.leaveStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
      case 'permission':
        return record.permissionStatus === 'approved' ? 'bg-purple-100 text-purple-800' : 
               record.permissionStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (record: AttendanceRecord) => {
    switch (record.type) {
      case 'attendance':
        return record.status === 'present' ? 'Hadir' : 
               record.status === 'late' ? 'Terlambat' : 'Tidak Hadir';
      case 'leave':
        const leaveTypes = {
          'annual': 'Cuti Tahunan',
          'sick': 'Cuti Sakit',
          'personal': 'Cuti Personal',
          'maternity': 'Cuti Melahirkan',
          'paternity': 'Cuti Ayah',
          'emergency': 'Cuti Darurat'
        };
        return `${leaveTypes[record.leaveType as keyof typeof leaveTypes] || 'Cuti'} (${record.leaveStatus})`;
      case 'permission':
        const permissionTypes = {
          'urgent': 'Ijin Mendesak',
          'appointment': 'Ijin Janji',
          'personal': 'Ijin Pribadi',
          'family': 'Ijin Keluarga',
          'health': 'Ijin Kesehatan'
        };
        return `${permissionTypes[record.permissionType as keyof typeof permissionTypes] || 'Ijin'} (${record.permissionStatus})`;
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📊 Detail Laporan</h2>
          <p className="mt-1 text-sm text-gray-600">Comprehensive tracking absensi, cuti, dan ijin</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="today">Hari Ini</option>
            <option value="last-7-days">7 Hari Terakhir</option>
            <option value="current-month">Bulan Ini</option>
            <option value="last-month">Bulan Lalu</option>
          </select>
        </div>
      </div>

      {/* Employee Filter */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter Karyawan:</label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Semua Karyawan</option>
            {employees.filter((emp: Employee) => emp.status === 'active').map((employee: Employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name} - {employee.position}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Combined Records Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            📋 Detail Absensi, Cuti & Izin 
            <span className="text-sm text-gray-500 ml-2">
              ({dateRange.start} s/d {dateRange.end})
            </span>
          </h3>
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in/Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jam Kerja
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alasan/Keterangan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approved By
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records
                .filter((record: AttendanceRecord) => !selectedEmployee || record.employeeId === selectedEmployee)
                .map((record: AttendanceRecord) => {
                  const employee = employees.find((emp: Employee) => emp.id === record.employeeId);
                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employee?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record)}`}>
                          <span className="mr-1">{getStatusIcon(record)}</span>
                          {getStatusText(record)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.checkIn && record.checkOut ? 
                          `${record.checkIn} - ${record.checkOut}` : 
                          record.checkIn ? record.checkIn :
                          record.permissionStartTime && record.permissionEndTime ?
                          `${record.permissionStartTime} - ${record.permissionEndTime}` : '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.hoursWorked ? `${record.hoursWorked} jam` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <div className="truncate" title={record.reason}>
                          {record.reason || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.approvedBy || '-'}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {records.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Tidak ada data untuk periode yang dipilih</p>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
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
                  <dd className="text-lg font-medium text-gray-900">
                    {records.filter((r: AttendanceRecord) => r.type === 'attendance' && r.status === 'present').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-blue-600 text-2xl">🏖️</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Cuti</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {records.filter((r: AttendanceRecord) => r.type === 'leave').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-purple-600 text-2xl">📋</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Izin</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {records.filter((r: AttendanceRecord) => r.type === 'permission').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-orange-600 text-2xl">📊</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Attendance Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {(() => {
                      const totalDays = records.length;
                      const presentDays = records.filter((r: AttendanceRecord) => r.type === 'attendance' && r.status === 'present').length;
                      return totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '0.0';
                    })()}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Attendance Charts Component with Line Charts
const AttendanceChartsComponent = ({
  employees, attendance, leaves, permissions, getCombinedAttendanceRecords
}: any) => {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  const getDateRange = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    switch (selectedPeriod) {
      case 'last-7-days':
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return { start: weekStart, end: today };
      case 'last-30-days':
        const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return { start: monthStart, end: today };
      case 'current-month':
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        return { start: firstDayOfMonth, end: today };
      default:
        const defaultStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return { start: defaultStart, end: today };
    }
  };

  const dateRange = getDateRange();
  const records = getCombinedAttendanceRecords(dateRange.start, dateRange.end);

  const getChartData = () => {
    const dates = [];
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }

    const labels = dates.map(date => 
      date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })
    );

    const totalEmployees = employees.filter((emp: Employee) => emp.status === 'active').length;
    const presentData = dates.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      return records.filter((r: AttendanceRecord) => 
        r.date === dateStr && r.type === 'attendance' && r.status === 'present'
      ).length;
    });

    const absentData = dates.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      return totalEmployees - records.filter((r: AttendanceRecord) => 
        r.date === dateStr && (r.type === 'attendance' || r.type === 'leave' || r.type === 'permission')
      ).length;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Total Karyawan',
          data: dates.map(() => totalEmployees),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
        },
        {
          label: 'Absensi Hadir',
          data: presentData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
        },
        {
          label: 'Tidak Hadir',
          data: absentData,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
        }
      ]
    };
  };

  const chartData = getChartData();

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '📈 Komparasi Absensi Harian',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Jumlah Karyawan'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Tanggal'
        }
      }
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
      },
      line: {
        tension: 0.4
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📈 Grafik Tracking</h2>
          <p className="mt-1 text-sm text-gray-600">Visualisasi data absensi dengan chart interaktif</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="last-7-days">7 Hari Terakhir</option>
            <option value="last-30-days">30 Hari Terakhir</option>
            <option value="current-month">Bulan Ini</option>
          </select>
        </div>
      </div>

      {/* Chart Display */}
      <div className="bg-white shadow rounded-lg p-6">
        <div style={{ height: '400px' }}>
          {chartData.labels.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Tidak ada data untuk periode yang dipilih</p>
            </div>
          )}
        </div>
      </div>

      {/* Chart Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📊 Insights</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Rata-rata Hadir/Hari:</span>
              <span className="text-sm font-medium">
                {(() => {
                  const totalPresent = records.filter((r: AttendanceRecord) => r.type === 'attendance' && r.status === 'present').length;
                  const totalDays = Math.ceil((new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  return totalDays > 0 ? (totalPresent / totalDays).toFixed(1) : '0';
                })()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Attendance Rate:</span>
              <span className="text-sm font-medium text-green-600">
                {(() => {
                  const totalAttendance = records.filter((r: AttendanceRecord) => r.type === 'attendance').length;
                  const presentCount = records.filter((r: AttendanceRecord) => r.type === 'attendance' && r.status === 'present').length;
                  return totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(1) : '0.0';
                })()}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Hari dengan Tingkat Hadir Tertinggi:</span>
              <span className="text-sm font-medium">
                {(() => {
                  const attendanceByDay = records.reduce((acc: Record<string, number>, r: AttendanceRecord) => {
                    if (r.type === 'attendance' && r.status === 'present') {
                      acc[r.date] = (acc[r.date] || 0) + 1;
                    }
                    return acc;
                  }, {});
                  
                  const maxDay = Object.keys(attendanceByDay).reduce((a, b) => 
                    attendanceByDay[a] > attendanceByDay[b] ? a : b, 'N/A'
                  );
                  
                  return maxDay !== 'N/A' ? new Date(maxDay).toLocaleDateString('id-ID') : 'N/A';
                })()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🎯 Trend Analysis</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Trend Attendance:</span>
              <span className="text-sm font-medium text-green-600">
                📈 Stabil
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Records:</span>
              <span className="text-sm font-medium">{records.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Coverage:</span>
              <span className="text-sm font-medium">
                {Math.ceil((new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) / (1000 * 60 * 60 * 24)) + 1} hari
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">⚡ Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Cuti Approved:</span>
              <span className="text-sm font-medium text-blue-600">
                {records.filter((r: AttendanceRecord) => r.type === 'leave' && r.leaveStatus === 'approved').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Izin Approved:</span>
              <span className="text-sm font-medium text-purple-600">
                {records.filter((r: AttendanceRecord) => r.type === 'permission' && r.permissionStatus === 'approved').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pending Approval:</span>
              <span className="text-sm font-medium text-yellow-600">
                {records.filter((r: AttendanceRecord) => (r.leaveStatus === 'pending' || r.permissionStatus === 'pending')).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Leave & Permission Component with 2-level Approval
const LeavePermissionComponent = ({
  employees, leaves, permissions, setLeaves, setPermissions, formatCurrency
}: any) => {
  const [activeForm, setActiveForm] = useState<'leave' | 'permission' | null>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    type: '',
    startDate: '',
    endDate: '',
    reason: '',
    startTime: '',
    endTime: ''
  });
  const [approvalData, setApprovalData] = useState({
    leaveId: '',
    permissionId: '',
    level: 1,
    action: 'approve' as 'approve' | 'reject',
    notes: '',
    approverName: ''
  });

  const handleSubmitLeave = () => {
    if (!formData.employeeId || !formData.startDate || !formData.endDate || !formData.type) {
      alert('Mohon lengkapi semua field yang diperlukan');
      return;
    }

    const newLeave: Leave = {
      id: Date.now().toString(),
      employeeId: formData.employeeId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      type: formData.type as any,
      status: 'pending',
      reason: formData.reason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedLeaves = [...leaves, newLeave];
    setLeaves(updatedLeaves);
    setToStorage('leaves', updatedLeaves);
    
    // Reset form
    setFormData({
      employeeId: '',
      type: '',
      startDate: '',
      endDate: '',
      reason: '',
      startTime: '',
      endTime: ''
    });
    setActiveForm(null);
    
    alert('Pengajuan cuti berhasil dikirim untuk approval!');
  };

  const handleSubmitPermission = () => {
    if (!formData.employeeId || !formData.startDate || !formData.type || !formData.startTime || !formData.endTime) {
      alert('Mohon lengkapi semua field yang diperlukan');
      return;
    }

    const newPermission: Permission = {
      id: Date.now().toString(),
      employeeId: formData.employeeId,
      date: formData.startDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      type: formData.type as any,
      status: 'pending',
      reason: formData.reason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedPermissions = [...permissions, newPermission];
    setPermissions(updatedPermissions);
    setToStorage('permissions', updatedPermissions);
    
    // Reset form
    setFormData({
      employeeId: '',
      type: '',
      startDate: '',
      endDate: '',
      reason: '',
      startTime: '',
      endTime: ''
    });
    setActiveForm(null);
    
    alert('Pengajuan ijin berhasil dikirim untuk approval!');
  };

  const handleApproval = () => {
    const { level, action, notes, approverName } = approvalData;
    
    if (action === 'approve') {
      if (level === 1) {
        // Level 1 approval
        if (approvalData.leaveId) {
          const updatedLeaves = leaves.map((leave: Leave) => 
            leave.id === approvalData.leaveId 
              ? { 
                  ...leave, 
                  status: 'approved',
                  level1Approval: {
                    approvedBy: approverName,
                    approvedAt: new Date().toISOString(),
                    notes: notes
                  }
                }
              : leave
          );
          setLeaves(updatedLeaves);
          setToStorage('leaves', updatedLeaves);
        }
        if (approvalData.permissionId) {
          const updatedPermissions = permissions.map((perm: Permission) => 
            perm.id === approvalData.permissionId 
              ? { 
                  ...perm, 
                  status: 'approved',
                  level1Approval: {
                    approvedBy: approverName,
                    approvedAt: new Date().toISOString(),
                    notes: notes
                  }
                }
              : perm
          );
          setPermissions(updatedPermissions);
          setToStorage('permissions', updatedPermissions);
        }
      } else {
        // Level 2 approval
        if (approvalData.leaveId) {
          const updatedLeaves = leaves.map((leave: Leave) => 
            leave.id === approvalData.leaveId 
              ? { 
                  ...leave, 
                  status: 'approved',
                  level2Approval: {
                    approvedBy: approverName,
                    approvedAt: new Date().toISOString(),
                    notes: notes
                  }
                }
              : leave
          );
          setLeaves(updatedLeaves);
          setToStorage('leaves', updatedLeaves);
        }
        if (approvalData.permissionId) {
          const updatedPermissions = permissions.map((perm: Permission) => 
            perm.id === approvalData.permissionId 
              ? { 
                  ...perm, 
                  status: 'approved',
                  level2Approval: {
                    approvedBy: approverName,
                    approvedAt: new Date().toISOString(),
                    notes: notes
                  }
                }
              : perm
          );
          setPermissions(updatedPermissions);
          setToStorage('permissions', updatedPermissions);
        }
      }
    } else {
      // Rejection
      if (approvalData.leaveId) {
        const updatedLeaves = leaves.map((leave: Leave) => 
          leave.id === approvalData.leaveId 
            ? { 
                ...leave, 
                status: 'rejected',
                rejectedReason: notes
              }
            : leave
        );
        setLeaves(updatedLeaves);
        setToStorage('leaves', updatedLeaves);
      }
      if (approvalData.permissionId) {
        const updatedPermissions = permissions.map((perm: Permission) => 
          perm.id === approvalData.permissionId 
            ? { 
                ...perm, 
                status: 'rejected',
                rejectedReason: notes
              }
            : perm
        );
        setPermissions(updatedPermissions);
        setToStorage('permissions', updatedPermissions);
      }
    }

    setApprovalData({
      leaveId: '',
      permissionId: '',
      level: 1,
      action: 'approve',
      notes: '',
      approverName: ''
    });

    alert(`Pengajuan ${action === 'approve' ? 'disetujui' : 'ditolak'}!`);
  };

  const getTypeName = (type: string, category: 'leave' | 'permission') => {
    if (category === 'leave') {
      const types = {
        'annual': 'Cuti Tahunan',
        'sick': 'Cuti Sakit',
        'personal': 'Cuti Personal',
        'maternity': 'Cuti Melahirkan',
        'paternity': 'Cuti Ayah',
        'emergency': 'Cuti Darurat'
      };
      return types[type as keyof typeof types] || type;
    } else {
      const types = {
        'urgent': 'Ijin Mendesak',
        'appointment': 'Ijin Janji',
        'personal': 'Ijin Pribadi',
        'family': 'Ijin Keluarga',
        'health': 'Ijin Kesehatan'
      };
      return types[type as keyof typeof types] || type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📋 Manajemen Cuti & Izin</h2>
          <p className="mt-1 text-sm text-gray-600">Sistem cuti dan ijin dengan 2-level approval workflow</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setActiveForm('leave')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            🏖️ Ajukan Cuti
          </button>
          <button
            onClick={() => setActiveForm('permission')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            📋 Ajukan Izin
          </button>
        </div>
      </div>

      {/* Forms */}
      {activeForm === 'leave' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🏖️ Form Pengajuan Cuti</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Karyawan</label>
              <select
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Pilih Karyawan</option>
                {employees.filter((emp: Employee) => emp.status === 'active').map((employee: Employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.position}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Cuti</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Pilih Jenis Cuti</option>
                <option value="annual">Cuti Tahunan</option>
                <option value="sick">Cuti Sakit</option>
                <option value="personal">Cuti Personal</option>
                <option value="maternity">Cuti Melahirkan</option>
                <option value="paternity">Cuti Ayah</option>
                <option value="emergency">Cuti Darurat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Selesai</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Alasan</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                rows={3}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Jelaskan alasan pengambilan cuti..."
              />
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleSubmitLeave}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Submit Cuti
            </button>
            <button
              onClick={() => setActiveForm(null)}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {activeForm === 'permission' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📋 Form Pengajuan Izin</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Karyawan</label>
              <select
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Pilih Karyawan</option>
                {employees.filter((emp: Employee) => emp.status === 'active').map((employee: Employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.position}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Izin</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Pilih Jenis Izin</option>
                <option value="urgent">Ijin Mendesak</option>
                <option value="appointment">Ijin Janji</option>
                <option value="personal">Ijin Pribadi</option>
                <option value="family">Ijin Keluarga</option>
                <option value="health">Ijin Kesehatan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jam Mulai</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jam Selesai</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Alasan</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                rows={3}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                placeholder="Jelaskan alasan pengambilan izin..."
              />
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleSubmitPermission}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
            >
              Submit Izin
            </button>
            <button
              onClick={() => setActiveForm(null)}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Approval Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">✅ 2-Level Approval System</h3>
        
        {/* Pending Approvals */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-800 mb-3">📋 Menunggu Approval</h4>
          
          {/* Pending Leaves */}
          <div className="mb-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Cuti Pending:</h5>
            {leaves.filter((leave: Leave) => leave.status === 'pending').map((leave: Leave) => {
              const employee = employees.find((emp: Employee) => emp.id === leave.employeeId);
              return (
                <div key={leave.id} className="border border-yellow-200 rounded-lg p-3 mb-2 bg-yellow-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{employee?.name} - {getTypeName(leave.type, 'leave')}</p>
                      <p className="text-sm text-gray-600">
                        {leave.startDate} s/d {leave.endDate}
                      </p>
                      <p className="text-sm text-gray-600">Alasan: {leave.reason}</p>
                    </div>
                    <button
                      onClick={() => setApprovalData({...approvalData, leaveId: leave.id, permissionId: '', level: 1})}
                      className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                    >
                      Approve Level 1
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pending Permissions */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Izin Pending:</h5>
            {permissions.filter((perm: Permission) => perm.status === 'pending').map((perm: Permission) => {
              const employee = employees.find((emp: Employee) => emp.id === perm.employeeId);
              return (
                <div key={perm.id} className="border border-orange-200 rounded-lg p-3 mb-2 bg-orange-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{employee?.name} - {getTypeName(perm.type, 'permission')}</p>
                      <p className="text-sm text-gray-600">
                        {perm.date} ({perm.startTime} - {perm.endTime})
                      </p>
                      <p className="text-sm text-gray-600">Alasan: {perm.reason}</p>
                    </div>
                    <button
                      onClick={() => setApprovalData({...approvalData, permissionId: perm.id, leaveId: '', level: 1})}
                      className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
                    >
                      Approve Level 1
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Approval Form */}
        {(approvalData.leaveId || approvalData.permissionId) && (
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <h4 className="text-md font-medium text-gray-800 mb-3">🔍 Review & Approval</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level Approval</label>
                <select
                  value={approvalData.level}
                  onChange={(e) => setApprovalData({...approvalData, level: Number(e.target.value)})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>Level 1 (Supervisor)</option>
                  <option value={2}>Level 2 (Manager)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Approver</label>
                <input
                  type="text"
                  value={approvalData.approverName}
                  onChange={(e) => setApprovalData({...approvalData, approverName: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nama approver..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                <select
                  value={approvalData.action}
                  onChange={(e) => setApprovalData({...approvalData, action: e.target.value as any})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="approve">Approve</option>
                  <option value="reject">Reject</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Catatan/Notes</label>
              <textarea
                value={approvalData.notes}
                onChange={(e) => setApprovalData({...approvalData, notes: e.target.value})}
                rows={2}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Catatan approval..."
              />
            </div>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={handleApproval}
                className={`px-4 py-2 rounded-md text-white ${
                  approvalData.action === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {approvalData.action === 'approve' ? '✅ Approve' : '❌ Reject'}
              </button>
              <button
                onClick={() => setApprovalData({
                  leaveId: '',
                  permissionId: '',
                  level: 1,
                  action: 'approve',
                  notes: '',
                  approverName: ''
                })}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-blue-600 text-2xl">🏖️</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Cuti</dt>
                  <dd className="text-lg font-medium text-gray-900">{leaves.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-purple-600 text-2xl">📋</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Izin</dt>
                  <dd className="text-lg font-medium text-gray-900">{permissions.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-yellow-600 text-2xl">⏳</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Approval</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {[...leaves, ...permissions].filter((item: any) => item.status === 'pending').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-green-600 text-2xl">✅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {[...leaves, ...permissions].filter((item: any) => item.status === 'approved').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
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
    },
    companyInfo: {
      name: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      taxId: '',
      logo: null as string | null
    },
    branding: {
      primaryColor: '#3B82F6',
      secondaryColor: '#6B7280',
      accentColor: '#10B981'
    }
  });

  const [activeTab, setActiveTab] = useState('working-hours');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setLogoFile(file);
      // Use logoFile to prevent ESLint warning
      void logoFile;
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Format file harus PNG atau JPEG');
    }
  };

  const handleSaveCompanyInfo = () => {
    const updatedCompanyInfo = {
      ...settings.companyInfo,
      logo: logoPreview || settings.companyInfo.logo
    };
    
    setSettings({
      ...settings,
      companyInfo: updatedCompanyInfo
    });

    // Save to localStorage
    setToStorage('companySettings', updatedCompanyInfo);
    
    alert('Informasi perusahaan berhasil disimpan!');
  };

  const handleSaveBranding = () => {
    setToStorage('brandingSettings', settings.branding);
    alert('Pengaturan branding berhasil disimpan!');
  };

  const handleSaveWorkingHours = () => {
    setToStorage('workingHoursSettings', settings);
    alert('Pengaturan jam kerja berhasil disimpan!');
  };

  // Load saved settings on component mount
  useEffect(() => {
    const savedCompanyInfo = getFromStorage('companySettings');
    const savedBranding = getFromStorage('brandingSettings');
    
    if (savedCompanyInfo) {
      setSettings(prev => ({ ...prev, companyInfo: savedCompanyInfo }));
      setLogoPreview(savedCompanyInfo.logo);
    }
    
    if (savedBranding) {
      setSettings(prev => ({ ...prev, branding: savedBranding }));
    }
  }, []);

  const tabs = [
    { id: 'working-hours', name: '⏰ Jam Kerja', icon: '⏰' },
    { id: 'company-info', name: '🏢 Info Perusahaan', icon: '🏢' },
    { id: 'branding', name: '🎨 Branding', icon: '🎨' },
    { id: 'notifications', name: '🔔 Notifikasi', icon: '🔔' },
    { id: 'geo-location', name: '📍 Geo-location', icon: '📍' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">⚙️ Pengaturan & Konfigurasi</h2>
        <p className="mt-1 text-sm text-gray-600">Konfigurasi sistem absensi dan identitas perusahaan</p>
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
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'working-hours' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">⏰ Jam Kerja & Toleransi</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jam Kerja per Hari</label>
                <input
                  type="number"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={settings.workingHours}
                  onChange={(e) => setSettings({...settings, workingHours: Number(e.target.value)})}
                  placeholder="8"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Toleransi Keterlambatan (menit)</label>
                <input
                  type="number"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={settings.lateTolerance}
                  onChange={(e) => setSettings({...settings, lateTolerance: Number(e.target.value)})}
                  placeholder="15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Break Time (menit)</label>
                <input
                  type="number"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={settings.breakTime}
                  onChange={(e) => setSettings({...settings, breakTime: Number(e.target.value)})}
                  placeholder="60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Overtime Multiplier</label>
                <input
                  type="number"
                  step="0.1"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={settings.overtimeMultiplier}
                  onChange={(e) => setSettings({...settings, overtimeMultiplier: Number(e.target.value)})}
                  placeholder="1.5"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveWorkingHours}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                💾 Simpan Pengaturan
              </button>
            </div>
          </div>
        )}

        {activeTab === 'company-info' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">🏢 Informasi Perusahaan</h3>
            
            {/* Logo Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo Perusahaan</label>
              <div className="flex items-center space-x-6">
                <div>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={handleLogoUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format yang didukung: PNG, JPG, JPEG (maks. 2MB)</p>
                </div>
                {logoPreview && (
                  <div className="flex flex-col items-center">
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="w-20 h-20 object-contain border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setLogoPreview(null);
                        setLogoFile(null);
                      }}
                      className="text-xs text-red-600 mt-1 hover:text-red-800"
                    >
                      Hapus
                    </button>
                  </div>
                )}
                {settings.companyInfo.logo && !logoPreview && (
                  <div className="flex flex-col items-center">
                    <img
                      src={settings.companyInfo.logo}
                      alt="Current Logo"
                      className="w-20 h-20 object-contain border border-gray-300 rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Logo Saat Ini</p>
                  </div>
                )}
              </div>
            </div>

            {/* Company Information Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Perusahaan</label>
                <input
                  type="text"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={settings.companyInfo.name}
                  onChange={(e) => setSettings({
                    ...settings,
                    companyInfo: { ...settings.companyInfo, name: e.target.value }
                  })}
                  placeholder="PT. Contoh Perusahaan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={settings.companyInfo.email}
                  onChange={(e) => setSettings({
                    ...settings,
                    companyInfo: { ...settings.companyInfo, email: e.target.value }
                  })}
                  placeholder="info@contohperusahaan.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
                <input
                  type="tel"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={settings.companyInfo.phone}
                  onChange={(e) => setSettings({
                    ...settings,
                    companyInfo: { ...settings.companyInfo, phone: e.target.value }
                  })}
                  placeholder="+62 21 1234 5678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={settings.companyInfo.website}
                  onChange={(e) => setSettings({
                    ...settings,
                    companyInfo: { ...settings.companyInfo, website: e.target.value }
                  })}
                  placeholder="https://www.contohperusahaan.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">NPWP</label>
                <input
                  type="text"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={settings.companyInfo.taxId}
                  onChange={(e) => setSettings({
                    ...settings,
                    companyInfo: { ...settings.companyInfo, taxId: e.target.value }
                  })}
                  placeholder="00.000.000.0-000.000"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Perusahaan</label>
                <textarea
                  rows={3}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={settings.companyInfo.address}
                  onChange={(e) => setSettings({
                    ...settings,
                    companyInfo: { ...settings.companyInfo, address: e.target.value }
                  })}
                  placeholder="Jl. Contoh No. 123, Jakarta Pusat, DKI Jakarta 12345"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveCompanyInfo}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                💾 Simpan Info Perusahaan
              </button>
            </div>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">🎨 Branding & Tema</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Warna Primer</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.branding.primaryColor}
                    onChange={(e) => setSettings({
                      ...settings,
                      branding: { ...settings.branding, primaryColor: e.target.value }
                    })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.branding.primaryColor}
                    onChange={(e) => setSettings({
                      ...settings,
                      branding: { ...settings.branding, primaryColor: e.target.value }
                    })}
                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Warna Sekunder</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.branding.secondaryColor}
                    onChange={(e) => setSettings({
                      ...settings,
                      branding: { ...settings.branding, secondaryColor: e.target.value }
                    })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.branding.secondaryColor}
                    onChange={(e) => setSettings({
                      ...settings,
                      branding: { ...settings.branding, secondaryColor: e.target.value }
                    })}
                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#6B7280"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Warna Aksen</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.branding.accentColor}
                    onChange={(e) => setSettings({
                      ...settings,
                      branding: { ...settings.branding, accentColor: e.target.value }
                    })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.branding.accentColor}
                    onChange={(e) => setSettings({
                      ...settings,
                      branding: { ...settings.branding, accentColor: e.target.value }
                    })}
                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#10B981"
                  />
                </div>
              </div>
            </div>

            {/* Preview Colors */}
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-800 mb-3">Preview Warna</h4>
              <div className="flex space-x-4">
                <div className="flex-1 p-4 rounded-lg" style={{ backgroundColor: settings.branding.primaryColor }}>
                  <span className="text-white font-medium">Warna Primer</span>
                </div>
                <div className="flex-1 p-4 rounded-lg" style={{ backgroundColor: settings.branding.secondaryColor }}>
                  <span className="text-white font-medium">Warna Sekunder</span>
                </div>
                <div className="flex-1 p-4 rounded-lg" style={{ backgroundColor: settings.branding.accentColor }}>
                  <span className="text-white font-medium">Warna Aksen</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveBranding}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                💾 Simpan Branding
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">🔔 Pengaturan Notifikasi</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Reminder Check-in</h4>
                  <p className="text-sm text-gray-500">Kirim notifikasi untuk remind check-in</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, checkInReminder: !settings.notifications.checkInReminder }
                  })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                    settings.notifications.checkInReminder ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.notifications.checkInReminder ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Reminder Check-out</h4>
                  <p className="text-sm text-gray-500">Kirim notifikasi untuk remind check-out</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, checkOutReminder: !settings.notifications.checkOutReminder }
                  })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                    settings.notifications.checkOutReminder ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.notifications.checkOutReminder ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Alert Keterlambatan</h4>
                  <p className="text-sm text-gray-500">Kirim notifikasi ketika ada karyawan terlambat</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, lateAlert: !settings.notifications.lateAlert }
                  })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                    settings.notifications.lateAlert ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.notifications.lateAlert ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'geo-location' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">📍 Pengaturan Geo-location</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Enable Geo-fencing</h4>
                  <p className="text-sm text-gray-500">Wajibkan absensi dari lokasi kantor</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    geoFence: { ...settings.geoFence, enabled: !settings.geoFence.enabled }
                  })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                    settings.geoFence.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.geoFence.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Radius (meter)</label>
                <input
                  type="number"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={settings.geoFence.radius}
                  onChange={(e) => setSettings({
                    ...settings,
                    geoFence: { ...settings.geoFence, radius: Number(e.target.value) }
                  })}
                  placeholder="100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={settings.geoFence.center.lat}
                    onChange={(e) => setSettings({
                      ...settings,
                      geoFence: {
                        ...settings.geoFence,
                        center: { ...settings.geoFence.center, lat: Number(e.target.value) }
                      }
                    })}
                    placeholder="-6.2088"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={settings.geoFence.center.lng}
                    onChange={(e) => setSettings({
                      ...settings,
                      geoFence: {
                        ...settings.geoFence,
                        center: { ...settings.geoFence.center, lng: Number(e.target.value) }
                      }
                    })}
                    placeholder="106.8456"
                  />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-blue-600 text-xl">ℹ️</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Info Geo-fencing</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Geo-fencing memungkinkan sistem untuk memverifikasi lokasi absensi karyawan. Karyawan hanya bisa melakukan check-in/check-out dari dalam radius yang ditentukan.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;