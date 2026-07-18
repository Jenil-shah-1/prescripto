import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'

// Inline SVG Icon components
const BarChartIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
)

const PieChartIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
)

const TrendingUpIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
)

const BedIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9M10 8v9M14 8v9M18 8v9"/></svg>
)

const UserCheckIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
)

const Analytics = () => {
  const { aToken } = useContext(AdminContext)
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState(null)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(backendUrl + '/api/admin/analytics', { headers: { aToken } })
      if (data.success) {
        setAnalytics(data.analytics)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (aToken) {
      fetchAnalytics()
    }
  }, [aToken])

  if (loading) {
    return (
      <div className="m-5 flex flex-col items-center justify-center min-h-[450px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-gray-500 mt-3">Fetching MongoDB Analytics & Visual Metrics...</p>
      </div>
    )
  }

  if (!analytics) return null

  const { appointmentsPerDay, revenuePerMonth, roomOccupancy, doctorWorkload, appointmentStatusDistribution } = analytics

  // Max calculations for chart scaling
  const maxAppts = Math.max(...appointmentsPerDay.map(d => d.appointments), 1)
  const maxRevenue = Math.max(...revenuePerMonth.map(m => m.revenue), 1)
  const maxWorkload = Math.max(...doctorWorkload.map(w => w.total), 1)
  const totalStatusCount = appointmentStatusDistribution.reduce((acc, curr) => acc + curr.count, 0) || 1

  const statusColors = {
    Completed: 'bg-emerald-500 text-emerald-700 border-emerald-200',
    Accepted: 'bg-blue-500 text-blue-700 border-blue-200',
    Pending: 'bg-amber-500 text-amber-700 border-amber-200',
    Cancelled: 'bg-red-500 text-red-700 border-red-200',
    Rejected: 'bg-gray-500 text-gray-700 border-gray-200',
  }

  const statusBgHex = {
    Completed: '#10B981',
    Accepted: '#3B82F6',
    Pending: '#F59E0B',
    Cancelled: '#EF4444',
    Rejected: '#6B7280',
  }

  return (
    <div className="m-5 flex flex-col gap-6 text-[#4A4A4A] max-w-7xl w-full">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Hospital Analytics & Performance</h1>
          <p className="text-xs text-gray-400">Real-time data visualization based on MongoDB hospital records.</p>
        </div>
        <button 
          onClick={fetchAnalytics}
          className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary-dark transition shadow"
        >
          Refresh Charts
        </button>
      </div>

      {/* 2x2 Grid + Full Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Appointments Per Day Chart */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <BarChartIcon size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">Appointments Per Day</h2>
                <p className="text-[11px] text-gray-400">Daily appointment volume (Last 7 Days)</p>
              </div>
            </div>
          </div>

          <div className="h-64 flex items-end gap-3 pt-6 px-2 border-b border-gray-150">
            {appointmentsPerDay.map((item, idx) => {
              const heightPct = Math.round((item.appointments / maxAppts) * 100)
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.appointments}
                  </span>
                  <div 
                    className="w-full bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-lg transition-all duration-500 hover:brightness-110"
                    style={{ height: `${Math.max(heightPct, 6)}%` }}
                  ></div>
                  <span className="text-[10px] text-gray-500 font-medium truncate w-full text-center">{item.date}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 2. Revenue Per Month Chart */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <TrendingUpIcon size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">Revenue Per Month</h2>
                <p className="text-[11px] text-gray-400">Monthly billing collections (Last 6 Months)</p>
              </div>
            </div>
          </div>

          <div className="h-64 flex items-end gap-3 pt-6 px-2 border-b border-gray-150">
            {revenuePerMonth.map((item, idx) => {
              const heightPct = Math.round((item.revenue / maxRevenue) * 100)
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{item.revenue}
                  </span>
                  <div 
                    className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg transition-all duration-500 hover:brightness-110"
                    style={{ height: `${Math.max(heightPct, 6)}%` }}
                  ></div>
                  <span className="text-[10px] text-gray-500 font-medium truncate w-full text-center">{item.month}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 3. Room Occupancy Breakdown Chart */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <BedIcon size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">Room Occupancy Breakdown</h2>
                <p className="text-[11px] text-gray-400">Bed capacity vs active occupancy by ward</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 py-2">
            {roomOccupancy.map((cat, idx) => {
              const pct = cat.total > 0 ? Math.round((cat.occupied / cat.total) * 100) : 0
              return (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-700">{cat.category}</span>
                    <span className="font-semibold text-gray-600">{cat.occupied} Occupied / {cat.total} Total ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-150 h-3 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-primary h-full transition-all duration-500" 
                      style={{ width: `${pct}%` }}
                    ></div>
                    <div 
                      className="bg-green-100 h-full transition-all duration-500" 
                      style={{ width: `${100 - pct}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 4. Appointment Status Distribution */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <PieChartIcon size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">Appointment Status Distribution</h2>
                <p className="text-[11px] text-gray-400">Proportional status breakdown of all visits</p>
              </div>
            </div>
          </div>

          {/* Visual Progress Bar Distribution */}
          <div className="flex flex-col gap-4 py-2">
            <div className="w-full bg-gray-100 h-6 rounded-xl overflow-hidden flex shadow-inner">
              {appointmentStatusDistribution.map((st, idx) => {
                const pct = Math.round((st.count / totalStatusCount) * 100)
                if (pct === 0) return null
                return (
                  <div
                    key={idx}
                    title={`${st.status}: ${st.count} (${pct}%)`}
                    style={{ width: `${pct}%`, backgroundColor: statusBgHex[st.status] || '#6B7280' }}
                    className="h-full hover:opacity-90 transition-all cursor-pointer border-r border-white/20 flex items-center justify-center text-[10px] font-bold text-white"
                  >
                    {pct > 8 ? `${pct}%` : ''}
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {appointmentStatusDistribution.map((st, idx) => {
                const pct = Math.round((st.count / totalStatusCount) * 100)
                return (
                  <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-xl border bg-gray-50/50">
                    <span 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: statusBgHex[st.status] || '#6B7280' }}
                    ></span>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{st.status}</p>
                      <p className="text-[10px] text-gray-500">{st.count} appts ({pct}%)</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>

      {/* 5. Doctor Workload Chart (Full Width) */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <UserCheckIcon size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">Doctor Workload Analysis</h2>
              <p className="text-[11px] text-gray-400">Total appointments booked vs completed per physician</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 py-2">
          {doctorWorkload.map((doc, idx) => {
            const totalPct = Math.round((doc.total / maxWorkload) * 100)
            const completedPct = doc.total > 0 ? Math.round((doc.completed / doc.total) * 100) : 0
            return (
              <div key={idx} className="flex flex-col gap-1 border-b border-gray-100 pb-3 last:border-b-0">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-800">{doc.name}</span>
                  <span className="font-semibold text-gray-600">
                    {doc.completed} Completed / {doc.total} Total ({completedPct}% Completion Rate)
                  </span>
                </div>
                <div className="w-full bg-gray-150 h-3 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-500" 
                    style={{ width: `${(doc.completed / maxWorkload) * 100}%` }}
                    title={`Completed: ${doc.completed}`}
                  ></div>
                  <div 
                    className="bg-indigo-300 h-full transition-all duration-500" 
                    style={{ width: `${((doc.total - doc.completed) / maxWorkload) * 100}%` }}
                    title={`Pending/Scheduled: ${doc.total - doc.completed}`}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}

export default Analytics
