import React, { useState, useEffect, useCallback } from 'react';
import { getFromStorage, setToStorage } from '../utils/storage';
import { Attendance, Employee } from '../utils/types';

const AttendancePage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [currentAttendance, setCurrentAttendance] = useState<Attendance | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const checkCurrentAttendance = useCallback(() => {
    if (!selectedEmployee) return;

    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.find(
      att => att.employeeId === selectedEmployee && att.date === today
    );
    setCurrentAttendance(todayAttendance || null);
  }, [selectedEmployee, attendance]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    checkCurrentAttendance();
  }, [checkCurrentAttendance]);

  const loadData = () => {
    const employeesData = getFromStorage('employees') || [];
    const attendanceData = getFromStorage('attendance') || [];
    setEmployees(employeesData);
    setAttendance(attendanceData);
  };


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

  const getMonthlyAttendance = () => {
    const [year, month] = selectedMonth.split('-');
    return attendance.filter(att => {
      const attDate = new Date(att.date);
      return attDate.getFullYear() === parseInt(year) && attDate.getMonth() === parseInt(month) - 1;
    });
  };

  const monthlyAttendance = getMonthlyAttendance();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Absensi</h1>
        <p className="mt-1 text-sm text-gray-600">Kelola absensi harian karyawan</p>
      </div>

      {/* Check-in/Check-out Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Check-in/Check-out Hari Ini</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Karyawan
            </label>
            <select
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">Pilih karyawan...</option>
              {employees.filter(emp => emp.status === 'active').map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.position}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end space-x-2">
            {!currentAttendance && (
              <button
                onClick={handleCheckIn}
                disabled={!selectedEmployee}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Check-in
              </button>
            )}

            {currentAttendance && !currentAttendance.checkOut && (
              <button
                onClick={handleCheckOut}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Check-out
              </button>
            )}

            <button
              onClick={requestNotificationPermission}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              Enable Notifications
            </button>
          </div>
        </div>

        {currentAttendance && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium text-gray-900">Status Hari Ini</h3>
            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Check-in:</span> {currentAttendance.checkIn}
              </div>
              {currentAttendance.checkOut && (
                <div>
                  <span className="font-medium">Check-out:</span> {currentAttendance.checkOut}
                </div>
              )}
              {currentAttendance.hoursWorked > 0 && (
                <div className="col-span-2">
                  <span className="font-medium">Jam Kerja:</span> {currentAttendance.hoursWorked} jam
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Monthly Report */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Laporan Bulanan</h2>
            <input
              type="month"
              className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
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
              {monthlyAttendance.map((att) => {
                const employee = employees.find(emp => emp.id === att.employeeId);
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

        {monthlyAttendance.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Tidak ada data absensi untuk bulan ini</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;