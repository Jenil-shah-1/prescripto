import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const AllAppointments = () => {

  const { aToken, appointments, cancelAppointment, acceptAppointment, rejectAppointment, completeAppointment, getAllAppointments, bills, getBillsAdmin } = useContext(AdminContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)

  // Complete consultation modal state
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [apptToComplete, setApptToComplete] = useState(null)
  const [diagnosis, setDiagnosis] = useState('')
  const [medNotes, setMedNotes] = useState('')
  const [prescription, setPrescription] = useState([{ medicine: '', dosage: '', advice: '' }])
  const [nextVisit, setNextVisit] = useState(false)
  const [followUpDate, setFollowUpDate] = useState('')
  const [followUpTime, setFollowUpTime] = useState('')
  const [followUpReason, setFollowUpReason] = useState('')
  const [followUpNotes, setFollowUpNotes] = useState('')
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    if (aToken) {
      getAllAppointments()
      getBillsAdmin()
    }
  }, [aToken])

  return (
    <div className='w-full max-w-6xl m-5 '>

      <p className='mb-3 text-lg font-medium'>All Appointments</p>

      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>
        <div className='hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Action</p>
        </div>
        {appointments.map((item, index) => (
          <div className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50' key={index}>
            <p className='max-sm:hidden'>{index+1}</p>
            <div className='flex items-center gap-2'>
              <img src={item.userData.image} className='w-8 rounded-full' alt="" /> <p>{item.userData.name}</p>
            </div>
            <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
            <div className='flex items-center gap-2'>
              <img src={item.docData.image} className='w-8 rounded-full bg-gray-200' alt="" /> <p>{item.docData.name}</p>
            </div>
            <div className="flex flex-col gap-1 items-start">
              <p className="font-bold text-gray-800">{currency}{item.amount}</p>
              {(() => {
                const bill = bills.find(b => b.appointmentId === item._id)
                if (!bill) {
                  return <span className="text-[10px] text-gray-400 italic">No Bill</span>
                }
                return (
                  <span className={`text-[9px] font-bold border px-1.5 py-0.2 rounded uppercase ${
                    bill.paymentStatus === 'Paid' 
                      ? 'bg-green-50 text-green-600 border-green-100' 
                      : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {bill.paymentStatus}
                  </span>
                )
              })()}
            </div>
            <div className="flex items-center gap-1">
              {item.cancelled ? (
                <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded text-xs font-medium">Cancelled</span>
              ) : item.isCompleted ? (
                <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-medium">Completed</span>
              ) : item.isRejected ? (
                <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded text-xs font-medium">Rejected</span>
              ) : item.isAccepted ? (
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs font-medium">Accepted</span>
              ) : (
                <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs font-medium">Pending</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Complete Consultation Modal */}
      {showCompleteModal && apptToComplete && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150">
              <h3 className="text-base font-bold text-gray-800">
                Complete Consultation - {apptToComplete.userData.name}
              </h3>
              <button 
                onClick={() => setShowCompleteModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content Form */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!diagnosis.trim() || !medNotes.trim()) {
                return toast.error("Diagnosis and Medical Notes are required.");
              }
              const invalidPres = prescription.some(p => !p.medicine.trim() || !p.dosage.trim());
              if (invalidPres) {
                return toast.error("Please fill in Medicine Name and Dosage for all prescribed items.");
              }
              if (nextVisit && (!followUpDate || !followUpTime)) {
                return toast.error("Follow-up Date and Time are required.");
              }

              setCompleting(true);
              const success = await completeAppointment(apptToComplete._id, {
                diagnosis,
                doctorNotes: medNotes,
                prescription,
                nextVisitRequired: nextVisit,
                followUpDate,
                followUpTime,
                followUpReason,
                followUpNotes
              });
              setCompleting(false);

              if (success) {
                setShowCompleteModal(false);
                getAllAppointments();
              }
            }} className="p-6 flex flex-col gap-5 text-sm">
              
              {/* Diagnosis */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-gray-700 text-xs">Diagnosis *</label>
                <input 
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="border border-gray-300 rounded-xl p-2.5 outline-primary focus:ring-1 focus:ring-primary w-full text-xs font-semibold text-gray-800"
                  placeholder="e.g. Acute Viral Bronchitis"
                />
              </div>

              {/* Medical Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-gray-700 text-xs">Medical / Consultation Notes *</label>
                <textarea 
                  required
                  value={medNotes}
                  onChange={(e) => setMedNotes(e.target.value)}
                  rows="3"
                  className="border border-gray-300 rounded-xl p-2.5 outline-primary focus:ring-1 focus:ring-primary w-full text-xs"
                  placeholder="Record symptoms, clinical notes, diagnosis remarks, or general health observations..."
                ></textarea>
              </div>

              {/* Prescriptions List */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-gray-700 text-xs">Prescription / Medicines *</label>
                  <button 
                    type="button"
                    onClick={() => setPrescription([...prescription, { medicine: '', dosage: '', advice: '' }])}
                    className="text-[10px] bg-primary text-white px-3 py-1 rounded hover:bg-primary-dark transition font-semibold"
                  >
                    + Add Medicine
                  </button>
                </div>
                
                <div className="flex flex-col gap-2">
                  {prescription.map((pres, idx) => (
                    <div key={idx} className="flex gap-2 items-center border p-3 rounded-xl bg-gray-50/50">
                      <input 
                        type="text" 
                        placeholder="Medicine Name"
                        required
                        value={pres.medicine}
                        onChange={(e) => {
                          const updated = [...prescription];
                          updated[idx].medicine = e.target.value;
                          setPrescription(updated);
                        }}
                        className="border rounded p-2 outline-primary text-xs w-1/3 bg-white"
                      />
                      <input 
                        type="text" 
                        placeholder="Dosage (e.g. 1-0-1)"
                        required
                        value={pres.dosage}
                        onChange={(e) => {
                          const updated = [...prescription];
                          updated[idx].dosage = e.target.value;
                          setPrescription(updated);
                        }}
                        className="border rounded p-2 outline-primary text-xs w-1/4 bg-white"
                      />
                      <input 
                        type="text" 
                        placeholder="Instructions / Advice"
                        value={pres.advice}
                        onChange={(e) => {
                          const updated = [...prescription];
                          updated[idx].advice = e.target.value;
                          setPrescription(updated);
                        }}
                        className="border rounded p-2 outline-primary text-xs flex-1 bg-white"
                      />
                      {prescription.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => {
                            const updated = [...prescription];
                            updated.splice(idx, 1);
                            setPrescription(updated);
                          }}
                          className="text-red-500 hover:text-red-700 font-bold px-1 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Follow-up Section */}
              <div className="border-t pt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700 text-xs">Does this patient require a follow-up visit?</span>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setNextVisit(true)}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${nextVisit ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
                    >
                      Yes
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNextVisit(false)}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${!nextVisit ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {nextVisit && (
                  <div className="grid grid-cols-2 gap-3.5 bg-gray-50 border p-4 rounded-xl mt-1">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-gray-500">Select Date *</label>
                      <input 
                        type="date"
                        required
                        value={followUpDate}
                        onChange={(e) => {
                          const val = e.target.value; // yyyy-mm-dd
                          if (val) {
                            const dateObj = new Date(val);
                            const formatted = `${dateObj.getDate()}_${dateObj.getMonth() + 1}_${dateObj.getFullYear()}`;
                            setFollowUpDate(formatted);
                          }
                        }}
                        className="border rounded p-2 outline-primary bg-white text-xs"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-gray-500">Select Time Slot *</label>
                      <select 
                        required
                        value={followUpTime}
                        onChange={(e) => setFollowUpTime(e.target.value)}
                        className="border rounded p-2 outline-primary bg-white text-xs"
                      >
                        <option value="">Choose Slot</option>
                        {[
                          "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
                          "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
                          "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM",
                          "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM"
                        ].map((time, tIdx) => (
                          <option key={tIdx} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2 flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-gray-500">Reason for Follow-up</label>
                      <input 
                        type="text"
                        value={followUpReason}
                        onChange={(e) => setFollowUpReason(e.target.value)}
                        className="border rounded p-2 outline-primary bg-white text-xs"
                        placeholder="e.g. Check blood pressure reports, follow-up symptoms"
                      />
                    </div>

                    <div className="col-span-2 flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-gray-500">Follow-up Notes</label>
                      <textarea 
                        value={followUpNotes}
                        onChange={(e) => setFollowUpNotes(e.target.value)}
                        rows="2"
                        className="border rounded p-2 outline-primary bg-white text-xs"
                        placeholder="Additional consultation checkup details..."
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex gap-2 justify-end mt-4">
                <button 
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={completing}
                  className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold shadow disabled:opacity-50 transition text-xs"
                >
                  {completing ? "Completing..." : "Submit & Mark Complete"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default AllAppointments