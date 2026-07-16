import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const DoctorLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)

  const { backendUrl, token, setToken, setRole } = useContext(AppContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      navigate('/doctor/dashboard')
    }
  }, [token])

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data } = await axios.post(backendUrl + '/api/doctor/login', { email, password })

      if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('role', 'doctor')
        setToken(data.token)
        setRole('doctor')
        toast.success("Doctor logged in successfully!")
        navigate('/doctor/dashboard')
      } else {
        toast.error(data.message || "Invalid doctor credentials")
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center justify-center bg-gray-50/50">
      <div className="flex flex-col gap-4 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border border-gray-150 rounded-2xl bg-white text-[#5E5E5E] text-sm shadow-xl">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800"><span className="text-primary">Doctor</span> Login</h2>
          <p className="text-gray-500 mt-1">Please log in to manage your appointments</p>
        </div>

        <div className="w-full">
          <label className="font-medium text-gray-700">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded-lg w-full p-2.5 mt-1.5 outline-primary focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="doctor@hospital.com"
            required 
          />
        </div>

        <div className="w-full relative">
          <label className="font-medium text-gray-700">Password</label>
          <input 
            type={showPassword ? "text" : "password"} 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded-lg w-full p-2.5 mt-1.5 outline-primary focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="••••••••"
            required 
          />
        </div>

        <div className="w-full flex items-center justify-between text-xs mt-1">
          <label className="flex items-center gap-2 cursor-pointer font-medium select-none">
            <input 
              type="checkbox" 
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="accent-primary w-4 h-4 rounded cursor-pointer" 
            />
            Remember Me
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer font-medium select-none text-primary hover:underline">
            <input 
              type="checkbox" 
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="accent-primary w-4 h-4 rounded cursor-pointer" 
            />
            Show Password
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="bg-primary hover:bg-primary-dark text-white w-full py-3 rounded-xl text-base font-semibold shadow-md hover:shadow-lg disabled:opacity-50 transition-all duration-200 mt-4"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center w-full mt-2 text-xs">
          Not a Doctor? <span onClick={() => navigate('/login')} className="text-primary hover:underline cursor-pointer font-semibold">Login as Patient</span>
        </p>
      </div>
    </form>
  )
}

export default DoctorLogin
