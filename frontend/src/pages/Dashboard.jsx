import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Members from '../components/Members'
import Statistics from '../components/Statistics'

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'members', name: 'Members', icon: '👥' },
    { id: 'statistics', name: 'Statistics', icon: '📈' },
    { id: 'visitors', name: 'Visitors', icon: '🚶' },
    { id: 'trainers', name: 'Trainer List', icon: '💪' },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`bg-gradient-to-b from-blue-600 to-blue-800 text-white w-64 min-h-screen fixed lg:static transition-transform duration-300 ease-in-out z-30 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b border-blue-500">
          <div className="flex items-center justify-center mb-2">
            <img 
              src="/gym-logo.png" 
              alt="Gym Logo" 
              className="w-16 h-16 object-contain"
              onError={(e) => e.target.style.display = 'none'}
            />
          </div>
          <h2 className="text-xl font-bold text-center">Gym Management</h2>
        </div>

        {/* Menu Items */}
        <nav className="p-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveMenu(item.id)
                setIsSidebarOpen(false)
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition ${
                activeMenu === item.id
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'hover:bg-blue-700 text-white'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition flex items-center justify-center space-x-2"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navigation Bar */}
        <nav className="bg-white shadow-lg sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                {/* Mobile menu button */}
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden text-gray-700 hover:text-gray-900 focus:outline-none mr-4"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 capitalize">
                  {menuItems.find(item => item.id === activeMenu)?.name}
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-gray-800">Hi, Admin</p>
                  <p className="text-xs text-gray-500">
                    {new Date().toLocaleDateString('en-GB', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                  A
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeMenu === 'dashboard' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4">Welcome to Dashboard</h2>
              <p className="text-gray-600 mb-6">
                Your gym management system is ready. Start managing members here.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Members</h3>
                  <p className="text-3xl font-bold text-blue-600">0</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-600">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Today</h3>
                  <p className="text-3xl font-bold text-green-600">0</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-600">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Trainers</h3>
                  <p className="text-3xl font-bold text-purple-600">0</p>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'members' && (
            <Members />
          )}

          {activeMenu === 'statistics' && (
            <Statistics />
          )}

          {activeMenu === 'visitors' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4">Visitors</h2>
              <p className="text-gray-600">Visitor tracking will be displayed here.</p>
            </div>
          )}

          {activeMenu === 'trainers' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4">Trainer List</h2>
              <p className="text-gray-600">Trainer management will be displayed here.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
