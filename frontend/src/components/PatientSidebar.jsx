import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  LuLayoutDashboard, 
  LuCalendar, 
  LuHistory, 
  LuBed, 
  LuCreditCard
} from 'react-icons/lu'

const PatientSidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LuLayoutDashboard },
    { id: 'book-appointment', label: 'Book Appointment', icon: LuCalendar, action: () => navigate('/doctors') },
    { id: 'my-appointments', label: 'My Appointments', icon: LuCalendar },
    { id: 'upcoming', label: 'Upcoming Appointments', icon: LuCalendar },
    { id: 'room-requests', label: 'Room Requests', icon: LuBed },
    { id: 'current-admission', label: 'Current Admission', icon: LuBed },
    { id: 'history', label: 'Medical History', icon: LuHistory },
    { id: 'billing-payments', label: 'Billing & Payments', icon: LuCreditCard },
  ]

  const activeStyle = 'flex items-center gap-3.5 py-4 px-6 md:px-10 md:min-w-64 w-full cursor-pointer bg-[#F2F3FF] border-r-4 border-primary text-[#111] font-semibold transition-all duration-200 text-left'
  const inactiveStyle = 'flex items-center gap-3.5 py-4 px-6 md:px-10 md:min-w-64 w-full cursor-pointer hover:bg-gray-50 text-gray-600 hover:text-black font-medium transition-all duration-200 text-left'

  return (
    <div className="min-h-screen bg-white border-r border-gray-150 flex flex-col py-5">
      <div className="text-[#5E5E5E] flex flex-col gap-1 w-full">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.action) {
                  item.action()
                } else {
                  setActiveTab(item.id)
                }
              }}
              className={isActive ? activeStyle : inactiveStyle}
            >
              <Icon size={20} className="flex-shrink-0" />
              <span className="hidden md:block text-sm">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default PatientSidebar
