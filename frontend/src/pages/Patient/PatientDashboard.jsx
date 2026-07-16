import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import PatientSidebar from '../../components/PatientSidebar'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../../assets/assets'
import { 
  LuCalendar, 
  LuBed, 
  LuFileText, 
  LuCreditCard, 
  LuRefreshCw, 
  LuClock,
  LuPrinter
} from 'react-icons/lu'

// Inline SVG Icons to avoid import dependency issues
const CheckCircleIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
)

const AlertCircleIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
)

const XIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
)

const CalendarIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
)

const BedIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9M10 8v9M14 8v9M18 8v9"></path></svg>
)

const HistoryIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
)

const FileTextIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
)

const CreditCardIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
)

const UserIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
)

const SettingsIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
)

const LogOutIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
)

const PrinterIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
)

const BellIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`inline-block ${className}`}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" /></svg>
)

const HelpIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`inline-block ${className}`}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
)



const LockIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
)

const MailIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
)

const ClockIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
)

const ActivityIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
)

const calculateAge = (dob) => {
  if (!dob || dob === 'Not Selected') return 'N/A';
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return 'N/A';
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

const PatientDashboard = () => {
  const { 
    token, 
    backendUrl, 
    userData, 
    setUserData, 
    loadUserProfileData, 
    medicalHistory, 
    getMedicalHistory,
    requestRoom,
    logout 
  } = useContext(AppContext)

  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab)
    }
  }, [location.state])

  // Profile Edit States
  const [isEdit, setIsEdit] = useState(false)
  const [image, setImage] = useState(false)

  // Appointments / Room Requests States
  const [appointments, setAppointments] = useState([])
  const [payment, setPayment] = useState('')
  const [postRoomCategories, setPostRoomCategories] = useState({})
  
  // Billing States
  const [bills, setBills] = useState([])
  const [paymentHistory, setPaymentHistory] = useState([])
  const [selectedBill, setSelectedBill] = useState(null)
  const [showBillModal, setShowBillModal] = useState(false)
  const [billFilter, setBillFilter] = useState('all')
  
  // Settings Form States
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [updatingSettings, setUpdatingSettings] = useState(false)

  // Quick Room Request Modal State
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [roomModalApptId, setRoomModalApptId] = useState('')
  const [roomModalCategory, setRoomModalCategory] = useState('General Ward')

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const slotDateFormat = (slotDate) => {
    if (!slotDate) return ''
    const dateArray = slotDate.split('_')
    if (dateArray.length < 3) return slotDate
    return dateArray[0] + " " + months[Number(dateArray[1]) - 1] + " " + dateArray[2]
  }

  const formatCategory = (cat) => {
    if (!cat) return 'N/A'
    if (cat === 'General Ward') return 'General Ward (GW)'
    if (cat === 'ICU') return 'Intensive Care Unit (ICU)'
    if (cat === 'Semi Private / Twin Sharing' || cat === 'Twin Sharing') return 'Twin Sharing (TS)'
    if (cat === 'Private Room' || cat === 'Private') return 'Private Room (PR)'
    return cat
  }

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
      if (data.success) {
        setAppointments(data.appointments.reverse())
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return
    try {
      const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Appointment Payment',
      description: "Appointment Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(backendUrl + "/api/user/verifyRazorpay", response, { headers: { token } })
          if (data.success) {
            toast.success("Payment completed successfully!")
            getUserAppointments()
            setActiveTab('my-appointments')
          }
        } catch (error) {
          console.log(error)
          toast.error(error.message)
        }
      }
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  const appointmentRazorpay = async (appointmentId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/payment-razorpay', { appointmentId }, { headers: { token } })
      if (data.success) {
        initPay(data.order)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const appointmentStripe = async (appointmentId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/payment-stripe', { appointmentId }, { headers: { token } })
      if (data.success) {
        window.location.replace(data.session_url)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const rescheduleAppointment = (appointment) => {
    navigate(`/appointment/${appointment.docData._id}`, { 
      state: { 
        isRescheduling: true,
        appointmentId: appointment._id,
        oldSlotDate: appointment.slotDate,
        oldSlotTime: appointment.slotTime
      }
    })
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('name', userData.name)
      formData.append('phone', userData.phone)
      formData.append('address', JSON.stringify(userData.address))
      formData.append('gender', userData.gender)
      formData.append('dob', userData.dob)
      if (userData.email) formData.append('email', userData.email)
      if (userData.emergencyContact !== undefined) formData.append('emergencyContact', userData.emergencyContact)
      if (userData.occupation !== undefined) formData.append('occupation', userData.occupation)
      if (userData.bloodGroup !== undefined) formData.append('bloodGroup', userData.bloodGroup)
      if (userData.allergies !== undefined) formData.append('allergies', userData.allergies)
      if (userData.medicalConditions !== undefined) formData.append('medicalConditions', userData.medicalConditions)
      if (userData.insurance !== undefined) formData.append('insurance', userData.insurance)
      if (image) formData.append('image', image)

      const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        await loadUserProfileData()
        setIsEdit(false)
        setImage(false)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      return toast.error("New Passwords do not match.")
    }
    setUpdatingSettings(true)
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/change-password', 
        { oldPassword, newPassword, confirmPassword }, 
        { headers: { token } }
      )
      if (data.success) {
        toast.success("Password changed successfully.")
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setUpdatingSettings(false)
    }
  }

  const handleUpdateEmail = async (e) => {
    e.preventDefault()
    if (!newEmail) return toast.error("Please enter a valid email address.")
    setUpdatingSettings(true)
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/update-email', 
        { newEmail }, 
        { headers: { token } }
      )
      if (data.success) {
        toast.success("Email updated successfully.")
        setNewEmail('')
        loadUserProfileData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setUpdatingSettings(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handlePrintPrescription = (item) => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
      <head>
          <title>Prescription - ${item._id}</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 40px; color: #333; line-height: 1.5; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
              .doctor-info { text-align: left; }
              .patient-info { text-align: right; }
              .section { margin-top: 30px; }
              .section-title { font-weight: bold; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; text-transform: uppercase; color: #444; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #f8f9fa; font-weight: bold; }
              .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
      </head>
      <body>
          <div class="header">
              <h1 style="margin: 0; color: #2563eb; font-size: 26px;">HOSPITAL CONSULTATION PRESCRIPTION</h1>
              <p style="margin: 5px 0 0 0;">Date of Visit: ${slotDateFormat(item.slotDate)} | Time: ${item.slotTime}</p>
          </div>
          <div class="info-grid">
              <div class="doctor-info">
                  <strong style="font-size: 14px; color: #555;">DOCTOR DETAILS</strong><br/>
                  <span style="font-size: 16px; font-weight: bold;">${item.docData.name}</span><br/>
                  <span>Speciality: ${item.docData.speciality}</span>
              </div>
              <div class="patient-info">
                  <strong style="font-size: 14px; color: #555;">PATIENT DETAILS</strong><br/>
                  <span style="font-size: 16px; font-weight: bold;">${item.userData.name}</span><br/>
                  <span>Email: ${item.userData.email}</span>
              </div>
          </div>
          <div class="section">
              <div class="section-title">Diagnosis</div>
              <p style="font-size: 15px; font-weight: 500;">${item.diagnosis || 'General Checkup'}</p>
          </div>
          <div class="section">
              <div class="section-title">Clinical Consultation Notes</div>
              <p style="font-style: italic; color: #555;">"${item.doctorNotes || 'No notes recorded.'}"</p>
          </div>
          ${item.prescription && item.prescription.length > 0 ? `
          <div class="section">
              <div class="section-title">Prescribed Medicines</div>
              <table>
                  <thead>
                      <tr>
                          <th>Medicine Name</th>
                          <th>Dosage</th>
                          <th>Directions / Advice</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${item.prescription.map(pres => `
                          <tr>
                              <td style="font-weight: bold;">${pres.medicine}</td>
                              <td>${pres.dosage}</td>
                              <td>${pres.advice || 'As directed'}</td>
                          </tr>
                      `).join('')}
                  </tbody>
              </table>
          </div>` : ''}
          <div class="footer">
              <p>This is a computer-generated prescription under role-based authorization.</p>
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

  const handleQuickRoomRequestSubmit = async (e) => {
    e.preventDefault()
    if (!roomModalApptId) return toast.error("Please select an active appointment.")
    const success = await requestRoom(roomModalApptId, roomModalCategory)
    if (success) {
      setShowRoomModal(false)
      getUserAppointments()
    }
  }

  const getBills = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/bills', { headers: { token } })
      if (data.success) {
        setBills(data.bills)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getPaymentHistory = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/payment-history', { headers: { token } })
      if (data.success) {
        setPaymentHistory(data.history)
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
      getUserAppointments()
      getMedicalHistory()
      getBills()
      getPaymentHistory()
    }
  }, [token])

  // Compute Dashboard Metrics
  const activeAppts = appointments.filter(appt => !appt.isCompleted && !appt.cancelled && !appt.isRejected)
  const completedAppts = appointments.filter(appt => appt.isCompleted)
  const pendingAppts = appointments.filter(appt => appt.status === 'pending' && !appt.cancelled)
  const followUpAppts = appointments.filter(appt => appt.isFollowUp && !appt.isCompleted && !appt.cancelled)
  
  const activeAdmission = appointments.find(appt => appt.roomRequested && appt.roomStatus === 'Allocated')
  const outstandingCount = appointments.filter(appt => !appt.payment && !appt.cancelled && !appt.isRejected && !appt.isCompleted).length

  const latestCompleted = completedAppts[0] || null

  // Helper to parse DD_MM_YYYY slot date and time into standard JS Date objects
  const getApptDateObject = (appt) => {
    if (!appt || !appt.slotDate) return new Date(0)
    const arr = appt.slotDate.split('_')
    if (arr.length < 3) return new Date(0)
    
    let hours = 0, minutes = 0
    if (appt.slotTime) {
      const match = appt.slotTime.match(/(\d+):(\d+)\s*(AM|PM)/i)
      if (match) {
        hours = parseInt(match[1], 10)
        minutes = parseInt(match[2], 10)
        const ampm = match[3].toUpperCase()
        if (ampm === 'PM' && hours < 12) hours += 12
        if (ampm === 'AM' && hours === 12) hours = 0
      }
    }
    return new Date(parseInt(arr[2], 10), parseInt(arr[1], 10) - 1, parseInt(arr[0], 10), hours, minutes)
  }

  // Get next closest upcoming appointment
  const nextAppt = [...activeAppts].sort((a, b) => getApptDateObject(a) - getApptDateObject(b))[0]

  // Time-based greeting generator
  const getGreeting = () => {
    const hr = new Date().getHours()
    if (hr < 12) return 'Good Morning'
    if (hr < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  // Chronological patient activity log compiled from appointments and bills
  const getRecentActivity = () => {
    let activity = []
    
    appointments.forEach(appt => {
      activity.push({
        type: 'appointment',
        text: `Booked consultation with Dr. ${appt.docData.name}`,
        date: getApptDateObject(appt).getTime() || appt.date || Date.now(),
        status: appt.cancelled ? 'Cancelled' : appt.isCompleted ? 'Completed' : appt.isRejected ? 'Rejected' : appt.status || 'Scheduled'
      })
      if (appt.isCompleted) {
        activity.push({
          type: 'prescription',
          text: `Prescription generated by Dr. ${appt.docData.name}`,
          date: (appt.date || Date.now()) + 3600000 * 2,
          status: 'Generated'
        })
      }
      if (appt.roomRequested) {
        activity.push({
          type: 'room',
          text: `Room admission (${appt.roomCategory}) requested by ${appt.roomRequestedBy || 'patient'}`,
          date: (appt.date || Date.now()) + 60000,
          status: appt.roomStatus
        })
      }
    })

    bills.forEach(bill => {
      activity.push({
        type: 'bill',
        text: `Consolidated bill ${bill.billNumber} generated - Total ₹${bill.totalAmount}`,
        date: bill.billDate || Date.now(),
        status: bill.paymentStatus
      })
      if (bill.paymentHistory && Array.isArray(bill.paymentHistory)) {
        bill.paymentHistory.forEach(h => {
          activity.push({
            type: 'payment',
            text: `Payment of ₹${h.amountPaid} registered via ${h.paymentMethod}`,
            date: h.paymentDate,
            status: 'Success'
          })
        })
      }
    })

    return activity.sort((a, b) => b.date - a.date).slice(0, 8)
  }

  return (
    <div className="flex bg-[#F8F9FD] min-h-screen">
      {/* Sidebar Navigation */}
      <PatientSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-10 overflow-x-hidden">
        
        {/* Page Title */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Patient Portal</h1>
          <p className="text-xs text-gray-400">Welcome back, {userData?.name}</p>
        </div>

        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-6 max-w-6xl w-full">
            {/* Elegant Welcome Banner */}
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-3xl p-6 md:p-8 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="z-10 flex-1">
                <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Patient Portal Dashboard</span>
                <h2 className="text-2xl md:text-3xl font-black mt-3">{getGreeting()}, {userData?.name || 'Patient'}</h2>
                <p className="text-white/80 text-xs md:text-sm mt-1.5 max-w-xl leading-relaxed">
                  Welcome back! Access your clinical summaries, monitor active inpatient ward allocations, verify prescriptions, and securely pay hospital bills online.
                </p>
              </div>
              <div className="bg-white/10 p-5 rounded-2xl border border-white/25 hidden md:block">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            </div>

            {/* Summary Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div onClick={() => setActiveTab('upcoming')} className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 flex items-center gap-3.5">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-500"><CalendarIcon size={22} /></div>
                <div>
                  <p className="text-xs font-semibold text-gray-400">Upcoming Visits</p>
                  <h3 className="text-lg font-black text-gray-800 mt-0.5">{activeAppts.length}</h3>
                </div>
              </div>

              <div onClick={() => setActiveTab('history')} className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 flex items-center gap-3.5">
                <div className="p-3 bg-green-50 rounded-xl text-green-500"><CheckCircleIcon size={22} /></div>
                <div>
                  <p className="text-xs font-semibold text-gray-400">Completed Visits</p>
                  <h3 className="text-lg font-black text-gray-800 mt-0.5">{completedAppts.length}</h3>
                </div>
              </div>

              <div onClick={() => setActiveTab('current-admission')} className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 flex items-center gap-3.5">
                <div className="p-3 bg-purple-50 rounded-xl text-purple-500"><BedIcon size={22} /></div>
                <div>
                  <p className="text-xs font-semibold text-gray-400">Admitted Status</p>
                  <h3 className="text-sm font-black text-gray-800 mt-0.5 truncate max-w-[120px]">
                    {activeAdmission ? `Room ${activeAdmission.roomNumber}` : 'Not Admitted'}
                  </h3>
                </div>
              </div>

              <div onClick={() => setActiveTab('billing-payments')} className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 flex items-center gap-3.5">
                <div className="p-3 bg-red-50 rounded-xl text-red-500"><CreditCardIcon size={22} /></div>
                <div>
                  <p className="text-xs font-semibold text-gray-400">Pending Bills</p>
                  <h3 className="text-lg font-black text-gray-800 mt-0.5">{outstandingCount}</h3>
                </div>
              </div>

              <div onClick={() => setActiveTab('prescriptions')} className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 flex items-center gap-3.5">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-500"><FileTextIcon size={22} /></div>
                <div>
                  <p className="text-xs font-semibold text-gray-400">Latest Prescriptions</p>
                  <h3 className="text-lg font-black text-gray-800 mt-0.5">{completedAppts.filter(a => a.prescription && a.prescription.length > 0).length}</h3>
                </div>
              </div>

              <div onClick={() => setActiveTab('history')} className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 flex items-center gap-3.5">
                <div className="p-3 bg-teal-50 rounded-xl text-teal-500"><HistoryIcon size={22} /></div>
                <div>
                  <p className="text-xs font-semibold text-gray-400">Medical Records</p>
                  <h3 className="text-lg font-black text-gray-800 mt-0.5">{medicalHistory.length}</h3>
                </div>
              </div>

              <div onClick={() => setActiveTab('upcoming')} className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 flex items-center gap-3.5 col-span-2 md:col-span-2">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-500"><ClockIcon size={22} /></div>
                <div>
                  <p className="text-xs font-semibold text-gray-400">Follow-up Consultations</p>
                  <h3 className="text-lg font-black text-gray-800 mt-0.5">{followUpAppts.length} Follow-ups</h3>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white border rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider text-xs">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <button onClick={() => navigate('/doctors')} className="flex flex-col items-center justify-center gap-3.5 p-4 border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all duration-200 shadow-xs group">
                  <div className="p-3 bg-blue-50 text-blue-500 group-hover:bg-primary group-hover:text-white rounded-xl transition duration-200"><CalendarIcon size={20} /></div>
                  <span className="text-[11px] font-bold text-gray-700">Book Visit</span>
                </button>
                <button 
                  onClick={() => {
                    const upcomingActive = appointments.find(appt => !appt.isCompleted && !appt.cancelled && !appt.isRejected);
                    setRoomModalApptId(upcomingActive?._id || '');
                    setRoomModalCategory('General Ward');
                    setShowRoomModal(true);
                  }}
                  className="flex flex-col items-center justify-center gap-3.5 p-4 border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all duration-200 shadow-xs group"
                >
                  <div className="p-3 bg-purple-50 text-purple-500 group-hover:bg-primary group-hover:text-white rounded-xl transition duration-200"><BedIcon size={20} /></div>
                  <span className="text-[11px] font-bold text-gray-700">Request Room</span>
                </button>
                <button onClick={() => setActiveTab('history')} className="flex flex-col items-center justify-center gap-3.5 p-4 border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all duration-200 shadow-xs group">
                  <div className="p-3 bg-teal-50 text-teal-500 group-hover:bg-primary group-hover:text-white rounded-xl transition duration-200"><HistoryIcon size={20} /></div>
                  <span className="text-[11px] font-bold text-gray-700">Medical History</span>
                </button>
                <button onClick={() => setActiveTab('prescriptions')} className="flex flex-col items-center justify-center gap-3.5 p-4 border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all duration-200 shadow-xs group">
                  <div className="p-3 bg-amber-50 text-amber-500 group-hover:bg-primary group-hover:text-white rounded-xl transition duration-200"><FileTextIcon size={20} /></div>
                  <span className="text-[11px] font-bold text-gray-700">Prescriptions</span>
                </button>
                <button onClick={() => setActiveTab('billing-payments')} className="flex flex-col items-center justify-center gap-3.5 p-4 border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all duration-200 shadow-xs group">
                  <div className="p-3 bg-red-50 text-red-500 group-hover:bg-primary group-hover:text-white rounded-xl transition duration-200"><CreditCardIcon size={20} /></div>
                  <span className="text-[11px] font-bold text-gray-700">Hospital Bills</span>
                </button>
                <button onClick={() => setActiveTab('profile')} className="flex flex-col items-center justify-center gap-3.5 p-4 border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all duration-200 shadow-xs group">
                  <div className="p-3 bg-gray-50 text-gray-500 group-hover:bg-primary group-hover:text-white rounded-xl transition duration-200"><UserIcon size={20} /></div>
                  <span className="text-[11px] font-bold text-gray-700">Edit Profile</span>
                </button>
              </div>
            </div>

            {/* Core Widgets Double Columns Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Appointment overview panel */}
              <div className="bg-white border rounded-3xl p-5 md:p-6 shadow-sm flex flex-col justify-between min-h-[260px]">
                <div className="border-b pb-3 mb-4 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Next Upcoming Visit</h3>
                  <button onClick={() => setActiveTab('upcoming')} className="text-xs font-bold text-primary hover:underline">View All</button>
                </div>
                {nextAppt ? (
                  <div className="flex flex-col justify-between flex-1">
                    <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-2xl border">
                      <img className="w-12 h-12 rounded-full object-cover border border-primary/20" src={nextAppt.docData.image} alt="" />
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">Dr. {nextAppt.docData.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{nextAppt.docData.speciality}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs my-4 bg-gray-50/50 p-3 rounded-2xl border border-dashed border-gray-200 text-gray-600 font-semibold">
                      <p>Date: <span className="text-gray-800 font-bold block mt-0.5">{slotDateFormat(nextAppt.slotDate)}</span></p>
                      <p>Time: <span className="text-gray-800 font-bold block mt-0.5">{nextAppt.slotTime}</span></p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold border border-blue-200 bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{nextAppt.status || 'Accepted'}</span>
                      <button onClick={() => setActiveTab('upcoming')} className="bg-primary text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-primary-dark transition">View Details</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 py-8 text-center text-gray-400 italic">
                    <CalendarIcon size={36} className="text-gray-200 mb-2" />
                    <p className="text-xs">No upcoming appointments scheduled.</p>
                    <button onClick={() => navigate('/doctors')} className="mt-3.5 border border-primary text-primary px-4 py-1.5 rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition">Book One Now</button>
                  </div>
                )}
              </div>

              {/* Inpatient Admission Summary details card widget */}
              <div className="bg-white border rounded-3xl p-5 md:p-6 shadow-sm flex flex-col justify-between min-h-[260px]">
                <div className="border-b pb-3 mb-4 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Current Admission Info</h3>
                  <button onClick={() => setActiveTab('current-admission')} className="text-xs font-bold text-primary hover:underline">Admission Page</button>
                </div>
                {activeAdmission ? (
                  <div className="flex flex-col justify-between flex-1">
                    <div className="flex justify-between items-start bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                      <div>
                        <span className="text-[9px] font-bold text-purple-600 block uppercase tracking-wide">ALLOCATED ROOM</span>
                        <h4 className="font-black text-gray-800 text-sm mt-0.5">Room {activeAdmission.roomNumber} ({activeAdmission.roomCategory})</h4>
                      </div>
                      <span className="text-[9px] uppercase font-bold bg-green-500 text-white px-2 py-0.5 rounded">Active</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs my-4 bg-gray-50/50 p-3 rounded-2xl border border-dashed border-gray-200 text-gray-600 font-semibold">
                      <p>Admit Date: <span className="text-gray-850 font-bold block mt-0.5">{new Date(activeAdmission.roomAdmissionDate).toLocaleDateString()}</span></p>
                      <p>Attending: <span className="text-gray-850 font-bold block mt-0.5">Dr. {activeAdmission.docData.name}</span></p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-gray-400">Total Accumulation: <span className="text-red-500 font-black block text-sm">₹{activeAdmission.amount + (activeAdmission.roomDays * activeAdmission.roomRatePerDay)}</span></p>
                      <button onClick={() => setActiveTab('current-admission')} className="bg-primary text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-primary-dark transition">Manage Stay</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 py-8 text-center text-gray-400 italic">
                    <BedIcon size={36} className="text-gray-200 mb-2" />
                    <p className="text-xs">You are not currently admitted in any ward room.</p>
                    <button 
                      onClick={() => {
                        const upcomingActive = appointments.find(appt => !appt.isCompleted && !appt.cancelled && !appt.isRejected);
                        setRoomModalApptId(upcomingActive?._id || '');
                        setRoomModalCategory('General Ward');
                        setShowRoomModal(true);
                      }}
                      className="mt-3.5 border border-primary text-primary px-4 py-1.5 rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition"
                    >
                      Request Ward Admission
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Recent Activity & Prescriptions double grid column */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patient Activity Timeline logger */}
              <div className="bg-white border rounded-3xl p-5 md:p-6 shadow-sm">
                <h3 className="text-xs font-bold text-gray-800 border-b pb-3 mb-4 uppercase tracking-wider">Recent Activity History</h3>
                <div className="flex flex-col gap-5 max-h-[350px] overflow-y-auto pr-1">
                  {getRecentActivity().length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-8 text-center">No clinical activities registered to your timeline.</p>
                  ) : (
                    getRecentActivity().map((act, index) => (
                      <div key={index} className="flex gap-4 items-start text-xs">
                        <div className="relative flex-shrink-0 flex flex-col items-center h-full">
                          <div className={`w-3.5 h-3.5 rounded-full border-2 ${
                            act.type === 'appointment' ? 'bg-blue-500 border-blue-200' :
                            act.type === 'prescription' ? 'bg-amber-500 border-amber-200' :
                            act.type === 'room' ? 'bg-purple-500 border-purple-200' :
                            act.type === 'bill' ? 'bg-red-500 border-red-200' :
                            'bg-green-500 border-green-200'
                          }`}></div>
                          {index < getRecentActivity().length - 1 && (
                            <div className="w-0.5 bg-gray-200 flex-1 min-h-[40px] mt-1"></div>
                          )}
                        </div>
                        <div className="flex-1 bg-gray-55/10 p-3.5 rounded-2xl border border-gray-100">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-bold text-gray-800 text-[11px] leading-tight block">{act.text}</span>
                            <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap">{new Date(act.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between items-center mt-2 border-t pt-1.5 border-dashed border-gray-200">
                            <span className="text-[9px] font-bold text-gray-450 uppercase">Category: {act.type}</span>
                            <span className="text-[9px] font-bold text-primary uppercase">{act.status}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Latest Prescription and follow-up tracker */}
              <div className="bg-white border rounded-3xl p-5 md:p-6 shadow-sm">
                <h3 className="text-xs font-bold text-gray-800 border-b pb-3 mb-4 uppercase tracking-wider">Latest Consultation Prescription</h3>
                {latestCompleted ? (
                  <div className="flex flex-col gap-4 text-xs">
                    <div className="flex justify-between items-center bg-gray-50 p-4.5 border rounded-2xl">
                      <div>
                        <h4 className="font-bold text-gray-850">Consulted Doctor: Dr. {latestCompleted.docData.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-wide">{latestCompleted.docData.speciality}</p>
                      </div>
                      <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-lg font-bold border border-primary/20">
                        {slotDateFormat(latestCompleted.slotDate)}
                      </span>
                    </div>

                    <div className="text-xs text-gray-650 bg-gray-50/50 p-4 rounded-2xl border border-dashed">
                      <p className="font-bold text-gray-700">Diagnosis Summary:</p>
                      <p className="mt-1 font-medium text-gray-800">{latestCompleted.diagnosis || 'General Checkup'}</p>
                      {latestCompleted.doctorNotes && (
                        <div className="mt-2.5 border-t pt-2 border-dashed border-gray-200">
                          <p className="font-bold text-gray-700">Doctor Clinical Notes:</p>
                          <p className="italic text-gray-500 mt-0.5">"{latestCompleted.doctorNotes}"</p>
                        </div>
                      )}
                    </div>

                    {latestCompleted.prescription && latestCompleted.prescription.length > 0 ? (
                      <div className="bg-white border p-4 rounded-2xl">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Prescribed Medicines</p>
                        <div className="flex flex-col gap-2">
                          {latestCompleted.prescription.map((pres, idx) => (
                            <div key={idx} className="flex justify-between text-xs border-b pb-2 last:border-b-0 last:pb-0">
                              <div>
                                <span className="font-bold text-gray-800 block">{pres.medicine}</span>
                                <span className="text-[10px] text-gray-400 mt-0.5 block">Advice: {pres.advice || 'As directed'}</span>
                              </div>
                              <span className="text-gray-500 text-[10px] font-bold bg-gray-100 px-2 py-1 rounded">{pres.dosage}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic py-3">No prescribed items logged for this visit.</p>
                    )}

                    <button 
                      onClick={() => handlePrintPrescription(latestCompleted)}
                      className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow"
                    >
                      <PrinterIcon size={14} /> Print Full Invoice & Report
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 italic">
                    <FileTextIcon size={36} className="text-gray-200 mb-2" />
                    <p className="text-xs">No clinical prescription records available.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY APPOINTMENTS */}
        {activeTab === 'my-appointments' && (
            <div className="flex flex-col gap-4">
              {appointments.length === 0 ? (
                <p className="text-gray-400 italic text-center py-10 bg-white rounded-2xl border">No appointments recorded.</p>
              ) : (
                appointments.map((item, index) => (
                  <div key={index} className="bg-white border rounded-2xl p-5 shadow-sm flex flex-wrap md:flex-nowrap gap-5 items-start justify-between">
                    <div className="flex gap-4">
                      <img className="w-24 h-24 bg-blue-50/50 rounded-xl object-cover border" src={item.docData.image} alt="" />
                      <div className="text-xs text-gray-500 flex flex-col gap-1.5">
                        <p className="text-gray-800 text-sm font-bold">Dr. {item.docData.name}</p>
                        <p className="text-primary font-semibold">{item.docData.speciality}</p>
                        <p className="text-gray-400">Clinic Address: {item.docData.address.line1}, {item.docData.address.line2}</p>
                        <p className="font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded inline-block">
                          Slot: {slotDateFormat(item.slotDate)} | {item.slotTime}
                        </p>
                        
                        {/* Status badges */}
                        <div className="mt-1">
                          {item.cancelled ? (
                            <span className="text-[10px] text-red-500 font-bold bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">Cancelled</span>
                          ) : item.isCompleted ? (
                            <span className="text-[10px] text-green-600 font-bold bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">Completed</span>
                          ) : item.isRejected ? (
                            <span className="text-[10px] text-red-500 font-bold bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">Rejected</span>
                          ) : item.isAccepted ? (
                            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">Accepted</span>
                          ) : (
                            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">Pending Confirmation</span>
                          )}
                        </div>

                        {/* Room Admission Status block */}
                        {item.roomRequested && (
                          <div className="mt-2.5 p-3 bg-gray-50 border border-gray-150 rounded-xl text-xs flex flex-col gap-1 max-w-sm">
                            <p className="font-bold text-gray-700">Room Requested: <span className="text-primary">{formatCategory(item.roomCategory)}</span></p>
                            <p className="text-gray-500 font-medium">Status: <span className="font-bold text-gray-800">{item.roomStatus}</span></p>
                            {item.roomStatus === 'Allocated' && (
                              <p className="text-gray-600 font-semibold mt-1">Assigned Room: <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">Room {item.roomNumber}</span></p>
                            )}
                          </div>
                        )}

                        {/* Quick Request Admission option */}
                        {!item.roomRequested && !item.cancelled && !item.isRejected && !item.isCompleted && (
                          <div className="mt-2.5 p-3 border border-dashed border-gray-300 rounded-xl text-xs flex flex-col gap-2 bg-white max-w-xs">
                            <p className="font-bold text-gray-700">Need Hospital Admission?</p>
                            <div className="flex gap-2 items-center">
                              <select
                                value={postRoomCategories[item._id] || 'General Ward'}
                                onChange={(e) => setPostRoomCategories(prev => ({ ...prev, [item._id]: e.target.value }))}
                                className="border rounded-lg px-2.5 py-1.5 outline-primary text-gray-800 text-[11px] bg-white flex-1"
                              >
                                <option value="General Ward">General Ward</option>
                                <option value="ICU">ICU</option>
                                <option value="Semi Private / Twin Sharing">Twin Sharing</option>
                                <option value="Private Room">Private Room</option>
                              </select>
                              <button
                                onClick={async () => {
                                  const category = postRoomCategories[item._id] || 'General Ward';
                                  const success = await requestRoom(item._id, category);
                                  if (success) {
                                    getUserAppointments();
                                  }
                                }}
                                className="px-3 py-1.5 bg-primary text-white font-bold rounded-lg text-[10px] hover:bg-primary-dark transition"
                              >
                                Request
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>

                    {/* Actions column */}
                    <div className="flex flex-col gap-2 justify-end text-xs text-center min-w-[150px] self-stretch">
                      {!item.cancelled && !item.isRejected && !item.isCompleted && payment !== item._id && (
                        <button onClick={() => setPayment(item._id)} className="w-full py-2 border border-primary text-primary rounded-xl hover:bg-primary hover:text-white font-bold transition">
                          Pay Online
                        </button>
                      )}
                      {!item.cancelled && !item.isRejected && !item.isCompleted && payment === item._id && (
                        <button onClick={() => appointmentStripe(item._id)} className="w-full py-2 border rounded-xl hover:bg-gray-50 transition flex items-center justify-center">
                          <img className="max-w-[70px] max-h-5" src={assets.stripe_logo} alt="" />
                        </button>
                      )}
                      {!item.cancelled && !item.isRejected && !item.isCompleted && payment === item._id && (
                        <button onClick={() => appointmentRazorpay(item._id)} className="w-full py-2 border rounded-xl hover:bg-gray-50 transition flex items-center justify-center">
                          <img className="max-w-[70px] max-h-5" src={assets.razorpay_logo} alt="" />
                        </button>
                      )}

                      {/* Partial payments check */}
                      {!item.cancelled && !item.isRejected && item.payment && !item.isCompleted && item.paidAmount < item.amount && (
                        <button onClick={() => appointmentRazorpay(item._id)} className="w-full py-2 border border-primary text-primary rounded-xl hover:bg-primary hover:text-white font-bold transition">
                          Pay Outstanding Balance
                        </button>
                      )}

                      {!item.cancelled && !item.isRejected && item.payment && !item.isCompleted && item.paidAmount >= item.amount && (
                        <button className="w-full py-2 bg-green-50 text-green-600 font-bold border border-green-100 rounded-xl cursor-default">
                          Paid
                        </button>
                      )}

                      {item.isCompleted && (
                        <button className="w-full py-2 bg-green-50 text-green-600 font-bold border border-green-100 rounded-xl cursor-default">
                          Consultation Completed
                        </button>
                      )}

                      {item.isRejected && (
                        <button className="w-full py-2 bg-red-50 text-red-500 font-bold border border-red-100 rounded-xl cursor-default">
                          Rejected
                        </button>
                      )}

                      {!item.cancelled && !item.isRejected && !item.isCompleted && (
                        <button onClick={() => rescheduleAppointment(item)} className="w-full py-2 border rounded-xl hover:bg-gray-50 text-gray-600 transition font-semibold">
                          Reschedule Appointment
                        </button>
                      )}

                      {!item.cancelled && !item.isRejected && !item.isCompleted && (
                        <button onClick={() => cancelAppointment(item._id)} className="w-full py-2 border border-red-100 text-red-500 hover:bg-red-50 rounded-xl transition font-bold">
                          Cancel Appointment
                        </button>
                      )}

                      {item.cancelled && !item.isCompleted && (
                        <button className="w-full py-2 bg-red-50 text-red-500 border border-red-100 rounded-xl cursor-default font-bold">
                          Cancelled
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        {/* TAB 3: UPCOMING APPOINTMENTS */}
        {activeTab === 'upcoming' && (
          <div className="max-w-5xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">Upcoming Visits</h2>
              <p className="text-gray-500 text-xs">Filter of scheduled visits awaiting consultation complete.</p>
            </div>

            <div className="flex flex-col gap-4">
              {activeAppts.length === 0 ? (
                <p className="text-gray-400 italic text-center py-10 bg-white rounded-2xl border">No upcoming visits found.</p>
              ) : (
                activeAppts.map((item, index) => (
                  <div key={index} className="bg-white border rounded-2xl p-5 shadow-sm flex flex-wrap md:flex-nowrap gap-5 items-start justify-between">
                    <div className="flex gap-4">
                      <img className="w-20 h-20 bg-blue-50/50 rounded-xl object-cover border" src={item.docData.image} alt="" />
                      <div className="text-xs text-gray-500 flex flex-col gap-1">
                        <p className="text-gray-800 text-sm font-bold">Dr. {item.docData.name}</p>
                        <p className="text-primary font-semibold">{item.docData.speciality}</p>
                        <p className="font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded inline-block mt-1">
                          Slot: {slotDateFormat(item.slotDate)} | {item.slotTime}
                        </p>
                        {item.isFollowUp && (
                          <span className="text-[9px] bg-purple-50 text-purple-600 border border-purple-100 font-bold px-2 py-0.5 rounded-full inline-block w-fit mt-1 uppercase">
                            Follow-Up visit
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => rescheduleAppointment(item)} className="px-3 py-2 border rounded-xl hover:bg-gray-50 text-gray-600 font-semibold text-xs transition">
                        Reschedule
                      </button>
                      <button onClick={() => cancelAppointment(item._id)} className="px-3 py-2 border border-red-100 text-red-500 hover:bg-red-50 rounded-xl font-bold text-xs transition">
                        Cancel
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: MEDICAL HISTORY */}
        {activeTab === 'history' && (
          <div className="max-w-5xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">Medical History Reports</h2>
              <p className="text-gray-500 text-xs">Access clinical checkups, diagnosis charts, prescription advices, and doctor consultation notes.</p>
            </div>

            <div className="flex flex-col gap-5">
              {medicalHistory.length === 0 ? (
                <p className="text-gray-400 italic text-center py-10 bg-white rounded-2xl border">No completed history notes recorded.</p>
              ) : (
                medicalHistory.map((item, index) => (
                  <div key={index} className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-start border-b pb-3">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">Consultation with Dr. {item.docData.name}</p>
                        <p className="text-xs text-primary font-semibold">{item.docData.speciality}</p>
                      </div>
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {slotDateFormat(item.slotDate)} | {item.slotTime}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Diagnosis Details</p>
                        <p className="text-gray-800 text-sm font-semibold mt-1 bg-blue-50/30 p-2.5 rounded-xl border">
                          {item.diagnosis || 'General Checkup'}
                        </p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Clinical Notes</p>
                        <p className="text-gray-600 italic mt-1 bg-gray-50 p-2.5 rounded-xl border">
                          "{item.doctorNotes || 'No notes logged.'}"
                        </p>
                      </div>
                    </div>

                    {/* Prescription Table */}
                    {item.prescription && item.prescription.length > 0 && (
                      <div className="border border-gray-100 rounded-xl overflow-hidden mt-2">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-gray-50 text-gray-500 font-semibold border-b">
                              <th className="p-3">Medicine</th>
                              <th className="p-3">Dosage</th>
                              <th className="p-3">Advice / Directions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.prescription.map((pres, i) => (
                              <tr key={i} className="hover:bg-gray-50/30 border-b">
                                <td className="p-3 font-semibold text-gray-800">{pres.medicine}</td>
                                <td className="p-3 text-gray-600">{pres.dosage}</td>
                                <td className="p-3 text-gray-500 italic">{pres.advice || 'As directed'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                     {/* Admission & Billing details for history card */}
                     {item.roomRequested && (
                        <div className="mt-2.5 p-3 bg-gray-50/50 border rounded-xl flex flex-col gap-1 text-[11px]">
                          <span className="font-bold text-gray-500 uppercase tracking-wider text-[9px] block mb-0.5">Admission Coordinates</span>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-gray-600">
                            <div><span className="font-semibold text-gray-800">Status:</span> {item.roomStatus}</div>
                            <div><span className="font-semibold text-gray-800">Room:</span> {item.roomNumber ? `Room ${item.roomNumber}` : 'Pending'} ({item.roomCategory})</div>
                            {item.roomAdmissionDate && <div><span className="font-semibold text-gray-800">Admit:</span> {new Date(item.roomAdmissionDate).toLocaleDateString()}</div>}
                            {item.roomDischargedAt && <div><span className="font-semibold text-gray-800">Discharge:</span> {new Date(item.roomDischargedAt).toLocaleDateString()}</div>}
                          </div>
                        </div>
                      )}

                      {(() => {
                        const bill = bills.find(b => b.appointmentId === item._id)
                        if (!bill) return null
                        return (
                          <div className="mt-2.5 p-3 bg-blue-50/15 border border-blue-100 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px]">
                            <div>
                              <span className="font-bold text-blue-700 uppercase tracking-wider text-[9px] block mb-0.5">Linked Hospital Bill</span>
                              <span className="font-semibold text-gray-800">Bill No:</span> {bill.billNumber} | 
                              <span className="font-semibold text-gray-800 ml-1.5">Total:</span> ₹{bill.totalAmount} | 
                              <span className="font-semibold text-gray-800 ml-1.5">Status:</span> <span className={`font-bold ml-0.5 ${bill.paymentStatus === 'Paid' ? 'text-green-600' : 'text-amber-600'}`}>{bill.paymentStatus}</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedBill(bill)
                                  setShowBillModal(true)
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-[10px]"
                              >
                                View Invoice
                              </button>
                              <button
                                onClick={() => handlePrintBill(bill)}
                                className="border border-blue-200 hover:bg-blue-50 text-blue-600 font-bold px-2 py-1.5 rounded-lg text-[10px] flex items-center gap-1"
                              >
                                <LuPrinter size={12} /> PDF
                              </button>
                            </div>
                          </div>
                        )
                      })()}

                    <div className="flex flex-wrap gap-4 text-xs mt-3 items-center justify-between border-t pt-3">
                      <div className="flex gap-3">
                        {item.nextVisitRequired && (
                          <span className="bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1 rounded-full font-semibold">
                            Follow-up Scheduled
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => handlePrintPrescription(item)}
                        className="text-xs font-bold text-primary border border-primary hover:bg-primary hover:text-white px-4 py-2 rounded-xl transition duration-200 flex items-center gap-1.5"
                      >
                        <LuPrinter size={14} /> Print Prescription Report
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: ROOM REQUESTS */}
        {activeTab === 'room-requests' && (
          <div className="max-w-5xl">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Hospital Room Requests</h2>
                <p className="text-gray-500 text-xs">Track active and previous requests submitted by you or recommended by your consulting Doctor.</p>
              </div>
              <button 
                onClick={() => {
                  const upcomingActive = appointments.find(appt => !appt.isCompleted && !appt.cancelled && !appt.isRejected);
                  setRoomModalApptId(upcomingActive?._id || '');
                  setRoomModalCategory('General Ward');
                  setShowRoomModal(true);
                }}
                className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary-dark transition shadow"
              >
                + Request Admission
              </button>
            </div>

            <div className="bg-white border rounded-2xl p-5 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b text-gray-500 font-semibold">
                    <th className="p-3">Doctor / Visit</th>
                    <th className="p-3">Category Requested</th>
                    <th className="p-3">Requested By</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Room Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.filter(appt => appt.roomRequested).length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-gray-400 italic">No room admission requests submitted yet.</td>
                    </tr>
                  ) : (
                    appointments.filter(appt => appt.roomRequested).map((item, index) => {
                      let statusClass = 'bg-amber-50 text-amber-600 border-amber-200';
                      if (item.roomStatus === 'Approved') statusClass = 'bg-blue-50 text-blue-600 border-blue-200';
                      if (item.roomStatus === 'Rejected') statusClass = 'bg-red-50 text-red-600 border-red-200';
                      if (item.roomStatus === 'Allocated') statusClass = 'bg-green-50 text-green-600 border-green-200';
                      if (item.roomStatus === 'Discharged') statusClass = 'bg-gray-50 text-gray-600 border-gray-200';

                      return (
                        <tr key={index} className="border-b hover:bg-gray-50/50">
                          <td className="p-3">
                            <span className="font-semibold text-gray-800 block">Dr. {item.docData.name}</span>
                            <span className="text-[10px] text-gray-400">{slotDateFormat(item.slotDate)}</span>
                          </td>
                          <td className="p-3 font-medium text-primary">{item.roomCategory}</td>
                          <td className="p-3">
                            <span className={`text-[9px] font-bold border px-2 py-0.5 rounded-full ${item.roomRequestedBy === 'doctor' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                              {item.roomRequestedBy === 'doctor' ? 'Doctor' : 'Patient'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${statusClass}`}>
                              {item.roomStatus}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-gray-800">
                            {item.roomNumber ? `Room ${item.roomNumber}` : 'N/A'}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: CURRENT ADMISSION */}
        {activeTab === 'current-admission' && (
          <div className="max-w-2xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">Current Hospital Admission</h2>
              <p className="text-gray-500 text-xs">Verify allocated room coordinates, admission dates, and attending physician details.</p>
            </div>

            {activeAdmission ? (
              <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-4 bg-green-50 border border-green-150 p-4 rounded-xl text-green-700">
                  <LuBed size={28} />
                  <div>
                    <h3 className="font-bold text-sm">Patient Admitted Successfully</h3>
                    <p className="text-[11px] font-medium opacity-90">Currently assigned to Room {activeAdmission.roomNumber} ({activeAdmission.roomCategory})</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-gray-700 mt-2">
                  <div className="border p-3.5 rounded-xl">
                    <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">Ward Category</p>
                    <p className="font-bold text-gray-800">{activeAdmission.roomCategory}</p>
                  </div>
                  <div className="border p-3.5 rounded-xl">
                    <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">Room Number</p>
                    <p className="font-bold text-gray-800">Room {activeAdmission.roomNumber}</p>
                  </div>
                  <div className="border p-3.5 rounded-xl">
                    <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">Admission Date</p>
                    <p className="font-semibold text-gray-800">{new Date(activeAdmission.roomAdmissionDate).toLocaleDateString()}</p>
                  </div>
                  <div className="border p-3.5 rounded-xl">
                    <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">Expected Discharge</p>
                    <p className="font-semibold text-gray-800">{activeAdmission.roomExpectedDischarge ? new Date(activeAdmission.roomExpectedDischarge).toLocaleDateString() : 'Pending Doctor review'}</p>
                  </div>
                  <div className="col-span-2 border p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 font-bold uppercase text-[9px] tracking-wider mb-1">Attending Physician</p>
                      <p className="font-bold text-gray-800">Dr. {activeAdmission.docData.name}</p>
                      <p className="text-gray-400 text-[10px]">{activeAdmission.docData.speciality}</p>
                    </div>
                    <img className="w-12 h-12 rounded-full object-cover border" src={activeAdmission.docData.image} alt="" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border rounded-2xl p-8 text-center shadow-sm">
                <LuBed className="mx-auto text-gray-300 mb-3" size={48} />
                <h3 className="font-bold text-gray-700 text-sm">No Active Admission</h3>
                <p className="text-gray-400 text-xs mt-1 max-w-sm mx-auto">You are not currently admitted to any ward. If required, click below to submit a room admission request.</p>
                <button
                  onClick={() => {
                    const upcomingActive = appointments.find(appt => !appt.isCompleted && !appt.cancelled && !appt.isRejected);
                    setRoomModalApptId(upcomingActive?._id || '');
                    setRoomModalCategory('General Ward');
                    setShowRoomModal(true);
                  }}
                  className="mt-4 bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary-dark transition"
                >
                  Submit Admission Request
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: PRESCRIPTIONS */}
        {activeTab === 'prescriptions' && (
          <div className="max-w-5xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 font-sans">Active Prescriptions List</h2>
              <p className="text-gray-500 text-xs">Verify pharmacy orders and download reports directly.</p>
            </div>

            <div className="flex flex-col gap-4">
              {medicalHistory.filter(appt => appt.prescription && appt.prescription.length > 0).length === 0 ? (
                <p className="text-gray-400 italic text-center py-10 bg-white rounded-2xl border">No prescriptions found.</p>
              ) : (
                medicalHistory.filter(appt => appt.prescription && appt.prescription.length > 0).map((item, index) => (
                  <div key={index} className="bg-white border rounded-2xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800 text-xs">Prescribed by Dr. {item.docData.name}</p>
                      <p className="text-[10px] text-gray-400">Date: {slotDateFormat(item.slotDate)} | Diagnosis: {item.diagnosis || 'Checkup'}</p>
                      <div className="flex gap-2 mt-2">
                        {item.prescription.map((p, pIdx) => (
                          <span key={pIdx} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-semibold border">
                            {p.medicine}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handlePrintPrescription(item)}
                      className="border border-primary text-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition flex items-center gap-1"
                    >
                      <LuPrinter size={12} /> Print
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 8: BILLING & PAYMENTS */}
        {activeTab === 'billing-payments' && (
          <div className="max-w-5xl flex flex-col gap-8">
            <div className="mb-2">
              <h2 className="text-xl font-bold text-gray-800">Billing & Payments</h2>
              <p className="text-gray-500 text-xs">Access hospital bills, download invoice PDFs, or pay outstanding dues online.</p>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2.5">
              {['all', 'pending', 'paid'].map((f) => (
                <button
                  key={f}
                  onClick={() => setBillFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition capitalize ${
                    billFilter === f 
                      ? 'bg-primary text-white shadow-md shadow-primary/20' 
                      : 'bg-white border text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {f === 'all' ? 'All Bills' : f === 'pending' ? 'Pending Payment' : 'Paid Bills'}
                </button>
              ))}
            </div>

            {/* Bill Cards Grid */}
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-1.5">
                <LuCreditCard className="text-primary" size={16} />
                Hospital Invoice Records
              </h3>
              
              {(() => {
                const filteredBills = bills.filter(b => {
                  if (billFilter === 'pending') return b.paymentStatus !== 'Paid';
                  if (billFilter === 'paid') return b.paymentStatus === 'Paid';
                  return true;
                });

                if (filteredBills.length === 0) {
                  return (
                    <p className="text-gray-400 italic text-center py-10 bg-white rounded-2xl border">No billing records found matching this status.</p>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredBills.map((bill, index) => {
                      const pendingAmt = Math.max(0, bill.totalAmount - bill.paidAmount);
                      let statusClass = 'bg-amber-50 text-amber-600 border-amber-200';
                      if (bill.paymentStatus === 'Paid') statusClass = 'bg-green-50 text-green-600 border-green-200';
                      if (bill.paymentStatus === 'Partially Paid') statusClass = 'bg-blue-50 text-blue-600 border-blue-200';
                      if (bill.paymentStatus === 'Cancelled') statusClass = 'bg-red-50 text-red-600 border-red-200';

                      return (
                        <div key={index} className="bg-white border rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                          <div className="flex justify-between items-center border-b pb-3">
                            <div>
                              <span className="text-[10px] text-gray-400 font-bold block">BILL NUMBER / INVOICE</span>
                              <span className="font-bold text-gray-800 text-xs">{bill.billNumber}</span>
                            </div>
                            <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${statusClass}`}>
                              {bill.paymentStatus}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs text-gray-600 border-b pb-3">
                            <div>
                              <span className="font-semibold text-gray-400 block text-[9px] uppercase">Appointment ID</span>
                              <span className="font-bold text-gray-800">{bill.appointmentId}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-400 block text-[9px] uppercase">Doctor Name</span>
                              <span className="font-bold text-gray-800">Dr. {bill.doctorName}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-400 block text-[9px] uppercase">Consultation Fee</span>
                              <span className="font-bold text-gray-800">₹{bill.consultationFee}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-400 block text-[9px] uppercase">Room Charges</span>
                              <span className="font-bold text-gray-800">₹{bill.roomCharges || 0}</span>
                            </div>
                          </div>

                          <div className="bg-gray-50 border p-3 rounded-xl grid grid-cols-3 gap-2 text-center text-xs">
                            <div>
                              <span className="text-[9px] font-bold text-gray-400 block">TOTAL AMOUNT</span>
                              <span className="font-bold text-gray-800">₹{bill.totalAmount}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-gray-400 block">PAID</span>
                              <span className="font-bold text-green-600">₹{bill.paidAmount}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-gray-400 block">PENDING</span>
                              <span className="font-bold text-red-600">₹{pendingAmt}</span>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-1">
                            <button
                              onClick={() => {
                                setSelectedBill(bill)
                                setShowBillModal(true)
                              }}
                              className="flex-1 py-2 border rounded-xl hover:bg-gray-50 text-gray-600 font-semibold text-xs transition font-bold"
                            >
                              View Bill
                            </button>
                            <button
                              onClick={() => handlePrintBill(bill)}
                              className="flex-1 py-2 border border-blue-150 hover:bg-blue-50 text-blue-600 font-semibold text-xs transition flex items-center justify-center gap-1.5 font-bold"
                            >
                              <LuPrinter size={13} /> Download Invoice
                            </button>
                            {pendingAmt > 0 && (
                              <button
                                onClick={() => {
                                  setPayment(bill.appointmentId)
                                  appointmentRazorpay(bill.appointmentId)
                                }}
                                className="flex-1 py-2 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-dark transition"
                              >
                                Pay Now
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Payment History Log */}
            <div className="mt-4">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-1.5">
                <LuHistory className="text-primary" size={16} />
                Transaction & Payment Logs
              </h3>

              <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b text-gray-500 font-semibold">
                      <th className="p-3">Payment Date</th>
                      <th className="p-3">Attending Doctor</th>
                      <th className="p-3">Bill Number</th>
                      <th className="p-3">Amount Paid</th>
                      <th className="p-3">Payment Method</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-6 text-center text-gray-400 italic">No payments successfully logged.</td>
                      </tr>
                    ) : (
                      paymentHistory.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50/50">
                          <td className="p-3 text-gray-600">{new Date(item.paymentDate).toLocaleDateString()}</td>
                          <td className="p-3">
                            <span className="font-semibold text-gray-800 block">Dr. {item.doctorName}</span>
                            <span className="text-[10px] text-gray-400">{item.appointmentDate}</span>
                          </td>
                          <td className="p-3 font-semibold text-primary">{item.billNumber}</td>
                          <td className="p-3 font-bold text-green-600">₹{item.amountPaid}</td>
                          <td className="p-3 capitalize">{item.paymentMethod}</td>
                          <td className="p-3">
                            <span className="text-[9px] bg-green-50 text-green-600 font-bold border border-green-150 px-2 py-0.5 rounded-full">Success</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: COMBINED PROFILE & SETTINGS */}
        {activeTab === 'profile' && (
          <div className="max-w-4xl flex flex-col gap-6">
            <div className="mb-2">
              <h2 className="text-xl font-bold text-gray-800">My Profile & Settings</h2>
              <p className="text-gray-500 text-xs">View personal details, update contact parameters, manage emergency contacts, and change your password.</p>
            </div>

            {userData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Column 1 & 2: Demographic & Medical info */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  
                  {/* Personal Information Form */}
                  <form onSubmit={handleUpdateProfile} className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
                    <div className="flex justify-between items-center border-b pb-4">
                      <h3 className="text-sm font-bold text-gray-800">Personal Information</h3>
                      {!isEdit ? (
                        <button 
                          type="button"
                          onClick={() => setIsEdit(true)}
                          className="px-4 py-1.5 border border-primary text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition"
                        >
                          Edit Profile
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => { setIsEdit(false); setImage(false); }}
                            className="px-3 py-1.5 border rounded-xl hover:bg-gray-50 text-xs font-bold"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            className="px-4 py-1.5 bg-primary text-white hover:bg-primary-dark rounded-xl text-xs font-bold transition"
                          >
                            Save Changes
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap md:flex-nowrap items-center gap-5 pb-4 border-b">
                      {isEdit ? (
                        <label htmlFor="image" className="cursor-pointer relative inline-block">
                          <img className="w-20 h-20 rounded-full object-cover opacity-75 border" src={image ? URL.createObjectURL(image) : userData.image} alt="" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/35 rounded-full text-white text-[9px] font-bold">Change</div>
                          <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden />
                        </label>
                      ) : (
                        <img className="w-20 h-20 rounded-full object-cover border" src={userData.image} alt="" />
                      )}
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">{userData.name}</h4>
                        <p className="text-gray-400 text-xs">Patient Account</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-700">Full Name</label>
                        <input 
                          type="text" 
                          required
                          disabled={!isEdit}
                          value={userData.name}
                          onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                          className="border rounded-xl p-2.5 outline-primary bg-white disabled:bg-gray-50/50 text-gray-800 font-semibold"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-700">Email Address</label>
                        <input 
                          type="email" 
                          required
                          disabled={!isEdit}
                          value={userData.email}
                          onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                          className="border rounded-xl p-2.5 outline-primary bg-white disabled:bg-gray-50/50 text-gray-800 font-semibold"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-700">Phone Number</label>
                        <input 
                          type="text" 
                          required
                          disabled={!isEdit}
                          value={userData.phone}
                          onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                          className="border rounded-xl p-2.5 outline-primary bg-white disabled:bg-gray-50/50 text-gray-800 font-semibold"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-700">Date of Birth</label>
                        <input 
                          type="date" 
                          required
                          disabled={!isEdit}
                          value={userData.dob}
                          onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))}
                          className="border rounded-xl p-2.5 outline-primary bg-white disabled:bg-gray-50/50 text-gray-800 font-semibold"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-400">Age (Calculated)</label>
                        <input 
                          type="text" 
                          disabled
                          value={calculateAge(userData.dob)}
                          className="border rounded-xl p-2.5 bg-gray-50 text-gray-400 font-semibold"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-450">Gender</label>
                        <input 
                          type="text" 
                          disabled
                          value={userData.gender}
                          className="border rounded-xl p-2.5 bg-gray-50 text-gray-400 font-semibold"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-450">Blood Group</label>
                        <input 
                          type="text" 
                          disabled
                          value={userData.bloodGroup || 'Not Selected'}
                          className="border rounded-xl p-2.5 bg-gray-50 text-gray-400 font-semibold"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-455">Occupation</label>
                        <input 
                          type="text" 
                          disabled
                          value={userData.occupation || 'N/A'}
                          className="border rounded-xl p-2.5 bg-gray-50 text-gray-400 font-semibold"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="font-bold text-gray-700">Emergency Contact</label>
                        <input 
                          type="text" 
                          disabled={!isEdit}
                          placeholder="Name and Phone number"
                          value={userData.emergencyContact || ''}
                          onChange={(e) => setUserData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                          className="border rounded-xl p-2.5 outline-primary bg-white disabled:bg-gray-50/50 text-gray-800 font-semibold"
                        />
                      </div>

                      <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-gray-700">Address Line 1</label>
                          <input 
                            type="text" 
                            disabled={!isEdit}
                            value={userData.address?.line1 || ''}
                            onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                            className="border rounded-xl p-2.5 outline-primary bg-white disabled:bg-gray-50/50 text-gray-800 font-semibold"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-bold text-gray-700">Address Line 2</label>
                          <input 
                            type="text" 
                            disabled={!isEdit}
                            value={userData.address?.line2 || ''}
                            onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))}
                            className="border rounded-xl p-2.5 outline-primary bg-white disabled:bg-gray-50/50 text-gray-800 font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  </form>

                  {/* Medical Information block */}
                  <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-xs">
                    <h3 className="text-sm font-bold text-gray-800 border-b pb-3 mb-1">Medical & Health Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-400">Known Allergies</label>
                        <textarea 
                          disabled
                          value={userData.allergies || 'No known allergies reported.'}
                          rows="2"
                          className="border rounded-xl p-2.5 bg-gray-50 text-gray-400 font-semibold resize-none"
                        ></textarea>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-gray-400">Medical Conditions</label>
                        <textarea 
                          disabled
                          value={userData.medicalConditions || 'No active chronic medical conditions logged.'}
                          rows="2"
                          className="border rounded-xl p-2.5 bg-gray-50 text-gray-400 font-semibold resize-none"
                        ></textarea>
                      </div>

                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="font-bold text-gray-400">Insurance Policy Info (Future Support)</label>
                        <input 
                          type="text" 
                          disabled
                          value={userData.insurance || 'No linked active insurance provider.'}
                          className="border rounded-xl p-2.5 bg-gray-50 text-gray-400 font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Account Security */}
                <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-xs">
                  <h3 className="text-sm font-bold text-gray-800 border-b pb-3 mb-1">Account Security</h3>
                  <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-gray-700">Current Password</label>
                      <input 
                        type="password" 
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="border rounded-xl p-2.5 outline-primary bg-white text-gray-800 font-semibold"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-gray-700">New Password</label>
                      <input 
                        type="password" 
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="border rounded-xl p-2.5 outline-primary bg-white text-gray-800 font-semibold"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-gray-700">Confirm Password</label>
                      <input 
                        type="password" 
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="border rounded-xl p-2.5 outline-primary bg-white text-gray-800 font-semibold"
                        placeholder="••••••••"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={updatingSettings}
                      className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-xl transition disabled:opacity-50 mt-2 shadow-sm text-xs"
                    >
                      {updatingSettings ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* QUICK ROOM REQUEST MODAL DIALOG */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border">
            <div className="flex justify-between items-center bg-gray-50 px-5 py-4 border-b">
              <h3 className="font-bold text-gray-800 text-sm">Request Hospital Admission</h3>
              <button 
                onClick={() => setShowRoomModal(false)}
                className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition"
              >
                <XIcon size={18} />
              </button>
            </div>
            
            <form onSubmit={handleQuickRoomRequestSubmit} className="p-5 flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-700">Select Active Appointment *</label>
                <select
                  required
                  value={roomModalApptId}
                  onChange={(e) => setRoomModalApptId(e.target.value)}
                  className="border rounded-lg p-2.5 bg-white text-gray-800 font-semibold"
                >
                  <option value="">-- Choose Attending Appointment --</option>
                  {appointments.filter(appt => !appt.isCompleted && !appt.cancelled && !appt.isRejected).map((appt, idx) => (
                    <option key={idx} value={appt._id}>
                      Dr. {appt.docData.name} ({slotDateFormat(appt.slotDate)} | {appt.slotTime})
                    </option>
                  ))}
                </select>
                {appointments.filter(appt => !appt.isCompleted && !appt.cancelled && !appt.isRejected).length === 0 && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1">No active appointments found. You must have an active appointment to request a room.</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-700">Select Room Category *</label>
                <select
                  required
                  value={roomModalCategory}
                  onChange={(e) => setRoomModalCategory(e.target.value)}
                  className="border rounded-lg p-2.5 bg-white text-gray-800 font-semibold"
                >
                  <option value="General Ward">General Ward</option>
                  <option value="ICU">ICU</option>
                  <option value="Semi Private / Twin Sharing">Twin Sharing</option>
                  <option value="Private Room">Private Room</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end mt-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-gray-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={appointments.filter(appt => !appt.isCompleted && !appt.cancelled && !appt.isRejected).length === 0}
                  className="px-5 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition disabled:opacity-50"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED HOSPITAL BILL INVOICE MODAL */}
      {showBillModal && selectedBill && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b">
              <h3 className="font-bold text-gray-800 text-sm font-sans">Invoice Details - {selectedBill.billNumber}</h3>
              <button 
                onClick={() => setShowBillModal(false)}
                className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition"
              >
                <XIcon size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex flex-col gap-6 text-xs text-gray-650 font-sans">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h4 className="font-bold text-primary text-base">Prescripto Hospital</h4>
                  <p className="mt-1 text-gray-400 leading-relaxed">
                    123 Healing Garden Street<br/>
                    Medical Hub District, NY 10016
                  </p>
                </div>
                <div className="text-right flex flex-col gap-0.5">
                  <p className="font-bold text-gray-800 text-sm">INVOICE</p>
                  <p><span className="font-semibold">Number:</span> {selectedBill.billNumber}</p>
                  <p><span className="font-semibold">Date Generated:</span> {new Date(selectedBill.billDate).toLocaleDateString()}</p>
                  <p><span className="font-semibold">Payment Due:</span> {new Date(selectedBill.dueDate).toLocaleDateString()}</p>
                  <p className="mt-1">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] border uppercase ${
                      selectedBill.paymentStatus === 'Paid' 
                        ? 'bg-green-50 text-green-600 border-green-200' 
                        : selectedBill.paymentStatus === 'Partially Paid' 
                          ? 'bg-blue-50 text-blue-600 border-blue-200' 
                          : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}>
                      {selectedBill.paymentStatus}
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border">
                <div>
                  <span className="font-bold text-gray-450 block mb-1 text-[9px] uppercase tracking-wider">PATIENT & DOCTOR DETAILS</span>
                  <p className="font-semibold text-gray-800">Patient: <span className="font-bold text-gray-900">{selectedBill.patientName}</span></p>
                  <p className="text-[10px] text-gray-400">ID: {selectedBill.userId}</p>
                  <p className="font-semibold text-gray-800 mt-1.5">Doctor Name: <span className="font-bold text-gray-900">Dr. {selectedBill.doctorName}</span></p>
                  <p className="text-[10px] text-gray-400">ID: {selectedBill.docId}</p>
                </div>
                <div>
                  <span className="font-bold text-gray-450 block mb-1 text-[9px] uppercase tracking-wider">APPOINTMENT & INVOICE DETAILS</span>
                  <p className="font-semibold text-gray-800">Appointment ID: <span className="font-bold text-gray-900">{selectedBill.appointmentId}</span></p>
                  <p className="font-semibold text-gray-800 mt-1">Bill Date: <span className="font-bold text-gray-900">{new Date(selectedBill.billDate).toLocaleString()}</span></p>
                  <p className="font-semibold text-gray-800 mt-1">Due Date: <span className="font-bold text-gray-900">{new Date(selectedBill.dueDate).toLocaleString()}</span></p>
                </div>
              </div>

              {selectedBill.roomAdmissionDate && (
                <div className="grid grid-cols-2 gap-4 bg-blue-50/20 p-4 rounded-xl border border-blue-100">
                  <div>
                    <span className="font-bold text-blue-600 block mb-1 text-[9px] uppercase tracking-wider">ROOM DETAILS</span>
                    <p className="font-semibold text-gray-800">Category: <span className="font-bold text-gray-900">{selectedBill.roomCategory}</span></p>
                    <p className="font-semibold text-gray-800 mt-1">Room Number: <span className="font-bold text-gray-900">Room {selectedBill.roomNumber}</span></p>
                    <p className="font-semibold text-gray-800 mt-1">Daily Room Rate: <span className="font-bold text-gray-900">₹{selectedBill.roomRatePerDay}/day</span></p>
                  </div>
                  <div>
                    <span className="font-bold text-blue-600 block mb-1 text-[9px] uppercase tracking-wider">ADMISSION TIMELINE</span>
                    <p className="font-semibold text-gray-800">Admission Date: <span className="font-bold text-gray-900">{new Date(selectedBill.roomAdmissionDate).toLocaleString()}</span></p>
                    <p className="font-semibold text-gray-800 mt-1">Discharge Date: <span className="font-bold text-gray-900">{selectedBill.roomDischargeDate ? new Date(selectedBill.roomDischargeDate).toLocaleString() : 'N/A'}</span></p>
                    <p className="font-semibold text-gray-800 mt-1">Chargeable Days: <span className="font-bold text-gray-900">{selectedBill.roomDays} Days</span></p>
                  </div>
                </div>
              )}

              <div>
                <span className="font-bold text-gray-700 block mb-2 text-[9px] uppercase tracking-wider">BILL BREAKDOWN</span>
                <div className="bg-gray-50 border rounded-xl p-4 font-mono text-[11px] text-gray-700 leading-relaxed shadow-inner">
                  <div className="flex justify-between">
                    <span>Consultation Fee</span>
                    <span className="font-bold text-gray-900">₹{selectedBill.consultationFee}</span>
                  </div>
                  <div className="border-t border-dashed my-2 border-gray-300"></div>
                  {selectedBill.roomCharges > 0 ? (
                    <>
                      <div className="flex justify-between">
                        <span>Room Category</span>
                        <span className="font-bold text-gray-900">{selectedBill.roomCategory}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Room Rate</span>
                        <span className="font-bold text-gray-900">₹{selectedBill.roomRatePerDay}/day</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Chargeable Days</span>
                        <span className="font-bold text-gray-900">{selectedBill.roomDays}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Room Charges</span>
                        <span className="font-bold text-gray-900">₹{selectedBill.roomCharges}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-400 italic text-[10px]">No Room Accommodation Charges</p>
                  )}
                  <div className="border-t border-dashed my-2 border-gray-300"></div>
                  <div className="flex justify-between">
                    <span>Other Charges</span>
                    <span className="font-bold text-gray-900">₹{selectedBill.otherCharges || 0}</span>
                  </div>
                  <div className="border-t border-double my-3 border-gray-400"></div>
                  <div className="flex justify-between text-xs font-bold text-primary uppercase">
                    <span>Total Amount</span>
                    <span>₹{selectedBill.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-green-700 uppercase mt-1">
                    <span>Amount Paid</span>
                    <span>₹{selectedBill.paidAmount}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-red-600 uppercase mt-1 border-t pt-1.5 border-dashed border-gray-350">
                    <span>Outstanding Balance</span>
                    <span>₹{Math.max(0, selectedBill.totalAmount - selectedBill.paidAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3 font-sans">
              <button 
                onClick={() => handlePrintBill(selectedBill)}
                className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary-dark transition flex items-center gap-1.5 shadow-sm"
              >
                <LuPrinter size={14} /> Print Invoice
              </button>
              <button 
                onClick={() => setShowBillModal(false)}
                className="px-4 py-2 border rounded-xl hover:bg-gray-100 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default PatientDashboard
