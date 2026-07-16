import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { LuCalendarDays, LuClock, LuTimer } from 'react-icons/lu'

const DoctorAvailability = () => {
  const { doctorProfileData, updateDoctorAvailability, getDoctorProfileData } = useContext(AppContext)
  
  const [workingDays, setWorkingDays] = useState([])
  const [workingHours, setWorkingHours] = useState([])
  const [timeSlots, setTimeSlots] = useState([])
  const [saving, setSaving] = useState(false)

  const daysOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const hoursOptions = ["Morning", "Afternoon", "Evening"]
  
  const slotsOptions = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", 
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", 
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"
  ]

  useEffect(() => {
    if (doctorProfileData) {
      setWorkingDays(doctorProfileData.workingDays || daysOptions)
      setWorkingHours(doctorProfileData.workingHours || hoursOptions)
      setTimeSlots(doctorProfileData.timeSlots || slotsOptions)
    }
  }, [doctorProfileData])

  const handleToggleDay = (day) => {
    setWorkingDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const handleToggleHour = (hour) => {
    setWorkingHours(prev => 
      prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]
    )
  }

  const handleToggleSlot = (slot) => {
    setTimeSlots(prev => 
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    )
  }

  const handleSelectAllDays = () => {
    setWorkingDays(workingDays.length === daysOptions.length ? [] : daysOptions)
  }

  const handleSelectAllSlots = () => {
    setTimeSlots(timeSlots.length === slotsOptions.length ? [] : slotsOptions)
  }

  const handleSave = async () => {
    setSaving(true)
    const success = await updateDoctorAvailability({ workingDays, workingHours, timeSlots })
    setSaving(false)
    if (success) {
      getDoctorProfileData()
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Availability</h1>
          <p className="text-gray-500 text-sm">Configure your consultation working days, hour brackets, and booking slots.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg disabled:opacity-50 transition-all duration-200"
        >
          {saving ? "Saving Changes..." : "Save Schedule"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Working Days */}
        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h4 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
              <LuCalendarDays className="text-primary" />
              Working Days
            </h4>
            <button 
              onClick={handleSelectAllDays}
              className="text-xs text-primary hover:underline font-semibold"
            >
              {workingDays.length === daysOptions.length ? "Deselect All" : "Select All"}
            </button>
          </div>
          <div className="flex flex-col gap-2.5 mt-1">
            {daysOptions.map((day) => (
              <label 
                key={day} 
                className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50/50 cursor-pointer select-none transition-all text-xs font-semibold text-gray-600"
              >
                <input 
                  type="checkbox" 
                  checked={workingDays.includes(day)}
                  onChange={() => handleToggleDay(day)}
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                />
                {day}
              </label>
            ))}
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <div className="border-b border-gray-100 pb-3">
            <h4 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
              <LuClock className="text-primary" />
              Working Hours
            </h4>
          </div>
          <div className="flex flex-col gap-2.5 mt-1">
            {hoursOptions.map((hour) => (
              <label 
                key={hour} 
                className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50/50 cursor-pointer select-none transition-all text-xs font-semibold text-gray-600"
              >
                <input 
                  type="checkbox" 
                  checked={workingHours.includes(hour)}
                  onChange={() => handleToggleHour(hour)}
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                />
                <div>
                  <p>{hour}</p>
                  <p className="text-[10px] text-gray-400 font-normal mt-0.5">
                    {hour === 'Morning' && '09:00 AM - 12:00 PM'}
                    {hour === 'Afternoon' && '12:00 PM - 05:00 PM'}
                    {hour === 'Evening' && '05:00 PM - 09:00 PM'}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h4 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
              <LuTimer className="text-primary" />
              Consultation Slots
            </h4>
            <button 
              onClick={handleSelectAllSlots}
              className="text-xs text-primary hover:underline font-semibold"
            >
              {timeSlots.length === slotsOptions.length ? "Deselect All" : "Select All"}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-1 max-h-[50vh] overflow-y-auto pr-1">
            {slotsOptions.map((slot) => {
              const isSelected = timeSlots.includes(slot)
              return (
                <div 
                  onClick={() => handleToggleSlot(slot)}
                  key={slot}
                  className={`text-center py-2.5 rounded-lg border text-xs font-semibold cursor-pointer select-none transition-all ${isSelected ? 'bg-primary border-primary text-white shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                  {slot}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorAvailability
