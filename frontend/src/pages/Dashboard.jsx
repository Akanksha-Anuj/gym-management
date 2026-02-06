import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Members from '../components/Members'

export default function Dashboard({ activeTab }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeMenu, setActiveMenu] = useState(activeTab || 'dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [graphYear, setGraphYear] = useState(new Date().getFullYear())
  const [stats, setStats] = useState(null)
  const [yearlyStats, setYearlyStats] = useState([])
  const [loading, setLoading] = useState(false)
  const [hoveredPoint, setHoveredPoint] = useState(null)

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ]

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)

  useEffect(() => {
    // Set active menu based on current route
    if (location.pathname === '/members') {
      setActiveMenu('members')
    } else if (location.pathname === '/dashboard') {
      setActiveMenu('dashboard')
    }
  }, [location])

  useEffect(() => {
    if (activeMenu === 'dashboard') {
      fetchStatistics()
      fetchYearlyStatistics()
    }
  }, [selectedYear, selectedMonth, activeMenu])

  useEffect(() => {
    if (activeMenu === 'dashboard') {
      fetchYearlyStatistics()
    }
  }, [graphYear, activeMenu])

  const fetchStatistics = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `http://localhost:5056/api/members/statistics/monthly?year=${selectedYear}&month=${selectedMonth}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to fetch statistics:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchYearlyStatistics = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `http://localhost:5056/api/members/statistics/yearly?year=${graphYear}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setYearlyStats(data)
      }
    } catch (err) {
      console.error('Failed to fetch yearly statistics:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'members', name: 'Members', icon: '👥' },
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
                if (item.id === 'members') {
                  navigate('/members')
                } else if (item.id === 'dashboard') {
                  navigate('/dashboard')
                } else {
                  setActiveMenu(item.id)
                }
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
            <div className="space-y-6">
              {/* Month/Year Selector */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Select Period:</h3>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {months.map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Statistics Cards */}
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading statistics...</div>
              ) : stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Members - Clickable */}
                  <button
                    onClick={() => navigate('/members')}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-l-4 border-blue-600 hover:shadow-lg transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-blue-600 uppercase">Total Members</h3>
                      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-4xl font-bold text-blue-700">{stats.totalMembers}</p>
                    <p className="text-xs text-blue-600 mt-1">Click to view all →</p>
                  </button>

                  {/* New Admissions */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border-l-4 border-green-600">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-green-600 uppercase">New Admissions</h3>
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <p className="text-4xl font-bold text-green-700">{stats.newAdmissions}</p>
                    <p className="text-xs text-green-600 mt-1">This month</p>
                  </div>

                  {/* Renewals */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border-l-4 border-purple-600">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-purple-600 uppercase">Renewals</h3>
                      <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <p className="text-4xl font-bold text-purple-700">{stats.renewals}</p>
                    <p className="text-xs text-purple-600 mt-1">This month</p>
                  </div>

                  {/* Expiring This Month */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border-l-4 border-orange-600">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-orange-600 uppercase">Expiring</h3>
                      <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-4xl font-bold text-orange-700">{stats.expiringThisMonth}</p>
                    <p className="text-xs text-orange-600 mt-1">This month</p>
                  </div>
                </div>
              )}

              {/* Member Growth Graph */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Member Growth Trend</h3>
                  <select
                    value={graphYear}
                    onChange={(e) => setGraphYear(Number(e.target.value))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {yearlyStats.length > 0 && (
                  <div className="relative" style={{ height: '350px' }}>
                    <svg width="100%" height="100%" viewBox="0 0 900 350">
                      {/* Grid lines */}
                      {[0, 1, 2, 3, 4, 5].map(i => (
                        <line
                          key={`grid-${i}`}
                          x1="60"
                          y1={50 + i * 50}
                          x2="870"
                          y2={50 + i * 50}
                          stroke="#e5e7eb"
                          strokeWidth="1"
                        />
                      ))}
                      
                      {/* Y-axis labels */}
                      {(() => {
                        const maxMembers = Math.max(...yearlyStats.map(d => d.memberCount), 5)
                        const step = Math.ceil(maxMembers / 5)
                        return [0, 1, 2, 3, 4, 5].map(i => (
                          <text
                            key={`ylabel-${i}`}
                            x="45"
                            y={304 - i * 50}
                            fill="#6b7280"
                            fontSize="13"
                            textAnchor="end"
                            fontWeight="500"
                          >
                            {step * i}
                          </text>
                        ))
                      })()}

                      {/* X-axis line */}
                      <line x1="60" y1="300" x2="870" y2="300" stroke="#9ca3af" strokeWidth="2" />
                      {/* Y-axis line */}
                      <line x1="60" y1="50" x2="60" y2="300" stroke="#9ca3af" strokeWidth="2" />
                      
                      {/* Line path */}
                      <path
                        d={(() => {
                          const maxMembers = Math.max(...yearlyStats.map(d => d.memberCount), 5)
                          const points = yearlyStats.map((data, index) => {
                            const x = 60 + (index * (810 / 11))
                            const y = 300 - ((data.memberCount / maxMembers) * 250)
                            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
                          }).join(' ')
                          return points
                        })()}
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Gradient definition */}
                      <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                      
                      {/* Data points with hover */}
                      {(() => {
                        const maxMembers = Math.max(...yearlyStats.map(d => d.memberCount), 5)
                        return yearlyStats.map((data, index) => {
                          const x = 60 + (index * (810 / 11))
                          const y = 300 - ((data.memberCount / maxMembers) * 250)
                          const isHovered = hoveredPoint === index
                          return (
                            <g key={`point-${index}`}>
                              {/* Hover area */}
                              <circle
                                cx={x}
                                cy={y}
                                r="15"
                                fill="transparent"
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={() => setHoveredPoint(index)}
                                onMouseLeave={() => setHoveredPoint(null)}
                              />
                              {/* Visible point */}
                              <circle
                                cx={x}
                                cy={y}
                                r={isHovered ? "7" : "5"}
                                fill={isHovered ? "#8b5cf6" : "#3b82f6"}
                                stroke="white"
                                strokeWidth="2"
                                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                              />
                              {/* Tooltip on hover */}
                              {isHovered && (
                                <>
                                  <rect
                                    x={x - 35}
                                    y={y - 45}
                                    width="70"
                                    height="32"
                                    fill="#1f2937"
                                    rx="6"
                                    opacity="0.95"
                                  />
                                  <text
                                    x={x}
                                    y={y - 30}
                                    fill="white"
                                    fontSize="12"
                                    fontWeight="600"
                                    textAnchor="middle"
                                  >
                                    {months[data.month - 1].label.substring(0, 3)}
                                  </text>
                                  <text
                                    x={x}
                                    y={y - 17}
                                    fill="#60a5fa"
                                    fontSize="14"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                  >
                                    {data.memberCount}
                                  </text>
                                </>
                              )}
                              {/* X-axis labels */}
                              <text
                                x={x}
                                y="320"
                                fill="#6b7280"
                                fontSize="12"
                                textAnchor="middle"
                                fontWeight="500"
                              >
                                {months[data.month - 1].label.substring(0, 3)}
                              </text>
                            </g>
                          )
                        })
                      })()}

                      {/* Chart title labels */}
                      <text x="450" y="345" fill="#6b7280" fontSize="13" textAnchor="middle" fontWeight="600">
                        Month
                      </text>
                      <text
                        x="20"
                        y="180"
                        fill="#6b7280"
                        fontSize="13"
                        textAnchor="middle"
                        fontWeight="600"
                        transform="rotate(-90, 20, 180)"
                      >
                        Total Members
                      </text>
                    </svg>
                  </div>
                )}
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
