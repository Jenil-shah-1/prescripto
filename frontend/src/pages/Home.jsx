import React, { useContext } from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { LuBed } from 'react-icons/lu'

const Home = () => {
  const { token } = useContext(AppContext)
  const navigate = useNavigate()

  const handleRequestRoomClick = () => {
    if (token) {
      navigate('/patient/dashboard', { state: { tab: 'room-requests' } })
    } else {
      toast.info("Please login to request a room.")
      navigate('/login-select')
    }
  }

  return (
    <div>
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
      
      {/* Hospital Admission Section */}
      <div className="my-16 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-8 md:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary/10 text-primary rounded-2xl hidden sm:block">
            <LuBed size={32} />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">Need Hospital Admission?</h3>
            <p className="text-gray-500 text-xs md:text-sm mt-1.5 max-w-xl">
              If your health condition requires continuous ward monitoring, you can submit a room request. Select from General Wards, ICU facilities, Twin Sharing, or Private Rooms.
            </p>
          </div>
        </div>
        <button
          onClick={handleRequestRoomClick}
          className="bg-primary text-white px-8 py-3.5 rounded-full font-bold text-xs md:text-sm hover:bg-primary-dark hover:scale-105 transition-all duration-200 shadow-md shadow-primary/20 whitespace-nowrap"
        >
          Request Room Admission
        </button>
      </div>
    </div>
  )
}

export default Home