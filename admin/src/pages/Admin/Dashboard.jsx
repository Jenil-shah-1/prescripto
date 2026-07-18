import React, { useContext, useEffect } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

// Inline SVG Icons
const DoctorIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
)

const UsersIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
)

const CalendarIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
)

const BedIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9M10 8v9M14 8v9M18 8v9"/></svg>
)

const DollarIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
)

const ActivityIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
)

const CheckSquareIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
)

const Dashboard = () => {

  const { aToken, getDashData, dashData } = useContext(AdminContext)
  const { slotDateFormat } = useContext(AppContext)

  useEffect(() => {
    if (aToken) {
      getDashData()
    }
  }, [aToken])

  if (!dashData) {
    return (
      <div className="m-5 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Loading Hospital Analytics...</p>
        </div>
      </div>
    )
  }

  const occupancyList = dashData.roomOccupancy || [
    { category: 'General Ward', occupied: 0, total: 10, percentage: 0 },
    { category: 'ICU', occupied: 0, total: 5, percentage: 0 },
    { category: 'Semi Private / Twin Sharing', occupied: 0, total: 8, percentage: 0 },
    { category: 'Private Room', occupied: 0, total: 6, percentage: 0 },
  ]

  const tasks = dashData.pendingTasks || {
    pendingRoomRequests: 0,
    pendingBills: 0,
    todayAppointments: 0,
    doctorsOnDuty: 0,
  }

  return (
    <div className='m-5 flex flex-col gap-6 text-[#4A4A4A] max-w-7xl'>
      
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Hospital Admin Dashboard</h1>
          <p className="text-xs text-gray-400">Live MongoDB analytics, room occupancy metrics, and activity logs.</p>
        </div>
        <button 
          onClick={getDashData} 
          className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary-dark transition shadow"
        >
          Refresh Dashboard
        </button>
      </div>

      {/* 6 Top Metric Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4'>
        
        {/* Doctors Card */}
        <div className='bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-3.5 hover:shadow-md transition'>
          <div className='p-3 bg-blue-50 text-blue-600 rounded-xl'>
            <DoctorIcon />
          </div>
          <div>
            <p className='text-xl font-bold text-gray-800'>{dashData.doctors || 0}</p>
            <p className='text-[11px] font-semibold text-gray-400 uppercase tracking-wider'>Doctors</p>
          </div>
        </div>

        {/* Patients Card */}
        <div className='bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-3.5 hover:shadow-md transition'>
          <div className='p-3 bg-emerald-50 text-emerald-600 rounded-xl'>
            <UsersIcon />
          </div>
          <div>
            <p className='text-xl font-bold text-gray-800'>{dashData.patients || 0}</p>
            <p className='text-[11px] font-semibold text-gray-400 uppercase tracking-wider'>Patients</p>
          </div>
        </div>

        {/* Today's Appointments Card */}
        <div className='bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-3.5 hover:shadow-md transition'>
          <div className='p-3 bg-purple-50 text-purple-600 rounded-xl'>
            <CalendarIcon />
          </div>
          <div>
            <p className='text-xl font-bold text-gray-800'>{dashData.todayAppointmentsCount || 0}</p>
            <p className='text-[11px] font-semibold text-gray-400 uppercase tracking-wider'>Today's Appts</p>
          </div>
        </div>

        {/* Pending Room Requests Card */}
        <div className='bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-3.5 hover:shadow-md transition'>
          <div className='p-3 bg-amber-50 text-amber-600 rounded-xl'>
            <BedIcon />
          </div>
          <div>
            <p className='text-xl font-bold text-gray-800'>{dashData.pendingRoomRequestsCount || 0}</p>
            <p className='text-[11px] font-semibold text-gray-400 uppercase tracking-wider'>Pending Rooms</p>
          </div>
        </div>

        {/* Occupied Rooms Card */}
        <div className='bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-3.5 hover:shadow-md transition'>
          <div className='p-3 bg-indigo-50 text-indigo-600 rounded-xl'>
            <BedIcon />
          </div>
          <div>
            <p className='text-xl font-bold text-gray-800'>{dashData.occupiedRoomsCount || 0}</p>
            <p className='text-[11px] font-semibold text-gray-400 uppercase tracking-wider'>Occupied Rooms</p>
          </div>
        </div>

        {/* Today's Revenue Card */}
        <div className='bg-white p-4 rounded-2xl border shadow-sm flex items-center gap-3.5 hover:shadow-md transition'>
          <div className='p-3 bg-teal-50 text-teal-600 rounded-xl'>
            <DollarIcon />
          </div>
          <div>
            <p className='text-xl font-bold text-gray-800'>₹{dashData.todayRevenue || 0}</p>
            <p className='text-[11px] font-semibold text-gray-400 uppercase tracking-wider'>Today's Revenue</p>
          </div>
        </div>

      </div>

      {/* Main Dashboard Section: Left (Recent Activity) & Right (Room Occupancy + Pending Tasks) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (2 cols wide): Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <ActivityIcon size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">Recent Activity</h2>
                <p className="text-xs text-gray-400">Latest 10 dynamic hospital events from MongoDB</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {(!dashData.recentActivity || dashData.recentActivity.length === 0) ? (
              <div className="p-8 text-center text-gray-400 text-xs italic">
                No hospital activity recorded yet today.
              </div>
            ) : (
              dashData.recentActivity.map((item, index) => {
                let badgeColor = 'bg-blue-50 text-blue-600 border-blue-200'
                if (item.type === 'completed') badgeColor = 'bg-emerald-50 text-emerald-600 border-emerald-200'
                if (item.type === 'room_allocated') badgeColor = 'bg-purple-50 text-purple-600 border-purple-200'
                if (item.type === 'discharged') badgeColor = 'bg-gray-50 text-gray-600 border-gray-200'
                if (item.type === 'invoice') badgeColor = 'bg-amber-50 text-amber-600 border-amber-200'
                if (item.type === 'payment') badgeColor = 'bg-teal-50 text-teal-600 border-teal-200'

                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 hover:bg-gray-100/70 border border-gray-100 transition">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold border px-2.5 py-1 rounded-full uppercase ${badgeColor}`}>
                        {item.title}
                      </span>
                      <span className="text-xs text-gray-700 font-medium">{item.description}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono flex-shrink-0">
                      {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Column (1 col wide): Room Occupancy Card & Pending Tasks */}
        <div className="flex flex-col gap-6">

          {/* Room Occupancy Widget */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2.5 border-b pb-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <BedIcon size={18} />
              </div>
              <h2 className="text-base font-bold text-gray-800">Room Occupancy</h2>
            </div>

            <div className="flex flex-col gap-4">
              {occupancyList.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-700">{item.category}</span>
                    <span className="font-bold text-gray-800">{item.occupied} / {item.total} beds ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-150 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${item.percentage >= 90 ? 'bg-red-500' : item.percentage >= 60 ? 'bg-amber-500' : 'bg-primary'}`} 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Tasks Widget */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2.5 border-b pb-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <CheckSquareIcon size={18} />
              </div>
              <h2 className="text-base font-bold text-gray-800">Pending Tasks</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-50/50 border border-amber-150 p-3.5 rounded-xl text-center">
                <p className="text-xl font-black text-amber-700">{tasks.pendingRoomRequests}</p>
                <p className="text-[10px] font-bold text-amber-800 uppercase mt-1">Pending Rooms</p>
              </div>

              <div className="bg-red-50/50 border border-red-150 p-3.5 rounded-xl text-center">
                <p className="text-xl font-black text-red-700">{tasks.pendingBills}</p>
                <p className="text-[10px] font-bold text-red-800 uppercase mt-1">Pending Bills</p>
              </div>

              <div className="bg-purple-50/50 border border-purple-150 p-3.5 rounded-xl text-center">
                <p className="text-xl font-black text-purple-700">{tasks.todayAppointments}</p>
                <p className="text-[10px] font-bold text-purple-800 uppercase mt-1">Today's Appts</p>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-150 p-3.5 rounded-xl text-center">
                <p className="text-xl font-black text-emerald-700">{tasks.doctorsOnDuty}</p>
                <p className="text-[10px] font-bold text-emerald-800 uppercase mt-1">Doctors On Duty</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}

export default Dashboard