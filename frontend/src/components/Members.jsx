import { useState, useEffect } from 'react'
import config from '../config'

export default function Members() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    address: 'Barh',
    subscriptionPlan: '',
    payment: 0,
    paid: 0,
    due: 0,
    subscriptionStartDate: '',
    subscriptionExpiryDate: '',
    bagProvided: false,
    lockerNumber: ''
  })
  const [showOnlyWithDues, setShowOnlyWithDues] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [sidePanel, setSidePanel] = useState({
    contactedForPayment: false,
    didRespond: false,
    notes: ''
  })
  const [isCustomPlan, setIsCustomPlan] = useState(false)
  const [customPlanValue, setCustomPlanValue] = useState('')

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_BASE_URL}/api/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch members')
      }

      const data = await response.json()
      setMembers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_BASE_URL}/api/members/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete member')
      }

      // Refresh the list
      fetchMembers()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleBagToggle = async (id, currentValue) => {
    try {
      const token = localStorage.getItem('token')
      
      // Get the current member data
      const member = members.find(m => m.id === id)
      
      const response = await fetch(`${config.API_BASE_URL}/api/members/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...member,
          bagProvided: !currentValue
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update bag status')
      }

      // Refresh the list
      fetchMembers()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    // Handle subscription plan selection
    if (name === 'subscriptionPlan') {
      if (value === 'Custom') {
        setIsCustomPlan(true)
        setFormData(prev => ({
          ...prev,
          subscriptionPlan: ''
        }))
      } else {
        setIsCustomPlan(false)
        setCustomPlanValue('')
        setFormData(prev => ({
          ...prev,
          subscriptionPlan: value
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    
    // Use custom plan value if custom is selected
    const finalPlan = isCustomPlan ? customPlanValue : formData.subscriptionPlan
    
    if (isCustomPlan && !customPlanValue.trim()) {
      alert('Please enter a custom subscription plan')
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_BASE_URL}/api/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          subscriptionPlan: finalPlan,
          payment: parseInt(formData.payment),
          paid: parseInt(formData.paid),
          due: parseInt(formData.due),
          // Initialize follow-up fields with default values
          contactedForPayment: false,
          didRespond: false,
          notes: ''
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add member')
      }

      // Reset form and close modal
      setFormData({
        name: '',
        contactNumber: '',
        address: 'Barh',
        subscriptionPlan: '',
        payment: 0,
        paid: 0,
        due: 0,
        subscriptionStartDate: '',
        subscriptionExpiryDate: '',
        bagProvided: false,
        lockerNumber: ''
      })
      setIsCustomPlan(false)
      setCustomPlanValue('')
      setShowAddForm(false)
      
      // Refresh the list
      fetchMembers()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleEdit = (member) => {
    console.log('Edit clicked for member:', member)
    
    if (!member || !member.id) {
      alert('Error: id is not defined')
      return
    }
    
    // Check if it's a custom plan (not in predefined list)
    const predefinedPlans = ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly']
    const isCustom = !predefinedPlans.includes(member.subscriptionPlan)
    
    setEditingMember(member)
    setIsCustomPlan(isCustom)
    setCustomPlanValue(isCustom ? member.subscriptionPlan : '')
    
    setFormData({
      name: member.name,
      contactNumber: member.contactNumber,
      address: member.address,
      subscriptionPlan: isCustom ? '' : member.subscriptionPlan,
      payment: member.payment,
      paid: member.paid,
      due: member.due,
      subscriptionStartDate: member.subscriptionStartDate.split('T')[0],
      subscriptionExpiryDate: member.subscriptionExpiryDate.split('T')[0],
      bagProvided: member.bagProvided,
      lockerNumber: member.lockerNumber || ''
    })
  }

  const handleUpdateMember = async (e) => {
    e.preventDefault()
    
    console.log('Update member clicked')
    console.log('editingMember:', editingMember)
    console.log('editingMember.id:', editingMember?.id)
    console.log('formData:', formData)
    
    if (!editingMember) {
      alert('Error: No member selected for editing')
      return
    }
    
    if (!editingMember.id) {
      alert('Error: id is not defined')
      return
    }
    
    // Use custom plan value if custom is selected
    const finalPlan = isCustomPlan ? customPlanValue : formData.subscriptionPlan
    
    if (isCustomPlan && !customPlanValue.trim()) {
      alert('Please enter a custom subscription plan')
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_BASE_URL}/api/members/${editingMember.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: editingMember.id,
          ...formData,
          subscriptionPlan: finalPlan,
          payment: parseInt(formData.payment),
          paid: parseInt(formData.paid),
          due: parseInt(formData.due),
          // Preserve the follow-up fields
          contactedForPayment: editingMember.contactedForPayment || false,
          didRespond: editingMember.didRespond || false,
          notes: editingMember.notes || ''
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update member')
      }

      // Reset form and close modal
      setFormData({
        name: '',
        contactNumber: '',
        address: 'Barh',
        subscriptionPlan: '',
        payment: 0,
        paid: 0,
        due: 0,
        subscriptionStartDate: '',
        subscriptionExpiryDate: '',
        bagProvided: false,
        lockerNumber: ''
      })
      setIsCustomPlan(false)
      setCustomPlanValue('')
      setEditingMember(null)
      
      // Refresh the list
      fetchMembers()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleCloseForm = () => {
    setShowAddForm(false)
    setEditingMember(null)
    setIsCustomPlan(false)
    setCustomPlanValue('')
    setFormData({
      name: '',
      contactNumber: '',
      address: 'Barh',
      subscriptionPlan: '',
      payment: 0,
      paid: 0,
      due: 0,
      subscriptionStartDate: '',
      subscriptionExpiryDate: '',
      bagProvided: false,
      lockerNumber: ''
    })
  }

  const handleRowClick = (member) => {
    setSelectedMember(member)
    // Load existing values from member
    setSidePanel({
      contactedForPayment: member.contactedForPayment || false,
      didRespond: member.didRespond || false,
      notes: member.notes || ''
    })
  }

  const handleCloseSidePanel = () => {
    setSelectedMember(null)
  }

  const handleSidePanelChange = (field, value) => {
    setSidePanel(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveSidePanelData = async () => {
    if (!selectedMember) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_BASE_URL}/api/members/${selectedMember.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...selectedMember,
          contactedForPayment: sidePanel.contactedForPayment,
          didRespond: sidePanel.didRespond,
          notes: sidePanel.notes
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save member data')
      }

      alert('Notes and follow-up status saved successfully!')
      fetchMembers()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getSubscriptionStatus = (expiryDate) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', label: 'Expired', color: 'red' }
    } else if (daysUntilExpiry <= 7) {
      return { status: 'expiring-soon', label: 'Expiring Soon', color: 'orange' }
    } else {
      return { status: 'active', label: 'Active', color: 'green' }
    }
  }

  const getRowBackgroundClass = (expiryDate) => {
    const status = getSubscriptionStatus(expiryDate)
    if (status.status === 'expired') {
      return 'bg-red-50 hover:bg-red-100'
    } else if (status.status === 'expiring-soon') {
      return 'bg-orange-50 hover:bg-orange-100'
    } else {
      return 'hover:bg-gray-50'
    }
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getFilteredAndSortedMembers = () => {
    let filtered = members.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) || member.contactNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
    if (showOnlyWithDues) {
      filtered = filtered.filter(member => Number(member.due) > 0)
    }
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = new Date(a[sortField])
        const bValue = new Date(b[sortField])
        
        if (sortDirection === 'asc') {
          return aValue - bValue
        } else {
          return bValue - aValue
        }
      })
    }

    return filtered
  }

  const filteredMembers = getFilteredAndSortedMembers()

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading members...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Members Management</h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={showOnlyWithDues}
                onChange={e => setShowOnlyWithDues(e.target.checked)}
                className="mr-2 accent-blue-600"
              />
              Show Only With Dues
            </label>
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Add Member
            </button>
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name/number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>      </div>

      {/* Add Member Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-semibold text-gray-800">Add New Member</h3>
              <button
                onClick={handleCloseForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddMember} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subscription Plan *
                  </label>
                  <select
                    name="subscriptionPlan"
                    value={isCustomPlan ? 'Custom' : formData.subscriptionPlan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Plan</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Half-Yearly">Half-Yearly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                {isCustomPlan && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Plan *
                    </label>
                    <input
                      type="text"
                      value={customPlanValue}
                      onChange={(e) => setCustomPlanValue(e.target.value)}
                      placeholder="e.g., 15 Days, 7 Weeks"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount (₹) *
                  </label>
                  <input
                    type="number"
                    name="payment"
                    value={formData.payment}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paid Amount (₹) *
                  </label>
                  <input
                    type="number"
                    name="paid"
                    value={formData.paid}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Amount (₹) *
                  </label>
                  <input
                    type="number"
                    name="due"
                    value={formData.due}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subscription Start Date *
                  </label>
                  <input
                    type="date"
                    name="subscriptionStartDate"
                    value={formData.subscriptionStartDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subscription Expiry Date *
                  </label>
                  <input
                    type="date"
                    name="subscriptionExpiryDate"
                    value={formData.subscriptionExpiryDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Locker Number
                  </label>
                  <input
                    type="text"
                    name="lockerNumber"
                    value={formData.lockerNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., L-101"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="bagProvided"
                      checked={formData.bagProvided}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Bag Provided</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-semibold text-gray-800">Edit Member</h3>
              <button
                onClick={handleCloseForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdateMember} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subscription Plan *
                  </label>
                  <select
                    name="subscriptionPlan"
                    value={isCustomPlan ? 'Custom' : formData.subscriptionPlan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Plan</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Half-Yearly">Half-Yearly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                {isCustomPlan && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Plan *
                    </label>
                    <input
                      type="text"
                      value={customPlanValue}
                      onChange={(e) => setCustomPlanValue(e.target.value)}
                      placeholder="e.g., 15 Days, 7 Weeks"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount (₹) *
                  </label>
                  <input
                    type="number"
                    name="payment"
                    value={formData.payment}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paid Amount (₹) *
                  </label>
                  <input
                    type="number"
                    name="paid"
                    value={formData.paid}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Amount (₹) *
                  </label>
                  <input
                    type="number"
                    name="due"
                    value={formData.due}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subscription Start Date *
                  </label>
                  <input
                    type="date"
                    name="subscriptionStartDate"
                    value={formData.subscriptionStartDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subscription Expiry Date *
                  </label>
                  <input
                    type="date"
                    name="subscriptionExpiryDate"
                    value={formData.subscriptionExpiryDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Locker Number
                  </label>
                  <input
                    type="text"
                    name="lockerNumber"
                    value={formData.lockerNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., L-101"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="bagProvided"
                      checked={formData.bagProvided}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Bag Provided</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Update Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Details Side Panel */}
      {selectedMember && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
            onClick={handleCloseSidePanel}
          />
          
          {/* Side Panel */}
          <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white shadow-2xl z-50 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold mb-1">Member Details</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center font-semibold">
                      {getInitials(selectedMember.name)}
                    </div>
                    <span className="font-medium">{selectedMember.name}</span>
                  </div>
                </div>
                <button
                  onClick={handleCloseSidePanel}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Basic Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">Name</label>
                    <p className="text-sm font-medium text-gray-900">{selectedMember.name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Contact Number</label>
                    <p className="text-sm font-medium text-gray-900">{selectedMember.contactNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Address</label>
                    <p className="text-sm font-medium text-gray-900">{selectedMember.address}</p>
                  </div>
                </div>
              </div>

              {/* Subscription Details */}
              <div className="border-t pt-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Subscription Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">Plan</label>
                    <p className="text-sm">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {selectedMember.subscriptionPlan}
                      </span>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Start Date</label>
                      <p className="text-sm font-medium text-gray-900">{formatDate(selectedMember.subscriptionStartDate)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Expiry Date</label>
                      <p className="text-sm font-medium text-gray-900">{formatDate(selectedMember.subscriptionExpiryDate)}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Status</label>
                    <p className="text-sm">
                      {(() => {
                        const status = getSubscriptionStatus(selectedMember.subscriptionExpiryDate)
                        return (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            status.status === 'expired' 
                              ? 'bg-red-100 text-red-800' 
                              : status.status === 'expiring-soon'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {status.label}
                          </span>
                        )
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="border-t pt-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Payment Details</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="text-xs text-gray-500">Total Amount</label>
                    <p className="text-lg font-bold text-gray-900">₹{selectedMember.payment}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <label className="text-xs text-green-600">Paid</label>
                    <p className="text-lg font-bold text-green-700">₹{selectedMember.paid}</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <label className="text-xs text-red-600">Due</label>
                    <p className="text-lg font-bold text-red-700">₹{selectedMember.due}</p>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="border-t pt-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Additional Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">Locker Number</label>
                    <p className="text-sm font-medium text-gray-900">{selectedMember.lockerNumber || 'Not Assigned'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Bag Provided</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedMember.bagProvided ? (
                        <span className="text-green-600">✓ Yes</span>
                      ) : (
                        <span className="text-gray-400">✗ No</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Follow-up Section */}
              <div className="border-t pt-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Follow-up Status</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition">
                    <input
                      type="checkbox"
                      checked={sidePanel.contactedForPayment}
                      onChange={(e) => handleSidePanelChange('contactedForPayment', e.target.checked)}
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Contacted for payment/renewal</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition">
                    <input
                      type="checkbox"
                      checked={sidePanel.didRespond}
                      onChange={(e) => handleSidePanelChange('didRespond', e.target.checked)}
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Did they respond</span>
                  </label>
                </div>
              </div>

              {/* Notes Section */}
              <div className="border-t pt-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Notes</h4>
                <textarea
                  value={sidePanel.notes}
                  onChange={(e) => handleSidePanelChange('notes', e.target.value)}
                  rows="10"
                  placeholder="Add any notes or details about this member..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum 10 lines</p>
              </div>

              {/* Action Buttons */}
              <div className="border-t pt-6 space-y-3">
                <button
                  onClick={handleSaveSidePanelData}
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Notes & Follow-up Status</span>
                </button>
                
                <div className="flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCloseSidePanel()
                      handleEdit(selectedMember)
                    }}
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Edit Member
                  </button>
                  <button
                    onClick={handleCloseSidePanel}
                    className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {filteredMembers.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          {searchTerm ? 'No members found matching your search.' : 'No members found. Add your first member to get started.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dues</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('subscriptionStartDate')}
                    className={`flex items-center space-x-1 hover:text-gray-700 ${sortField === 'subscriptionStartDate' ? 'font-bold text-blue-700' : ''}`}
                    title="Sort by Start Date"
                  >
                    <span>Start Date</span>
                    <span>
                      {sortField === 'subscriptionStartDate' ? (
                        sortDirection === 'asc' ? '▲' : '▼'
                      ) : (
                        <span className="text-gray-300">⇅</span>
                      )}
                    </span>
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('subscriptionExpiryDate')}
                    className={`flex items-center space-x-1 hover:text-gray-700 ${sortField === 'subscriptionExpiryDate' ? 'font-bold text-blue-700' : ''}`}
                    title="Sort by Expiry Date"
                  >
                    <span>Expiry</span>
                    <span>
                      {sortField === 'subscriptionExpiryDate' ? (
                        sortDirection === 'asc' ? '▲' : '▼'
                      ) : (
                        <span className="text-gray-300">⇅</span>
                      )}
                    </span>
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Locker</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bag</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member, index) => {
                const subscriptionStatus = getSubscriptionStatus(member.subscriptionExpiryDate)
                return (
                <tr 
                  key={member.id} 
                  onClick={() => handleRowClick(member)}
                  className={`transition cursor-pointer ${getRowBackgroundClass(member.subscriptionExpiryDate)}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm mr-3">
                        {getInitials(member.name)}
                      </div>
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {member.subscriptionPlan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.contactNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {member.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ₹{member.payment}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    ₹{member.paid}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                    ₹{member.due}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(member.subscriptionStartDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{formatDate(member.subscriptionExpiryDate)}</span>
                      {subscriptionStatus.status !== 'active' && (
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          subscriptionStatus.status === 'expired' 
                            ? 'bg-red-200 text-red-800' 
                            : 'bg-orange-200 text-orange-800'
                        }`}>
                          {subscriptionStatus.label}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.lockerNumber || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={member.bagProvided}
                      disabled
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded cursor-not-allowed"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(member)
                        }}
                        className="text-blue-600 hover:text-blue-900 transition"
                        title="Edit member"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(member.id)
                        }}
                        className="text-red-600 hover:text-red-900 transition"
                        title="Delete member"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
