import React, { useState, useEffect } from 'react';
import { getFromStorage, setToStorage } from '../utils/storage';
import { Employee, Attendance, Salary } from '../utils/types';
import { useAppContext } from '../contexts/AppContext';

const SalaryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('salary-slips');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [salaryDetails, setSalaryDetails] = useState<Salary[]>([]);
  const { settings } = useAppContext();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const employeesData = getFromStorage('employees') || [];
    const attendanceData = getFromStorage('attendance') || [];
    const salaryDetailsData = getFromStorage('salaryDetails') || [];
    setEmployees(employeesData);
    setAttendance(attendanceData);
    setSalaryDetails(salaryDetailsData);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getMonthName = (month: number): string => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month - 1];
  };

  const calculateEnhancedSalary = (employeeId: string, month: string, year: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return null;

    // Get attendance for the month
    const monthAttendance = attendance.filter(att => {
      const attDate = new Date(att.date);
      return att.employeeId === employeeId &&
             attDate.getMonth() === parseInt(month) - 1 &&
             attDate.getFullYear() === year;
    });

    const totalHours = monthAttendance.reduce((sum, att) => sum + att.hoursWorked, 0);
    const workingDays = new Set(monthAttendance.map(att => att.date)).size;
    
    // Basic calculation
    const baseSalary = employee.salary || 0;
    
    // Enhanced components
    const transportAllowance = workingDays * 20000; // Rp 20,000 per working day
    const mealAllowance = workingDays * 25000; // Rp 25,000 per working day
    const healthAllowance = baseSalary * 0.05; // 5% of base salary
    const positionAllowance = baseSalary * 0.1; // 10% position allowance
    
    const totalAllowances = transportAllowance + mealAllowance + healthAllowance + positionAllowance;
    const grossSalary = baseSalary + totalAllowances;
    
    // Deductions
    const incomeTax = grossSalary * 0.05; // Simplified 5% tax
    const healthInsurance = baseSalary * 0.01; // 1% health insurance
    const employmentInsurance = baseSalary * 0.02; // 2% employment insurance
    
    const totalDeductions = incomeTax + healthInsurance + employmentInsurance;
    const netSalary = grossSalary - totalDeductions;

    return {
      baseSalary,
      hoursWorked: totalHours,
      workingDays,
      allowances: {
        transport: transportAllowance,
        meal: mealAllowance,
        health: healthAllowance,
        position: positionAllowance,
        skill: 0,
        other: 0,
      },
      deductions: {
        incomeTax,
        healthInsurance,
        employmentInsurance,
        loan: 0,
        other: 0,
      },
      bonuses: {
        performance: 0,
        annual: 0,
        holiday: 0,
        attendance: 0,
        other: 0,
      },
      grossSalary,
      totalDeductions,
      netSalary,
    };
  };

  const tabs = [
    { id: 'salary-slips', name: 'Slip Gaji', icon: '📋' },
    { id: 'allowances', name: 'Tunjangan', icon: '💰', disabled: true },
    { id: 'deductions', name: 'Potongan', icon: '🔻', disabled: true },
    { id: 'payroll-config', name: 'Konfigurasi', icon: '⚙️', disabled: true },
    { id: 'bonuses', name: 'Bonus', icon: '🎁', disabled: true },
    { id: 'salary-structure', name: 'Struktur Gaji', icon: '📊', disabled: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Manajemen Gaji</h1>
          <p className="mt-1 text-sm text-gray-600">Sistem payroll dengan slip gaji yang enhanced</p>
        </div>
        <div className="text-sm text-gray-500">
          Aplikasi: {settings.appName}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : tab.disabled
                  ? 'border-transparent text-gray-300 cursor-not-allowed'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}{tab.disabled && ' (Soon)'}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        <SalarySlipsComponent
          employees={employees}
          attendance={attendance}
          salaryDetails={salaryDetails}
          calculateEnhancedSalary={calculateEnhancedSalary}
          formatCurrency={formatCurrency}
          getMonthName={getMonthName}
          settings={settings}
          onDataChange={loadData}
        />
      </div>
    </div>
  );
};

