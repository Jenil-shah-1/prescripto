import React, { useContext } from 'react'
import Navbar from './components/Navbar'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { assets } from './assets/assets'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import Appointment from './pages/Appointment'
import MyAppointments from './pages/MyAppointments'
import MyProfile from './pages/MyProfile'
import PatientDashboard from './pages/Patient/PatientDashboard'
import Footer from './components/Footer'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

// Role Selection & Doctor Login
import LoginSelect from './pages/LoginSelect'
import DoctorLogin from './pages/Doctor/DoctorLogin'

// Doctor Dashboard Pages & Sidebar
import DoctorSidebar from './components/doctor/Sidebar'
import DoctorDashboard from './pages/Doctor/DoctorDashboard'
import DoctorAppointments from './pages/Doctor/DoctorAppointments'
import DoctorPatients from './pages/Doctor/DoctorPatients'
import DoctorAvailability from './pages/Doctor/DoctorAvailability'
import DoctorProfile from './pages/Doctor/DoctorProfile'
import DoctorSettings from './pages/Doctor/DoctorSettings'

import { AppContext } from './context/AppContext'

// ── Patient Portal Top-Bar Dropdown ──────────────────────────────────────────
const PatientNavbar = ({ userData, logout, navigate, onMyProfile }) => {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef(null)

  // Close dropdown on outside click
  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className='flex justify-between items-center px-6 md:px-10 py-3 border-b bg-white'>
      {/* Left: Logo + Badge */}
      <div className='flex items-center gap-2.5 text-xs'>
        <img onClick={() => navigate('/')} className='w-36 sm:w-40 cursor-pointer' src={assets.logo} alt='Hospital Logo' />
        <p className='border px-2.5 py-0.5 rounded-full border-gray-300 text-gray-600 font-bold bg-gray-50'>Patient Portal</p>
      </div>

      {/* Right: Avatar + Name + Dropdown */}
      <div className='relative' ref={ref}>
        <button
          onClick={() => setOpen(prev => !prev)}
          className='flex items-center gap-2.5 p-1.5 hover:bg-gray-100 rounded-xl transition duration-200'
        >
          <img
            src={userData?.image || assets.profile_pic}
            alt='Profile'
            className='w-8 h-8 rounded-full object-cover border border-gray-200'
          />
          <span className='hidden sm:inline text-xs font-semibold text-gray-700'>{userData?.name || 'Patient'}</span>
          <svg className='w-4 h-4 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
          </svg>
        </button>

        {open && (
          <div className='absolute right-0 mt-2.5 w-56 bg-white border border-gray-150 rounded-2xl shadow-xl z-50 py-2.5'>
            {/* User info header */}
            <div className='px-4 py-2.5 border-b border-gray-100 mb-1'>
              <p className='text-xs font-black text-gray-800 truncate'>{userData?.name}</p>
              <p className='text-[10px] text-gray-400 truncate mt-0.5'>{userData?.email}</p>
            </div>

            {/* My Profile */}
            <button
              onClick={() => { onMyProfile(); setOpen(false); }}
              className='w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2.5'
            >
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/></svg>
              My Profile
            </button>

            {/* Notifications (placeholder) */}
            <button
              onClick={() => alert('Notifications feature coming soon!')}
              className='w-full text-left px-4 py-2 text-xs font-semibold text-gray-400 hover:bg-gray-50 flex items-center gap-2.5 cursor-not-allowed'
            >
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0'/></svg>
              Notifications
              <span className='ml-auto text-[9px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full font-bold'>Soon</span>
            </button>

            {/* Help (placeholder) */}
            <button
              onClick={() => alert('Help center coming soon!')}
              className='w-full text-left px-4 py-2 text-xs font-semibold text-gray-400 hover:bg-gray-50 flex items-center gap-2.5 cursor-not-allowed'
            >
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='10'/><path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3'/><line x1='12' y1='17' x2='12.01' y2='17'/></svg>
              Help
            </button>

            <div className='border-t border-gray-100 my-1.5' />

            {/* Logout */}
            <button
              onClick={() => { setOpen(false); logout(); navigate('/login-select'); }}
              className='w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2.5'
            >
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'/><polyline points='16 17 21 12 16 7'/><line x1='21' y1='12' x2='9' y2='12'/></svg>
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const App = () => {
  const { token, role, userData, logout } = useContext(AppContext)
  const location = useLocation()
  const navigate = useNavigate()

  const isPatientRoute = location.pathname.startsWith('/patient')

  // Layout for Doctors
  if (token && role === 'doctor') {
    return (
      <div className='bg-[#F8F9FD] min-h-screen flex flex-col justify-between'>
        <div>
          <ToastContainer />
          <div className='mx-4 sm:mx-[10%]'>
            <Navbar />
          </div>
          <div className='flex items-start'>
            <DoctorSidebar />
            <div className='flex-1 p-6 md:p-10 overflow-x-hidden'>
              <Routes>
                <Route path='/doctor/dashboard' element={<DoctorDashboard />} />
                <Route path='/doctor/appointments' element={<DoctorAppointments />} />
                <Route path='/doctor/patients' element={<DoctorPatients />} />
                <Route path='/doctor/availability' element={<DoctorAvailability />} />
                <Route path='/doctor/profile' element={<DoctorProfile />} />
                <Route path='/doctor/settings' element={<DoctorSettings />} />
                <Route path='*' element={<Navigate to="/doctor/dashboard" replace />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Layout for Patients (Standalone Patient Portal)
  if (token && role !== 'doctor' && isPatientRoute) {
    const goToProfile = () => navigate('/patient/dashboard', { state: { tab: 'profile' } })
    return (
      <div className='bg-[#F8F9FD] min-h-screen flex flex-col justify-between'>
        <div>
          <ToastContainer />
          {/* Unified Patient Portal Header with profile dropdown */}
          <PatientNavbar
            userData={userData}
            logout={logout}
            navigate={navigate}
            onMyProfile={goToProfile}
          />
          {/* Main Dashboard Workspace */}
          <div className='flex items-start'>
            <Routes>
              <Route path='/patient/dashboard' element={<PatientDashboard />} />
              <Route path='*' element={<Navigate to="/patient/dashboard" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    )
  }

  // Layout for Patients / Guests (Main Website)
  return (
    <div className='mx-4 sm:mx-[10%] min-h-screen flex flex-col justify-between'>
      <div>
        <ToastContainer />
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/doctors' element={<Doctors />} />
          <Route path='/doctors/:speciality' element={<Doctors />} />
          <Route path='/login' element={<Login />} />
          <Route path='/login-select' element={<LoginSelect />} />
          <Route path='/doctor/login' element={<DoctorLogin />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/appointment/:docId' element={<Appointment />} />
          
          {/* Patient Protected Redirects to standalone portal */}
          <Route path='/dashboard' element={token ? <Navigate to="/patient/dashboard" replace /> : <Navigate to="/login-select" replace />} />
          <Route path='/my-appointments' element={token ? <Navigate to="/patient/dashboard" state={{ tab: 'my-appointments' }} replace /> : <Navigate to="/login-select" replace />} />
          <Route path='/my-profile' element={token ? <Navigate to="/patient/dashboard" state={{ tab: 'profile' }} replace /> : <Navigate to="/login-select" replace />} />
          <Route path='/my-bills' element={token ? <Navigate to="/patient/dashboard" state={{ tab: 'billing-payments' }} replace /> : <Navigate to="/login-select" replace />} />
          <Route path='/billing' element={token ? <Navigate to="/patient/dashboard" state={{ tab: 'billing-payments' }} replace /> : <Navigate to="/login-select" replace />} />
          <Route path='/bills' element={token ? <Navigate to="/patient/dashboard" state={{ tab: 'billing-payments' }} replace /> : <Navigate to="/login-select" replace />} />
          <Route path='/payment-history' element={token ? <Navigate to="/patient/dashboard" state={{ tab: 'billing-payments' }} replace /> : <Navigate to="/login-select" replace />} />
          
          {/* Non-authenticated redirect for patient portal path */}
          <Route path='/patient/*' element={token ? <Navigate to="/patient/dashboard" replace /> : <Navigate to="/login-select" replace />} />
          
          <Route path='/verify' element={<Verify />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password' element={<ResetPassword />} />
          <Route path='*' element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App