import React, { useState, useEffect } from 'react';
import { getFromStorage } from '../utils/storage';
import { Employee, EnhancedSkill, TrainingRecord, Certification, SkillGap } from '../utils/types';
import {
  getSkillData,
  addEnhancedSkill,
  updateEnhancedSkill,
  deleteEnhancedSkill,
  addTrainingRecord,
  updateTrainingRecord,
  deleteTrainingRecord,
  addCertification,
  updateCertification,
  deleteCertification,
  addSkillGap,
  updateSkillGap,
  deleteSkillGap
} from '../utils/storage';

const Skills: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeTab, setActiveTab] = useState<'inventory' | 'training' | 'certifications' | 'gaps' | 'analytics'>('inventory');
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [showTrainingForm, setShowTrainingForm] = useState(false);
  const [showCertificationForm, setShowCertificationForm] = useState(false);
  const [showGapForm, setShowGapForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<EnhancedSkill | null>(null);
  const [editingTraining, setEditingTraining] = useState<TrainingRecord | null>(null);
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null);
  const [editingGap, setEditingGap] = useState<SkillGap | null>(null);

  // Skills Management State
  const [skills, setSkills] = useState<EnhancedSkill[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);

  const [skillFilters, setSkillFilters] = useState({
    employee: '',
    category: '',
    proficiency: '',
    source: ''
  });

  const [trainingFilters, setTrainingFilters] = useState({
    employee: '',
    type: '',
    status: ''
  });

  const [certificationFilters, setCertificationFilters] = useState({
    employee: '',
    type: '',
    status: ''
  });

  const [gapFilters, setGapFilters] = useState({
    employee: '',
    priority: '',
    status: ''
  });

  useEffect(() => {
    loadEmployees();
    loadSkillData();
  }, []);

  const loadEmployees = () => {
    const employeesData = getFromStorage('employees') || [];
    setEmployees(employeesData);
  };

  const loadSkillData = () => {
    const data = getSkillData();
    setSkills(data.skills || []);
    setTrainingRecords(data.trainingRecords || []);
    setCertifications(data.certifications || []);
    setSkillGaps(data.skillGaps || []);
  };

  // Skills Form State
  const [skillForm, setSkillForm] = useState<any>({
    employeeId: '',
    skillName: '',
    category: 'technical' as 'technical' | 'soft' | 'language' | 'license' | 'certification',
    proficiencyLevel: 'intermediate' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    yearsOfExperience: 0,
    lastUsedDate: '',
    certificationStatus: 'none' as 'none' | 'in-progress' | 'certified' | 'expired',
    certificationExpiry: '',
    skillSource: 'self-assessment' as 'self-assessment' | 'training' | 'work-experience' | 'formal-education',
    proofOfCompetency: '',
    notes: '',
    rating: 3
  });

  // Training Form State
  const [trainingForm, setTrainingForm] = useState<any>({
    employeeId: '',
    trainingName: '',
    provider: '',
    trainingType: 'internal' as 'internal' | 'external' | 'online' | 'workshop' | 'conference',
    duration: {
      hours: 0,
      days: 0,
      weeks: 0
    },
    completionDate: '',
    status: 'planned' as 'planned' | 'in-progress' | 'completed' | 'cancelled',
    outcome: '',
    score: 0,
    certificateReceived: false,
    certificateNumber: '',
    cost: 0,
    nextTrainingNeeded: '',
    notes: ''
  });

  // Certification Form State
  const [certificationForm, setCertificationForm] = useState<any>({
    employeeId: '',
    certificationName: '',
    issuingOrganization: '',
    certificationType: 'professional' as 'professional' | 'technical' | 'language' | 'safety' | 'compliance',
    issueDate: '',
    expiryDate: '',
    certificateNumber: '',
    status: 'active' as 'active' | 'expired' | 'expiring-soon' | 'renewal-required',
    renewalCost: 0,
    fileUrl: '',
    notes: ''
  });

  // Skill Gap Form State
  const [gapForm, setGapForm] = useState<any>({
    employeeId: '',
    skillRequired: '',
    currentLevel: 'none' as 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert',
    requiredLevel: 'intermediate' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    gapPercentage: 0,
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    recommendedActions: [''],
    targetCompletionDate: '',
    status: 'identified' as 'identified' | 'in-progress' | 'addressed'
  });

  const handleAddArrayField = (field: string, setForm: any) => {
    const currentArray = gapForm[field];
    setGapForm({
      ...gapForm,
      [field]: [...currentArray, '']
    });
  };

  const handleUpdateArrayField = (field: string, index: number, value: string, setForm: any) => {
    const currentArray = gapForm[field];
    const newArray = [...currentArray];
    newArray[index] = value;
    setGapForm({
      ...gapForm,
      [field]: newArray
    });
  };

  const handleRemoveArrayField = (field: string, index: number, setForm: any) => {
    const currentArray = gapForm[field];
    const newArray = currentArray.filter((_: any, i: number) => i !== index);
    setGapForm({
      ...gapForm,
      [field]: newArray
    });
  };

  const handleSubmitSkill = (e: React.FormEvent) => {
    e.preventDefault();
    
    const skillData = {
      ...skillForm,
      id: editingSkill?.id || Date.now().toString(),
      createdAt: editingSkill?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingSkill) {
      updateEnhancedSkill(skillData);
    } else {
      addEnhancedSkill(skillData);
    }

    loadSkillData();
    resetSkillForm();
    setShowSkillForm(false);
    setEditingSkill(null);
    alert('Skill berhasil disimpan!');
  };

  const handleSubmitTraining = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trainingData = {
      ...trainingForm,
      id: editingTraining?.id || Date.now().toString(),
      createdAt: editingTraining?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingTraining) {
      updateTrainingRecord(trainingData);
    } else {
      addTrainingRecord(trainingData);
    }

    loadSkillData();
    resetTrainingForm();
    setShowTrainingForm(false);
    setEditingTraining(null);
    alert('Training record berhasil disimpan!');
  };

  const handleSubmitCertification = (e: React.FormEvent) => {
    e.preventDefault();
    
    const certificationData = {
      ...certificationForm,
      id: editingCertification?.id || Date.now().toString(),
      createdAt: editingCertification?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingCertification) {
      updateCertification(certificationData);
    } else {
      addCertification(certificationData);
    }

    loadSkillData();
    resetCertificationForm();
    setShowCertificationForm(false);
    setEditingCertification(null);
    alert('Certification berhasil disimpan!');
  };

  const handleSubmitGap = (e: React.FormEvent) => {
    e.preventDefault();
    
    const gapData = {
      ...gapForm,
      gapPercentage: Math.max(0, Math.min(100, 
        (gapForm.requiredLevel === 'beginner' ? 20 :
         gapForm.requiredLevel === 'intermediate' ? 50 :
         gapForm.requiredLevel === 'advanced' ? 75 : 90) -
        (gapForm.currentLevel === 'none' ? 0 :
         gapForm.currentLevel === 'beginner' ? 20 :
         gapForm.currentLevel === 'intermediate' ? 50 :
         gapForm.currentLevel === 'advanced' ? 75 : 90)
      )),
      createdAt: editingGap?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingGap) {
      updateSkillGap(gapData);
    } else {
      addSkillGap(gapData);
    }

    loadSkillData();
    resetGapForm();
    setShowGapForm(false);
    setEditingGap(null);
    alert('Skill gap berhasil disimpan!');
  };

  const resetSkillForm = () => {
    setSkillForm({
      employeeId: '',
      skillName: '',
      category: 'technical',
      proficiencyLevel: 'intermediate',
      yearsOfExperience: 0,
      lastUsedDate: '',
      certificationStatus: 'none',
      certificationExpiry: '',
      skillSource: 'self-assessment',
      proofOfCompetency: '',
      notes: '',
      rating: 3
    });
  };

  const resetTrainingForm = () => {
    setTrainingForm({
      employeeId: '',
      trainingName: '',
      provider: '',
      trainingType: 'internal',
      duration: {
        hours: 0,
        days: 0,
        weeks: 0
      },
      completionDate: '',
      status: 'planned',
      outcome: '',
      score: 0,
      certificateReceived: false,
      certificateNumber: '',
      cost: 0,
      nextTrainingNeeded: '',
      notes: ''
    });
  };

  const resetCertificationForm = () => {
    setCertificationForm({
      employeeId: '',
      certificationName: '',
      issuingOrganization: '',
      certificationType: 'professional',
      issueDate: '',
      expiryDate: '',
      certificateNumber: '',
      status: 'active',
      renewalCost: 0,
      fileUrl: '',
      notes: ''
    });
  };

  const resetGapForm = () => {
    setGapForm({
      employeeId: '',
      skillRequired: '',
      currentLevel: 'none',
      requiredLevel: 'intermediate',
      gapPercentage: 0,
      priority: 'medium',
      recommendedActions: [''],
      targetCompletionDate: '',
      status: 'identified'
    });
  };

  const handleEditSkill = (skill: EnhancedSkill) => {
    setSkillForm({
      employeeId: skill.employeeId,
      skillName: skill.skillName,
      category: skill.category,
      proficiencyLevel: skill.proficiencyLevel,
      yearsOfExperience: skill.yearsOfExperience,
      lastUsedDate: skill.lastUsedDate || '',
      certificationStatus: skill.certificationStatus || 'none',
      certificationExpiry: skill.certificationExpiry || '',
      skillSource: skill.skillSource,
      proofOfCompetency: skill.proofOfCompetency || '',
      notes: skill.notes || '',
      rating: skill.rating
    });
    setEditingSkill(skill);
    setShowSkillForm(true);
  };

  const handleEditTraining = (training: TrainingRecord) => {
    setTrainingForm({
      employeeId: training.employeeId,
      trainingName: training.trainingName,
      provider: training.provider,
      trainingType: training.trainingType,
      duration: training.duration,
      completionDate: training.completionDate || '',
      status: training.status,
      outcome: training.outcome || '',
      score: training.score || 0,
      certificateReceived: training.certificateReceived,
      certificateNumber: training.certificateNumber || '',
      cost: training.cost || 0,
      nextTrainingNeeded: training.nextTrainingNeeded || '',
      notes: training.notes || ''
    });
    setEditingTraining(training);
    setShowTrainingForm(true);
  };

  const handleEditCertification = (certification: Certification) => {
    setCertificationForm({
      employeeId: certification.employeeId,
      certificationName: certification.certificationName,
      issuingOrganization: certification.issuingOrganization,
      certificationType: certification.certificationType,
      issueDate: certification.issueDate,
      expiryDate: certification.expiryDate || '',
      certificateNumber: certification.certificateNumber || '',
      status: certification.status,
      renewalCost: certification.renewalCost || 0,
      fileUrl: certification.fileUrl || '',
      notes: certification.notes || ''
    });
    setEditingCertification(certification);
    setShowCertificationForm(true);
  };

  const handleEditGap = (gap: SkillGap) => {
    setGapForm({
      employeeId: gap.employeeId,
      skillRequired: gap.skillRequired,
      currentLevel: gap.currentLevel,
      requiredLevel: gap.requiredLevel,
      gapPercentage: gap.gapPercentage,
      priority: gap.priority,
      recommendedActions: gap.recommendedActions,
      targetCompletionDate: gap.targetCompletionDate || '',
      status: gap.status
    });
    setEditingGap(gap);
    setShowGapForm(true);
  };

  const handleDeleteSkill = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus skill ini?')) {
      deleteEnhancedSkill(id);
      loadSkillData();
    }
  };

  const handleDeleteTraining = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus training ini?')) {
      deleteTrainingRecord(id);
      loadSkillData();
    }
  };

  const handleDeleteCertification = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus certification ini?')) {
      deleteCertification(id);
      loadSkillData();
    }
  };

  const handleDeleteGap = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus skill gap ini?')) {
      deleteSkillGap(id);
      loadSkillData();
    }
  };

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'expert': return 'text-purple-600 bg-purple-100';
      case 'advanced': return 'text-blue-600 bg-blue-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'beginner': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
      case 'certified':
        return 'bg-blue-100 text-blue-800';
      case 'planned':
      case 'identified':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
      case 'cancelled':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter functions
  const filteredSkills = skills.filter(skill => {
    const employee = employees.find(emp => emp.id === skill.employeeId);
    const matchesEmployee = !skillFilters.employee || skill.employeeId === skillFilters.employee;
    const matchesCategory = !skillFilters.category || skill.category === skillFilters.category;
    const matchesProficiency = !skillFilters.proficiency || skill.proficiencyLevel === skillFilters.proficiency;
    const matchesSource = !skillFilters.source || skill.skillSource === skillFilters.source;
    return matchesEmployee && matchesCategory && matchesProficiency && matchesSource;
  });

  const filteredTraining = trainingRecords.filter(training => {
    const matchesEmployee = !trainingFilters.employee || training.employeeId === trainingFilters.employee;
    const matchesType = !trainingFilters.type || training.trainingType === trainingFilters.type;
    const matchesStatus = !trainingFilters.status || training.status === trainingFilters.status;
    return matchesEmployee && matchesType && matchesStatus;
  });

  const filteredCertifications = certifications.filter(cert => {
    const matchesEmployee = !certificationFilters.employee || cert.employeeId === certificationFilters.employee;
    const matchesType = !certificationFilters.type || cert.certificationType === certificationFilters.type;
    const matchesStatus = !certificationFilters.status || cert.status === certificationFilters.status;
    return matchesEmployee && matchesType && matchesStatus;
  });

  const filteredGaps = skillGaps.filter(gap => {
    const matchesEmployee = !gapFilters.employee || gap.employeeId === gapFilters.employee;
    const matchesPriority = !gapFilters.priority || gap.priority === gapFilters.priority;
    const matchesStatus = !gapFilters.status || gap.status === gapFilters.status;
    return matchesEmployee && matchesPriority && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">🎓 Skills & Training Management</h1>
        <p className="mt-1 text-sm text-gray-600">Kelola skills, training records, certifications, dan skill gaps karyawan</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'inventory', label: 'Skills Inventory', icon: '📋' },
            { key: 'training', label: 'Training Records', icon: '🎓' },
            { key: 'certifications', label: 'Certifications', icon: '🏆' },
            { key: 'gaps', label: 'Skill Gaps', icon: '⚡' },
            { key: 'analytics', label: 'Analytics', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Skills Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Skills Inventory</h2>
              <button
                onClick={() => {
                  resetSkillForm();
                  setShowSkillForm(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                + Add Skill
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  value={skillFilters.employee}
                  onChange={(e) => setSkillFilters({...skillFilters, employee: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Employees</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={skillFilters.category}
                  onChange={(e) => setSkillFilters({...skillFilters, category: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  <option value="technical">Technical</option>
                  <option value="soft">Soft Skills</option>
                  <option value="language">Language</option>
                  <option value="license">License</option>
                  <option value="certification">Certification</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proficiency</label>
                <select
                  value={skillFilters.proficiency}
                  onChange={(e) => setSkillFilters({...skillFilters, proficiency: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select
                  value={skillFilters.source}
                  onChange={(e) => setSkillFilters({...skillFilters, source: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Sources</option>
                  <option value="self-assessment">Self Assessment</option>
                  <option value="training">Training</option>
                  <option value="work-experience">Work Experience</option>
                  <option value="formal-education">Formal Education</option>
                </select>
              </div>
            </div>
          </div>

          {/* Skills List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skill Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proficiency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSkills.map((skill) => {
                    const employee = employees.find(emp => emp.id === skill.employeeId);
                    return (
                      <tr key={skill.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {employee?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-medium">{skill.skillName}</div>
                          {skill.notes && (
                            <div className="text-xs text-gray-500">{skill.notes.substring(0, 50)}...</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                            {skill.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProficiencyColor(skill.proficiencyLevel)} capitalize`}>
                            {skill.proficiencyLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {skill.yearsOfExperience} years
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-sm ${i < skill.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEditSkill(skill)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSkill(skill.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredSkills.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No skills found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Training Records Tab */}
      {activeTab === 'training' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Training Records</h2>
              <button
                onClick={() => {
                  resetTrainingForm();
                  setShowTrainingForm(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                + Add Training
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  value={trainingFilters.employee}
                  onChange={(e) => setTrainingFilters({...trainingFilters, employee: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Employees</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={trainingFilters.type}
                  onChange={(e) => setTrainingFilters({...trainingFilters, type: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="internal">Internal</option>
                  <option value="external">External</option>
                  <option value="online">Online</option>
                  <option value="workshop">Workshop</option>
                  <option value="conference">Conference</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={trainingFilters.status}
                  onChange={(e) => setTrainingFilters({...trainingFilters, status: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="planned">Planned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Training List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Training Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTraining.map((training) => {
                    const employee = employees.find(emp => emp.id === training.employeeId);
                    return (
                      <tr key={training.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {employee?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-medium">{training.trainingName}</div>
                          {training.completionDate && (
                            <div className="text-xs text-gray-500">
                              Completed: {new Date(training.completionDate).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {training.provider}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                            {training.trainingType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(training.duration?.hours || 0) > 0 && `${training.duration.hours}h `}
                          {(training.duration?.days || 0) > 0 && `${training.duration.days}d `}
                          {(training.duration?.weeks || 0) > 0 && `${training.duration.weeks}w`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(training.status)}`}>
                            {training.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEditTraining(training)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTraining(training.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredTraining.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No training records found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Certifications Tab */}
      {activeTab === 'certifications' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Certifications</h2>
              <button
                onClick={() => {
                  resetCertificationForm();
                  setShowCertificationForm(true);
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
              >
                + Add Certification
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  value={certificationFilters.employee}
                  onChange={(e) => setCertificationFilters({...certificationFilters, employee: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Employees</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={certificationFilters.type}
                  onChange={(e) => setCertificationFilters({...certificationFilters, type: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="professional">Professional</option>
                  <option value="technical">Technical</option>
                  <option value="language">Language</option>
                  <option value="safety">Safety</option>
                  <option value="compliance">Compliance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={certificationFilters.status}
                  onChange={(e) => setCertificationFilters({...certificationFilters, status: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="expiring-soon">Expiring Soon</option>
                  <option value="renewal-required">Renewal Required</option>
                </select>
              </div>
            </div>
          </div>

          {/* Certifications List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certification</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issuer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCertifications.map((certification) => {
                    const employee = employees.find(emp => emp.id === certification.employeeId);
                    return (
                      <tr key={certification.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {employee?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-medium">{certification.certificationName}</div>
                          {certification.certificateNumber && (
                            <div className="text-xs text-gray-500">#{certification.certificateNumber}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {certification.issuingOrganization}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                            {certification.certificationType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(certification.issueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {certification.expiryDate ? new Date(certification.expiryDate).toLocaleDateString() : 'No Expiry'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(certification.status)}`}>
                            {certification.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEditCertification(certification)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCertification(certification.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredCertifications.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No certifications found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Skill Gaps Tab */}
      {activeTab === 'gaps' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Skill Gaps</h2>
              <button
                onClick={() => {
                  resetGapForm();
                  setShowGapForm(true);
                }}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
              >
                + Add Skill Gap
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  value={gapFilters.employee}
                  onChange={(e) => setGapFilters({...gapFilters, employee: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Employees</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={gapFilters.priority}
                  onChange={(e) => setGapFilters({...gapFilters, priority: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={gapFilters.status}
                  onChange={(e) => setGapFilters({...gapFilters, status: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="identified">Identified</option>
                  <option value="in-progress">In Progress</option>
                  <option value="addressed">Addressed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Skill Gaps List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skill Required</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gap %</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGaps.map((gap) => {
                    const employee = employees.find(emp => emp.id === gap.employeeId);
                    return (
                      <tr key={gap.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {employee?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-medium">{gap.skillRequired}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProficiencyColor(gap.currentLevel)} capitalize`}>
                            {gap.currentLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProficiencyColor(gap.requiredLevel)} capitalize`}>
                            {gap.requiredLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-orange-600 h-2 rounded-full" 
                                style={{ width: `${gap.gapPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">{gap.gapPercentage}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            gap.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            gap.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            gap.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {gap.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(gap.status)}`}>
                            {gap.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEditGap(gap)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteGap(gap.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredGaps.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No skill gaps found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Skills Analytics</h2>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{skills.length}</div>
                <div className="text-sm text-blue-800">Total Skills</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{trainingRecords.length}</div>
                <div className="text-sm text-green-800">Training Records</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{certifications.length}</div>
                <div className="text-sm text-purple-800">Certifications</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{skillGaps.length}</div>
                <div className="text-sm text-red-800">Skill Gaps</div>
              </div>
            </div>

            {/* Skills Distribution Chart Placeholder */}
            <div className="border rounded-lg p-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">Skills Distribution</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <div>Skills Analytics Dashboard</div>
                  <div className="text-sm mt-2">Coming Soon: Interactive skills charts dengan Chart.js</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skill Form Modal */}
      {showSkillForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingSkill ? 'Edit Skill' : 'Add New Skill'}
              </h3>
              <button
                onClick={() => {
                  setShowSkillForm(false);
                  setEditingSkill(null);
                  resetSkillForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitSkill} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee *</label>
                  <select
                    required
                    value={skillForm.employeeId}
                    onChange={(e) => setSkillForm({...skillForm, employeeId: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Employee</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>{employee.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skill Name *</label>
                  <input
                    type="text"
                    required
                    value={skillForm.skillName}
                    onChange={(e) => setSkillForm({...skillForm, skillName: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., JavaScript, Project Management"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={skillForm.category}
                    onChange={(e) => setSkillForm({...skillForm, category: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="technical">Technical</option>
                    <option value="soft">Soft Skills</option>
                    <option value="language">Language</option>
                    <option value="license">License</option>
                    <option value="certification">Certification</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Proficiency Level</label>
                  <select
                    value={skillForm.proficiencyLevel}
                    onChange={(e) => setSkillForm({...skillForm, proficiencyLevel: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    value={skillForm.yearsOfExperience}
                    onChange={(e) => setSkillForm({...skillForm, yearsOfExperience: parseInt(e.target.value) || 0})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skill Source</label>
                  <select
                    value={skillForm.skillSource}
                    onChange={(e) => setSkillForm({...skillForm, skillSource: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="self-assessment">Self Assessment</option>
                    <option value="training">Training</option>
                    <option value="work-experience">Work Experience</option>
                    <option value="formal-education">Formal Education</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Self Rating (1-5)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={skillForm.rating}
                      onChange={(e) => setSkillForm({...skillForm, rating: parseInt(e.target.value)})}
                      className="flex-1"
                    />
                    <span className="w-8 text-center text-sm font-medium">{skillForm.rating}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={skillForm.notes}
                  onChange={(e) => setSkillForm({...skillForm, notes: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Additional notes about this skill..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSkillForm(false);
                    setEditingSkill(null);
                    resetSkillForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingSkill ? 'Update Skill' : 'Add Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Similar modals for Training, Certification, and Gap forms would go here */}
      {/* For brevity, I'm showing the pattern with just the Skill form above */}
      
      {/* Training Form Modal */}
      {showTrainingForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingTraining ? 'Edit Training' : 'Add Training Record'}
              </h3>
              <button
                onClick={() => {
                  setShowTrainingForm(false);
                  setEditingTraining(null);
                  resetTrainingForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTraining} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee *</label>
                  <select
                    required
                    value={trainingForm.employeeId}
                    onChange={(e) => setTrainingForm({...trainingForm, employeeId: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Employee</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>{employee.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Training Name *</label>
                  <input
                    type="text"
                    required
                    value={trainingForm.trainingName}
                    onChange={(e) => setTrainingForm({...trainingForm, trainingName: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                  <input
                    type="text"
                    value={trainingForm.provider}
                    onChange={(e) => setTrainingForm({...trainingForm, provider: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={trainingForm.trainingType}
                    onChange={(e) => setTrainingForm({...trainingForm, trainingType: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="internal">Internal</option>
                    <option value="external">External</option>
                    <option value="online">Online</option>
                    <option value="workshop">Workshop</option>
                    <option value="conference">Conference</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={trainingForm.status}
                    onChange={(e) => setTrainingForm({...trainingForm, status: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="planned">Planned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Completion Date</label>
                  <input
                    type="date"
                    value={trainingForm.completionDate}
                    onChange={(e) => setTrainingForm({...trainingForm, completionDate: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={trainingForm.score}
                    onChange={(e) => setTrainingForm({...trainingForm, score: parseInt(e.target.value) || 0})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTrainingForm(false);
                    setEditingTraining(null);
                    resetTrainingForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  {editingTraining ? 'Update Training' : 'Add Training'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certification Form Modal */}
      {showCertificationForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCertification ? 'Edit Certification' : 'Add Certification'}
              </h3>
              <button
                onClick={() => {
                  setShowCertificationForm(false);
                  setEditingCertification(null);
                  resetCertificationForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitCertification} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee *</label>
                  <select
                    required
                    value={certificationForm.employeeId}
                    onChange={(e) => setCertificationForm({...certificationForm, employeeId: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Employee</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>{employee.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Certification Name *</label>
                  <input
                    type="text"
                    required
                    value={certificationForm.certificationName}
                    onChange={(e) => setCertificationForm({...certificationForm, certificationName: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Issuing Organization</label>
                  <input
                    type="text"
                    value={certificationForm.issuingOrganization}
                    onChange={(e) => setCertificationForm({...certificationForm, issuingOrganization: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={certificationForm.certificationType}
                    onChange={(e) => setCertificationForm({...certificationForm, certificationType: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="professional">Professional</option>
                    <option value="technical">Technical</option>
                    <option value="language">Language</option>
                    <option value="safety">Safety</option>
                    <option value="compliance">Compliance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={certificationForm.issueDate}
                    onChange={(e) => setCertificationForm({...certificationForm, issueDate: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={certificationForm.expiryDate}
                    onChange={(e) => setCertificationForm({...certificationForm, expiryDate: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCertificationForm(false);
                    setEditingCertification(null);
                    resetCertificationForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  {editingCertification ? 'Update Certification' : 'Add Certification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Skill Gap Form Modal */}
      {showGapForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingGap ? 'Edit Skill Gap' : 'Add Skill Gap'}
              </h3>
              <button
                onClick={() => {
                  setShowGapForm(false);
                  setEditingGap(null);
                  resetGapForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitGap} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee *</label>
                  <select
                    required
                    value={gapForm.employeeId}
                    onChange={(e) => setGapForm({...gapForm, employeeId: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Employee</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>{employee.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skill Required *</label>
                  <input
                    type="text"
                    required
                    value={gapForm.skillRequired}
                    onChange={(e) => setGapForm({...gapForm, skillRequired: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Advanced Excel, Project Management"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Level</label>
                  <select
                    value={gapForm.currentLevel}
                    onChange={(e) => setGapForm({...gapForm, currentLevel: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="none">None</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Required Level</label>
                  <select
                    value={gapForm.requiredLevel}
                    onChange={(e) => setGapForm({...gapForm, requiredLevel: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={gapForm.priority}
                    onChange={(e) => setGapForm({...gapForm, priority: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Completion Date</label>
                <input
                  type="date"
                  value={gapForm.targetCompletionDate}
                  onChange={(e) => setGapForm({...gapForm, targetCompletionDate: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowGapForm(false);
                    setEditingGap(null);
                    resetGapForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  {editingGap ? 'Update Gap' : 'Add Gap'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skills;