// Salary Slips Component
const SalarySlipsComponent = ({
  employees,
  attendance,
  salaryDetails,
  calculateEnhancedSalary,
  formatCurrency,
  getMonthName,
  settings,
  onDataChange
}: any) => {
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const generateEnhancedSalarySlip = () => {
    if (!selectedEmployee) return;

    const [year, month] = selectedMonth.split('-').map(Number);
    const existingSalary = salaryDetails.find(
      (s: Salary) => s.employeeId === selectedEmployee && s.month === getMonthName(month) && s.year === year
    );

    if (existingSalary) {
      alert('Slip gaji untuk bulan ini sudah ada');
      return;
    }

    const calculation = calculateEnhancedSalary(selectedEmployee, month.toString(), year);
    if (!calculation) return;

    const totalAllowances = (Object.values(calculation.allowances) as number[]).reduce((a, b) => a + b, 0);
    const totalDeductions = (Object.values(calculation.deductions) as number[]).reduce((a, b) => a + b, 0);
    const totalBonuses = (Object.values(calculation.bonuses) as number[]).reduce((a, b) => a + b, 0);

    const newSalaryDetail: Salary = {
      id: Date.now().toString(),
      employeeId: selectedEmployee,
      month: getMonthName(month),
      year,
      baseSalary: calculation.baseSalary,
      allowances: totalAllowances,
      deductions: totalDeductions,
      netSalary: calculation.netSalary,
    };

    const updatedDetails = [...salaryDetails, newSalaryDetail];
    setToStorage('salaries', updatedDetails);
    setShowGenerateModal(false);
    setSelectedEmployee('');
    onDataChange();
    alert('Slip gaji berhasil dibuat!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Daftar Slip Gaji</h2>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Generate Slip Gaji
        </button>
      </div>

      {/* Salary List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {salaryDetails.map((salary: Salary) => {
            const employee = employees.find((emp: Employee) => emp.id === salary.employeeId);
            return (
              <li key={salary.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {settings.logoData ? (
                        <img src={settings.logoData} alt="Logo" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {employee?.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{employee?.name}</div>
                      <div className="text-sm text-gray-500">
                        {salary.month} {salary.year} - {employee?.position}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-medium text-gray-900">
                      {formatCurrency(salary.netSalary)}
                    </div>
                    <div className="text-sm text-gray-500">Gaji Bersih</div>
                  </div>
                </div>

                {/* Enhanced breakdown */}
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

        {salaryDetails.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Belum ada slip gaji yang dibuat</p>
          </div>
        )}
      </div>

      {/* Generate Modal */}
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
                    {employees.filter((emp: Employee) => emp.status === 'active').map((employee: Employee) => (
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
                      const calculation = calculateEnhancedSalary(selectedEmployee, month.toString(), year);
                      return calculation ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Gaji Pokok:</span>
                            <span>{formatCurrency(calculation.baseSalary)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Tunjangan:</span>
                            <span>{formatCurrency((Object.values(calculation.allowances) as number[]).reduce((a, b) => a + b, 0))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Bonus:</span>
                            <span>{formatCurrency((Object.values(calculation.bonuses) as number[]).reduce((a, b) => a + b, 0))}</span>
                          </div>
                          <div className="flex justify-between font-medium border-t pt-2">
                            <span>Gaji Bruto:</span>
                            <span>{formatCurrency(calculation.grossSalary)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Potongan:</span>
                            <span>{formatCurrency(calculation.totalDeductions)}</span>
                          </div>
                          <div className="flex justify-between font-medium border-t pt-2">
                            <span>Gaji Bersih:</span>
                            <span className="text-blue-600">{formatCurrency(calculation.netSalary)}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Berdasarkan {calculation.hoursWorked} jam kerja, {calculation.workingDays} hari kerja
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
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Batal
                  </button>
                  <button
                    onClick={generateEnhancedSalarySlip}
                    disabled={!selectedEmployee}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
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