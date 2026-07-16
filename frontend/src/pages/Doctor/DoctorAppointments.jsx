import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import { LuFileText, LuUser, LuX } from 'react-icons/lu'
import axios from 'axios'

const DoctorAppointments = () => {
  const { 
    token, 
    doctorAppointments, 
    getDoctorAppointments, 
    acceptDoctorAppointment, 
    completeDoctorAppointment, 
    cancelDoctorAppointment,
    rejectDoctorAppointment,
    saveDoctorNotes,
    currencySymbol,
    backendUrl
  } = useContext(AppContext)

  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [tempNotes, setTempNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  // Patient history state
  const [patientHistory, setPatientHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

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
  const [admissionRequired, setAdmissionRequired] = useState(false)
  const [recRoomCategory, setRecRoomCategory] = useState('General Ward')
  const [expectedStay, setExpectedStay] = useState('')
  const [completing, setCompleting] = useState(false)
  const [bills, setBills] = useState([])

  const getBills = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/doctor/bills', { headers: { dtoken: token } })
      if (data.success) {
        setBills(data.bills)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handlePrintBill = (bill) => {
    const printWindow = window.open('', '_blank')
    const roomDetailsHtml = bill.roomCategory ? `
      <div class="invoice-section">
          <div class="section-title">Admission & Accommodation Details</div>
          <table class="items-table">
              <thead>
                  <tr>
                      <th>Room / Ward</th>
                      <th>Room Number</th>
                      <th>Admission Date</th>
                      <th>Discharge Date</th>
                      <th>Days Admitted</th>
                      <th>Rate per Day</th>
                      <th>Total Room Fee</th>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td>${bill.roomCategory}</td>
                      <td>Room ${bill.roomNumber}</td>
                      <td>${new Date(bill.roomAdmissionDate).toLocaleDateString()}</td>
                      <td>${bill.roomDischargeDate ? new Date(bill.roomDischargeDate).toLocaleDateString() : 'N/A'}</td>
                      <td>${bill.roomDays} Days</td>
                      <td>₹${bill.roomRatePerDay}</td>
                      <td style="font-weight: bold;">₹${bill.roomCharges}</td>
                  </tr>
              </tbody>
          </table>
      </div>` : '';

    const paymentHistoryRowsHtml = bill.paymentHistory && bill.paymentHistory.length > 0 
      ? bill.paymentHistory.map(h => '<tr><td>' + new Date(h.paymentDate).toLocaleDateString() + '</td><td>₹' + h.amountPaid + '</td><td style="text-transform: capitalize;">' + h.paymentMethod + '</td><td>' + (h.transactionId || 'CASH-PAYMENT') + '</td></tr>').join('')
      : '';

    const paymentHistoryHtml = paymentHistoryRowsHtml ? `
      <div class="invoice-section">
          <div class="section-title">Transaction & Payment Logs</div>
          <table class="items-table">
              <thead>
                  <tr>
                      <th>Date</th>
                      <th>Amount Paid</th>
                      <th>Method</th>
                      <th>Transaction ID</th>
                  </tr>
              </thead>
              <tbody>
                  ${paymentHistoryRowsHtml}
              </tbody>
          </table>
      </div>` : '';

    const roomChargesSummaryHtml = bill.roomCharges > 0 ? `
      <tr>
          <td>Room Accommodation Charges:</td>
          <td style="text-align: right;">₹${bill.roomCharges}</td>
      </tr>` : '';

    const otherChargesSummaryHtml = bill.otherCharges > 0 ? `
      <tr>
          <td>Other Charges:</td>
          <td style="text-align: right;">₹${bill.otherCharges}</td>
      </tr>` : '';

    printWindow.document.write(`
      <html>
      <head>
          <title>Hospital Bill - ${bill.billNumber}</title>
          <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 40px; color: #333; line-height: 1.6; }
              .invoice-box { max-width: 800px; margin: auto; padding: 20px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); }
              .header-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              .header-table td { vertical-align: top; }
              .logo { font-size: 28px; font-weight: bold; color: #2563eb; text-decoration: none; }
              .hospital-details { text-align: left; font-size: 12px; color: #666; }
              .invoice-details { text-align: right; font-size: 12px; color: #666; }
              .invoice-details h2 { font-size: 20px; color: #111; margin: 0 0 10px 0; }
              .client-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; background-color: #fcfcfc; border: 1px solid #f0f0f0; }
              .client-table td { padding: 15px; vertical-align: top; width: 50%; font-size: 13px; }
              .invoice-section { margin-bottom: 30px; }
              .section-title { font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #475569; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 15px; }
              .items-table { width: 100%; border-collapse: collapse; font-size: 13px; }
              .items-table th { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; text-align: left; font-weight: bold; color: #475569; }
              .items-table td { border: 1px solid #e2e8f0; padding: 12px 10px; }
              .summary-table { width: 40%; margin-left: 60%; border-collapse: collapse; font-size: 13px; margin-top: 20px; }
              .summary-table td { padding: 8px 10px; border-bottom: 1px solid #eee; }
              .summary-table tr.total-row td { font-weight: bold; font-size: 15px; color: #2563eb; border-bottom: 2px double #2563eb; }
              .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-weight: bold; font-size: 11px; text-transform: uppercase; }
              .badge-paid { background-color: #dcfce7; color: #166534; }
              .badge-pending { background-color: #fef9c3; color: #854d0e; }
              .badge-partial { background-color: #dbeafe; color: #1e40af; }
              .footer { text-align: center; margin-top: 50px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
      </head>
      <body>
          <div class="invoice-box">
              <table class="header-table">
                  <tr>
                      <td>
                          <div class="logo">Prescripto Hospital</div>
                          <div class="hospital-details">
                              123 Healing Garden Street<br/>
                              Medical Hub District, NY 10016<br/>
                              support@prescriptohospital.com
                          </div>
                      </td>
                      <td class="invoice-details">
                          <h2>INVOICE</h2>
                          <strong>Invoice Number:</strong> ${bill.billNumber}<br/>
                          <strong>Date Generated:</strong> ${new Date(bill.billDate).toLocaleDateString()}<br/>
                          <strong>Payment Due:</strong> ${new Date(bill.dueDate).toLocaleDateString()}<br/>
                          <strong>Status:</strong> <span class="badge ${bill.paymentStatus === 'Paid' ? 'badge-paid' : bill.paymentStatus === 'Partially Paid' ? 'badge-partial' : 'badge-pending'}">${bill.paymentStatus}</span>
                      </td>
                  </tr>
              </table>

              <table class="client-table">
                  <tr>
                      <td>
                          <strong>PATIENT DETAILS:</strong><br/>
                          Name: ${bill.patientName}<br/>
                          ID: ${bill.userId}
                      </td>
                      <td>
                          <strong>DOCTOR DETAILS:</strong><br/>
                          Name: ${bill.doctorName}<br/>
                          ID: ${bill.docId}
                      </td>
                  </tr>
              </table>

              <div class="invoice-section">
                  <div class="section-title">Consultation & Visit Details</div>
                  <table class="items-table">
                      <thead>
                          <tr>
                              <th>Description</th>
                              <th>Date</th>
                              <th style="text-align: right;">Charges</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr>
                              <td>General Doctor Consultation - Dr. ${bill.doctorName}</td>
                              <td>${bill.appointmentDate}</td>
                              <td style="text-align: right;">₹${bill.consultationFee}</td>
                          </tr>
                      </tbody>
                  </table>
              </div>

              ${roomDetailsHtml}

              <div class="invoice-section">
                  <div class="section-title">Summary & Dues</div>
                  <table class="summary-table">
                      <tr>
                          <td>Consultation Fee:</td>
                          <td style="text-align: right;">₹${bill.consultationFee}</td>
                      </tr>
                      ${roomChargesSummaryHtml}
                      ${otherChargesSummaryHtml}
                      <tr class="total-row">
                          <td>Total Billing Amount:</td>
                          <td style="text-align: right;">₹${bill.totalAmount}</td>
                      </tr>
                      <tr>
                          <td>Amount Paid:</td>
                          <td style="text-align: right; font-weight: 500; color: #166534;">₹${bill.paidAmount}</td>
                      </tr>
                      <tr style="font-weight: bold;">
                          <td>Outstanding Dues:</td>
                          <td style="text-align: right; color: #b91c1c;">₹${Math.max(0, bill.totalAmount - bill.paidAmount)}</td>
                      </tr>
                  </table>
              </div>

              ${paymentHistoryHtml}

              <div class="footer">
                  <p>Thank you for choosing Prescripto Hospital. This is a system-generated invoice containing validated clinical details.</p>
              </div>
          </div>
          <script>
              window.onload = function() {
                  window.print();
                  window.close();
              }
          </script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  useEffect(() => {
    if (token) {
      getDoctorAppointments()
      getBills()
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

  const handleOpenDetails = async (appointment) => {
    setSelectedAppointment(appointment)
    setTempNotes(appointment.doctorNotes || '')
    setShowModal(true)
    
    // Fetch patient history
    setLoadingHistory(true)
    try {
      const { data } = await axios.post(
        backendUrl + '/api/doctor/patient-history',
        { patientId: appointment.userId },
        { headers: { dtoken: token } }
      )
      if (data.success) {
        setPatientHistory(data.history)
      } else {
        setPatientHistory([])
      }
    } catch (err) {
      console.log(err)
      setPatientHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedAppointment) return
    setSavingNotes(true)
    const success = await saveDoctorNotes(selectedAppointment._id, tempNotes)
    setSavingNotes(false)
    if (success) {
      // update local notes representation
      setSelectedAppointment(prev => ({ ...prev, doctorNotes: tempNotes }))
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
        <p className="text-gray-500 text-sm">Review, accept, cancel, or complete patient consultations assigned to you.</p>
      </div>

      {/* Appointments List Table */}
      <div className="bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-150">
                <th className="py-4 px-6">#</th>
                <th className="py-4 px-6">Patient</th>
                <th className="py-4 px-6">Age / Gender</th>
                <th className="py-4 px-6">Date & Time</th>
                <th className="py-4 px-6">Reason / Disease</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {doctorAppointments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-400">No appointments scheduled.</td>
                </tr>
              ) : (
                doctorAppointments.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50/30 transition-all">
                    <td className="py-4 px-6 font-medium text-gray-400">{index + 1}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img src={item.userData.image} className="w-10 h-10 rounded-full object-cover border border-gray-200" alt="" />
                        <div>
                          <p className="font-semibold text-gray-800">{item.userData.name}</p>
                          <p className="text-xs text-gray-400">{item.userData.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium">{calculateAge(item.userData.dob)} yrs</span>
                      <span className="text-gray-400 text-xs block mt-0.5">{item.userData.gender}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium">{slotDateFormat(item.slotDate)}</span>
                      <span className="text-xs text-gray-400 block mt-0.5">{item.slotTime}</span>
                    </td>
                    <td className="py-4 px-6 max-w-xs truncate text-gray-500 font-light" title={item.reason}>
                      {item.reason}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1 items-start">
                        {item.cancelled ? (
                          <span className="text-red-500 bg-red-50 px-2.5 py-0.5 rounded-full text-xs font-semibold">Cancelled</span>
                        ) : item.isCompleted ? (
                          <span className="text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full text-xs font-semibold">Completed</span>
                        ) : item.isRejected ? (
                          <span className="text-red-500 bg-red-50 px-2.5 py-0.5 rounded-full text-xs font-semibold">Rejected</span>
                        ) : item.isAccepted ? (
                          <span className="text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full text-xs font-semibold">Accepted</span>
                        ) : (
                          <span className="text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full text-xs font-semibold">Pending</span>
                        )}
                        
                        {(() => {
                          const bill = bills.find(b => b.appointmentId === item._id)
                          if (!bill) {
                            return <span className="text-[10px] text-gray-400 font-medium">No Bill</span>
                          }
                          return (
                            <span className={`text-[9px] font-bold border px-1.5 py-0.2 rounded uppercase mt-0.5 ${bill.paymentStatus === 'Paid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                              Bill: {bill.paymentStatus}
                            </span>
                          )
                        })()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Details Button */}
                        <button 
                          onClick={() => handleOpenDetails(item)}
                          className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all"
                          title="View Patient Details & Notes"
                        >
                          <LuFileText size={16} />
                        </button>

                        {!item.cancelled && !item.isCompleted && !item.isRejected && (
                          <>
                            {!item.isAccepted ? (
                              <>
                                {/* Accept Button */}
                                <button 
                                  onClick={() => acceptDoctorAppointment(item._id)}
                                  className="bg-primary hover:bg-primary-dark text-white text-xs px-3 py-2 rounded-lg font-medium shadow-sm hover:shadow transition-all"
                                >
                                  Accept
                                </button>
                                {/* Reject Button */}
                                <button 
                                  onClick={() => rejectDoctorAppointment(item._id)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 text-xs px-3 py-2 rounded-lg font-medium transition-all"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <>
                                {/* Complete Button */}
                                <button 
                                  onClick={() => {
                                    setApptToComplete(item)
                                    setDiagnosis('')
                                    setMedNotes('')
                                    setPrescription([{ medicine: '', dosage: '', advice: '' }])
                                    setNextVisit(false)
                                    setFollowUpDate('')
                                    setFollowUpTime('')
                                    setFollowUpReason('')
                                    setFollowUpNotes('')
                                    setAdmissionRequired(false)
                                    setRecRoomCategory('General Ward')
                                    setExpectedStay('')
                                    setShowCompleteModal(true)
                                  }}
                                  className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-2 rounded-lg font-medium shadow-sm hover:shadow transition-all"
                                >
                                  Complete
                                </button>
                                {/* Cancel Button */}
                                <button 
                                  onClick={() => cancelDoctorAppointment(item._id)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 text-xs px-3 py-2 rounded-lg font-medium transition-all"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Detail Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <LuUser className="text-primary" />
                Patient Details
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all"
              >
                <LuX size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 flex flex-col gap-6">
              {/* Patient Basic Info */}
              <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start border-b border-gray-100 pb-5">
                <img src={selectedAppointment.userData.image} className="w-20 h-20 rounded-xl object-cover border border-gray-200" alt="" />
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="text-xl font-bold text-gray-800">{selectedAppointment.userData.name}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 mt-3 text-sm text-gray-600">
                    <p><span className="font-semibold block text-[11px] text-gray-400 uppercase">Age</span> {calculateAge(selectedAppointment.userData.dob)} Years</p>
                    <p><span className="font-semibold block text-[11px] text-gray-400 uppercase">Gender</span> {selectedAppointment.userData.gender}</p>
                    <p><span className="font-semibold block text-[11px] text-gray-400 uppercase">Email</span> {selectedAppointment.userData.email}</p>
                    <p className="sm:col-span-2"><span className="font-semibold block text-[11px] text-gray-400 uppercase">Phone</span> {selectedAppointment.userData.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Consultation Details */}
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-sm">
                <h5 className="font-bold text-gray-700 mb-2.5">Consultation Summary</h5>
                <div className="grid grid-cols-2 gap-y-3">
                  <p><span className="text-gray-400 font-medium mr-1.5">Appt Date:</span>{slotDateFormat(selectedAppointment.slotDate)}</p>
                  <p><span className="text-gray-400 font-medium mr-1.5">Appt Time:</span>{selectedAppointment.slotTime}</p>
                  <p><span className="text-gray-400 font-medium mr-1.5">Booking ID:</span>{selectedAppointment._id}</p>
                  <p><span className="text-gray-400 font-medium mr-1.5">Fee Charged:</span>{currencySymbol}{selectedAppointment.amount}</p>
                  <p className="col-span-2">
                    <span className="text-gray-400 font-medium mr-1.5 font-semibold">Hospital Billing:</span>
                    {(() => {
                      const bill = bills.find(b => b.appointmentId === selectedAppointment._id)
                      if (!bill) {
                        return <span className="text-gray-400 italic">No Bill Generated</span>
                      }
                      return (
                        <>
                          <span className={`font-bold ${bill.paymentStatus === 'Paid' ? 'text-green-600' : 'text-amber-600'} uppercase text-xs mr-2`}>
                            {bill.paymentStatus} (₹{bill.totalAmount})
                          </span>
                          <button
                            onClick={() => handlePrintBill(bill)}
                            className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-650 font-bold px-2.5 py-0.5 rounded border border-blue-200 transition"
                          >
                            View Invoice
                          </button>
                        </>
                      )
                    })()}
                  </p>
                  <p className="col-span-2"><span className="text-gray-400 font-medium block mb-1">Reason for Visit:</span><span className="text-gray-700 italic">"{selectedAppointment.reason}"</span></p>
                </div>
              </div>

              {/* Address */}
              <div className="text-sm">
                <h5 className="font-bold text-gray-700 mb-1">Patient Address</h5>
                <p className="text-gray-600 font-light">
                  {selectedAppointment.userData.address?.line1 || 'No address specified'}
                  {selectedAppointment.userData.address?.line2 && `, ${selectedAppointment.userData.address.line2}`}
                </p>
              </div>

              {/* Previous Medical History Timeline */}
              <div className="border-t pt-5 mt-2">
                <h5 className="font-bold text-gray-700 mb-3 text-sm">Previous Medical History</h5>
                {loadingHistory ? (
                  <p className="text-xs text-gray-400 italic">Loading history...</p>
                ) : patientHistory.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No completed consultations in record.</p>
                ) : (
                  <div className="flex flex-col gap-3.5 max-h-64 overflow-y-auto pr-1">
                    {patientHistory.map((hist, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 border rounded-xl text-xs flex flex-col gap-2">
                        <div className="flex justify-between font-semibold text-gray-700">
                          <span>Doctor: {hist.docData.name} ({hist.docData.speciality})</span>
                          <span className="text-gray-400">{slotDateFormat(hist.slotDate)}</span>
                        </div>
                        <p><span className="font-bold text-gray-600">Diagnosis:</span> {hist.diagnosis}</p>
                        <p className="italic text-gray-500 font-light">"Notes: {hist.doctorNotes}"</p>
                        <div>
                          <p className="font-bold text-gray-600 mb-1">Prescription:</p>
                          <ul className="list-disc pl-4 text-gray-600 flex flex-col gap-0.5">
                            {hist.prescription.map((pres, pidx) => (
                              <li key={pidx}>
                                <span className="font-medium text-gray-800">{pres.medicine}</span> - {pres.dosage} ({pres.advice})
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Clinical / Doctor Notes */}
              <div className="flex flex-col gap-2">
                <label className="font-bold text-gray-700 text-sm">Doctor notes for this session</label>
                <textarea 
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  rows="4"
                  className="w-full border border-gray-300 rounded-xl p-3 outline-primary focus:ring-1 focus:ring-primary text-sm shadow-inner"
                  placeholder="Record symptoms, diagnosis, prescribed medicines, or follow-up instructions..."
                ></textarea>
                <button 
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow self-end hover:shadow-md disabled:opacity-50 transition-all mt-1"
                >
                  {savingNotes ? "Saving..." : "Save Notes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Consultation Modal */}
      {showCompleteModal && apptToComplete && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150">
              <h3 className="text-lg font-bold text-gray-800">
                Complete Consultation - {apptToComplete.userData.name}
              </h3>
              <button 
                onClick={() => setShowCompleteModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all"
              >
                <LuX size={20} />
              </button>
            </div>

            {/* Modal Content Form */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              
              // Filter out empty medicines
              const finalPres = prescription.filter(p => p.medicine.trim() !== "");
              const invalidPres = finalPres.some(p => !p.dosage.trim());
              if (invalidPres) {
                return toast.error("Please fill in Dosage for all prescribed items.");
              }
              if (nextVisit && (!followUpDate || !followUpTime)) {
                return toast.error("Follow-up Date and Time are required.");
              }

              setCompleting(true);
              const success = await completeDoctorAppointment(apptToComplete._id, {
                diagnosis: diagnosis.trim(),
                doctorNotes: medNotes.trim(),
                prescription: finalPres,
                nextVisitRequired: nextVisit,
                followUpDate,
                followUpTime,
                followUpReason,
                followUpNotes,
                admissionRecommendedByDoctor: admissionRequired,
                recommendedRoomCategory: recRoomCategory,
                expectedStayDays: expectedStay
              });
              setCompleting(false);

              if (success) {
                setShowCompleteModal(false);
                getDoctorAppointments();
              }
            }} className="p-6 flex flex-col gap-5 text-sm">
              
              {/* Diagnosis */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-gray-700">Diagnosis (Optional)</label>
                <input 
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="border border-gray-300 rounded-xl p-2.5 outline-primary focus:ring-1 focus:ring-primary w-full text-xs font-semibold text-gray-800"
                  placeholder="e.g. Acute Viral Bronchitis"
                />
              </div>

              {/* Medical Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-gray-700">Medical / Consultation Notes (Optional)</label>
                <textarea 
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
                  <label className="font-bold text-gray-700">Prescription / Medicines (Optional)</label>
                  <button 
                    type="button"
                    onClick={() => setPrescription([...prescription, { medicine: '', dosage: '', advice: '' }])}
                    className="text-xs bg-primary text-white px-3 py-1 rounded hover:bg-primary-dark transition font-semibold"
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
                  <span className="font-bold text-gray-700">Does this patient require a follow-up visit?</span>
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
                      <label className="text-xs font-semibold text-gray-500">Select Date *</label>
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
                      <label className="text-xs font-semibold text-gray-500">Select Time Slot *</label>
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
                      <label className="text-xs font-semibold text-gray-500">Reason for Follow-up</label>
                      <input 
                        type="text"
                        value={followUpReason}
                        onChange={(e) => setFollowUpReason(e.target.value)}
                        className="border rounded p-2 outline-primary bg-white text-xs"
                        placeholder="e.g. Check blood pressure reports, follow-up symptoms"
                      />
                    </div>

                    <div className="col-span-2 flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-500">Follow-up Notes</label>
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

              {/* Hospital Admission Section */}
              <div className="border-t pt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700">Does this patient require hospital admission?</span>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setAdmissionRequired(true)}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${admissionRequired ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
                    >
                      Yes
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAdmissionRequired(false)}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${!admissionRequired ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {admissionRequired && (
                  <div className="grid grid-cols-2 gap-3.5 bg-gray-50 border p-4 rounded-xl mt-1">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-500">Recommend Room Category</label>
                      <select 
                        value={recRoomCategory}
                        onChange={(e) => setRecRoomCategory(e.target.value)}
                        className="border rounded p-2 outline-primary bg-white text-xs"
                      >
                        <option value="General Ward">General Ward</option>
                        <option value="ICU">ICU</option>
                        <option value="Semi Private / Twin Sharing">Twin Sharing</option>
                        <option value="Private Room">Private Room</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-500">Expected Stay (Days)</label>
                      <input 
                        type="number"
                        min="0"
                        value={expectedStay}
                        onChange={(e) => setExpectedStay(e.target.value)}
                        className="border rounded p-2 outline-primary bg-white text-xs"
                        placeholder="e.g. 5"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex gap-2 justify-end mt-4">
                <button 
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={completing}
                  className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold shadow disabled:opacity-50 transition"
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

export default DoctorAppointments
