import { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchRevenueStats();
  }, [revenueMonth, revenueYear]);

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

  return (
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
  );
}
