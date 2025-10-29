import React, { useState, useEffect } from 'react';
import { getFromStorage, setToStorage } from '../utils/storage';
import { Salary, Employee, Attendance } from '../utils/types';

const SalaryPage: React.FC = () => {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const salariesData = getFromStorage('salaries') || [];
    const employeesData = getFromStorage('employees') || [];
    const attendanceData = getFromStorage('attendance') || [];
    setSalaries(salariesData);
    setEmployees(employeesData);
    setAttendance(attendanceData);
  };

  const calculateSalary = (employeeId: string, month: string, year: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return null;

    // Get attendance for the month
    const monthAttendance = attendance.filter(att => {
      const attDate = new Date(att.date);
      return att.employeeId === employeeId &&
             attDate.getMonth() === parseInt(month) - 1 &&
             attDate.getFullYear() === year;
    });

    // Calculate total hours worked
    const totalHours = monthAttendance.reduce((sum, att) => sum + att.hoursWorked, 0);

    // Basic calculation (simplified)
    const baseSalary = employee.salary || 0;
    const hourlyRate = baseSalary / 160; // Assuming 160 working hours per month
    const earnedSalary = hourlyRate * totalHours;

    // Allowances and deductions (simplified)
    const allowances = baseSalary * 0.1; // 10% allowance
    const deductions = baseSalary * 0.05; // 5% deduction

    return {
      baseSalary,
      allowances,
      deductions,
      netSalary: earnedSalary + allowances - deductions,
      hoursWorked: totalHours,
    };
  };

  const generateSalarySlip = () => {
    if (!selectedEmployee) return;

    const [year, month] = selectedMonth.split('-').map(Number);
    const existingSalary = salaries.find(
      s => s.employeeId === selectedEmployee && s.month === getMonthName(month) && s.year === year
    );

    if (existingSalary) {
      alert('Slip gaji untuk bulan ini sudah ada');
      return;
    }

    const calculation = calculateSalary(selectedEmployee, month.toString(), year);
    if (!calculation) return;

    const newSalary: Salary = {
      id: Date.now().toString(),
      employeeId: selectedEmployee,
      month: getMonthName(month),
      year,
      baseSalary: calculation.baseSalary,
      allowances: calculation.allowances,
      deductions: calculation.deductions,
      netSalary: calculation.netSalary,
    };

    const updatedSalaries = [...salaries, newSalary];
    setSalaries(updatedSalaries);
    setToStorage('salaries', updatedSalaries);
    setShowGenerateModal(false);
    setSelectedEmployee('');
  };

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const exportToPDF = (salary: Salary) => {
    // Simple PDF-like export (in a real app, use a PDF library)
    const employee = employees.find(emp => emp.id === salary.employeeId);
    const content = `
      SLIP GAJI
      =========

      Karyawan: ${employee?.name}
      Posisi: ${employee?.position}
      Departemen: ${employee?.department}

      Periode: ${salary.month} ${salary.year}

      Gaji Pokok: ${formatCurrency(salary.baseSalary)}
      Tunjangan: ${formatCurrency(salary.allowances)}
      Potongan: ${formatCurrency(salary.deductions)}
      Gaji Bersih: ${formatCurrency(salary.netSalary)}

      Dicetak pada: ${new Date().toLocaleDateString('id-ID')}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slip-gaji-${employee?.name}-${salary.month}-${salary.year}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gaji</h1>
          <p className="mt-1 text-sm text-gray-600">Kelola dan lihat slip gaji karyawan</p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Generate Slip Gaji
        </button>
      </div>

      {/* Salary List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Daftar Slip Gaji</h2>
        </div>

        <ul className="divide-y divide-gray-200">
          {salaries.map((salary) => {
            const employee = employees.find(emp => emp.id === salary.employeeId);
            return (
              <li key={salary.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {employee?.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{employee?.name}</div>
                      <div className="text-sm text-gray-500">
                        {salary.month} {salary.year} - {employee?.position}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(salary.netSalary)}
                      </div>
                      <div className="text-sm text-gray-500">Gaji Bersih</div>
                    </div>
                    <button
                      onClick={() => exportToPDF(salary)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Export PDF
                    </button>
                  </div>
                </div>

                {/* Detailed breakdown */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Gaji Pokok:</span>
                    <div className="text-gray-900">{formatCurrency(salary.baseSalary)}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Tunjangan:</span>
                    <div className="text-gray-900">{formatCurrency(salary.allowances)}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Potongan:</span>
                    <div className="text-gray-900">{formatCurrency(salary.deductions)}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Gaji Bersih:</span>
                    <div className="text-gray-900 font-medium">{formatCurrency(salary.netSalary)}</div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {salaries.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Belum ada slip gaji yang dibuat</p>
          </div>
        )}
      </div>

      {/* Generate Salary Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Slip Gaji</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pilih Karyawan</label>
                  <select
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700">Pilih Bulan</label>
                  <input
                    type="month"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                </div>

                {selectedEmployee && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-medium text-gray-900 mb-2">Pratinjau Perhitungan</h4>
                    {(() => {
                      const [year, month] = selectedMonth.split('-').map(Number);
                      const calculation = calculateSalary(selectedEmployee, month.toString(), year);
                      return calculation ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Gaji Pokok:</span>
                            <span>{formatCurrency(calculation.baseSalary)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tunjangan:</span>
                            <span>{formatCurrency(calculation.allowances)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Potongan:</span>
                            <span>{formatCurrency(calculation.deductions)}</span>
                          </div>
                          <div className="flex justify-between font-medium border-t pt-2">
                            <span>Gaji Bersih:</span>
                            <span>{formatCurrency(calculation.netSalary)}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Berdasarkan {calculation.hoursWorked} jam kerja
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">Tidak dapat menghitung gaji</p>
                      );
                    })()}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGenerateModal(false);
                      setSelectedEmployee('');
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Batal
                  </button>
                  <button
                    onClick={generateSalarySlip}
                    disabled={!selectedEmployee}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryPage;