import React from 'react'
import { useNavigate } from 'react-router-dom'

const LoginSelect = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50/50">
      <div className="flex flex-col gap-6 m-auto items-center p-10 min-w-[340px] sm:min-w-96 border border-gray-150 rounded-2xl bg-white text-[#5E5E5E] text-sm shadow-xl transition-all duration-300 hover:shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Welcome Back</h2>
          <p className="text-gray-500 mt-2 text-sm">Choose how you want to continue</p>
        </div>
        
        <div className="w-full flex flex-col gap-4 mt-4">
          <button 
            onClick={() => navigate('/login')} 
            className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 px-4 rounded-xl text-base font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            Continue as Patient
          </button>
          
          <button 
            onClick={() => navigate('/doctor/login')} 
            className="w-full bg-white hover:bg-gray-50 text-primary border border-primary/30 py-3.5 px-4 rounded-xl text-base font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            Continue as Doctor
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginSelect
