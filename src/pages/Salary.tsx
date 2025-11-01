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
    let employeesData = getFromStorage('employees') || [];
    const attendanceData = getFromStorage('attendance') || [];
    const salaryDetailsData = getFromStorage('salaries') || getFromStorage('salaryDetails') || [];
    
    // Add sample data if empty
    if (employeesData.length === 0) {
      const sampleEmployees: Employee[] = [
        {
          id: '1',
          name: 'Budi Santoso',
          email: 'budi@company.com',
          position: 'Software Developer',
          department: 'IT',
          salary: 8000000,
          status: 'active' as const,
          photoUrl: '',
          phone: '081234567890',
          joinDate: '2023-01-15',
          birthDate: '1990-05-15',
          nip: 'IT001'
        },
        {
          id: '2',
          name: 'Siti Nurhaliza',
          email: 'siti@company.com',
          position: 'UI/UX Designer',
          department: 'Design',
          salary: 6500000,
          status: 'active' as const,
          photoUrl: '',
          phone: '081234567892',
          joinDate: '2023-03-01',
          birthDate: '1992-08-20',
          nip: 'DS002'
        },
        {
          id: '3',
          name: 'Ahmad Rizki',
          email: 'ahmad@company.com',
          position: 'Project Manager',
          department: 'Management',
          salary: 9000000,
          status: 'active' as const,
          photoUrl: '',
          phone: '081234567894',
          joinDate: '2022-11-01',
          birthDate: '1988-12-10',
          nip: 'MG003'
        }
      ];
      setToStorage('employees', sampleEmployees);
      employeesData = sampleEmployees;
    }
    
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
    { id: 'allowances', name: 'Tunjangan', icon: '💰', disabled: false },
    { id: 'deductions', name: 'Potongan', icon: '🔻', disabled: false },
    { id: 'payroll-config', name: 'Konfigurasi', icon: '⚙️', disabled: false },
    { id: 'bonuses', name: 'Bonus', icon: '🎁', disabled: false },
    { id: 'salary-structure', name: 'Struktur Gaji', icon: '📊', disabled: false },
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
        {activeTab === 'salary-slips' && (
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
        )}
        {activeTab === 'allowances' && (
          <AllowancesComponent
            employees={employees}
            settings={settings}
            formatCurrency={formatCurrency}
          />
        )}
        {activeTab === 'deductions' && (
          <DeductionsComponent
            employees={employees}
            settings={settings}
            formatCurrency={formatCurrency}
          />
        )}
        {activeTab === 'bonuses' && (
          <BonusesComponent
            employees={employees}
            settings={settings}
            formatCurrency={formatCurrency}
          />
        )}
        {activeTab === 'payroll-config' && (
          <PayrollConfigComponent
            settings={settings}
            onDataChange={loadData}
          />
        )}
        {activeTab === 'salary-structure' && (
          <SalaryStructureComponent
            employees={employees}
            formatCurrency={formatCurrency}
          />
        )}
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
    // const totalBonuses = (Object.values(calculation.bonuses) as number[]).reduce((a, b) => a + b, 0);

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

  const [selectedSalaryIndex, setSelectedSalaryIndex] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<{
    basic: boolean;
    allowances: boolean;
    deductions: boolean;
    summary: boolean;
  }>({
    basic: true,
    allowances: true,
    deductions: false,
    summary: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePrintSlip = (salary: Salary) => {
    const employee = employees.find((emp: Employee) => emp.id === salary.employeeId);
    if (!employee) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${settings.salarySlipLabels.headerTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
          .logo { width: 80px; height: 80px; margin: 0 auto 10px; }
          .title { font-size: 24px; font-weight: bold; margin: 10px 0; }
          .company { font-size: 18px; margin: 5px 0; }
          .employee-info { margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
          .breakdown { margin: 20px 0; }
          .section { margin: 15px 0; }
          .section-title { font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; }
          .amount { text-align: right; }
          .total { font-weight: bold; font-size: 16px; border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; }
          .footer { text-align: center; margin-top: 30px; font-style: italic; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          ${settings.logoData ? `<img src="${settings.logoData}" class="logo" alt="Logo">` : ''}
          <div class="title">${settings.salarySlipLabels.headerTitle}</div>
          <div class="company">${settings.salarySlipLabels.companyName}</div>
        </div>
        
        <div class="employee-info">
          <div class="info-row">
            <span><strong>${settings.salarySlipLabels.fieldNames.employeeName}:</strong></span>
            <span>${employee.name}</span>
          </div>
          <div class="info-row">
            <span><strong>${settings.salarySlipLabels.fieldNames.position}:</strong></span>
            <span>${employee.position}</span>
          </div>
          <div class="info-row">
            <span><strong>${settings.salarySlipLabels.fieldNames.department}:</strong></span>
            <span>${employee.department}</span>
          </div>
          <div class="info-row">
            <span><strong>${settings.salarySlipLabels.fieldNames.period}:</strong></span>
            <span>${salary.month} ${salary.year}</span>
          </div>
        </div>

        <div class="breakdown">
          <div class="section">
            <div class="section-title">PENGHASILAN</div>
            <div class="info-row">
              <span>${settings.salarySlipLabels.fieldNames.baseSalary}</span>
              <span class="amount">${formatCurrency(salary.baseSalary)}</span>
            </div>
            <div class="info-row">
              <span>${settings.salarySlipLabels.fieldNames.allowances}</span>
              <span class="amount">${formatCurrency(salary.allowances)}</span>
            </div>
          </div>
          
          <div class="total">
            <div class="info-row">
              <span>TOTAL PENGHASILAN</span>
              <span class="amount">${formatCurrency(salary.baseSalary + salary.allowances)}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">POTONGAN</div>
            <div class="info-row">
              <span>${settings.salarySlipLabels.fieldNames.deductions}</span>
              <span class="amount">${formatCurrency(salary.deductions)}</span>
            </div>
          </div>

          <div class="total">
            <div class="info-row">
              <span>${settings.salarySlipLabels.fieldNames.netSalary}</span>
              <span class="amount">${formatCurrency(salary.netSalary)}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>${settings.salarySlipLabels.footerText}</p>
          <p>Dicetak pada: ${new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportToPDF = (salary: Salary) => {
    // Simple export to text file (in real app, use PDF library)
    const employee = employees.find((emp: Employee) => emp.id === salary.employeeId);
    if (!employee) return;

    const content = `
${settings.salarySlipLabels.headerTitle}
${settings.salarySlipLabels.companyName}
${'='.repeat(40)}

${settings.salarySlipLabels.fieldNames.employeeName}: ${employee.name}
${settings.salarySlipLabels.fieldNames.position}: ${employee.position}
${settings.salarySlipLabels.fieldNames.department}: ${employee.department}
${settings.salarySlipLabels.fieldNames.period}: ${salary.month} ${salary.year}

PENGHASILAN:
${settings.salarySlipLabels.fieldNames.baseSalary}: ${formatCurrency(salary.baseSalary)}
${settings.salarySlipLabels.fieldNames.allowances}: ${formatCurrency(salary.allowances)}
TOTAL PENGHASILAN: ${formatCurrency(salary.baseSalary + salary.allowances)}

POTONGAN:
${settings.salarySlipLabels.fieldNames.deductions}: ${formatCurrency(salary.deductions)}

${settings.salarySlipLabels.fieldNames.netSalary}: ${formatCurrency(salary.netSalary)}

${settings.salarySlipLabels.footerText}
Dicetak pada: ${new Date().toLocaleDateString('id-ID')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slip-gaji-${employee.name}-${salary.month}-${salary.year}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const navigateToSalary = (direction: 'prev' | 'next') => {
    if (selectedSalaryIndex === null) return;
    
    const newIndex = direction === 'prev'
      ? selectedSalaryIndex - 1
      : selectedSalaryIndex + 1;
    
    if (newIndex >= 0 && newIndex < salaryDetails.length) {
      setSelectedSalaryIndex(newIndex);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Slip Gaji</h2>
          <p className="mt-1 text-sm text-gray-600">Generate dan kelola slip gaji karyawan dengan fitur print dan export</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium shadow-lg"
          >
            📋 Generate Slip Gaji
          </button>
        </div>
      </div>

      {/* Navigation Controls */}
      {selectedSalaryIndex !== null && (
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <button
            onClick={() => navigateToSalary('prev')}
            disabled={selectedSalaryIndex === 0}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Sebelumnya
          </button>
          <span className="text-sm text-gray-600">
            Slip {selectedSalaryIndex + 1} dari {salaryDetails.length}
          </span>
          <button
            onClick={() => navigateToSalary('next')}
            disabled={selectedSalaryIndex === salaryDetails.length - 1}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Selanjutnya →
          </button>
        </div>
      )}

      {/* Salary List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {salaryDetails.map((salary: Salary, index: number) => {
            const employee = employees.find((emp: Employee) => emp.id === salary.employeeId);
            const isSelected = selectedSalaryIndex === index;
            
            return (
              <li key={salary.id} className={`${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'px-6 py-4'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-12 w-12">
                      {settings.logoData ? (
                        <img src={settings.logoData} alt="Logo" className="h-12 w-12 rounded-full object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {employee?.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-lg font-medium text-gray-900">{employee?.name}</div>
                      <div className="text-sm text-gray-500">
                        {salary.month} {salary.year} - {employee?.position}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-xl font-semibold text-gray-900">
                        {formatCurrency(salary.netSalary)}
                      </div>
                      <div className="text-sm text-gray-500">{settings.salarySlipLabels.fieldNames.netSalary}</div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedSalaryIndex(isSelected ? null : index)}
                        className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 text-sm"
                      >
                        {isSelected ? 'Tutup' : 'Detail'}
                      </button>
                      <button
                        onClick={() => handlePrintSlip(salary)}
                        className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm"
                      >
                        Print
                      </button>
                      <button
                        onClick={() => handleExportToPDF(salary)}
                        className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
                      >
                        Export
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collapsible Detailed View */}
                {isSelected && (
                  <div className="mt-6 border-t pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <button
                          onClick={() => toggleSection('basic')}
                          className="flex items-center justify-between w-full text-left"
                        >
                          <h3 className="text-lg font-medium text-gray-900">Informasi Karyawan</h3>
                          <svg className={`w-5 h-5 transition-transform ${expandedSections.basic ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        {expandedSections.basic && (
                          <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                            <div className="flex justify-between">
                              <span className="text-gray-600">{settings.salarySlipLabels.fieldNames.employeeName}:</span>
                              <span className="font-medium">{employee?.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{settings.salarySlipLabels.fieldNames.position}:</span>
                              <span className="font-medium">{employee?.position}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{settings.salarySlipLabels.fieldNames.department}:</span>
                              <span className="font-medium">{employee?.department}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{settings.salarySlipLabels.fieldNames.period}:</span>
                              <span className="font-medium">{salary.month} {salary.year}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Earnings Breakdown */}
                      <div className="space-y-4">
                        <button
                          onClick={() => toggleSection('allowances')}
                          className="flex items-center justify-between w-full text-left"
                        >
                          <h3 className="text-lg font-medium text-gray-900">Penghasilan</h3>
                          <svg className={`w-5 h-5 transition-transform ${expandedSections.allowances ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        {expandedSections.allowances && (
                          <div className="space-y-2 pl-4 border-l-2 border-green-200">
                            <div className="flex justify-between">
                              <span className="text-gray-600">{settings.salarySlipLabels.fieldNames.baseSalary}:</span>
                              <span className="font-medium text-green-600">{formatCurrency(salary.baseSalary)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{settings.salarySlipLabels.fieldNames.allowances}:</span>
                              <span className="font-medium text-green-600">{formatCurrency(salary.allowances)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                              <span className="font-medium">Total Penghasilan:</span>
                              <span className="font-bold text-green-700">{formatCurrency(salary.baseSalary + salary.allowances)}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Deductions */}
                      <div className="space-y-4">
                        <button
                          onClick={() => toggleSection('deductions')}
                          className="flex items-center justify-between w-full text-left"
                        >
                          <h3 className="text-lg font-medium text-gray-900">Potongan</h3>
                          <svg className={`w-5 h-5 transition-transform ${expandedSections.deductions ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        {expandedSections.deductions && (
                          <div className="space-y-2 pl-4 border-l-2 border-red-200">
                            <div className="flex justify-between">
                              <span className="text-gray-600">{settings.salarySlipLabels.fieldNames.deductions}:</span>
                              <span className="font-medium text-red-600">{formatCurrency(salary.deductions)}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Summary */}
                      <div className="space-y-4">
                        <button
                          onClick={() => toggleSection('summary')}
                          className="flex items-center justify-between w-full text-left"
                        >
                          <h3 className="text-lg font-medium text-gray-900">Rangkuman</h3>
                          <svg className={`w-5 h-5 transition-transform ${expandedSections.summary ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        {expandedSections.summary && (
                          <div className="pl-4 border-l-2 border-blue-200 bg-blue-50 p-4 rounded-r-lg">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-700">
                                {formatCurrency(salary.netSalary)}
                              </div>
                              <div className="text-sm text-blue-600">{settings.salarySlipLabels.fieldNames.netSalary}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
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

// Allowances Component
const AllowancesComponent = ({ employees, settings, formatCurrency }: any) => {
  const [allowances, setAllowances] = useState([
    { id: '1', name: 'Transport', rate: 20000, type: 'per_day', description: 'Tunjangan transportasi harian', active: true },
    { id: '2', name: 'Makan', rate: 25000, type: 'per_day', description: 'Tunjangan makan harian', active: true },
    { id: '3', name: 'Kesehatan', rate: 5, type: 'percentage', description: 'Tunjangan kesehatan 5% dari gaji pokok', active: true },
    { id: '4', name: 'Posisi', rate: 10, type: 'percentage', description: 'Tunjangan posisi 10% dari gaji pokok', active: true },
    { id: '5', name: 'Keahlian', rate: 500000, type: 'fixed', description: 'Tunjangan keahlian tetap', active: true },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editingAllowance, setEditingAllowance] = useState<any>(null);
  const [viewingAllowance, setViewingAllowance] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    rate: 0,
    type: 'fixed',
    description: '',
    active: true
  });

  const handleAdd = () => {
    setEditingAllowance(null);
    setFormData({ name: '', rate: 0, type: 'fixed', description: '', active: true });
    setShowModal(true);
  };

  const handleEdit = (allowance: any) => {
    setEditingAllowance(allowance);
    setFormData({
      name: allowance.name,
      rate: allowance.rate,
      type: allowance.type,
      description: allowance.description,
      active: allowance.active
    });
    setShowModal(true);
  };

  const handleView = (allowance: any) => {
    setViewingAllowance(allowance);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tunjangan ini?')) {
      setAllowances(allowances.filter(a => a.id !== id));
      alert('Tunjangan berhasil dihapus!');
    }
  };

  const handleSave = () => {
    if (!formData.name || formData.rate <= 0) {
      alert('Mohon lengkapi semua field yang diperlukan!');
      return;
    }

    if (editingAllowance) {
      setAllowances(allowances.map(a =>
        a.id === editingAllowance.id
          ? { ...a, ...formData, id: a.id }
          : a
      ));
      alert('Tunjangan berhasil diperbarui!');
    } else {
      const newAllowance = {
        ...formData,
        id: Date.now().toString()
      };
      setAllowances([...allowances, newAllowance]);
      alert('Tunjangan berhasil ditambahkan!');
    }
    setShowModal(false);
  };

  const getTypeLabel = (type: string) => {
    const types = {
      'fixed': 'Tetap',
      'percentage': 'Persentase',
      'per_day': 'Per Hari'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Tunjangan</h2>
          <p className="mt-1 text-sm text-gray-600">Kelola berbagai jenis tunjangan karyawan</p>
        </div>
        <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium shadow-lg">
          ➕ Tambah Tunjangan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allowances.map((allowance: any) => (
          <div key={allowance.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <span className="text-green-600 text-xl">💰</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{allowance.name}</h3>
                  <p className="text-sm text-gray-500">
                    {allowance.type === 'percentage' ? `${allowance.rate}%` : formatCurrency(allowance.rate)}
                    {!allowance.active && <span className="ml-2 text-red-500">(Nonaktif)</span>}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">{allowance.description}</p>
            <div className="flex space-x-2">
              <button
                onClick={() => handleView(allowance)}
                className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-100 text-sm"
              >
                View
              </button>
              <button
                onClick={() => handleEdit(allowance)}
                className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded-md hover:bg-green-100 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(allowance.id)}
                className="flex-1 bg-red-50 text-red-700 px-3 py-2 rounded-md hover:bg-red-100 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingAllowance ? 'Edit Tunjangan' : 'Tambah Tunjangan Baru'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Tunjangan</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Masukkan nama tunjangan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipe Tunjangan</label>
                  <select
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="fixed">Tetap</option>
                    <option value="percentage">Persentase</option>
                    <option value="per_day">Per Hari</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {formData.type === 'percentage' ? 'Persentase (%)' : 'Jumlah (Rp)'}
                  </label>
                  <input
                    type="number"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.rate}
                    onChange={(e) => setFormData({...formData, rate: Number(e.target.value)})}
                    placeholder="Masukkan nilai"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                  <textarea
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Masukkan deskripsi tunjangan"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                    Tunjangan aktif
                  </label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    {editingAllowance ? 'Update' : 'Tambah'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewingAllowance && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Detail Tunjangan</h3>
                <button
                  onClick={() => setViewingAllowance(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nama</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingAllowance.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipe</label>
                    <p className="mt-1 text-sm text-gray-900">{getTypeLabel(viewingAllowance.type)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nilai</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {viewingAllowance.type === 'percentage'
                        ? `${viewingAllowance.rate}%`
                        : formatCurrency(viewingAllowance.rate)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        viewingAllowance.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {viewingAllowance.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingAllowance.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Deductions Component
const DeductionsComponent = ({ employees, settings, formatCurrency }: any) => {
  const [deductions, setDeductions] = useState([
    { id: '1', name: 'Pajak Penghasilan', rate: 5, type: 'percentage', description: 'Pajak penghasilan 5% dari gaji bruto', active: true, mandatory: true },
    { id: '2', name: 'BPJS Kesehatan', rate: 1, type: 'percentage', description: 'Iuran BPJS kesehatan 1%', active: true, mandatory: true },
    { id: '3', name: 'BPJS Ketenagakerjaan', rate: 2, type: 'percentage', description: 'Iuran BPJS ketenagakerjaan 2%', active: true, mandatory: true },
    { id: '4', name: 'Koperasi', rate: 0, type: 'fixed', description: 'Potongan koperasi (jika ada)', active: false, mandatory: false },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editingDeduction, setEditingDeduction] = useState<any>(null);
  const [viewingDeduction, setViewingDeduction] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    rate: 0,
    type: 'percentage',
    description: '',
    active: true,
    mandatory: false
  });

  const handleAdd = () => {
    setEditingDeduction(null);
    setFormData({ name: '', rate: 0, type: 'percentage', description: '', active: true, mandatory: false });
    setShowModal(true);
  };

  const handleEdit = (deduction: any) => {
    setEditingDeduction(deduction);
    setFormData({
      name: deduction.name,
      rate: deduction.rate,
      type: deduction.type,
      description: deduction.description,
      active: deduction.active,
      mandatory: deduction.mandatory
    });
    setShowModal(true);
  };

  const handleView = (deduction: any) => {
    setViewingDeduction(deduction);
  };

  const handleDelete = (id: string) => {
    const deduction = deductions.find(d => d.id === id);
    if (deduction?.mandatory) {
      alert('Potongan wajib tidak dapat dihapus!');
      return;
    }
    if (window.confirm('Apakah Anda yakin ingin menghapus potongan ini?')) {
      setDeductions(deductions.filter(d => d.id !== id));
      alert('Potongan berhasil dihapus!');
    }
  };

  const handleSave = () => {
    if (!formData.name || formData.rate < 0) {
      alert('Mohon lengkapi semua field yang diperlukan!');
      return;
    }

    if (editingDeduction) {
      setDeductions(deductions.map(d =>
        d.id === editingDeduction.id
          ? { ...d, ...formData, id: d.id }
          : d
      ));
      alert('Potongan berhasil diperbarui!');
    } else {
      const newDeduction = {
        ...formData,
        id: Date.now().toString()
      };
      setDeductions([...deductions, newDeduction]);
      alert('Potongan berhasil ditambahkan!');
    }
    setShowModal(false);
  };

  const getTypeLabel = (type: string) => {
    const types = {
      'fixed': 'Tetap',
      'percentage': 'Persentase'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Potongan</h2>
          <p className="mt-1 text-sm text-gray-600">Kelola berbagai jenis potongan gaji</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium shadow-lg"
        >
          ➕ Tambah Potongan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deductions.map((deduction: any) => (
          <div key={deduction.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="bg-red-100 p-2 rounded-lg mr-3">
                  <span className="text-red-600 text-xl">🔻</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{deduction.name}</h3>
                  <p className="text-sm text-gray-500">
                    {deduction.type === 'percentage' ? `${deduction.rate}%` : formatCurrency(deduction.rate)}
                    {deduction.mandatory && <span className="ml-2 text-red-500">(Wajib)</span>}
                    {!deduction.active && <span className="ml-2 text-gray-500">(Nonaktif)</span>}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">{deduction.description}</p>
            <div className="flex space-x-2">
              <button
                onClick={() => handleView(deduction)}
                className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-100 text-sm"
              >
                View
              </button>
              <button
                onClick={() => handleEdit(deduction)}
                className="flex-1 bg-yellow-50 text-yellow-700 px-3 py-2 rounded-md hover:bg-yellow-100 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(deduction.id)}
                disabled={deduction.mandatory}
                className="flex-1 bg-gray-50 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal - Similar structure as AllowancesComponent */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingDeduction ? 'Edit Potongan' : 'Tambah Potongan Baru'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Potongan</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Masukkan nama potongan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipe Potongan</label>
                  <select
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="percentage">Persentase</option>
                    <option value="fixed">Tetap</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {formData.type === 'percentage' ? 'Persentase (%)' : 'Jumlah (Rp)'}
                  </label>
                  <input
                    type="number"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.rate}
                    onChange={(e) => setFormData({...formData, rate: Number(e.target.value)})}
                    placeholder="Masukkan nilai"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                  <textarea
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Masukkan deskripsi potongan"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="active"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={formData.active}
                      onChange={(e) => setFormData({...formData, active: e.target.checked})}
                    />
                    <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                      Potongan aktif
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="mandatory"
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      checked={formData.mandatory}
                      onChange={(e) => setFormData({...formData, mandatory: e.target.checked})}
                    />
                    <label htmlFor="mandatory" className="ml-2 block text-sm text-gray-900">
                      Potongan wajib (tidak dapat dihapus)
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    {editingDeduction ? 'Update' : 'Tambah'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal - Similar structure as AllowancesComponent */}
      {viewingDeduction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Detail Potongan</h3>
                <button
                  onClick={() => setViewingDeduction(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nama</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingDeduction.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipe</label>
                    <p className="mt-1 text-sm text-gray-900">{getTypeLabel(viewingDeduction.type)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nilai</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {viewingDeduction.type === 'percentage'
                        ? `${viewingDeduction.rate}%`
                        : formatCurrency(viewingDeduction.rate)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        viewingDeduction.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {viewingDeduction.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                      {viewingDeduction.mandatory && (
                        <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Wajib
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingDeduction.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Bonuses Component
const BonusesComponent = ({ employees, settings, formatCurrency }: any) => {
  const [bonuses, setBonuses] = useState([
    { id: '1', name: 'Bonus Kinerja', amount: 1000000, type: 'performance', description: 'Bonus berdasarkan evaluasi kinerja', frequency: 'monthly', active: true, criteria: 'Rating ≥ 4.0' },
    { id: '2', name: 'Bonus Tahunan', amount: 2000000, type: 'annual', description: 'Bonus akhir tahun atau THR', frequency: 'annual', active: true, criteria: '1 tahun masa kerja' },
    { id: '3', name: 'Bonus Hari Raya', amount: 1500000, type: 'holiday', description: 'Bonus hari raya keagamaan', frequency: 'on-demand', active: true, criteria: 'Hari raya keagamaan' },
    { id: '4', name: 'Bonus Kehadiran', amount: 500000, type: 'attendance', description: 'Bonus untuk kehadiran perfect', frequency: 'monthly', active: true, criteria: '100% kehadiran' },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editingBonus, setEditingBonus] = useState<any>(null);
  const [viewingBonus, setViewingBonus] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: 0,
    type: 'performance',
    description: '',
    frequency: 'monthly',
    criteria: '',
    active: true
  });

  const handleAdd = () => {
    setEditingBonus(null);
    setFormData({ name: '', amount: 0, type: 'performance', description: '', frequency: 'monthly', criteria: '', active: true });
    setShowModal(true);
  };

  const handleEdit = (bonus: any) => {
    setEditingBonus(bonus);
    setFormData({
      name: bonus.name,
      amount: bonus.amount,
      type: bonus.type,
      description: bonus.description,
      frequency: bonus.frequency,
      criteria: bonus.criteria,
      active: bonus.active
    });
    setShowModal(true);
  };

  const handleView = (bonus: any) => {
    setViewingBonus(bonus);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus bonus ini?')) {
      setBonuses(bonuses.filter(b => b.id !== id));
      alert('Bonus berhasil dihapus!');
    }
  };

  const handleSave = () => {
    if (!formData.name || formData.amount <= 0) {
      alert('Mohon lengkapi semua field yang diperlukan!');
      return;
    }

    if (editingBonus) {
      setBonuses(bonuses.map(b =>
        b.id === editingBonus.id
          ? { ...b, ...formData, id: b.id }
          : b
      ));
      alert('Bonus berhasil diperbarui!');
    } else {
      const newBonus = {
        ...formData,
        id: Date.now().toString()
      };
      setBonuses([...bonuses, newBonus]);
      alert('Bonus berhasil ditambahkan!');
    }
    setShowModal(false);
  };

  const getTypeLabel = (type: string) => {
    const types = {
      'performance': 'Kinerja',
      'annual': 'Tahunan',
      'holiday': 'Hari Raya',
      'attendance': 'Kehadiran',
      'other': 'Lainnya'
    };
    return types[type as keyof typeof types] || type;
  };

  const getFrequencyLabel = (frequency: string) => {
    const frequencies = {
      'monthly': 'Bulanan',
      'quarterly': 'Per 3 Bulan',
      'annual': 'Tahunan',
      'on-demand': 'Sesuai Kebutuhan'
    };
    return frequencies[frequency as keyof typeof frequencies] || frequency;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Bonus</h2>
          <p className="mt-1 text-sm text-gray-600">Kelola berbagai jenis bonus karyawan</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 font-medium shadow-lg"
        >
          ➕ Tambah Bonus
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bonuses.map((bonus: any) => (
          <div key={bonus.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                  <span className="text-yellow-600 text-xl">🎁</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{bonus.name}</h3>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(bonus.amount)} - {getFrequencyLabel(bonus.frequency)}
                    {!bonus.active && <span className="ml-2 text-red-500">(Nonaktif)</span>}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-2">{bonus.description}</p>
            <p className="text-xs text-gray-500 mb-4">
              <strong>Kriteria:</strong> {bonus.criteria}
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => handleView(bonus)}
                className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-100 text-sm"
              >
                View
              </button>
              <button
                onClick={() => handleEdit(bonus)}
                className="flex-1 bg-yellow-50 text-yellow-700 px-3 py-2 rounded-md hover:bg-yellow-100 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(bonus.id)}
                className="flex-1 bg-red-50 text-red-700 px-3 py-2 rounded-md hover:bg-red-100 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingBonus ? 'Edit Bonus' : 'Tambah Bonus Baru'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Bonus</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Masukkan nama bonus"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipe Bonus</label>
                  <select
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="performance">Kinerja</option>
                    <option value="annual">Tahunan</option>
                    <option value="holiday">Hari Raya</option>
                    <option value="attendance">Kehadiran</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Jumlah Bonus (Rp)</label>
                  <input
                    type="number"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                    placeholder="Masukkan jumlah bonus"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Frekuensi</label>
                  <select
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                  >
                    <option value="monthly">Bulanan</option>
                    <option value="quarterly">Per 3 Bulan</option>
                    <option value="annual">Tahunan</option>
                    <option value="on-demand">Sesuai Kebutuhan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kriteria</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.criteria}
                    onChange={(e) => setFormData({...formData, criteria: e.target.value})}
                    placeholder="Masukkan criteria bonus"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                  <textarea
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Masukkan deskripsi bonus"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                    Bonus aktif
                  </label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
                  >
                    {editingBonus ? 'Update' : 'Tambah'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewingBonus && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Detail Bonus</h3>
                <button
                  onClick={() => setViewingBonus(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nama</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingBonus.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipe</label>
                    <p className="mt-1 text-sm text-gray-900">{getTypeLabel(viewingBonus.type)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Jumlah</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(viewingBonus.amount)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Frekuensi</label>
                    <p className="mt-1 text-sm text-gray-900">{getFrequencyLabel(viewingBonus.frequency)}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Kriteria</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingBonus.criteria}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        viewingBonus.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {viewingBonus.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingBonus.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Payroll Config Component
const PayrollConfigComponent = ({ settings, onDataChange }: any) => {
  const [showModal, setShowModal] = useState(false);
  const [viewingConfig, setViewingConfig] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [config, setConfig] = useState({
    workingHoursPerDay: 8,
    workingDaysPerMonth: 22,
    overtimeMultiplier: 1.5,
    standardOvertimeThreshold: 40,
    monthlyTaxExemption: 4500000,
    transportAllowanceRate: 20000,
    mealAllowanceRate: 25000,
  });

  const [savedConfigs, setSavedConfigs] = useState([
    {
      id: '1',
      name: 'Konfigurasi Default',
      workingHoursPerDay: 8,
      workingDaysPerMonth: 22,
      overtimeMultiplier: 1.5,
      standardOvertimeThreshold: 40,
      monthlyTaxExemption: 4500000,
      transportAllowanceRate: 20000,
      mealAllowanceRate: 25000,
      createdAt: '2024-01-01',
      active: true
    }
  ]);

  const handleView = (configItem: any) => {
    setSelectedConfig(configItem);
    setViewingConfig(true);
  };

  const handleEdit = (configItem: any) => {
    setSelectedConfig(configItem);
    setConfig({...configItem});
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    const configItem = savedConfigs.find(c => c.id === id);
    if (configItem?.active) {
      alert('Konfigurasi aktif tidak dapat dihapus!');
      return;
    }
    if (window.confirm('Apakah Anda yakin ingin menghapus konfigurasi ini?')) {
      setSavedConfigs(savedConfigs.filter(c => c.id !== id));
      alert('Konfigurasi berhasil dihapus!');
    }
  };

  const handleSave = () => {
    // Save config logic here
    alert('Konfigurasi payroll berhasil disimpan!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Konfigurasi Payroll</h2>
          <p className="mt-1 text-sm text-gray-600">Atur parameter perhitungan gaji</p>
        </div>
        <div className="space-x-3">
          <button
            onClick={() => setSelectedConfig(null)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium shadow-lg"
          >
            ➕ Tambah Konfigurasi
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium shadow-lg"
          >
            💾 Simpan Konfigurasi
          </button>
        </div>
      </div>

      {/* Saved Configurations List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Konfigurasi Tersimpan</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {savedConfigs.map((configItem: any) => (
            <div key={configItem.id} className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-md font-medium text-gray-900">{configItem.name}</h4>
                  <p className="text-sm text-gray-500">
                    Dibuat: {configItem.createdAt} |
                    {configItem.active && <span className="ml-2 text-green-600 font-medium">Aktif</span>}
                    {!configItem.active && <span className="ml-2 text-gray-500">Nonaktif</span>}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleView(configItem)}
                    className="bg-blue-50 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-100 text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(configItem)}
                    className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-md hover:bg-yellow-100 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(configItem.id)}
                    disabled={configItem.active}
                    className="bg-red-50 text-red-700 px-4 py-2 rounded-md hover:bg-red-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedConfig ? 'Edit Konfigurasi' : 'Tambah Konfigurasi Baru'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jam Kerja per Hari</label>
                  <input
                    type="number"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={config.workingHoursPerDay}
                    onChange={(e) => setConfig({...config, workingHoursPerDay: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hari Kerja per Bulan</label>
                  <input
                    type="number"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={config.workingDaysPerMonth}
                    onChange={(e) => setConfig({...config, workingDaysPerMonth: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Multiplier Lembur</label>
                  <input
                    type="number"
                    step="0.1"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={config.overtimeMultiplier}
                    onChange={(e) => setConfig({...config, overtimeMultiplier: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batas Lembur Standar (jam/bulan)</label>
                  <input
                    type="number"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={config.standardOvertimeThreshold}
                    onChange={(e) => setConfig({...config, standardOvertimeThreshold: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rate Tunjangan Transport (per hari)</label>
                  <input
                    type="number"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={config.transportAllowanceRate}
                    onChange={(e) => setConfig({...config, transportAllowanceRate: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rate Tunjangan Makan (per hari)</label>
                  <input
                    type="number"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={config.mealAllowanceRate}
                    onChange={(e) => setConfig({...config, mealAllowanceRate: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  {selectedConfig ? 'Update' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewingConfig && selectedConfig && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Detail Konfigurasi</h3>
                <button
                  onClick={() => setViewingConfig(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Jam Kerja/Hari</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedConfig.workingHoursPerDay} jam</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hari Kerja/Bulan</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedConfig.workingDaysPerMonth} hari</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Multiplier Lembur</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedConfig.overtimeMultiplier}x</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Batas Lembur</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedConfig.standardOvertimeThreshold} jam/bulan</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tunjangan Transport</label>
                  <p className="mt-1 text-sm text-gray-900">Rp {selectedConfig.transportAllowanceRate.toLocaleString()}/hari</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tunjangan Makan</label>
                  <p className="mt-1 text-sm text-gray-900">Rp {selectedConfig.mealAllowanceRate.toLocaleString()}/hari</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Salary Structure Component
const SalaryStructureComponent = ({ employees, formatCurrency }: any) => {
  const [salaryStructures, setSalaryStructures] = useState([
    { id: '1', level: 'Junior', position: 'Software Developer', minSalary: 6000000, maxSalary: 8000000, baseSalary: 7000000, active: true },
    { id: '2', level: 'Senior', position: 'Software Developer', minSalary: 9000000, maxSalary: 12000000, baseSalary: 10500000, active: true },
    { id: '3', level: 'Lead', position: 'Software Developer', minSalary: 13000000, maxSalary: 16000000, baseSalary: 14500000, active: true },
    { id: '4', level: 'Junior', position: 'UI/UX Designer', minSalary: 5000000, maxSalary: 7000000, baseSalary: 6000000, active: true },
    { id: '5', level: 'Senior', position: 'UI/UX Designer', minSalary: 8000000, maxSalary: 10000000, baseSalary: 9000000, active: true },
    { id: '6', level: 'Intern', position: 'Software Developer', minSalary: 2000000, maxSalary: 3000000, baseSalary: 2500000, active: false },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editingStructure, setEditingStructure] = useState<any>(null);
  const [viewingStructure, setViewingStructure] = useState<any>(null);
  const [formData, setFormData] = useState({
    level: '',
    position: '',
    minSalary: 0,
    maxSalary: 0,
    baseSalary: 0,
    active: true
  });

  const handleAdd = () => {
    setEditingStructure(null);
    setFormData({ level: '', position: '', minSalary: 0, maxSalary: 0, baseSalary: 0, active: true });
    setShowModal(true);
  };

  const handleEdit = (structure: any) => {
    setEditingStructure(structure);
    setFormData({
      level: structure.level,
      position: structure.position,
      minSalary: structure.minSalary,
      maxSalary: structure.maxSalary,
      baseSalary: structure.baseSalary,
      active: structure.active
    });
    setShowModal(true);
  };

  const handleView = (structure: any) => {
    setViewingStructure(structure);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus struktur gaji ini?')) {
      setSalaryStructures(salaryStructures.filter(s => s.id !== id));
      alert('Struktur gaji berhasil dihapus!');
    }
  };

  const handleSave = () => {
    if (!formData.level || !formData.position || formData.minSalary <= 0 || formData.maxSalary <= 0) {
      alert('Mohon lengkapi semua field yang diperlukan!');
      return;
    }

    if (formData.minSalary >= formData.maxSalary) {
      alert('Gaji maksimal harus lebih besar dari gaji minimal!');
      return;
    }

    if (editingStructure) {
      setSalaryStructures(salaryStructures.map(s =>
        s.id === editingStructure.id
          ? { ...s, ...formData, id: s.id }
          : s
      ));
      alert('Struktur gaji berhasil diperbarui!');
    } else {
      const newStructure = {
        ...formData,
        id: Date.now().toString()
      };
      setSalaryStructures([...salaryStructures, newStructure]);
      alert('Struktur gaji berhasil ditambahkan!');
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Struktur Gaji</h2>
          <p className="mt-1 text-sm text-gray-600">Kelola struktur salary berdasarkan level dan posisi</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 font-medium shadow-lg"
        >
          ➕ Tambah Level
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posisi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gaji Min</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gaji Max</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gaji Pokok</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {salaryStructures.map((structure: any) => (
              <tr key={structure.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{structure.level}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{structure.position}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(structure.minSalary)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(structure.maxSalary)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(structure.baseSalary)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    structure.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {structure.active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleView(structure)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(structure)}
                    className="text-yellow-600 hover:text-yellow-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(structure.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingStructure ? 'Edit Struktur Gaji' : 'Tambah Struktur Gaji Baru'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Level</label>
                  <select
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.level}
                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                  >
                    <option value="">Pilih Level</option>
                    <option value="Intern">Intern</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                    <option value="Manager">Manager</option>
                    <option value="Director">Director</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Posisi</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    placeholder="Masukkan nama posisi"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gaji Min (Rp)</label>
                    <input
                      type="number"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={formData.minSalary}
                      onChange={(e) => setFormData({...formData, minSalary: Number(e.target.value)})}
                      placeholder="Min salary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gaji Max (Rp)</label>
                    <input
                      type="number"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={formData.maxSalary}
                      onChange={(e) => setFormData({...formData, maxSalary: Number(e.target.value)})}
                      placeholder="Max salary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gaji Pokok (Rp)</label>
                    <input
                      type="number"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={formData.baseSalary}
                      onChange={(e) => setFormData({...formData, baseSalary: Number(e.target.value)})}
                      placeholder="Base salary"
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                    Struktur gaji aktif
                  </label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                  >
                    {editingStructure ? 'Update' : 'Tambah'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewingStructure && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Detail Struktur Gaji</h3>
                <button
                  onClick={() => setViewingStructure(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Level</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingStructure.level}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Posisi</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingStructure.position}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gaji Minimal</label>
                  <p className="mt-1 text-sm text-gray-900">{formatCurrency(viewingStructure.minSalary)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gaji Maksimal</label>
                  <p className="mt-1 text-sm text-gray-900">{formatCurrency(viewingStructure.maxSalary)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gaji Pokok</label>
                  <p className="mt-1 text-sm text-gray-900">{formatCurrency(viewingStructure.baseSalary)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      viewingStructure.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {viewingStructure.active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Range Salary</p>
                    <p className="text-sm font-medium text-gray-900">
                      {((viewingStructure.maxSalary - viewingStructure.minSalary) / viewingStructure.minSalary * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Midpoint</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency((viewingStructure.minSalary + viewingStructure.maxSalary) / 2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Position in Range</p>
                    <p className="text-sm font-medium text-gray-900">
                      {((viewingStructure.baseSalary - viewingStructure.minSalary) / (viewingStructure.maxSalary - viewingStructure.minSalary) * 100).toFixed(1)}%
                    </p>
                  </div>
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