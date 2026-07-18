import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'

// Inline SVG Icon components to avoid external package resolution issues
const BedIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block">
    <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
  </svg>
)

const UserPlusIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
)

const UserCheckIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <polyline points="16 11 18 13 22 9" />
  </svg>
)

const RefreshCwIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`inline-block ${className}`}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

const AlertCircleIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

const RoomManagement = () => {
  const {
    aToken,
    rooms,
    getRooms,
    appointments,
    getAllAppointments,
    assignRoom,
    transferRoom,
    dischargeRoom,
    cancelRoomRequest,
    approveRoomRequest,
    rejectRoomRequest,
    getEligiblePatients
  } = useContext(AdminContext)

  const { slotDateFormat } = useContext(AppContext)

  const [activeTab, setActiveTab] = useState('inventory') // 'inventory' | 'requests' | 'admissions'
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  
  // Action Modals State
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showDischargeModal, setShowDischargeModal] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('General Ward')
  const [eligiblePatients, setEligiblePatients] = useState([])
  
  // Form parameters
  const [targetRoomNo, setTargetRoomNo] = useState('')
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().split('T')[0])
  const [expectedDischarge, setExpectedDischarge] = useState('')
  const [dischargeDate, setDischargeDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (aToken) {
      getRooms()
      getAllAppointments()
    }
  }, [aToken])

  const openAssignModalForAppt = async (appt = null) => {
    const list = await getEligiblePatients()
    setEligiblePatients(list)
    if (appt) {
      setSelectedAppt(appt)
      if (appt.roomCategory) setSelectedCategory(appt.roomCategory)
    } else if (list.length > 0) {
      setSelectedAppt(list[0])
      if (list[0].roomCategory) setSelectedCategory(list[0].roomCategory)
    } else {
      setSelectedAppt(null)
    }
    setTargetRoomNo('')
    setAdmissionDate(new Date().toISOString().split('T')[0])
    setExpectedDischarge('')
    setShowAssignModal(true)
  }

  // Get active rooms that have available capacity for a specific category
  const getAvailableRoomsForCategory = (category) => {
    return rooms.filter(room => 
      room.category === category && 
      room.status !== 'Maintenance' && 
      room.occupiedBeds < room.capacity
    )
  }

  // Calculate statistics
  const stats = (() => {
    let totalBeds = 0
    let occupiedBeds = 0
    let pendingRequests = 0
    let activeAdmissions = 0

    rooms.forEach(r => {
      totalBeds += r.capacity
      occupiedBeds += r.occupiedBeds
    })

    appointments.forEach(appt => {
      if (appt.roomRequested) {
        if (appt.roomStatus === 'Pending') pendingRequests++
        if (appt.roomStatus === 'Allocated') activeAdmissions++
      }
    })

    return {
      totalBeds,
      occupiedBeds,
      availableBeds: totalBeds - occupiedBeds,
      pendingRequests,
      activeAdmissions
    }
  })()

  // Format Room Category Display Name
  const formatCategory = (cat) => {
    if (cat === 'General Ward') return 'General Ward (GW)'
    if (cat === 'ICU') return 'ICU'
    if (cat === 'Semi Private / Twin Sharing') return 'Twin Sharing (TS)'
    if (cat === 'Private Room') return 'Private (PR)'
    return cat
  }

  // Action Submit handlers
  const handleAssignSubmit = async (e) => {
    e.preventDefault()
    if (!targetRoomNo || !admissionDate) {
      return toast.error("Please fill in Room Number and Admission Date.")
    }
    const success = await assignRoom(selectedAppt._id, targetRoomNo, admissionDate, expectedDischarge)
    if (success) {
      setShowAssignModal(false)
      setSelectedAppt(null)
      setTargetRoomNo('')
    }
  }

  const handleTransferSubmit = async (e) => {
    e.preventDefault()
    if (!targetRoomNo || !admissionDate) {
      return toast.error("Please fill in new Room Number and Admission Date.")
    }
    const success = await transferRoom(selectedAppt._id, targetRoomNo, admissionDate)
    if (success) {
      setShowTransferModal(false)
      setSelectedAppt(null)
      setTargetRoomNo('')
    }
  }

  const handleDischargeSubmit = async (e) => {
    e.preventDefault()
    if (!dischargeDate) {
      return toast.error("Please specify Discharge Date.")
    }
    const success = await dischargeRoom(selectedAppt._id, dischargeDate)
    if (success) {
      setShowDischargeModal(false)
      setSelectedAppt(null)
    }
  }

  return (
    <div className="m-5 flex flex-col gap-6 text-sm text-[#4A4A4A] w-full max-w-7xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Hospital Room Management</h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => openAssignModalForAppt()}
            className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-primary-dark transition shadow"
          >
            <UserPlusIcon size={14} />
            Assign Room
          </button>
          <button 
            onClick={() => { getRooms(); getAllAppointments(); }}
            className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-200 transition"
          >
            <RefreshCwIcon size={14} />
            Refresh Stats
          </button>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Occupied Beds */}
        <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-red-50 rounded-xl text-red-500">
            <BedIcon size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.occupiedBeds} / {stats.totalBeds}</p>
            <p className="text-xs text-gray-400 font-semibold uppercase">Beds Occupied</p>
          </div>
        </div>

        {/* Available Beds */}
        <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-green-50 rounded-xl text-green-600">
            <BedIcon size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.availableBeds}</p>
            <p className="text-xs text-gray-400 font-semibold uppercase">Available Beds</p>
          </div>
        </div>

        {/* Active Admissions */}
        <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 rounded-xl text-blue-600">
            <UserCheckIcon size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.activeAdmissions}</p>
            <p className="text-xs text-gray-400 font-semibold uppercase">Active Admitted Patients</p>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 rounded-xl text-amber-600">
            <UserPlusIcon size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.pendingRequests}</p>
            <p className="text-xs text-gray-400 font-semibold uppercase">Pending Requests</p>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`py-3 px-6 font-semibold border-b-2 transition-all ${activeTab === 'inventory' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
        >
          Rooms Inventory Overview
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`py-3 px-6 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'requests' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
        >
          Pending Requests
          {stats.pendingRequests > 0 && (
            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {stats.pendingRequests}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('admissions')}
          className={`py-3 px-6 font-semibold border-b-2 transition-all ${activeTab === 'admissions' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
        >
          Active Patient Admissions
        </button>
      </div>

      {/* Tab Panel Render */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm min-h-[400px]">
        {activeTab === 'inventory' && (
          <div>
            <h3 className="text-base font-bold text-gray-800 mb-4">Ward/Bed Live Inventory Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room, index) => {
                let badgeColor = 'bg-green-50 text-green-600 border-green-200'
                if (room.status === 'Full') badgeColor = 'bg-orange-50 text-orange-600 border-orange-200'
                if (room.status === 'Partially Occupied') badgeColor = 'bg-blue-50 text-blue-600 border-blue-200'
                if (room.status === 'Maintenance') badgeColor = 'bg-red-50 text-red-600 border-red-200'

                return (
                  <div key={index} className="border border-gray-150 rounded-2xl p-4 bg-gray-50/20 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-gray-800 text-base">Room {room.roomNumber}</h4>
                        <span className="text-[11px] font-semibold text-gray-400 uppercase">{formatCategory(room.category)}</span>
                      </div>
                      <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${badgeColor}`}>
                        {room.status}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-col gap-1 text-xs text-gray-600">
                      <p>Capacity: <span className="font-semibold text-gray-800">{room.capacity} beds</span></p>
                      <p>Occupied: <span className="font-semibold text-gray-800">{room.occupiedBeds} beds</span></p>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className={`h-full ${room.status === 'Full' ? 'bg-orange-500' : 'bg-primary'}`} 
                          style={{ width: `${(room.occupiedBeds / room.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            <h3 className="text-base font-bold text-gray-800 mb-4">Unified Room Booking Requests</h3>
            
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-3 mb-5 items-center bg-gray-50 p-4 rounded-xl border border-gray-150">
              <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Search</label>
                <input 
                  type="text"
                  placeholder="Search patient or doctor name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-xs outline-primary bg-white text-gray-800"
                />
              </div>

              <div className="flex flex-col gap-1 min-w-[150px]">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Requested Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-xs outline-primary bg-white text-gray-800"
                >
                  <option value="">All Categories</option>
                  <option value="General Ward">General Ward</option>
                  <option value="ICU">ICU</option>
                  <option value="Semi Private / Twin Sharing">Twin Sharing</option>
                  <option value="Private Room">Private Room</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 min-w-[150px]">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Current Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-xs outline-primary bg-white text-gray-800"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Allocated">Allocated</option>
                  <option value="Discharged">Discharged</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b text-gray-500 font-semibold">
                    <th className="p-3">Patient Details</th>
                    <th className="p-3">Doctor Details</th>
                    <th className="p-3">Requested By</th>
                    <th className="p-3">Admission Recommendation</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filteredRequests = appointments.filter(appt => {
                      if (!appt.roomRequested) return false;
                      const matchesSearch = 
                        appt.userData.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        appt.docData.name.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesCategory = filterCategory ? appt.roomCategory === filterCategory : true;
                      const matchesStatus = filterStatus ? appt.roomStatus === filterStatus : true;
                      return matchesSearch && matchesCategory && matchesStatus;
                    });

                    if (filteredRequests.length === 0) {
                      return (
                        <tr>
                          <td colSpan="6" className="p-6 text-center text-gray-400 italic">No room booking requests found matching filters.</td>
                        </tr>
                      );
                    }

                    return filteredRequests.map((appt, index) => {
                      let statusBadge = 'bg-amber-50 text-amber-600 border-amber-200';
                      if (appt.roomStatus === 'Approved') statusBadge = 'bg-blue-50 text-blue-600 border-blue-200';
                      if (appt.roomStatus === 'Rejected') statusBadge = 'bg-red-50 text-red-600 border-red-200';
                      if (appt.roomStatus === 'Allocated') statusBadge = 'bg-green-50 text-green-600 border-green-200';
                      if (appt.roomStatus === 'Discharged') statusBadge = 'bg-gray-50 text-gray-600 border-gray-200';

                      return (
                        <tr key={index} className="border-b hover:bg-gray-50/50">
                          <td className="p-3">
                            <span className="font-semibold text-gray-800 block">{appt.userData.name}</span>
                            <span className="text-[10px] text-gray-400">DOB: {appt.userData.dob}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-gray-800 block">{appt.docData.name}</span>
                            <span className="text-[10px] text-gray-400">Date: {appt.slotDate} | Time: {appt.slotTime}</span>
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${appt.roomRequestedBy === 'doctor' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                              {appt.roomRequestedBy === 'doctor' ? 'Doctor' : 'Patient'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-gray-700 block">{formatCategory(appt.roomCategory)}</span>
                            {appt.admissionRecommendedByDoctor && (
                              <span className="text-[10px] text-purple-500 italic font-semibold">
                                Recommended expected stay: {appt.expectedStayDays || '0'} Days
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${statusBadge}`}>
                              {appt.roomStatus}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2 justify-center">
                              {appt.roomStatus === 'Pending' && (
                                <>
                                  <button
                                    onClick={async () => {
                                      await approveRoomRequest(appt._id);
                                    }}
                                    className="bg-blue-500 text-white px-2.5 py-1 rounded hover:bg-blue-600 font-bold transition text-[10px]"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={async () => {
                                      await rejectRoomRequest(appt._id);
                                    }}
                                    className="bg-red-50 text-red-500 border border-red-200 px-2.5 py-1 rounded hover:bg-red-100 font-bold transition text-[10px]"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {(appt.roomStatus === 'Pending' || appt.roomStatus === 'Approved') && (
                                <button
                                  onClick={() => openAssignModalForAppt(appt)}
                                  className="bg-primary text-white px-2.5 py-1 rounded font-bold hover:bg-primary-dark transition text-[10px]"
                                >
                                  Assign Room
                                </button>
                              )}

                              {appt.roomStatus === 'Rejected' && (
                                <button
                                  onClick={async () => {
                                    await approveRoomRequest(appt._id);
                                  }}
                                  className="bg-blue-500 text-white px-2.5 py-1 rounded hover:bg-blue-600 font-bold transition text-[10px]"
                                >
                                  Approve
                                </button>
                              )}

                              {appt.roomStatus === 'Allocated' && (
                                <span className="text-[10px] text-gray-400 font-medium">Room {appt.roomNumber} Allocated</span>
                              )}

                              {appt.roomStatus !== 'Allocated' && appt.roomStatus !== 'Discharged' && (
                                <button
                                  onClick={async () => {
                                    if (window.confirm("Cancel this request?")) {
                                      await cancelRoomRequest(appt._id);
                                    }
                                  }}
                                  className="text-red-500 hover:text-red-700 font-bold text-[10px] px-1"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'admissions' && (
          <div>
            <h3 className="text-base font-bold text-gray-800 mb-4">Admitted Patient Occupancy</h3>
            
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-3 mb-5 items-center bg-gray-50 p-4 rounded-xl border border-gray-150">
              <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Search</label>
                <input 
                  type="text"
                  placeholder="Search patient or doctor name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-xs outline-primary bg-white text-gray-800"
                />
              </div>

              <div className="flex flex-col gap-1 min-w-[150px]">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Room Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-xs outline-primary bg-white text-gray-800"
                >
                  <option value="">All Categories</option>
                  <option value="General Ward">General Ward</option>
                  <option value="ICU">ICU</option>
                  <option value="Semi Private / Twin Sharing">Twin Sharing</option>
                  <option value="Private Room">Private Room</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b text-gray-500 font-semibold">
                    <th className="p-3">Patient</th>
                    <th className="p-3">Room / Category</th>
                    <th className="p-3">Admit Date</th>
                    <th className="p-3">Exp. Discharge</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filteredAdmissions = appointments.filter(appt => {
                      if (!appt.roomRequested || appt.roomStatus !== 'Allocated') return false;
                      const matchesSearch = 
                        appt.userData.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        appt.docData.name.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesCategory = filterCategory ? appt.roomCategory === filterCategory : true;
                      return matchesSearch && matchesCategory;
                    });

                    if (filteredAdmissions.length === 0) {
                      return (
                        <tr>
                          <td colSpan="5" className="p-6 text-center text-gray-400 italic">No active patient room admissions found.</td>
                        </tr>
                      );
                    }

                    return filteredAdmissions.map((appt, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50/50">
                        <td className="p-3 font-semibold text-gray-800">
                          {appt.userData.name}
                          <span className="text-[10px] text-gray-400 block font-light">Doctor: {appt.docData.name}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-gray-800">Room {appt.roomNumber}</span>
                          <span className="text-[10px] text-primary block">{appt.roomCategory}</span>
                        </td>
                        <td className="p-3">{new Date(appt.roomAdmissionDate).toLocaleDateString()}</td>
                        <td className="p-3">{appt.roomExpectedDischarge ? new Date(appt.roomExpectedDischarge).toLocaleDateString() : 'N/A'}</td>
                        <td className="p-3">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => {
                                setSelectedAppt(appt);
                                setTargetRoomNo('');
                                setAdmissionDate(new Date().toISOString().split('T')[0]);
                                setShowTransferModal(true);
                              }}
                              className="bg-primary text-white px-3 py-1.5 rounded-lg font-bold hover:bg-primary-dark transition text-[10px]"
                            >
                              Transfer
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAppt(appt)
                                setDischargeDate(new Date().toISOString().split('T')[0])
                                setShowDischargeModal(true)
                              }}
                              className="bg-green-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-green-600 transition text-[10px]"
                            >
                              Discharge
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm("Cancel allocation and clear patient room profile?")) {
                                  await cancelRoomRequest(appt._id)
                                }
                              }}
                              className="border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition text-[10px]"
                            >
                              Cancel Allocation
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Assign Room Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-gray-800 mb-4">Assign Room Admission</h3>
            
            <form onSubmit={handleAssignSubmit} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-700">Select Eligible Patient (Accepted & Not Completed) *</label>
                <select
                  required
                  value={selectedAppt?._id || ''}
                  onChange={(e) => {
                    const found = eligiblePatients.find(p => p._id === e.target.value);
                    setSelectedAppt(found || null);
                    if (found && found.roomCategory) {
                      setSelectedCategory(found.roomCategory);
                    }
                  }}
                  className="border rounded p-2 bg-white text-gray-800 font-semibold"
                >
                  <option value="">-- Choose Patient / Appointment --</option>
                  {eligiblePatients.map((appt, idx) => (
                    <option key={idx} value={appt._id}>
                      {appt.userData.name} (Dr. {appt.docData.name} - {appt.slotDate}) {appt.roomRequested ? `[Req: ${appt.roomCategory}]` : ''}
                    </option>
                  ))}
                </select>
                {eligiblePatients.length === 0 && (
                  <p className="text-[10px] text-amber-600 font-semibold mt-1">No eligible patients currently available (must be Accepted & not Completed).</p>
                )}
              </div>

              {selectedAppt && (
                <div className="p-3 bg-gray-50 border rounded-xl text-xs flex flex-col gap-1">
                  <p><span className="font-semibold text-gray-700">Patient:</span> {selectedAppt.userData.name}</p>
                  <p><span className="font-semibold text-gray-700">Doctor:</span> Dr. {selectedAppt.docData.name}</p>
                  {selectedAppt.roomRequested && (
                    <p><span className="font-semibold text-primary">Requested Category:</span> {selectedAppt.roomCategory}</p>
                  )}
                </div>
              )}
              
              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-700">Select Room Category *</label>
                <select
                  required
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value)
                    setTargetRoomNo('')
                  }}
                  className="border rounded p-2 bg-white"
                >
                  <option value="General Ward">General Ward</option>
                  <option value="ICU">ICU</option>
                  <option value="Semi Private / Twin Sharing">Twin Sharing</option>
                  <option value="Private Room">Private Room</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-700">Select Available Room *</label>
                <select
                  required
                  value={targetRoomNo}
                  onChange={(e) => setTargetRoomNo(e.target.value)}
                  className="border rounded p-2 bg-white"
                >
                  <option value="">-- Select Room Number --</option>
                  {getAvailableRoomsForCategory(selectedCategory).map((room, idx) => (
                    <option key={idx} value={room.roomNumber}>
                      Room {room.roomNumber} (Beds occupied: {room.occupiedBeds} / {room.capacity})
                    </option>
                  ))}
                </select>
                {getAvailableRoomsForCategory(selectedCategory).length === 0 && (
                  <p className="text-[10px] text-red-500 flex items-center gap-1 font-semibold mt-1">
                    <AlertCircleIcon size={12} /> No available capacity in this room category!
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-700">Admission Date *</label>
                <input 
                  type="date"
                  required
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  className="border rounded p-2"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-700">Expected Discharge Date</label>
                <input 
                  type="date"
                  value={expectedDischarge}
                  onChange={(e) => setExpectedDischarge(e.target.value)}
                  className="border rounded p-2"
                />
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={getAvailableRoomsForCategory(selectedAppt.roomCategory).length === 0}
                  className="px-4 py-2 bg-primary text-white rounded-xl font-semibold shadow disabled:opacity-50 hover:bg-primary-dark transition"
                >
                  Assign Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Patient Modal */}
      {showTransferModal && selectedAppt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-gray-800 mb-4">Transfer Patient Room</h3>
            <div className="p-3 bg-gray-50 border rounded-xl text-xs mb-4">
              <p><span className="font-semibold">Patient:</span> {selectedAppt.userData.name}</p>
              <p><span className="font-semibold">Current Room:</span> Room {selectedAppt.roomNumber} ({selectedAppt.roomCategory})</p>
            </div>
            
            <form onSubmit={handleTransferSubmit} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-700">Select Target Room * (Any Category with Capacity)</label>
                <select
                  required
                  value={targetRoomNo}
                  onChange={(e) => setTargetRoomNo(e.target.value)}
                  className="border rounded p-2 bg-white"
                >
                  <option value="">-- Select Room Number --</option>
                  {rooms.filter(r => r.status !== 'Maintenance' && r.occupiedBeds < r.capacity && r.roomNumber !== selectedAppt.roomNumber).map((room, idx) => (
                    <option key={idx} value={room.roomNumber}>
                      Room {room.roomNumber} - {formatCategory(room.category)} (Beds occupied: {room.occupiedBeds} / {room.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-700">Transfer / Admission Date *</label>
                <input 
                  type="date"
                  required
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  className="border rounded p-2"
                />
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-xl font-semibold shadow hover:bg-primary-dark transition"
                >
                  Transfer Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discharge Patient Modal */}
      {showDischargeModal && selectedAppt && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-gray-800 mb-4">Discharge Patient & Free Bed</h3>
            <div className="p-3 bg-gray-50 border rounded-xl text-xs mb-4">
              <p><span className="font-semibold">Patient:</span> {selectedAppt.userData.name}</p>
              <p><span className="font-semibold">Assigned Room:</span> Room {selectedAppt.roomNumber} ({selectedAppt.roomCategory})</p>
              <p><span className="font-semibold">Admission Date:</span> {new Date(selectedAppt.roomAdmissionDate).toLocaleDateString()}</p>
            </div>
            
            <form onSubmit={handleDischargeSubmit} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-700">Specify Discharge Date *</label>
                <input 
                  type="date"
                  required
                  value={dischargeDate}
                  onChange={(e) => setDischargeDate(e.target.value)}
                  className="border rounded p-2"
                />
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowDischargeModal(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-xl font-semibold shadow hover:bg-green-600 transition"
                >
                  Confirm Discharge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoomManagement
