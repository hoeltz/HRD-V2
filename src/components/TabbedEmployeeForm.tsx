import React, { useState } from 'react';
import { Employee } from '../utils/types';

interface TabbedEmployeeFormProps {
  employee?: Employee;
  onSave: (employee: Employee) => void;
  onCancel: () => void;
}

const TabbedEmployeeForm: React.FC<TabbedEmployeeFormProps> = ({ 
  employee, 
  onSave, 
  onCancel 
}) => {
  const [activeTab, setActiveTab] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Employee>>({
    id: employee?.id || '',
    name: employee?.name || '',
    email: employee?.email || '',
    position: employee?.position || '',
    department: employee?.department || '',
    joinDate: employee?.joinDate || '',
    phone: employee?.phone || '',
    birthDate: employee?.birthDate || '',
    status: employee?.status || 'active',
    salary: employee?.salary || 0,
    nip: employee?.nip || '',
    photoUrl: employee?.photoUrl || '',
  });

  // Personal Details (extended fields)
  const [personalDetails, setPersonalDetails] = useState({
    nik: '',
    npwp: '',
    birthPlace: '',
    gender: 'male' as 'male' | 'female',
    maritalStatus: 'single' as 'single' | 'married' | 'divorced' | 'widowed',
    religion: '',
    bloodType: '',
    address: '',
    rtRw: '',
    village: '',
    subDistrict: '',
    city: '',
    province: '',
    postalCode: '',
    spouseName: '',
    spouseJob: '',
    numberOfChildren: 0,
    childrenNames: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
  });

  // Education data
  const [education, setEducation] = useState([
    {
      id: '1',
      level: 'sma' as 'sd' | 'smp' | 'sma' | 'smk' | 'diploma' | 's1' | 's2' | 's3',
      institutionName: '',
      major: '',
      entryYear: '',
      graduationYear: '',
      grade: '',
      description: ''
    }
  ]);

  // Skills data
  const [skills, setSkills] = useState([
    {
      id: '1',
      name: '',
      type: 'hard' as 'hard' | 'soft' | 'language' | 'license',
      level: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
      description: '',
      certificate: false,
      certificateNumber: '',
      validUntil: ''
    }
  ]);

  const handleSave = () => {
    if (editingIndex >= 0) {
      // Update existing education
      const updated = [...education];
      updated[editingIndex] = { ...edu, id: education[editingIndex].id };
      setEducation(updated);
    } else {
      // Add new education
      const newEdu = { ...edu, id: Date.now().toString() };
      setEducation([...education, newEdu]);
    }
    setShowEducationModal(false);
    setEditingIndex(-1);
    setEdu({
      level: 'sma',
      institutionName: '',
      major: '',
      entryYear: '',
      graduationYear: '',
      grade: '',
      description: ''
    });
  };

  const handleDeleteEducation = (id: string) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  const [showEducationModal, setShowEducationModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [edu, setEdu] = useState({
    level: 'sma' as 'sd' | 'smp' | 'sma' | 'smk' | 'diploma' | 's1' | 's2' | 's3',
    institutionName: '',
    major: '',
    entryYear: '',
    graduationYear: '',
    grade: '',
    description: ''
  });

  const handleEditEducation = (educationItem: any, index: number) => {
    setEdu(educationItem);
    setEditingIndex(index);
    setShowEducationModal(true);
  };

  // Skills management
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [editingSkillIndex, setEditingSkillIndex] = useState(-1);
  const [skill, setSkill] = useState({
    name: '',
    type: 'hard' as 'hard' | 'soft' | 'language' | 'license',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    description: '',
    certificate: false,
    certificateNumber: '',
    validUntil: ''
  });

  const handleSaveSkill = () => {
    if (editingSkillIndex >= 0) {
      // Update existing skill
      const updated = [...skills];
      updated[editingSkillIndex] = { ...skill, id: skills[editingSkillIndex].id };
      setSkills(updated);
    } else {
      // Add new skill
      const newSkill = { ...skill, id: Date.now().toString() };
      setSkills([...skills, newSkill]);
    }
    setShowSkillModal(false);
    setEditingSkillIndex(-1);
    setSkill({
      name: '',
      type: 'hard',
      level: 'beginner',
      description: '',
      certificate: false,
      certificateNumber: '',
      validUntil: ''
    });
  };

  const handleDeleteSkill = (id: string) => {
    setSkills(skills.filter(s => s.id !== id));
  };

  const handleEditSkill = (skillItem: any, index: number) => {
    setSkill(skillItem);
    setEditingSkillIndex(index);
    setShowSkillModal(true);
  };

  const tabs = [
    { name: 'Informasi Utama', icon: '📋' },
    { name: 'Detail Personal', icon: '👤' },
    { name: 'Riwayat Pendidikan', icon: '🎓' },
    { name: 'Kompetensi & Skills', icon: '💼' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <div className="space-y-8">
            <h3 className="text-lg font-medium text-gray-900">Informasi Utama Karyawan</h3>
            
            {/* Photo Upload Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-md font-medium text-gray-800 mb-3">Foto Karyawan</h4>
              <div className="flex items-center space-x-4">
                {formData.photoUrl ? (
                  <img
                    src={formData.photoUrl}
                    alt="Employee"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600 text-2xl">
                      {formData.name ? formData.name.charAt(0).toUpperCase() : '👤'}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <label className="block">
                    <span className="sr-only">Pilih Foto</span>
                    <input
                      type="file"
                      accept="image/jpeg"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 40 * 1024 * 1024) { // 40MB
                            alert('File terlalu besar. Maksimal 40MB.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setFormData({...formData, photoUrl: event.target?.result as string});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Format: JPEG, Maksimal 40MB</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NIP (Nomor Induk Pegawai) *</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan NIP"
                  className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                  value={formData.nip}
                  onChange={(e) => setFormData({...formData, nip: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap"
                  className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="contoh@email.com"
                  className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Posisi/Jabatan *</label>
                <select
                  required
                  className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                >
                  <option value="">Pilih Posisi</option>
                  <option value="CEO/Direktur Utama">CEO/Direktur Utama</option>
                  <option value="Manager">Manager</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Staff">Staff</option>
                  <option value="Admin">Admin</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="HRD">HRD</option>
                  <option value="IT Support">IT Support</option>
                  <option value="Produksi">Produksi</option>
                  <option value="Quality Control">Quality Control</option>
                  <option value="Gudang">Gudang</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Departemen *</label>
                <select
                  required
                  className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                >
                  <option value="">Pilih Departemen</option>
                  <option value="Manajemen Atas">Manajemen Atas</option>
                  <option value="Sumber Daya Manusia">Sumber Daya Manusia</option>
                  <option value="Keuangan & Akuntansi">Keuangan & Akuntansi</option>
                  <option value="Marketing & Sales">Marketing & Sales</option>
                  <option value="Operasional">Operasional</option>
                  <option value="Produksi">Produksi</option>
                  <option value="Quality Control">Quality Control</option>
                  <option value="Gudang & Logistik">Gudang & Logistik</option>
                  <option value="Teknologi Informasi">Teknologi Informasi</option>
                  <option value="Administrasi">Administrasi</option>
                  <option value="Pelayanan Pelanggan">Pelayanan Pelanggan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Bergabung *</label>
                <input
                  type="date"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon *</label>
                <input
                  type="tel"
                  required
                  placeholder="08123456789"
                  className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir *</label>
                <input
                  type="date"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gaji Pokok</label>
                <select
                  className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: parseInt(e.target.value) || 0})}
                >
                  <option value="">Pilih Range Gaji</option>
                  <option value="3000000">Rp 3.000.000 - Rp 5.000.000</option>
                  <option value="5000000">Rp 5.000.000 - Rp 7.500.000</option>
                  <option value="7500000">Rp 7.500.000 - Rp 10.000.000</option>
                  <option value="10000000">Rp 10.000.000 - Rp 15.000.000</option>
                  <option value="15000000">Rp 15.000.000 - Rp 20.000.000</option>
                  <option value="20000000">Rp 20.000.000 - Rp 30.000.000</option>
                  <option value="30000000">Rp 30.000.000+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Karyawan</label>
                <select
                  className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8">
            <h3 className="text-lg font-medium text-gray-900">Detail Personal & Keluarga</h3>
            
            <div className="space-y-8">
              {/* Basic Personal Info */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-md font-medium text-gray-800 mb-6">Data Pribadi</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">NPWP</label>
                    <input
                      type="text"
                      placeholder="Masukkan NPWP"
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                      value={personalDetails.npwp}
                      onChange={(e) => setPersonalDetails({...personalDetails, npwp: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tempat Lahir</label>
                    <select
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                      value={personalDetails.birthPlace}
                      onChange={(e) => setPersonalDetails({...personalDetails, birthPlace: e.target.value})}
                    >
                      <option value="">Pilih Kota Kelahiran</option>
                      <option value="Jakarta">Jakarta</option>
                      <option value="Bandung">Bandung</option>
                      <option value="Surabaya">Surabaya</option>
                      <option value="Medan">Medan</option>
                      <option value="Semarang">Semarang</option>
                      <option value="Palembang">Palembang</option>
                      <option value="Makassar">Makassar</option>
                      <option value="Tangerang">Tangerang</option>
                      <option value="Bekasi">Bekasi</option>
                      <option value="Bogor">Bogor</option>
                      <option value="Depok">Depok</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
                    <select
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                      value={personalDetails.gender}
                      onChange={(e) => setPersonalDetails({...personalDetails, gender: e.target.value as 'male' | 'female'})}
                    >
                      <option value="male">Laki-laki</option>
                      <option value="female">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status Perkawinan</label>
                    <select
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                      value={personalDetails.maritalStatus}
                      onChange={(e) => setPersonalDetails({...personalDetails, maritalStatus: e.target.value as any})}
                    >
                      <option value="single">Belum Menikah</option>
                      <option value="married">Menikah</option>
                      <option value="divorced">Cerai</option>
                      <option value="widowed">Janda/Duda</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Agama</label>
                    <select
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                      value={personalDetails.religion}
                      onChange={(e) => setPersonalDetails({...personalDetails, religion: e.target.value})}
                    >
                      <option value="">Pilih Agama</option>
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Khong Hu Cu">Khong Hu Cu</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Golongan Darah</label>
                    <select
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                      value={personalDetails.bloodType}
                      onChange={(e) => setPersonalDetails({...personalDetails, bloodType: e.target.value})}
                    >
                      <option value="">Pilih Golongan Darah</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                      <option value="Tidak Tahu">Tidak Tahu</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-md font-medium text-gray-800 mb-6">Alamat</h4>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap</label>
                    <textarea
                      rows={3}
                      placeholder="Masukkan alamat lengkap"
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                      value={personalDetails.address}
                      onChange={(e) => setPersonalDetails({...personalDetails, address: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">RT/RW</label>
                      <input
                        type="text"
                        placeholder="Contoh: 001/002"
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                        value={personalDetails.rtRw}
                        onChange={(e) => setPersonalDetails({...personalDetails, rtRw: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Desa/Kelurahan</label>
                      <input
                        type="text"
                        placeholder="Nama desa/kelurahan"
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                        value={personalDetails.village}
                        onChange={(e) => setPersonalDetails({...personalDetails, village: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kecamatan</label>
                      <input
                        type="text"
                        placeholder="Nama kecamatan"
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                        value={personalDetails.subDistrict}
                        onChange={(e) => setPersonalDetails({...personalDetails, subDistrict: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kota/Kabupaten</label>
                      <select
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                        value={personalDetails.city}
                        onChange={(e) => setPersonalDetails({...personalDetails, city: e.target.value})}
                      >
                        <option value="">Pilih Kota/Kabupaten</option>
                        <option value="Jakarta">Jakarta</option>
                        <option value="Bandung">Bandung</option>
                        <option value="Surabaya">Surabaya</option>
                        <option value="Medan">Medan</option>
                        <option value="Semarang">Semarang</option>
                        <option value="Palembang">Palembang</option>
                        <option value="Makassar">Makassar</option>
                        <option value="Tangerang">Tangerang</option>
                        <option value="Bekasi">Bekasi</option>
                        <option value="Bogor">Bogor</option>
                        <option value="Depok">Depok</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Provinsi</label>
                      <select
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                        value={personalDetails.province}
                        onChange={(e) => setPersonalDetails({...personalDetails, province: e.target.value})}
                      >
                        <option value="">Pilih Provinsi</option>
                        <option value="DKI Jakarta">DKI Jakarta</option>
                        <option value="Jawa Barat">Jawa Barat</option>
                        <option value="Jawa Tengah">Jawa Tengah</option>
                        <option value="Jawa Timur">Jawa Timur</option>
                        <option value="Sumatera Utara">Sumatera Utara</option>
                        <option value="Sumatera Barat">Sumatera Barat</option>
                        <option value="Sumatera Selatan">Sumatera Selatan</option>
                        <option value="Bengkulu">Bengkulu</option>
                        <option value="Riau">Riau</option>
                        <option value="Lampung">Lampung</option>
                        <option value="Banten">Banten</option>
                        <option value="DI Yogyakarta">DI Yogyakarta</option>
                        <option value="Kalimantan Barat">Kalimantan Barat</option>
                        <option value="Kalimantan Timur">Kalimantan Timur</option>
                        <option value="Kalimantan Selatan">Kalimantan Selatan</option>
                        <option value="Kalimantan Utara">Kalimantan Utara</option>
                        <option value="Kalimantan Tengah">Kalimantan Tengah</option>
                        <option value="Sulawesi Selatan">Sulawesi Selatan</option>
                        <option value="Sulawesi Utara">Sulawesi Utara</option>
                        <option value="Sulawesi Tengah">Sulawesi Tengah</option>
                        <option value="Sulawesi Tenggara">Sulawesi Tenggara</option>
                        <option value="Gorontalo">Gorontalo</option>
                        <option value="Sulawesi Barat">Sulawesi Barat</option>
                        <option value="Bali">Bali</option>
                        <option value="Nusa Tenggara Barat">Nusa Tenggara Barat</option>
                        <option value="Nusa Tenggara Timur">Nusa Tenggara Timur</option>
                        <option value="Maluku">Maluku</option>
                        <option value="Maluku Utara">Maluku Utara</option>
                        <option value="Papua">Papua</option>
                        <option value="Papua Barat">Papua Barat</option>
                        <option value="Papua Tengah">Papua Tengah</option>
                        <option value="Papua Pegunungan">Papua Pegunungan</option>
                        <option value="Papua Selatan">Papua Selatan</option>
                        <option value="Aceh">Aceh</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kode Pos</label>
                      <input
                        type="text"
                        placeholder="12345"
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                        value={personalDetails.postalCode}
                        onChange={(e) => setPersonalDetails({...personalDetails, postalCode: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Family Info */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-md font-medium text-gray-800 mb-6">Data Keluarga</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Pasangan</label>
                    <input
                      type="text"
                      placeholder="Nama pasangan (suami/istri)"
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                      value={personalDetails.spouseName}
                      onChange={(e) => setPersonalDetails({...personalDetails, spouseName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pekerjaan Pasangan</label>
                    <select
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                      value={personalDetails.spouseJob}
                      onChange={(e) => setPersonalDetails({...personalDetails, spouseJob: e.target.value})}
                    >
                      <option value="">Pilih Pekerjaan</option>
                      <option value="PNS">PNS</option>
                      <option value="Guru">Guru</option>
                      <option value="Dosen">Dosen</option>
                      <option value="Dokter">Dokter</option>
                      <option value="Perawat">Perawat</option>
                      <option value="Teknisi">Teknisi</option>
                      <option value="Montir">Montir</option>
                      <option value="Sales">Sales</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="CEO/Direktur">CEO/Direktur</option>
                      <option value="Wiraswasta">Wiraswasta</option>
                      <option value="IRT (Ibu Rumah Tangga)">IRT (Ibu Rumah Tangga)</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Anak</label>
                    <select
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                      value={personalDetails.numberOfChildren}
                      onChange={(e) => setPersonalDetails({...personalDetails, numberOfChildren: parseInt(e.target.value) || 0})}
                    >
                      <option value="0">0 (Tidak Punya Anak)</option>
                      <option value="1">1 Anak</option>
                      <option value="2">2 Anak</option>
                      <option value="3">3 Anak</option>
                      <option value="4">4 Anak</option>
                      <option value="5">5 Anak</option>
                      <option value="6">6 Anak</option>
                      <option value="7">7 Anak</option>
                      <option value="8">8 Anak</option>
                      <option value="9">9 Anak</option>
                      <option value="10">10+ Anak</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Anak (pisahkan dengan koma)</label>
                    <input
                      type="text"
                      placeholder="Contoh: Anak1, Anak2, Anak3"
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                      value={personalDetails.childrenNames}
                      onChange={(e) => setPersonalDetails({...personalDetails, childrenNames: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-md font-medium text-gray-800 mb-6">Kontak Darurat</h4>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Kontak Darurat</label>
                    <input
                      type="text"
                      placeholder="Nama lengkap kontak darurat"
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                      value={personalDetails.emergencyContactName}
                      onChange={(e) => setPersonalDetails({...personalDetails, emergencyContactName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hubungan</label>
                    <select
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                      value={personalDetails.emergencyContactRelation}
                      onChange={(e) => setPersonalDetails({...personalDetails, emergencyContactRelation: e.target.value})}
                    >
                      <option value="">Pilih Hubungan</option>
                      <option value="Suami">Suami</option>
                      <option value="Istri">Istri</option>
                      <option value="Orang Tua">Orang Tua</option>
                      <option value="Anak">Anak</option>
                      <option value="Kakak">Kakak</option>
                      <option value="Adik">Adik</option>
                      <option value="Teman Kerja">Teman Kerja</option>
                      <option value="Tetangga">Tetangga</option>
                      <option value="Saudara">Saudara</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon</label>
                    <input
                      type="tel"
                      placeholder="08123456789"
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2"
                      value={personalDetails.emergencyContactPhone}
                      onChange={(e) => setPersonalDetails({...personalDetails, emergencyContactPhone: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Riwayat Pendidikan</h3>
              <button
                type="button"
                onClick={() => setShowEducationModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Tambah Pendidikan
              </button>
            </div>

            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{edu.institutionName}</h4>
                      <p className="text-sm text-gray-600">{edu.level.toUpperCase()} {edu.major && `- ${edu.major}`}</p>
                      <p className="text-sm text-gray-500">{edu.entryYear} - {edu.graduationYear}</p>
                      {edu.grade && <p className="text-sm text-gray-500">Nilai: {edu.grade}</p>}
                      {edu.description && <p className="text-sm text-gray-500 mt-2">{edu.description}</p>}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEditEducation(edu, education.findIndex(e => e.id === edu.id))}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEducation(edu.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {education.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Belum ada riwayat pendidikan. Klik "Tambah Pendidikan" untuk menambahkan.
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Kompetensi & Skills</h3>
              <button
                type="button"
                onClick={() => setShowSkillModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Tambah Skill
              </button>
            </div>

            <div className="space-y-4">
              {skills.map((skillItem) => (
                <div key={skillItem.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{skillItem.name}</h4>
                      <p className="text-sm text-gray-600">{skillItem.type.toUpperCase()} - Level: {skillItem.level}</p>
                      {skillItem.description && <p className="text-sm text-gray-500 mt-2">{skillItem.description}</p>}
                      {skillItem.certificate && skillItem.certificateNumber && (
                        <p className="text-sm text-green-600 mt-1">Sertifikat: {skillItem.certificateNumber}</p>
                      )}
                      {skillItem.validUntil && (
                        <p className="text-sm text-gray-500">Berlaku hingga: {skillItem.validUntil}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEditSkill(skillItem, skills.findIndex(s => s.id === skillItem.id))}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSkill(skillItem.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {skills.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Belum ada skill yang dicantumkan. Klik "Tambah Skill" untuk menambahkan.
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow sm:rounded-lg">
        {/* Tab Headers */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab, index) => (
              <button
                key={tab.name}
                className={`${
                  index === activeTab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab(index)}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>

        {/* Form Actions */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={() => {
              // Create employee object with all form data
              const employeeData = {
                ...formData,
                id: formData.id || Date.now().toString(),
              } as Employee;
              onSave(employeeData);
            }}
          >
            Simpan
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={onCancel}
          >
            Batal
          </button>
        </div>
      </div>

      {/* Education Modal */}
      {showEducationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingIndex >= 0 ? 'Edit Pendidikan' : 'Tambah Pendidikan'}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tingkat Pendidikan</label>
                  <select
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={edu.level}
                    onChange={(e) => setEdu({...edu, level: e.target.value as any})}
                  >
                    <option value="sd">SD</option>
                    <option value="smp">SMP</option>
                    <option value="sma">SMA</option>
                    <option value="smk">SMK</option>
                    <option value="diploma">Diploma</option>
                    <option value="s1">S1</option>
                    <option value="s2">S2</option>
                    <option value="s3">S3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Institusi</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={edu.institutionName}
                    onChange={(e) => setEdu({...edu, institutionName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Jurusan/Prodi</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={edu.major}
                    onChange={(e) => setEdu({...edu, major: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tahun Masuk</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={edu.entryYear}
                    onChange={(e) => setEdu({...edu, entryYear: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tahun Lulus</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={edu.graduationYear}
                    onChange={(e) => setEdu({...edu, graduationYear: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nilai/IPK</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={edu.grade}
                    onChange={(e) => setEdu({...edu, grade: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Keterangan</label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={edu.description}
                  onChange={(e) => setEdu({...edu, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEducationModal(false);
                    setEditingIndex(-1);
                    setEdu({
                      level: 'sma',
                      institutionName: '',
                      major: '',
                      entryYear: '',
                      graduationYear: '',
                      grade: '',
                      description: ''
                    });
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  {editingIndex >= 0 ? 'Update' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skill Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingSkillIndex >= 0 ? 'Edit Skill' : 'Tambah Skill'}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Skill</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={skill.name}
                    onChange={(e) => setSkill({...skill, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Jenis Skill</label>
                  <select
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={skill.type}
                    onChange={(e) => setSkill({...skill, type: e.target.value as any})}
                  >
                    <option value="hard">Hard Skill</option>
                    <option value="soft">Soft Skill</option>
                    <option value="language">Bahasa</option>
                    <option value="license">Lisensi/Sertifikat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Level</label>
                  <select
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={skill.level}
                    onChange={(e) => setSkill({...skill, level: e.target.value as any})}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                {(skill.type === 'license' || skill.certificate) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nomor Sertifikat</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={skill.certificateNumber}
                      onChange={(e) => setSkill({...skill, certificateNumber: e.target.value})}
                    />
                  </div>
                )}
                {(skill.type === 'license' || skill.certificate) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Masa Berlaku</label>
                    <input
                      type="date"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={skill.validUntil}
                      onChange={(e) => setSkill({...skill, validUntil: e.target.value})}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    checked={skill.certificate}
                    onChange={(e) => setSkill({...skill, certificate: e.target.checked})}
                  />
                  <span className="ml-2 text-sm text-gray-700">Memiliki Sertifikat</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={skill.description}
                  onChange={(e) => setSkill({...skill, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSkillModal(false);
                    setEditingSkillIndex(-1);
                    setSkill({
                      name: '',
                      type: 'hard',
                      level: 'beginner',
                      description: '',
                      certificate: false,
                      certificateNumber: '',
                      validUntil: ''
                    });
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveSkill}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  {editingSkillIndex >= 0 ? 'Update' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabbedEmployeeForm;