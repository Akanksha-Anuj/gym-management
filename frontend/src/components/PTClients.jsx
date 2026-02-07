import { useState, useEffect } from 'react'
import config from '../config'

export default function PTClients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    address: 'Barh',
    payment: '',
    paid: '',
    due: '',
    ptStartDate: '',
    ptEndDate: '',
    trainer: '',
    remarks: ''
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_BASE_URL}/api/ptclients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch PT clients')
      }

      const data = await response.json()
      setClients(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this PT client?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_BASE_URL}/api/ptclients/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete PT client')
      }

      fetchClients()
    } catch (err) {
      alert('Error deleting PT client: ' + err.message)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddClient = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_BASE_URL}/api/ptclients`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          payment: Number(formData.payment) || 0,
          paid: Number(formData.paid) || 0,
          due: Number(formData.due) || 0
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add PT client')
      }

      setShowAddForm(false)
      resetForm()
      fetchClients()
    } catch (err) {
      alert('Error adding PT client: ' + err.message)
    }
  }

  const handleUpdateClient = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_BASE_URL}/api/ptclients/${editingClient.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          id: editingClient.id,
          payment: Number(formData.payment) || 0,
          paid: Number(formData.paid) || 0,
          due: Number(formData.due) || 0
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update PT client')
      }

      handleCloseForm()
      fetchClients()
    } catch (err) {
      alert('Error updating PT client: ' + err.message)
    }
  }

  const handleEdit = (client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      contactNumber: client.contactNumber,
      address: client.address,
      payment: client.payment,
      paid: client.paid,
      due: client.due,
      ptStartDate: client.ptStartDate?.split('T')[0] || '',
      ptEndDate: client.ptEndDate?.split('T')[0] || '',
      trainer: client.trainer,
      remarks: client.remarks || ''
    })
  }

  const handleCloseForm = () => {
    setShowAddForm(false)
    setEditingClient(null)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      contactNumber: '',
      address: 'Barh',
      payment: '',
      paid: '',
      due: '',
      ptStartDate: '',
      ptEndDate: '',
      trainer: '',
      remarks: ''
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading PT clients...</div>
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
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">PT Clients</h2>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add PT Client
        </button>
      </div>

      {showAddForm && (
        <Modal title="Add PT Client" onClose={handleCloseForm}>
          <PTClientForm
            formData={formData}
            onChange={handleInputChange}
            onSubmit={handleAddClient}
            onCancel={handleCloseForm}
            submitLabel="Add PT Client"
          />
        </Modal>
      )}

      {editingClient && (
        <Modal title="Edit PT Client" onClose={handleCloseForm}>
          <PTClientForm
            formData={formData}
            onChange={handleInputChange}
            onSubmit={handleUpdateClient}
            onCancel={handleCloseForm}
            submitLabel="Update PT Client"
          />
        </Modal>
      )}

      {clients.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No PT clients found. Add your first PT client to get started.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PT Start</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PT End</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trainer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client, index) => (
                <tr key={client.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.contactNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{client.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.payment}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.paid}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.due}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(client.ptStartDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(client.ptEndDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.trainer}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                    <div className="max-w-xs truncate" title={client.remarks}>
                      {client.remarks || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleEdit(client)}
                        className="text-blue-600 hover:text-blue-900 transition"
                        title="Edit PT client"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="text-red-600 hover:text-red-900 transition"
                        title="Delete PT client"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function PTClientForm({ formData, onChange, onSubmit, onCancel, submitLabel }) {
  return (
    <form onSubmit={onSubmit} className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact *</label>
          <input
            type="text"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={onChange}
            rows="2"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment</label>
          <input
            type="number"
            name="payment"
            value={formData.payment}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Paid</label>
          <input
            type="number"
            name="paid"
            value={formData.paid}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Due</label>
          <input
            type="number"
            name="due"
            value={formData.due}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">PT Start Date</label>
          <input
            type="date"
            name="ptStartDate"
            value={formData.ptStartDate}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">PT End Date</label>
          <input
            type="date"
            name="ptEndDate"
            value={formData.ptEndDate}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Trainer *</label>
          <input
            type="text"
            name="trainer"
            value={formData.trainer}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={onChange}
            rows="2"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
