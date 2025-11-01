import React, { useState, useEffect, useCallback } from 'react';
import { getFromStorage, setToStorage } from '../utils/storage';
import { Employee } from '../utils/types';
import TabbedEmployeeForm from '../components/TabbedEmployeeForm';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const filterEmployees = useCallback(() => {
    let filtered = employees;

    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }

    setFilteredEmployees(filtered);
  }, [employees, searchTerm, departmentFilter]);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, departmentFilter, filterEmployees]);

  const loadEmployees = () => {
    const data = getFromStorage('employees') || [];
    setEmployees(data);
  };


  const handleSave = (employeeData: Employee) => {
    if (editingEmployee) {
      // Update existing employee
      const updatedEmployees = employees.map(emp =>
        emp.id === editingEmployee.id ? employeeData : emp
      );
      setEmployees(updatedEmployees);
      setToStorage('employees', updatedEmployees);
    } else {
      // Add new employee
      const updatedEmployees = [...employees, employeeData];
      setEmployees(updatedEmployees);
      setToStorage('employees', updatedEmployees);
    }

    setShowForm(false);
    setEditingEmployee(null);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      const updatedEmployees = employees.filter(emp => emp.id !== id);
      setEmployees(updatedEmployees);
      setToStorage('employees', updatedEmployees);
    }
  };

  const handleAddNew = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  const departments = Array.from(new Set(employees.map(emp => emp.department))).filter(Boolean);

  // If showing form, render the TabbedEmployeeForm
  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            {editingEmployee ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}
          </h1>
          <button
            onClick={handleCancel}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Kembali ke Daftar
          </button>
        </div>
        
        <TabbedEmployeeForm
          employee={editingEmployee || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Manajemen Karyawan</h1>
          <p className="mt-1 text-sm text-gray-600">Kelola data karyawan perusahaan dengan sistem tabbed form yang komprehensif</p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Tambah Karyawan
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Sistem Tabbed Form Karyawan
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Tab 1: Informasi Utama - Data dasar karyawan</li>
                <li>Tab 2: Detail Personal - Data personal, alamat, keluarga</li>
                <li>Tab 3: Riwayat Pendidikan - Background pendidikan</li>
                <li>Tab 4: Kompetensi & Skills - Skill dan sertifikasi</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Cari Karyawan
            </label>
            <input
              type="text"
              id="search"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Nama, email, atau posisi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Filter Departemen
            </label>
            <select
              id="department"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">Semua Departemen</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredEmployees.map((employee) => (
            <li key={employee.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {employee.photoUrl ? (
                      <img
                        src={employee.photoUrl}
                        alt="Employee"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {employee.name ? employee.name.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                    <div className="text-sm font-bold" style={{ color: '#8AB9F1' }}>
                      {employee.position} - {employee.department}
                    </div>
                    {employee.nip && <div className="text-sm text-gray-500">NIK: {employee.nip}</div>}
                    <div className="text-sm text-gray-500">{employee.email}</div>
                    {employee.phone && <div className="text-sm text-gray-500">
                      {employee.phone.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}
                    </div>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    employee.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                  <button
                    onClick={() => handleEdit(employee)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(employee.id)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {filteredEmployees.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Tidak ada karyawan ditemukan</p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{employees.length}</div>
          <div className="text-sm text-gray-500">Total Karyawan</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {employees.filter(emp => emp.status === 'active').length}
          </div>
          <div className="text-sm text-gray-500">Karyawan Aktif</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">
            {employees.filter(emp => emp.status === 'inactive').length}
          </div>
          <div className="text-sm text-gray-500">Karyawan Non-Aktif</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{departments.length}</div>
          <div className="text-sm text-gray-500">Total Departemen</div>
        </div>
      </div>
    </div>
  );
};

export default Employees;