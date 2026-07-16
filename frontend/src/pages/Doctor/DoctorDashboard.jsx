import React, { useContext, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import { 
  LuCircleDollarSign, 
  LuCalendarCheck2, 
  LuUsers, 
  LuActivity, 
  LuFileText, 
  LuListTodo 
} from 'react-icons/lu'

const DoctorDashboard = () => {
  const { 
    token, 
    doctorDashData, 
    getDoctorDashData, 
    acceptDoctorAppointment, 
    completeDoctorAppointment, 
    cancelDoctorAppointment,
    rejectDoctorAppointment,
    currencySymbol 
  } = useContext(AppContext)

  useEffect(() => {
    if (token) {
      getDoctorDashData()
    }
  }, [token])

  if (!doctorDashData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const { 
    earnings, 
    appointments, 
    patients, 
    completed, 
    cancelled, 
    pending, 
    upcoming, 
    today, 
    weeklyChartData, 
    patientStats, 
    latestAppointments 
  } = doctorDashData

  // SVG Chart Dimensions
  const chartWidth = 500
  const chartHeight = 220
  const padding = 40

  // Weekly Bookings Chart calculations
  const maxWeeklyCount = Math.max(...weeklyChartData.map(d => d.count), 1)
  const barWidth = 35
  const barSpacing = (chartWidth - padding * 2) / weeklyChartData.length

  // Patient Stats Age Group Chart calculations
  const maxPatientCount = Math.max(...patientStats.map(d => d.count), 1)
  const barHeight = 22
  const horizontalBarSpacing = (chartHeight - padding * 2) / patientStats.length

  // Status Pie Chart calculations
  const totalStatus = (completed + cancelled + pending) || 1
  const completedAngle = (completed / totalStatus) * 360
  const cancelledAngle = (cancelled / totalStatus) * 360
  const pendingAngle = (pending / totalStatus) * 360

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent)
    const y = Math.sin(2 * Math.PI * percent)
    return [x, y]
  }

  // Draw Pie Slices
  let cumulativePercent = 0
  const drawSlice = (angle, color) => {
    if (angle === 0) return null
    if (angle === 360) {
      return <circle cx="100" cy="100" r="70" fill="none" stroke={color} strokeWidth="25" />
    }
    const percent = angle / 360
    const [startX, startY] = getCoordinatesForPercent(cumulativePercent)
    cumulativePercent += percent
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent)
    
    const largeArcFlag = percent > 0.5 ? 1 : 0
    const r = 70
    const startXVal = 100 + startX * r
    const startYVal = 100 + startY * r
    const endXVal = 100 + endX * r
    const endYVal = 100 + endY * r

    return (
      <path 
        d={`M 100 100 L ${startXVal} ${startYVal} A ${r} ${r} 0 ${largeArcFlag} 1 ${endXVal} ${endYVal} Z`} 
        fill={color} 
      />
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back! Here is a summary of your performance today.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Earnings */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="p-3 bg-green-50 text-green-500 rounded-xl">
            <LuCircleDollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Earnings</p>
            <h3 className="text-lg font-bold text-gray-800 mt-0.5">{currencySymbol} {earnings}</h3>
          </div>
        </div>

        {/* Total Appointments */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
            <LuCalendarCheck2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Total Appts</p>
            <h3 className="text-lg font-bold text-gray-800 mt-0.5">{appointments}</h3>
          </div>
        </div>

        {/* Unique Patients */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="p-3 bg-purple-50 text-purple-500 rounded-xl">
            <LuUsers size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Patients</p>
            <h3 className="text-lg font-bold text-gray-800 mt-0.5">{patients}</h3>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="p-3 bg-teal-50 text-teal-500 rounded-xl">
            <LuActivity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Completed</p>
            <h3 className="text-lg font-bold text-gray-800 mt-0.5">{completed}</h3>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <LuListTodo size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Pending</p>
            <h3 className="text-lg font-bold text-gray-800 mt-0.5">{pending}</h3>
          </div>
        </div>

        {/* Cancelled */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="p-3 bg-red-50 text-red-500 rounded-xl">
            <LuFileText size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Cancelled</p>
            <h3 className="text-lg font-bold text-gray-800 mt-0.5">{cancelled}</h3>
          </div>
        </div>
      </div>

      {/* Sub-Info (Today / Upcoming Banner) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-5 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <h4 className="font-semibold text-lg">Today's Appointments</h4>
            <p className="text-blue-100 text-xs mt-1">Check your schedule for today's consultations.</p>
          </div>
          <span className="text-3xl font-extrabold bg-white/20 px-4 py-2 rounded-xl">{today}</span>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-5 rounded-2xl shadow-sm flex justify-between items-center">
          <div>
            <h4 className="font-semibold text-lg">Accepted & Upcoming</h4>
            <p className="text-purple-100 text-xs mt-1">Confirmed appointments scheduled for future dates.</p>
          </div>
          <span className="text-3xl font-extrabold bg-white/20 px-4 py-2 rounded-xl">{upcoming}</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments This Week */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
          <h4 className="font-semibold text-gray-700 w-full mb-4">Appointments This Week</h4>
          <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const y = padding + (chartHeight - padding * 2) * ratio
              const val = Math.round(maxWeeklyCount * (1 - ratio))
              return (
                <g key={index}>
                  <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#E5E7EB" strokeDasharray="4 4" />
                  <text x={padding - 10} y={y + 4} textAnchor="end" fill="#9CA3AF" fontSize="11">{val}</text>
                </g>
              )
            })}
            {/* Axis */}
            <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#D1D5DB" strokeWidth="1.5" />
            
            {/* Bars */}
            {weeklyChartData.map((d, index) => {
              const x = padding + index * barSpacing + (barSpacing - barWidth) / 2
              const barHeightVal = ((d.count / maxWeeklyCount) * (chartHeight - padding * 2))
              const y = chartHeight - padding - barHeightVal
              return (
                <g key={index} className="group">
                  <rect 
                    x={x} 
                    y={y} 
                    width={barWidth} 
                    height={barHeightVal} 
                    fill="#3B82F6" 
                    rx="4" 
                    className="hover:fill-primary-dark transition-all duration-300 cursor-pointer" 
                  />
                  {/* Tooltip on hover */}
                  <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fill="#1F2937" fontSize="12" className="hidden group-hover:block font-bold">
                    {d.count}
                  </text>
                  <text x={x + barWidth / 2} y={chartHeight - padding + 18} textAnchor="middle" fill="#4B5563" fontSize="11">{d.name}</text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Appointment Status */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
          <h4 className="font-semibold text-gray-700 w-full mb-4">Appointment Status</h4>
          <div className="flex flex-col items-center sm:flex-row gap-6 mt-2 w-full justify-around">
            <svg width="200" height="200" className="overflow-visible transform -rotate-90">
              {drawSlice(completedAngle, "#10B981")}
              {drawSlice(cancelledAngle, "#EF4444")}
              {drawSlice(pendingAngle, "#F59E0B")}
              <circle cx="100" cy="100" r="50" fill="white" />
            </svg>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-[#10B981] rounded-full inline-block"></span>
                <span className="text-xs text-gray-600 font-medium">Completed ({completed})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-[#F59E0B] rounded-full inline-block"></span>
                <span className="text-xs text-gray-600 font-medium">Pending ({pending})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-[#EF4444] rounded-full inline-block"></span>
                <span className="text-xs text-gray-600 font-medium">Cancelled ({cancelled})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Statistics */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
          <h4 className="font-semibold text-gray-700 w-full mb-4">Patient Demographics (Age)</h4>
          <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const x = padding + (chartWidth - padding * 2) * ratio
              const val = Math.round(maxPatientCount * ratio)
              return (
                <g key={index}>
                  <line x1={x} y1={padding} x2={x} y2={chartHeight - padding} stroke="#E5E7EB" strokeDasharray="4 4" />
                  <text x={x} y={chartHeight - padding + 15} textAnchor="middle" fill="#9CA3AF" fontSize="10">{val}</text>
                </g>
              )
            })}
            
            {/* Horizontal Bars */}
            {patientStats.map((d, index) => {
              const y = padding + index * horizontalBarSpacing + (horizontalBarSpacing - barHeight) / 2
              const barWidthVal = ((d.count / maxPatientCount) * (chartWidth - padding * 2))
              return (
                <g key={index} className="group">
                  <text x={padding - 10} y={y + barHeight / 2 + 4} textAnchor="end" fill="#4B5563" fontSize="11" fontWeight="500">{d.name}</text>
                  <rect 
                    x={padding} 
                    y={y} 
                    width={barWidthVal} 
                    height={barHeight} 
                    fill="#A78BFA" 
                    rx="4" 
                    className="hover:fill-purple-600 transition-all duration-300 cursor-pointer"
                  />
                  {/* Label count */}
                  <text x={padding + barWidthVal + 8} y={y + barHeight / 2 + 4} fill="#1F2937" fontSize="11" className="hidden group-hover:block font-bold">
                    {d.count}
                  </text>
                </g>
              )
            })}
            <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="#D1D5DB" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* Latest Bookings */}
      <div className="bg-white border border-gray-150 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-150">
          <img src={assets.list_icon} alt="" className="w-5" />
          <h4 className="font-bold text-gray-800 text-base">Latest Bookings</h4>
        </div>

        <div className="divide-y divide-gray-100">
          {latestAppointments.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No appointments booked yet.</div>
          ) : (
            latestAppointments.map((item, index) => {
              const splitDate = item.slotDate.split('_')
              const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
              const formattedDate = `${splitDate[0]} ${months[Number(splitDate[1]) - 1]} ${splitDate[2]}`

              return (
                <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-all" key={index}>
                  <div className="flex items-center gap-4">
                    <img className="rounded-full w-11 h-11 object-cover border border-gray-200" src={item.userData.image} alt="" />
                    <div>
                      <p className="text-gray-800 font-semibold text-sm">{item.userData.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">Booking on {formattedDate} at {item.slotTime}</p>
                    </div>
                  </div>
                  <div>
                    {item.cancelled ? (
                      <span className="text-red-500 bg-red-50 px-3 py-1 rounded-full text-xs font-semibold">Cancelled</span>
                    ) : item.isCompleted ? (
                      <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-semibold">Completed</span>
                    ) : item.isRejected ? (
                      <span className="text-red-500 bg-red-50 px-3 py-1 rounded-full text-xs font-semibold">Rejected</span>
                    ) : !item.isAccepted ? (
                      <div className="flex items-center gap-2.5">
                        <button 
                          onClick={() => acceptDoctorAppointment(item._id)} 
                          className="bg-primary hover:bg-primary-dark text-white text-xs px-3.5 py-1.5 rounded-lg font-medium shadow-sm hover:shadow transition-all"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => rejectDoctorAppointment(item._id)} 
                          className="bg-red-50 hover:bg-red-100 text-red-600 text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5">
                        <button 
                          onClick={() => completeDoctorAppointment(item._id)} 
                          className="bg-green-500 hover:bg-green-600 text-white text-xs px-3.5 py-1.5 rounded-lg font-medium shadow-sm hover:shadow transition-all"
                        >
                          Complete
                        </button>
                        <button 
                          onClick={() => cancelDoctorAppointment(item._id)} 
                          className="bg-red-50 hover:bg-red-100 text-red-600 text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard
