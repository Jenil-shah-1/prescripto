import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { LuImage, LuBriefcase, LuGraduationCap, LuShieldAlert, LuCheck } from 'react-icons/lu'

const DoctorProfile = () => {
  const { doctorProfileData, updateDoctorProfile, getDoctorProfileData, currencySymbol } = useContext(AppContext)
  
  const [isEdit, setIsEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Profile state hooks
  const [name, setName] = useState('')
  const [degree, setDegree] = useState('')
  const [speciality, setSpeciality] = useState('')
  const [experience, setExperience] = useState('')
  const [fees, setFees] = useState(0)
  const [about, setAbout] = useState('')
  const [hospital, setHospital] = useState('')
  const [languages, setLanguages] = useState('')
  const [available, setAvailable] = useState(true)
  const [address, setAddress] = useState({ line1: '', line2: '' })
  const [image, setImage] = useState('')

  useEffect(() => {
    if (doctorProfileData) {
      setName(doctorProfileData.name || '')
      setDegree(doctorProfileData.degree || '')
      setSpeciality(doctorProfileData.speciality || '')
      setExperience(doctorProfileData.experience || '')
      setFees(doctorProfileData.fees || 0)
      setAbout(doctorProfileData.about || '')
      setHospital(doctorProfileData.hospital || 'General Hospital')
      setLanguages(Array.isArray(doctorProfileData.languages) ? doctorProfileData.languages.join(', ') : 'English')
      setAvailable(doctorProfileData.available !== undefined ? doctorProfileData.available : true)
      setAddress(doctorProfileData.address || { line1: '', line2: '' })
      setImage(doctorProfileData.image || '')
    }
  }, [doctorProfileData])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      name,
      degree,
      speciality,
      experience,
      fees: Number(fees),
      about,
      hospital,
      languages: languages.split(',').map(lang => lang.trim()).filter(Boolean),
      available,
      address,
      image
    }
    const success = await updateDoctorProfile(payload)
    setSaving(false)
    if (success) {
      setIsEdit(false)
      getDoctorProfileData()
    }
  }

  if (!doctorProfileData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-500 text-sm">Update your bio, fees, languages, and consultation settings.</p>
        </div>
        {!isEdit ? (
          <button 
            onClick={() => setIsEdit(true)}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsEdit(false)}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-xl font-semibold transition-all duration-200"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg disabled:opacity-50 transition-all duration-200"
            >
              {saving ? "Saving..." : "Save Info"}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Profile Picture Card */}
        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm flex flex-col items-center gap-4">
          <div className="relative group">
            <img 
              src={image} 
              className="w-48 h-48 rounded-2xl object-cover border border-gray-200 bg-[#EAEFFF]" 
              alt="" 
            />
            {isEdit && (
              <label className="absolute inset-0 bg-black/45 rounded-2xl flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-200">
                <LuImage size={24} />
                <span className="text-xs font-semibold mt-1.5">Change Photo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="hidden" 
                />
              </label>
            )}
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-800">{name}</h3>
            <p className="text-gray-400 text-xs mt-0.5">{doctorProfileData.email}</p>
          </div>

          <div className="w-full border-t border-gray-100 pt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-gray-400">Account Role:</span>
              <span className="text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider text-[10px]">Doctor</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-gray-400">Status:</span>
              <span className={`flex items-center gap-1.5 ${available ? 'text-green-600' : 'text-amber-500'}`}>
                {available ? <LuCheck size={14} /> : <LuShieldAlert size={14} />}
                {available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        </div>

        {/* Bio & Details Form Card */}
        <div className="md:col-span-2 bg-white border border-gray-150 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Name */}
            <div>
              <label className="font-semibold text-gray-400 text-xs uppercase">Full Name</label>
              {isEdit ? (
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-1 focus:ring-primary outline-none text-sm font-semibold"
                />
              ) : (
                <p className="text-gray-800 font-semibold text-sm mt-1.5">{name}</p>
              )}
            </div>

            {/* Speciality */}
            <div>
              <label className="font-semibold text-gray-400 text-xs uppercase">Specialization</label>
              {isEdit ? (
                <input 
                  type="text" 
                  value={speciality} 
                  onChange={(e) => setSpeciality(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-1 focus:ring-primary outline-none text-sm font-semibold"
                />
              ) : (
                <p className="text-gray-800 font-semibold text-sm mt-1.5 flex items-center gap-1.5">
                  <LuBriefcase size={15} className="text-primary" />
                  {speciality}
                </p>
              )}
            </div>

            {/* Degree / Qualification */}
            <div>
              <label className="font-semibold text-gray-400 text-xs uppercase">Qualification (Degree)</label>
              {isEdit ? (
                <input 
                  type="text" 
                  value={degree} 
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-1 focus:ring-primary outline-none text-sm font-semibold"
                />
              ) : (
                <p className="text-gray-800 font-semibold text-sm mt-1.5 flex items-center gap-1.5">
                  <LuGraduationCap size={16} className="text-primary" />
                  {degree}
                </p>
              )}
            </div>

            {/* Experience */}
            <div>
              <label className="font-semibold text-gray-400 text-xs uppercase">Experience</label>
              {isEdit ? (
                <input 
                  type="text" 
                  value={experience} 
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 5 Years"
                  className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-1 focus:ring-primary outline-none text-sm font-semibold"
                />
              ) : (
                <p className="text-gray-800 font-semibold text-sm mt-1.5">{experience}</p>
              )}
            </div>

            {/* Consultation Fee */}
            <div>
              <label className="font-semibold text-gray-400 text-xs uppercase">Consultation Fee</label>
              {isEdit ? (
                <input 
                  type="number" 
                  value={fees} 
                  onChange={(e) => setFees(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-1 focus:ring-primary outline-none text-sm font-semibold"
                />
              ) : (
                <p className="text-gray-800 font-semibold text-sm mt-1.5">{currencySymbol} {fees}</p>
              )}
            </div>

            {/* Hospital */}
            <div>
              <label className="font-semibold text-gray-400 text-xs uppercase">Affiliated Hospital</label>
              {isEdit ? (
                <input 
                  type="text" 
                  value={hospital} 
                  onChange={(e) => setHospital(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-1 focus:ring-primary outline-none text-sm font-semibold"
                />
              ) : (
                <p className="text-gray-800 font-semibold text-sm mt-1.5">{hospital}</p>
              )}
            </div>

            {/* Languages */}
            <div>
              <label className="font-semibold text-gray-400 text-xs uppercase">Spoken Languages</label>
              {isEdit ? (
                <input 
                  type="text" 
                  value={languages} 
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="Comma separated: English, Spanish"
                  className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-1 focus:ring-primary outline-none text-sm font-semibold"
                />
              ) : (
                <p className="text-gray-800 font-semibold text-sm mt-1.5">{languages}</p>
              )}
            </div>

            {/* Available Checkbox */}
            {isEdit && (
              <div className="flex items-center gap-2 mt-4 select-none">
                <input 
                  type="checkbox" 
                  id="avail-check"
                  checked={available}
                  onChange={() => setAvailable(!available)}
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                />
                <label htmlFor="avail-check" className="font-semibold text-gray-600 text-xs uppercase cursor-pointer">Available for Consultation</label>
              </div>
            )}
          </div>

          {/* Address */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-400 text-xs uppercase">Clinic Address</label>
            {isEdit ? (
              <div className="flex flex-col gap-2">
                <input 
                  type="text" 
                  value={address.line1} 
                  onChange={(e) => setAddress(prev => ({ ...prev, line1: e.target.value }))}
                  placeholder="Address Line 1"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-primary outline-none text-sm font-semibold"
                />
                <input 
                  type="text" 
                  value={address.line2} 
                  onChange={(e) => setAddress(prev => ({ ...prev, line2: e.target.value }))}
                  placeholder="Address Line 2"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-primary outline-none text-sm font-semibold"
                />
              </div>
            ) : (
              <p className="text-gray-800 font-semibold text-sm mt-1">
                {address.line1 || 'No address line 1'}<br />
                {address.line2 && address.line2}
              </p>
            )}
          </div>

          {/* About */}
          <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
            <label className="font-semibold text-gray-400 text-xs uppercase">About Me (Bio)</label>
            {isEdit ? (
              <textarea 
                value={about} 
                onChange={(e) => setAbout(e.target.value)}
                rows={5}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-1 focus:ring-primary outline-none text-sm font-medium"
              ></textarea>
            ) : (
              <p className="text-gray-600 text-sm font-light leading-relaxed whitespace-pre-line">{about}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile
