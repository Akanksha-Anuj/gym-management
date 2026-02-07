import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import config from '../config';

export default function Revenue({ months, years }) {
  const [revenueMonth, setRevenueMonth] = useState(new Date().getMonth() + 1);
  const [revenueYear, setRevenueYear] = useState(new Date().getFullYear());
  const [revenueStats, setRevenueStats] = useState({
    memberPayment: 0,
    memberPaid: 0,
    memberDue: 0,
    ptPaid: 0,
    ptDue: 0
  });

  // Expense Management State
  const [expenses, setExpenses] = useState([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    expenseDate: new Date().toISOString().split('T')[0],
    amount: '',
    expenseType: 'miscellaneous',
    remarks: ''
  });

  // Expense Chart State
  const [chartMonth, setChartMonth] = useState(new Date().getMonth() + 1);
  const [chartYear, setChartYear] = useState(new Date().getFullYear());
  const [expenseChartData, setExpenseChartData] = useState([]);

  // Expense Table Filters & Sorting
  const [filterExpenseType, setFilterExpenseType] = useState('all');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchRevenueStats();
    fetchExpenses();
  }, [revenueMonth, revenueYear]);

  useEffect(() => {
    fetchExpenseStats();
  }, [chartMonth, chartYear]);

  const fetchRevenueStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const [membersRes, ptClientsRes] = await Promise.all([
        fetch(`${config.API_BASE_URL}/api/members`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${config.API_BASE_URL}/api/ptclients`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!membersRes.ok || !ptClientsRes.ok) {
        throw new Error('Failed to fetch revenue data');
      }

      const [membersData, ptClientsData] = await Promise.all([
        membersRes.json(),
        ptClientsRes.json()
      ]);

      const inSelectedMonth = (dateValue) => {
        if (!dateValue) return false;
        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) return false;
        return date.getFullYear() === revenueYear && (date.getMonth() + 1) === revenueMonth;
      };

      const memberTotals = membersData
        .filter(m => inSelectedMonth(m.subscriptionStartDate))
        .reduce((acc, m) => {
          acc.memberPayment += Number(m.payment) || 0;
          acc.memberPaid += Number(m.paid) || 0;
          acc.memberDue += Number(m.due) || 0;
          return acc;
        }, { memberPayment: 0, memberPaid: 0, memberDue: 0 });

      const ptTotals = ptClientsData
        .filter(c => inSelectedMonth(c.ptStartDate))
        .reduce((acc, c) => {
          acc.ptPaid += Number(c.paid) || 0;
          acc.ptDue += Number(c.due) || 0;
          return acc;
        }, { ptPaid: 0, ptDue: 0 });

      setRevenueStats({
        memberPayment: memberTotals.memberPayment,
        memberPaid: memberTotals.memberPaid,
        memberDue: memberTotals.memberDue,
        ptPaid: ptTotals.ptPaid,
        ptDue: ptTotals.ptDue
      });
    } catch (err) {
      console.error('Failed to fetch revenue stats:', err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/expenses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    }
  };

  const fetchExpenseStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${config.API_BASE_URL}/api/expenses/statistics/monthly?year=${chartYear}&month=${chartMonth}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setExpenseChartData(data);
      }
    } catch (err) {
      console.error('Failed to fetch expense statistics:', err);
    }
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setExpenseForm({
      expenseDate: new Date().toISOString().split('T')[0],
      amount: '',
      expenseType: 'miscellaneous',
      remarks: ''
    });
    setShowExpenseModal(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      expenseDate: new Date(expense.expenseDate).toISOString().split('T')[0],
      amount: expense.amount,
      expenseType: expense.expenseType,
      remarks: expense.remarks || ''
    });
    setShowExpenseModal(true);
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchExpenses();
        fetchExpenseStats();
      } else {
        alert('Failed to delete expense');
      }
    } catch (err) {
      console.error('Failed to delete expense:', err);
      alert('Failed to delete expense');
    }
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();

    const expenseData = {
      expenseDate: new Date(expenseForm.expenseDate).toISOString(),
      amount: parseFloat(expenseForm.amount),
      expenseType: expenseForm.expenseType,
      remarks: expenseForm.remarks
    };

    if (editingExpense) {
      expenseData.id = editingExpense.id;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingExpense 
        ? `${config.API_BASE_URL}/api/expenses/${editingExpense.id}`
        : `${config.API_BASE_URL}/api/expenses`;
      
      const response = await fetch(url, {
        method: editingExpense ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseData)
      });

      if (response.ok) {
        fetchExpenses();
        fetchExpenseStats();
        setShowExpenseModal(false);
      } else {
        alert('Failed to save expense');
      }
    } catch (err) {
      console.error('Failed to save expense:', err);
      alert('Failed to save expense');
    }
  };

  const expenseTypes = [
    { value: 'rent', label: 'Rent' },
    { value: 'salary', label: 'Salary' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'water', label: 'Water' },
    { value: 'electricity', label: 'Electricity' },
    { value: 'miscellaneous', label: 'Miscellaneous' }
  ];

  const expenseColors = {
    rent: '#9333ea',
    salary: '#22c55e',
    maintenance: '#3b82f6',
    water: '#06b6d4',
    electricity: '#eab308',
    miscellaneous: '#6b7280'
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getFilteredAndSortedExpenses = () => {
    let filtered = expenses;

    // Filter by expense type
    if (filterExpenseType !== 'all') {
      filtered = filtered.filter(exp => exp.expenseType === filterExpenseType);
    }

    // Sort by date if sorting is active
    if (sortField === 'expenseDate') {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.expenseDate);
        const dateB = new Date(b.expenseDate);
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    return filtered;
  };

  const filteredExpenses = getFilteredAndSortedExpenses();

  return (
    <div className="space-y-6">
      {/* Revenue Stats Section */}
      <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Revenue</h2>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={revenueMonth}
            onChange={(e) => setRevenueMonth(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
          <select
            value={revenueYear}
            onChange={(e) => setRevenueYear(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="p-4 rounded-lg bg-blue-50">
          <p className="text-sm text-blue-600">Total Payment (Members)</p>
          <p className="text-2xl font-bold text-blue-800">{revenueStats.memberPayment}</p>
        </div>
        <div className="p-4 rounded-lg bg-green-50">
          <p className="text-sm text-green-600">Payments Collected (Members)</p>
          <p className="text-2xl font-bold text-green-800">{revenueStats.memberPaid}</p>
        </div>
        <div className="p-4 rounded-lg bg-orange-50">
          <p className="text-sm text-orange-600">Due (Members)</p>
          <p className="text-2xl font-bold text-orange-800">{revenueStats.memberDue}</p>
        </div>
        <div className="p-4 rounded-lg bg-purple-50">
          <p className="text-sm text-purple-600">Collected (PT Clients)</p>
          <p className="text-2xl font-bold text-purple-800">{revenueStats.ptPaid}</p>
        </div>
        <div className="p-4 rounded-lg bg-rose-50">
          <p className="text-sm text-rose-600">Due (PT Clients)</p>
          <p className="text-2xl font-bold text-rose-800">{revenueStats.ptDue}</p>
        </div>
      </div>
    </div>

      {/* Expense Chart Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Expense Breakdown</h2>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={chartMonth}
              onChange={(e) => setChartMonth(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
            <select
              value={chartYear}
              onChange={(e) => setChartYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {expenseChartData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No expense data available for the selected period.
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="w-full lg:w-2/3">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={expenseChartData.map(item => ({
                      name: item.expenseType.charAt(0).toUpperCase() + item.expenseType.slice(1),
                      value: item.totalAmount,
                      count: item.count
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={140}
                    paddingAngle={5}
                    dataKey="value"
                    label={(entry) => `₹${entry.value.toFixed(0)}`}
                  >
                    {expenseChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={expenseColors[entry.expenseType] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `₹${value.toFixed(2)}`}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#1f2937', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="w-full lg:w-1/3">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Categories</h3>
              <div className="space-y-3">
                {expenseChartData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: expenseColors[item.expenseType] || '#6b7280' }}
                      ></div>
                      <span className="font-medium text-gray-700">
                        {item.expenseType.charAt(0).toUpperCase() + item.expenseType.slice(1)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">₹{item.totalAmount.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{item.count} transaction{item.count !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    ₹{expenseChartData.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expenses Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Expenses</h2>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterExpenseType}
              onChange={(e) => setFilterExpenseType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {expenseTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <button
              onClick={handleAddExpense}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <span>➕</span>
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('expenseDate')}
                    className={`flex items-center space-x-1 hover:text-gray-700 ${sortField === 'expenseDate' ? 'font-bold text-blue-700' : ''}`}
                    title="Sort by Date"
                  >
                    <span>Date</span>
                    <span>
                      {sortField === 'expenseDate' ? (
                        sortDirection === 'asc' ? '▲' : '▼'
                      ) : (
                        <span className="text-gray-300">⇅</span>
                      )}
                    </span>
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    {filterExpenseType !== 'all' ? 'No expenses found for this category.' : 'No expenses found. Click "Add Expense" to create one.'}
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(expense.expenseDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        expense.expenseType === 'rent' ? 'bg-purple-100 text-purple-800' :
                        expense.expenseType === 'salary' ? 'bg-green-100 text-green-800' :
                        expense.expenseType === 'maintenance' ? 'bg-blue-100 text-blue-800' :
                        expense.expenseType === 'water' ? 'bg-cyan-100 text-cyan-800' :
                        expense.expenseType === 'electricity' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {expense.expenseType.charAt(0).toUpperCase() + expense.expenseType.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ₹{expense.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {expense.remarks || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditExpense(expense)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h3>
            <form onSubmit={handleSubmitExpense}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={expenseForm.expenseDate}
                    onChange={(e) => setExpenseForm({...expenseForm, expenseDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expense Type *
                  </label>
                  <select
                    required
                    value={expenseForm.expenseType}
                    onChange={(e) => setExpenseForm({...expenseForm, expenseType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {expenseTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    rows="3"
                    value={expenseForm.remarks}
                    onChange={(e) => setExpenseForm({...expenseForm, remarks: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Optional notes..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingExpense ? 'Update' : 'Add'} Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
