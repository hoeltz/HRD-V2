import React, { useState, useEffect } from 'react';
import { getFromStorage } from '../utils/storage';
import { Employee, PerformanceReview, SmartGoal } from '../utils/types';
import {
  addPerformanceReview,
  updatePerformanceReview,
  deletePerformanceReview,
  addSmartGoal,
  updateSmartGoal,
  deleteSmartGoal,
  getPerformanceData
} from '../utils/storage';

const Performance: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeTab, setActiveTab] = useState<'reviews' | 'goals' | 'analytics'>('reviews');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingReview, setEditingReview] = useState<PerformanceReview | null>(null);
  const [editingGoal, setEditingGoal] = useState<SmartGoal | null>(null);

  // Performance Review State
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [goals, setGoals] = useState<SmartGoal[]>([]);
  const [reviewFilters, setReviewFilters] = useState({
    employee: '',
    status: '',
    period: '',
    rating: ''
  });

  // SMART Goal State
  const [goalFilters, setGoalFilters] = useState({
    employee: '',
    status: '',
    priority: '',
    period: ''
  });

  useEffect(() => {
    loadEmployees();
    loadPerformanceData();
  }, []);

  const loadEmployees = () => {
    const employeesData = getFromStorage('employees') || [];
    setEmployees(employeesData);
  };

  const loadPerformanceData = () => {
    const data = getPerformanceData();
    setReviews(data.reviews || []);
    setGoals(data.goals || []);
  };

  // Performance Review Form State
  const [reviewForm, setReviewForm] = useState<any>({
    employeeId: '',
    reviewerName: '',
    reviewPeriod: {
      startDate: '',
      endDate: '',
      type: 'annual' as 'quarterly' | 'annual' | 'project-based' | 'mid-year'
    },
    selfAssessment: {
      communication: 3,
      teamwork: 3,
      leadership: 3,
      problemSolving: 3,
      productivity: 3,
      quality: 3,
      initiative: 3,
      adaptability: 3
    },
    managerAssessment: {
      communication: 3,
      teamwork: 3,
      leadership: 3,
      problemSolving: 3,
      productivity: 3,
      quality: 3,
      initiative: 3,
      adaptability: 3
    },
    keyAchievements: [''],
    areasForImprovement: [''],
    goalsForNextPeriod: [''],
    comments: '',
    actionItems: [{
      description: '',
      assignedTo: '',
      dueDate: '',
      priority: 'medium' as 'low' | 'medium' | 'high',
      status: 'pending' as 'pending' | 'in-progress' | 'completed'
    }]
  });

  // SMART Goal Form State
  const [goalForm, setGoalForm] = useState<any>({
    employeeId: '',
    title: '',
    description: '',
    specific: '',
    measurable: '',
    achievable: '',
    relevant: '',
    timeBound: '',
    targetCompletionDate: '',
    progress: 0,
    priority: 'medium' as 'low' | 'medium' | 'high',
    keyMilestones: [''],
    successCriteria: ''
  });

  const handleAddArrayField = (field: string, form: string, setForm: any) => {
    const currentArray = form === 'review' ? reviewForm[field] : goalForm[field];
    setForm({
      ...form === 'review' ? reviewForm : goalForm,
      [field]: [...currentArray, '']
    });
  };

  const handleUpdateArrayField = (field: string, index: number, value: string, form: string, setForm: any) => {
    const currentArray = form === 'review' ? reviewForm[field] : goalForm[field];
    const newArray = [...currentArray];
    newArray[index] = value;
    setForm({
      ...form === 'review' ? reviewForm : goalForm,
      [field]: newArray
    });
  };

  const handleRemoveArrayField = (field: string, index: number, form: string, setForm: any) => {
    const currentArray = form === 'review' ? reviewForm[field] : goalForm[field];
    const newArray = currentArray.filter((_: any, i: number) => i !== index);
    setForm({
      ...form === 'review' ? reviewForm : goalForm,
      [field]: newArray
    });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    
    const ratings = Object.values(reviewForm.managerAssessment) as number[];
    const averageRating = Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length);
    
    const reviewData = {
      ...reviewForm,
      id: editingReview?.id || Date.now().toString(),
      overallRating: averageRating as 1 | 2 | 3 | 4 | 5,
      status: editingReview ? 'completed' : 'draft',
      createdAt: editingReview?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingReview) {
      updatePerformanceReview(reviewData);
    } else {
      addPerformanceReview(reviewData);
    }

    loadPerformanceData();
    resetReviewForm();
    setShowReviewForm(false);
    setEditingReview(null);
    alert('Performance review berhasil disimpan!');
  };

  const handleSubmitGoal = (e: React.FormEvent) => {
    e.preventDefault();
    
    const goalData = {
      ...goalForm,
      id: editingGoal?.id || Date.now().toString(),
      assignedBy: 'Manager', // Could be dynamic
      status: 'not-started' as const,
      createdAt: editingGoal?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingGoal) {
      updateSmartGoal(goalData);
    } else {
      addSmartGoal(goalData);
    }

    loadPerformanceData();
    resetGoalForm();
    setShowGoalForm(false);
    setEditingGoal(null);
    alert('SMART Goal berhasil disimpan!');
  };

  const resetReviewForm = () => {
    setReviewForm({
      employeeId: '',
      reviewerName: '',
      reviewPeriod: {
        startDate: '',
        endDate: '',
        type: 'annual'
      },
      selfAssessment: {
        communication: 3,
        teamwork: 3,
        leadership: 3,
        problemSolving: 3,
        productivity: 3,
        quality: 3,
        initiative: 3,
        adaptability: 3
      },
      managerAssessment: {
        communication: 3,
        teamwork: 3,
        leadership: 3,
        problemSolving: 3,
        productivity: 3,
        quality: 3,
        initiative: 3,
        adaptability: 3
      },
      keyAchievements: [''],
      areasForImprovement: [''],
      goalsForNextPeriod: [''],
      comments: '',
      actionItems: [{
        description: '',
        assignedTo: '',
        dueDate: '',
        priority: 'medium',
        status: 'pending'
      }]
    });
  };

  const resetGoalForm = () => {
    setGoalForm({
      employeeId: '',
      title: '',
      description: '',
      specific: '',
      measurable: '',
      achievable: '',
      relevant: '',
      timeBound: '',
      targetCompletionDate: '',
      progress: 0,
      priority: 'medium',
      keyMilestones: [''],
      successCriteria: ''
    });
  };

  const handleEditReview = (review: PerformanceReview) => {
    setReviewForm({
      employeeId: review.employeeId,
      reviewerName: review.reviewerName,
      reviewPeriod: review.reviewPeriod,
      selfAssessment: review.selfAssessment,
      managerAssessment: review.managerAssessment,
      keyAchievements: review.keyAchievements,
      areasForImprovement: review.areasForImprovement,
      goalsForNextPeriod: review.goalsForNextPeriod,
      comments: review.comments,
      actionItems: review.actionItems
    });
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleEditGoal = (goal: SmartGoal) => {
    setGoalForm({
      employeeId: goal.employeeId,
      title: goal.title,
      description: goal.description,
      specific: goal.specific,
      measurable: goal.measurable,
      achievable: goal.achievable,
      relevant: goal.relevant,
      timeBound: goal.timeBound,
      targetCompletionDate: goal.targetCompletionDate,
      progress: goal.progress,
      priority: goal.priority,
      keyMilestones: goal.keyMilestones,
      successCriteria: goal.successCriteria
    });
    setEditingGoal(goal);
    setShowGoalForm(true);
  };

  const handleDeleteReview = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus review ini?')) {
      deletePerformanceReview(id);
      loadPerformanceData();
    }
  };

  const handleDeleteGoal = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus goal ini?')) {
      deleteSmartGoal(id);
      loadPerformanceData();
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4) return 'Excellent';
    if (rating >= 3) return 'Good';
    return 'Needs Improvement';
  };

  // Filter reviews and goals
  const filteredReviews = reviews.filter(review => {
    const matchesEmployee = !reviewFilters.employee || review.employeeId === reviewFilters.employee;
    const matchesStatus = !reviewFilters.status || review.status === reviewFilters.status;
    const matchesRating = !reviewFilters.rating || review.overallRating.toString() === reviewFilters.rating;
    const matchesPeriod = !reviewFilters.period || review.reviewPeriod.type === reviewFilters.period;
    return matchesEmployee && matchesStatus && matchesRating && matchesPeriod;
  });

  const filteredGoals = goals.filter(goal => {
    const matchesEmployee = !goalFilters.employee || goal.employeeId === goalFilters.employee;
    const matchesStatus = !goalFilters.status || goal.status === goalFilters.status;
    const matchesPriority = !goalFilters.priority || goal.priority === goalFilters.priority;
    return matchesEmployee && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">📊 Manajemen Kinerja</h1>
        <p className="mt-1 text-sm text-gray-600">Kelola evaluasi kinerja dan target SMART goals karyawan</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'reviews', label: 'Ulasan Kinerja', icon: '📝' },
            { key: 'goals', label: 'Tujuan SMART', icon: '🎯' },
            { key: 'analytics', label: 'Analitik', icon: '📈' }
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

      {/* Performance Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Ulasan Kinerja</h2>
              <button
                onClick={() => {
                  resetReviewForm();
                  setShowReviewForm(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                + Tambah Ulasan
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Karyawan</label>
                <select
                  value={reviewFilters.employee}
                  onChange={(e) => setReviewFilters({...reviewFilters, employee: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Semua Karyawan</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={reviewFilters.status}
                  onChange={(e) => setReviewFilters({...reviewFilters, status: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Semua Status</option>
                  <option value="draft">Draft</option>
                  <option value="in-review">Dalam Review</option>
                  <option value="completed">Selesai</option>
                  <option value="archived">Diarsipkan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Periode</label>
                <select
                  value={reviewFilters.period}
                  onChange={(e) => setReviewFilters({...reviewFilters, period: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Semua Periode</option>
                  <option value="quarterly">Kuartalan</option>
                  <option value="annual">Tahunan</option>
                  <option value="project-based">Berbasis Proyek</option>
                  <option value="mid-year">Pertengahan Tahun</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <select
                  value={reviewFilters.rating}
                  onChange={(e) => setReviewFilters({...reviewFilters, rating: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Ratings</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Excellent</option>
                  <option value="5">5 - Outstanding</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karyawan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periode Review</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviewer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReviews.map((review) => {
                    const employee = employees.find(emp => emp.id === review.employeeId);
                    return (
                      <tr key={review.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {employee?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {review.reviewPeriod.startDate} - {review.reviewPeriod.endDate}
                          <br />
                          <span className="text-xs text-gray-400">{review.reviewPeriod.type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getRatingColor(review.overallRating)}`}>
                            {review.overallRating}/5
                          </span>
                          <br />
                          <span className="text-xs text-gray-400">{getRatingLabel(review.overallRating)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            review.status === 'completed' ? 'bg-green-100 text-green-800' :
                            review.status === 'in-review' ? 'bg-yellow-100 text-yellow-800' :
                            review.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {review.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {review.reviewerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEditReview(review)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredReviews.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Tidak ada ulasan kinerja ditemukan</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SMART Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">SMART Goals</h2>
              <button
                onClick={() => {
                  resetGoalForm();
                  setShowGoalForm(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                + Add SMART Goal
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  value={goalFilters.employee}
                  onChange={(e) => setGoalFilters({...goalFilters, employee: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Semua Karyawan</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={goalFilters.status}
                  onChange={(e) => setGoalFilters({...goalFilters, status: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">Dalam Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={goalFilters.priority}
                  onChange={(e) => setGoalFilters({...goalFilters, priority: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Goals List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Goal Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGoals.map((goal) => {
                    const employee = employees.find(emp => emp.id === goal.employeeId);
                    return (
                      <tr key={goal.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {employee?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-medium">{goal.title}</div>
                          <div className="text-xs text-gray-500">{goal.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${goal.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">{goal.progress}%</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                            goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {goal.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {goal.targetCompletionDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                            goal.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            goal.status === 'not-started' ? 'bg-gray-100 text-gray-800' :
                            goal.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {goal.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEditGoal(goal)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
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
            {filteredGoals.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No SMART goals found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Performance Analytics</h2>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{reviews.length}</div>
                <div className="text-sm text-blue-800">Total Reviews</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{goals.length}</div>
                <div className="text-sm text-green-800">Active Goals</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {reviews.length > 0 ? 
                    (reviews.reduce((sum, review) => sum + review.overallRating, 0) / reviews.length).toFixed(1) : 
                    '0.0'
                  }
                </div>
                <div className="text-sm text-yellow-800">Avg Rating</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {goals.length > 0 ? 
                    Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length) : 
                    0
                  }%
                </div>
                <div className="text-sm text-purple-800">Avg Progress</div>
              </div>
            </div>

            {/* Performance Distribution Chart Placeholder */}
            <div className="border rounded-lg p-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">Performance Distribution</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <div>Performance Analytics Chart</div>
                  <div className="text-sm mt-2">Coming Soon: Interactive charts dengan Chart.js</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingReview ? 'Edit Ulasan Kinerja' : 'Ulasan Kinerja Baru'}
              </h3>
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                  resetReviewForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Karyawan *</label>
                  <select
                    required
                    value={reviewForm.employeeId}
                    onChange={(e) => setReviewForm({...reviewForm, employeeId: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Pilih Karyawan</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>{employee.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reviewer Name *</label>
                  <input
                    type="text"
                    required
                    value={reviewForm.reviewerName}
                    onChange={(e) => setReviewForm({...reviewForm, reviewerName: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Manager/Reviewer Name"
                  />
                </div>
              </div>

              {/* Review Period */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={reviewForm.reviewPeriod.startDate}
                    onChange={(e) => setReviewForm({
                      ...reviewForm, 
                      reviewPeriod: {...reviewForm.reviewPeriod, startDate: e.target.value}
                    })}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                  <input
                    type="date"
                    required
                    value={reviewForm.reviewPeriod.endDate}
                    onChange={(e) => setReviewForm({
                      ...reviewForm, 
                      reviewPeriod: {...reviewForm.reviewPeriod, endDate: e.target.value}
                    })}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Review</label>
                  <select
                    value={reviewForm.reviewPeriod.type}
                    onChange={(e) => setReviewForm({
                      ...reviewForm, 
                      reviewPeriod: {...reviewForm.reviewPeriod, type: e.target.value as any}
                    })}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                    <option value="project-based">Project Based</option>
                    <option value="mid-year">Mid Year</option>
                  </select>
                </div>
              </div>

              {/* Self Assessment */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Penilaian Diri</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(reviewForm.selfAssessment).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={value as number}
                          onChange={(e) => setReviewForm({
                            ...reviewForm,
                            selfAssessment: {...reviewForm.selfAssessment, [key]: parseInt(e.target.value)}
                          })}
                          className="flex-1"
                        />
                        <span className="w-8 text-center text-sm font-medium">{value as number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manager Assessment */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Penilaian Manajer</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(reviewForm.managerAssessment).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={value as number}
                          onChange={(e) => setReviewForm({
                            ...reviewForm,
                            managerAssessment: {...reviewForm.managerAssessment, [key]: parseInt(e.target.value)}
                          })}
                          className="flex-1"
                        />
                        <span className="w-8 text-center text-sm font-medium">{value as number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Achievements */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Key Achievements</label>
                  <button
                    type="button"
                    onClick={() => handleAddArrayField('keyAchievements', 'review', setReviewForm)}
                    className="text-blue-600 hover:text-blue-900 text-sm"
                  >
                    + Add Achievement
                  </button>
                </div>
                {reviewForm.keyAchievements.map((achievement: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <textarea
                      value={achievement}
                      onChange={(e) => handleUpdateArrayField('keyAchievements', index, e.target.value, 'review', setReviewForm)}
                      className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="Describe a key achievement..."
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveArrayField('keyAchievements', index, 'review', setReviewForm)}
                      className="text-red-600 hover:text-red-900"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Areas for Improvement */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Areas for Improvement</label>
                  <button
                    type="button"
                    onClick={() => handleAddArrayField('areasForImprovement', 'review', setReviewForm)}
                    className="text-blue-600 hover:text-blue-900 text-sm"
                  >
                    + Add Area
                  </button>
                </div>
                {reviewForm.areasForImprovement.map((area: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <textarea
                      value={area}
                      onChange={(e) => handleUpdateArrayField('areasForImprovement', index, e.target.value, 'review', setReviewForm)}
                      className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="Describe an area for improvement..."
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveArrayField('areasForImprovement', index, 'review', setReviewForm)}
                      className="text-red-600 hover:text-red-900"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Goals for Next Period */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Goals for Next Period</label>
                  <button
                    type="button"
                    onClick={() => handleAddArrayField('goalsForNextPeriod', 'review', setReviewForm)}
                    className="text-blue-600 hover:text-blue-900 text-sm"
                  >
                    + Add Goal
                  </button>
                </div>
                {reviewForm.goalsForNextPeriod.map((goal: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <textarea
                      value={goal}
                      onChange={(e) => handleUpdateArrayField('goalsForNextPeriod', index, e.target.value, 'review', setReviewForm)}
                      className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="Describe a goal for the next period..."
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveArrayField('goalsForNextPeriod', index, 'review', setReviewForm)}
                      className="text-red-600 hover:text-red-900"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">General Comments</label>
                <textarea
                  value={reviewForm.comments}
                  onChange={(e) => setReviewForm({...reviewForm, comments: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Additional comments or feedback..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(false);
                    setEditingReview(null);
                    resetReviewForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingReview ? 'Update Review' : 'Save Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SMART Goal Form Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingGoal ? 'Edit SMART Goal' : 'New SMART Goal'}
              </h3>
              <button
                onClick={() => {
                  setShowGoalForm(false);
                  setEditingGoal(null);
                  resetGoalForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitGoal} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee *</label>
                  <select
                    required
                    value={goalForm.employeeId}
                    onChange={(e) => setGoalForm({...goalForm, employeeId: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Employee</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>{employee.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={goalForm.priority}
                    onChange={(e) => setGoalForm({...goalForm, priority: e.target.value as any})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Title *</label>
                <input
                  type="text"
                  required
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({...goalForm, title: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Short, descriptive title for the goal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Description *</label>
                <textarea
                  required
                  value={goalForm.description}
                  onChange={(e) => setGoalForm({...goalForm, description: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Detailed description of the goal"
                />
              </div>

              {/* SMART Criteria */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-4">SMART Criteria</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specific</label>
                    <textarea
                      value={goalForm.specific}
                      onChange={(e) => setGoalForm({...goalForm, specific: e.target.value})}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="What exactly do you want to achieve?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Measurable</label>
                    <textarea
                      value={goalForm.measurable}
                      onChange={(e) => setGoalForm({...goalForm, measurable: e.target.value})}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="How will you measure success?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Achievable</label>
                    <textarea
                      value={goalForm.achievable}
                      onChange={(e) => setGoalForm({...goalForm, achievable: e.target.value})}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="Is this goal realistic and attainable?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Relevant</label>
                    <textarea
                      value={goalForm.relevant}
                      onChange={(e) => setGoalForm({...goalForm, relevant: e.target.value})}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="Why is this goal important?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time-bound</label>
                    <textarea
                      value={goalForm.timeBound}
                      onChange={(e) => setGoalForm({...goalForm, timeBound: e.target.value})}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="When will this goal be achieved?"
                    />
                  </div>
                </div>
              </div>

              {/* Timeline and Progress */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Completion Date *</label>
                  <input
                    type="date"
                    required
                    value={goalForm.targetCompletionDate}
                    onChange={(e) => setGoalForm({...goalForm, targetCompletionDate: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Progress (%)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={goalForm.progress}
                      onChange={(e) => setGoalForm({...goalForm, progress: parseInt(e.target.value)})}
                      className="flex-1"
                    />
                    <span className="w-12 text-center text-sm font-medium">{goalForm.progress}%</span>
                  </div>
                </div>
              </div>

              {/* Key Milestones */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Key Milestones</label>
                  <button
                    type="button"
                    onClick={() => handleAddArrayField('keyMilestones', 'goal', setGoalForm)}
                    className="text-blue-600 hover:text-blue-900 text-sm"
                  >
                    + Add Milestone
                  </button>
                </div>
                {goalForm.keyMilestones.map((milestone: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={milestone}
                      onChange={(e) => handleUpdateArrayField('keyMilestones', index, e.target.value, 'goal', setGoalForm)}
                      className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe a key milestone..."
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveArrayField('keyMilestones', index, 'goal', setGoalForm)}
                      className="text-red-600 hover:text-red-900"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Success Criteria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Success Criteria</label>
                <textarea
                  value={goalForm.successCriteria}
                  onChange={(e) => setGoalForm({...goalForm, successCriteria: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="How will you know this goal has been achieved?"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowGoalForm(false);
                    setEditingGoal(null);
                    resetGoalForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  {editingGoal ? 'Update Goal' : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performance;