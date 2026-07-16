import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { LuSearch, LuUser, LuChevronRight, LuCalendarDays, LuBookOpen } from 'react-icons/lu'

const DoctorPatients = () => {
  const { token, doctorPatients, getDoctorPatients } = useContext(AppContext)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)

  useEffect(() => {
    if (token) {
      getDoctorPatients()
    }
  }, [token])

  const calculateAge = (dob) => {
    if (!dob || dob === 'Not Selected') return 'N/A'
    const birthDate = new Date(dob)
    if (isNaN(birthDate)) return 'N/A'
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const slotDateFormat = (slotDate) => {
    if (!slotDate) return ''
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const dateArray = slotDate.split('_')
    if (dateArray.length < 3) return slotDate
    return dateArray[0] + " " + months[Number(dateArray[1]) - 1] + " " + dateArray[2]
  }

  // Filter patients by name/email
  const filteredPatients = doctorPatients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activePatient = selectedPatient || (filteredPatients.length > 0 ? filteredPatients[0] : null)

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Patients</h1>
        <p className="text-gray-500 text-sm">Access clinical records, history of consults, and notes for all your patients.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Patient List */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Search bar */}
          <div className="bg-white border border-gray-150 p-3 rounded-xl shadow-sm flex items-center gap-2">
            <LuSearch className="text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search patients by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="outline-none text-sm w-full bg-transparent"
            />
          </div>

          {/* Patients Listing */}
          <div className="bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">No patients found.</div>
            ) : (
              filteredPatients.map((patient) => {
                const isActive = activePatient && activePatient._id === patient._id
                return (
                  <div 
                    onClick={() => setSelectedPatient(patient)}
                    key={patient._id}
                    className={`flex items-center justify-between p-4 cursor-pointer transition-all ${isActive ? 'bg-[#F2F3FF]' : 'hover:bg-gray-50/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={patient.image} className="w-10 h-10 rounded-full object-cover border border-gray-200" alt="" />
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{patient.name}</p>
                        <p className="text-xs text-gray-500">{patient.email}</p>
                      </div>
                    </div>
                    <LuChevronRight size={16} className={isActive ? 'text-primary' : 'text-gray-300'} />
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Side: Selected Patient Details Card */}
        <div className="lg:col-span-2">
          {activePatient ? (
            <div className="bg-white border border-gray-150 rounded-2xl shadow-sm p-6 flex flex-col gap-6">
              {/* Patient Profile info */}
              <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start pb-5 border-b border-gray-100">
                <img src={activePatient.image} className="w-20 h-20 rounded-2xl object-cover border border-gray-200" alt="" />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center justify-center sm:justify-start gap-2">
                    <LuUser className="text-primary" />
                    {activePatient.name}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 mt-4 text-sm text-gray-600">
                    <p><span className="font-semibold block text-[11px] text-gray-400 uppercase">Age</span> {calculateAge(activePatient.dob)} Years</p>
                    <p><span className="font-semibold block text-[11px] text-gray-400 uppercase">Gender</span> {activePatient.gender}</p>
                    <p><span className="font-semibold block text-[11px] text-gray-400 uppercase">Email</span> {activePatient.email}</p>
                    <p><span className="font-semibold block text-[11px] text-gray-400 uppercase">Phone</span> {activePatient.phone || 'N/A'}</p>
                    <p className="md:col-span-2"><span className="font-semibold block text-[11px] text-gray-400 uppercase">Address</span> {activePatient.address?.line1 || 'No address specified'}{activePatient.address?.line2 && `, ${activePatient.address.line2}`}</p>
                  </div>
                </div>
              </div>

              {/* Consultation History */}
              <div>
                <h4 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                  <LuCalendarDays className="text-primary" />
                  Consultation History
                </h4>
                
                {activePatient.appointments && activePatient.appointments.length === 0 ? (
                  <p className="text-center py-6 text-gray-400 text-sm bg-gray-50/50 rounded-xl border border-gray-100">No appointments recorded with this patient.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {activePatient.appointments.map((appt, idx) => (
                      <div key={idx} className="border border-gray-150 rounded-xl p-4 flex flex-col gap-3 hover:shadow-sm transition-all bg-white">
                        <div className="flex flex-wrap justify-between items-center text-xs">
                          <span className="font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">ID: {appt._id}</span>
                          <span className="text-gray-400 font-medium">{slotDateFormat(appt.slotDate)} | {appt.slotTime}</span>
                        </div>
                        <div className="text-sm">
                          <p className="font-semibold text-gray-700">Reason: <span className="font-normal text-gray-500">"{appt.reason}"</span></p>
                        </div>
                        {appt.doctorNotes ? (
                          <div className="bg-blue-50/50 border border-blue-100/50 p-3 rounded-lg flex items-start gap-2.5">
                            <LuBookOpen className="text-primary flex-shrink-0 mt-0.5" size={16} />
                            <div>
                              <span className="text-[10px] font-bold text-primary block uppercase tracking-wider">Clinical Notes</span>
                              <p className="text-xs text-gray-600 mt-0.5 italic">"{appt.doctorNotes}"</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">No notes recorded for this session.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-150 rounded-2xl p-10 text-center text-gray-400 shadow-sm">
              Select a patient from the list to view their consultation history and notes.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorPatients
