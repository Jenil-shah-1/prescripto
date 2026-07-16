import React, { useContext, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import { LuMail, LuKeyRound, LuShieldCheck } from 'react-icons/lu'

const DoctorSettings = () => {
  const { doctorProfileData, changeDoctorPassword, updateDoctorEmail } = useContext(AppContext)
  
  // Password state
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Email state
  const [newEmail, setNewEmail] = useState(doctorProfileData?.email || '')
  const [emailLoading, setEmailLoading] = useState(false)

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match!")
    }
    if (newPassword.length < 8) {
      return toast.error("New password must be at least 8 characters long")
    }

    setPasswordLoading(true)
    const success = await changeDoctorPassword(oldPassword, newPassword, confirmPassword)
    setPasswordLoading(false)
    if (success) {
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  const handleEmailChangeSubmit = async (e) => {
    e.preventDefault()
    if (newEmail === doctorProfileData?.email) {
      return toast.warning("Email is same as current email")
    }

    setEmailLoading(true)
    const success = await updateDoctorEmail(newEmail)
    setEmailLoading(false)
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
        <p className="text-gray-500 text-sm">Manage your security credentials and primary contact email.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Email settings card */}
        <form onSubmit={handleEmailChangeSubmit} className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h4 className="font-bold text-gray-700 flex items-center gap-2 text-sm border-b border-gray-100 pb-3">
            <LuMail className="text-primary" />
            Update Email Address
          </h4>

          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-xs font-semibold text-gray-400 uppercase">Current Email</label>
            <p className="text-sm font-semibold text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              {doctorProfileData?.email}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase">New Email Address</label>
            <input 
              type="email" 
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="border border-gray-300 rounded-lg p-2.5 outline-primary focus:ring-1 focus:ring-primary text-sm font-medium"
              placeholder="new-email@hospital.com"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={emailLoading}
            className="bg-primary hover:bg-primary-dark text-white py-2.5 px-6 rounded-xl font-semibold shadow-sm hover:shadow transition-all duration-200 self-end disabled:opacity-50 text-xs mt-2"
          >
            {emailLoading ? "Updating..." : "Update Email"}
          </button>
        </form>

        {/* Password settings card */}
        <form onSubmit={handlePasswordChangeSubmit} className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h4 className="font-bold text-gray-700 flex items-center gap-2 text-sm border-b border-gray-100 pb-3">
            <LuKeyRound className="text-primary" />
            Change Password
          </h4>

          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-xs font-semibold text-gray-400 uppercase">Current Password</label>
            <input 
              type="password" 
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="border border-gray-300 rounded-lg p-2.5 outline-primary focus:ring-1 focus:ring-primary text-sm font-medium"
              placeholder="••••••••"
              required 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase">New Password</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border border-gray-300 rounded-lg p-2.5 outline-primary focus:ring-1 focus:ring-primary text-sm font-medium"
              placeholder="••••••••"
              required 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase">Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border border-gray-300 rounded-lg p-2.5 outline-primary focus:ring-1 focus:ring-primary text-sm font-medium"
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={passwordLoading}
            className="bg-primary hover:bg-primary-dark text-white py-2.5 px-6 rounded-xl font-semibold shadow-sm hover:shadow transition-all duration-200 self-end disabled:opacity-50 text-xs mt-2"
          >
            {passwordLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default DoctorSettings
