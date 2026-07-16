import React, { useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import { 
  LuLayoutDashboard, 
  LuCalendarDays, 
  LuUsers, 
  LuCalendarClock, 
  LuUser, 
  LuSettings, 
  LuLogOut 
} from 'react-icons/lu'

const DoctorSidebar = () => {
  const { logout, doctorUnreadCount } = useContext(AppContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login-select')
  }

  const activeStyle = 'flex items-center gap-3.5 py-4 px-6 md:px-10 md:min-w-64 cursor-pointer bg-[#F2F3FF] border-r-4 border-primary text-[#111] font-semibold transition-all duration-200'
  const inactiveStyle = 'flex items-center gap-3.5 py-4 px-6 md:px-10 md:min-w-64 cursor-pointer hover:bg-gray-50 text-gray-600 hover:text-black font-medium transition-all duration-200'

  return (
    <div className="min-h-screen bg-white border-r border-gray-150 flex flex-col justify-between py-5">
      <ul className="text-[#5E5E5E] flex flex-col gap-1 w-full">
        <NavLink 
          to="/doctor/dashboard" 
          className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
        >
          <LuLayoutDashboard size={20} className="flex-shrink-0" />
          <p className="hidden md:block text-sm">Dashboard</p>
        </NavLink>

        <NavLink 
          to="/doctor/appointments" 
          className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
        >
          <LuCalendarDays size={20} className="flex-shrink-0" />
          <div className="hidden md:flex justify-between items-center w-full">
            <p className="text-sm">My Appointments</p>
            {doctorUnreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {doctorUnreadCount}
              </span>
            )}
          </div>
        </NavLink>

        <NavLink 
          to="/doctor/patients" 
          className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
        >
          <LuUsers size={20} className="flex-shrink-0" />
          <p className="hidden md:block text-sm">Patients</p>
        </NavLink>

        <NavLink 
          to="/doctor/availability" 
          className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
        >
          <LuCalendarClock size={20} className="flex-shrink-0" />
          <p className="hidden md:block text-sm">Availability</p>
        </NavLink>

        <NavLink 
          to="/doctor/profile" 
          className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
        >
          <LuUser size={20} className="flex-shrink-0" />
          <p className="hidden md:block text-sm">My Profile</p>
        </NavLink>

        <NavLink 
          to="/doctor/settings" 
          className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
        >
          <LuSettings size={20} className="flex-shrink-0" />
          <p className="hidden md:block text-sm">Settings</p>
        </NavLink>
      </ul>

      <div 
        onClick={handleLogout}
        className="flex items-center gap-3.5 py-4 px-6 md:px-10 md:min-w-64 cursor-pointer hover:bg-red-50 hover:text-red-600 text-gray-500 font-medium transition-all duration-200 border-t border-gray-100"
      >
        <LuLogOut size={20} className="flex-shrink-0" />
        <p className="hidden md:block text-sm">Logout</p>
      </div>
    </div>
  )
}

export default DoctorSidebar
