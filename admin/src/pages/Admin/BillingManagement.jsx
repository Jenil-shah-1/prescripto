import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'

// Inline SVG Icon Components
const PrinterIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
)

const CreditCardIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
)

const SearchIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
)

const EditIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path></svg>
)

const DollarSignIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
)

const RefreshCwIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
)

const BillingManagement = () => {
  const {
    aToken,
    bills,
    getBillsAdmin,
    markBillPaid,
    triggerGenerateBillAdmin,
    updateCharges,
    appointments,
    getAllAppointments
  } = useContext(AdminContext)

  // Section / Tab state: 'pending' | 'paid' | 'invoices' | 'history'
  const [activeSection, setActiveSection] = useState('pending')

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // Modals state
  const [showPaidModal, setShowPaidModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedBill, setSelectedBill] = useState(null)

  // Form states
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [amountPaid, setAmountPaid] = useState('')

  const [consultFee, setConsultFee] = useState('')
  const [roomChgs, setRoomChgs] = useState('')
  const [otherChgs, setOtherChgs] = useState('')

  const [targetAppointmentId, setTargetAppointmentId] = useState('')

  useEffect(() => {
    if (aToken) {
      getBillsAdmin()
      getAllAppointments()
    }
  }, [aToken])

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

    const paymentHistoryHtml = bill.paymentHistory && bill.paymentHistory.length > 0 ? `
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
                  ${bill.paymentHistory.map(h => `
                      <tr>
                          <td>${new Date(h.paymentDate).toLocaleDateString()}</td>
                          <td>₹${h.amountPaid}</td>
                          <td style="text-transform: capitalize;">${h.paymentMethod}</td>
                          <td>${h.transactionId || 'CASH-PAYMENT'}</td>
                      </tr>
                  `).join('')}
              </tbody>
          </table>
      </div>` : '';

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
                      ${bill.roomCharges > 0 ? `
                      <tr>
                          <td>Room Accommodation Charges:</td>
                          <td style="text-align: right;">₹${bill.roomCharges}</td>
                      </tr>` : ''}
                      ${bill.otherCharges > 0 ? `
                      <tr>
                          <td>Other Charges:</td>
                          <td style="text-align: right;">₹${bill.otherCharges}</td>
                      </tr>` : ''}
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

  const handleMarkPaidSubmit = async (e) => {
    e.preventDefault()
    if (!selectedBill) return
    const success = await markBillPaid(selectedBill._id, paymentMethod, amountPaid)
    if (success) {
      setShowPaidModal(false)
      setAmountPaid('')
    }
  }

  const handleUpdateChargesSubmit = async (e) => {
    e.preventDefault()
    if (!selectedBill) return
    const success = await updateCharges(selectedBill._id, {
      consultationFee: consultFee,
      roomCharges: roomChgs,
      otherCharges: otherChgs
    })
    if (success) {
      setShowEditModal(false)
    }
  }

  const handleGenerateBillSubmit = async (e) => {
    e.preventDefault()
    if (!targetAppointmentId) return
    const success = await triggerGenerateBillAdmin(targetAppointmentId)
    if (success) {
      setShowGenerateModal(false)
      setTargetAppointmentId('')
    }
  }

  // Calculate Summary Cards metrics
  let totalBilled = 0
  let totalPaid = 0
  let pendingDues = 0
  let pendingCount = 0
  let paidCount = 0

  bills.forEach(b => {
    totalBilled += b.totalAmount || 0
    totalPaid += b.paidAmount || 0
    if (b.paymentStatus === 'Paid') {
      paidCount++
    } else {
      pendingCount++
      pendingDues += Math.max(0, b.totalAmount - b.paidAmount)
    }
  })

  // Filter bills based on search query
  const searchFilter = (b) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return b.patientName?.toLowerCase().includes(q) || 
           b.doctorName?.toLowerCase().includes(q) || 
           b.billNumber?.toLowerCase().includes(q)
  }

  const pendingBills = bills.filter(b => b.paymentStatus !== 'Paid' && searchFilter(b))
  const paidBills = bills.filter(b => b.paymentStatus === 'Paid' && searchFilter(b))
  const allInvoices = bills.filter(searchFilter)

  // Consolidated payment history ledger
  const paymentLogs = []
  bills.forEach(bill => {
    if (bill.paymentHistory && Array.isArray(bill.paymentHistory)) {
      bill.paymentHistory.forEach(h => {
        paymentLogs.push({
          billNumber: bill.billNumber,
          patientName: bill.patientName,
          doctorName: bill.doctorName,
          amountPaid: h.amountPaid,
          paymentMethod: h.paymentMethod,
          paymentDate: h.paymentDate,
          transactionId: h.transactionId || 'CASH-RECEIPT'
        })
      })
    }
  })
  paymentLogs.sort((a, b) => b.paymentDate - a.paymentDate)

  const billingCandidates = appointments.filter(appt => 
    appt.isCompleted && !bills.some(b => b.appointmentId === appt._id.toString())
  )

  return (
    <div className="p-6 md:p-10 w-full flex flex-col gap-6 text-[#4A4A4A] max-w-7xl">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Hospital Billing Management</h2>
          <p className="text-gray-500 text-xs mt-0.5">Manage invoices, collect outstanding payments, print receipts, and review payment logs.</p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-primary-dark transition shadow"
        >
          + Generate Invoice Manually
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Total Billed</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">₹{totalBilled}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <DollarSignIcon size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Collected Revenue</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">₹{totalPaid}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CreditCardIcon size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Pending Dues</p>
            <p className="text-2xl font-bold text-red-600 mt-1">₹{pendingDues}</p>
          </div>
          <div className="p-3 bg-red-50 text-red-500 rounded-xl">
            <DollarSignIcon size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Total Invoices</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{bills.length}</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <PrinterIcon size={24} />
          </div>
        </div>
      </div>

      {/* SEARCH AND 4 SECTIONS TABS */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border shadow-xs">
        {/* Section Tabs */}
        <div className="flex border-b border-gray-200 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveSection('pending')}
            className={`py-2.5 px-5 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${activeSection === 'pending' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
          >
            Pending Bills
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSection('paid')}
            className={`py-2.5 px-5 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${activeSection === 'paid' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
          >
            Paid Bills
            {paidCount > 0 && (
              <span className="bg-green-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {paidCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSection('invoices')}
            className={`py-2.5 px-5 font-bold text-xs border-b-2 transition-all whitespace-nowrap ${activeSection === 'invoices' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
          >
            Invoices Master
          </button>
          <button
            onClick={() => setActiveSection('history')}
            className={`py-2.5 px-5 font-bold text-xs border-b-2 transition-all whitespace-nowrap ${activeSection === 'history' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
          >
            Payment History
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 border rounded-xl px-3 py-2 min-w-[240px] w-full md:w-auto bg-gray-50/50">
          <SearchIcon className="text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search invoice or patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="outline-none text-xs w-full bg-transparent font-medium"
          />
        </div>
      </div>

      {/* SECTION CONTENT DISPLAY */}
      <div className="bg-white border rounded-2xl shadow-xs overflow-hidden min-h-[400px]">
        
        {/* SECTION 1: PENDING BILLS */}
        {activeSection === 'pending' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-500 font-semibold">
                  <th className="p-3">Bill Number</th>
                  <th className="p-3">Patient / Doctor</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Amount Paid</th>
                  <th className="p-3">Outstanding Dues</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingBills.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-6 text-center text-gray-400 italic">No pending or unpaid bills found.</td>
                  </tr>
                ) : (
                  pendingBills.map((bill, index) => {
                    const dues = Math.max(0, bill.totalAmount - bill.paidAmount)
                    return (
                      <tr key={index} className="border-b hover:bg-gray-50/50">
                        <td className="p-3 font-bold text-gray-800">{bill.billNumber}</td>
                        <td className="p-3">
                          <span className="font-semibold text-gray-850 block">{bill.patientName}</span>
                          <span className="text-[10px] text-gray-400 block">Doctor: Dr. {bill.doctorName}</span>
                        </td>
                        <td className="p-3 text-gray-600 font-medium">{new Date(bill.dueDate).toLocaleDateString()}</td>
                        <td className="p-3 font-bold text-gray-800">₹{bill.totalAmount}</td>
                        <td className="p-3 font-semibold text-emerald-600">₹{bill.paidAmount}</td>
                        <td className="p-3 font-bold text-red-600">₹{dues}</td>
                        <td className="p-3">
                          <span className="text-[10px] font-bold border px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border-amber-200">
                            {bill.paymentStatus}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => {
                                setSelectedBill(bill)
                                setAmountPaid(dues)
                                setShowPaidModal(true)
                              }}
                              className="bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition shadow-xs"
                            >
                              <DollarSignIcon size={12} /> Collect ₹{dues}
                            </button>
                            <button
                              onClick={() => handlePrintBill(bill)}
                              className="border border-blue-200 text-blue-600 hover:bg-blue-50 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                            >
                              <PrinterIcon size={12} /> Invoice
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* SECTION 2: PAID BILLS */}
        {activeSection === 'paid' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-500 font-semibold">
                  <th className="p-3">Bill Number</th>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Doctor</th>
                  <th className="p-3">Total Paid</th>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paidBills.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-gray-400 italic">No fully paid hospital bills recorded.</td>
                  </tr>
                ) : (
                  paidBills.map((bill, index) => {
                    const lastPayment = bill.paymentHistory?.[bill.paymentHistory.length - 1]
                    return (
                      <tr key={index} className="border-b hover:bg-gray-50/50">
                        <td className="p-3 font-bold text-gray-800">{bill.billNumber}</td>
                        <td className="p-3 font-semibold text-gray-800">{bill.patientName}</td>
                        <td className="p-3 text-gray-600">Dr. {bill.doctorName}</td>
                        <td className="p-3 font-bold text-emerald-600">₹{bill.paidAmount}</td>
                        <td className="p-3 capitalize text-gray-600">{lastPayment?.paymentMethod || 'Cash'}</td>
                        <td className="p-3">
                          <span className="text-[10px] font-bold border px-2 py-0.5 rounded-full bg-green-50 text-green-600 border-green-200">
                            Paid In Full
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handlePrintBill(bill)}
                              className="border border-blue-200 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                            >
                              <PrinterIcon size={12} /> Print Receipt
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* SECTION 3: INVOICES MASTER */}
        {activeSection === 'invoices' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-500 font-semibold">
                  <th className="p-3">Bill Number</th>
                  <th className="p-3">Patient / Doctor</th>
                  <th className="p-3">Visit Date</th>
                  <th className="p-3">Room / Category</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Paid Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-6 text-center text-gray-400 italic">No invoices generated yet.</td>
                  </tr>
                ) : (
                  allInvoices.map((bill, index) => {
                    let statusClass = 'bg-amber-50 text-amber-600 border-amber-200';
                    if (bill.paymentStatus === 'Paid') statusClass = 'bg-green-50 text-green-600 border-green-200';
                    if (bill.paymentStatus === 'Partially Paid') statusClass = 'bg-blue-50 text-blue-600 border-blue-200';

                    return (
                      <tr key={index} className="border-b hover:bg-gray-50/50">
                        <td className="p-3 font-bold text-gray-800">{bill.billNumber}</td>
                        <td className="p-3">
                          <span className="font-semibold text-gray-800 block">{bill.patientName}</span>
                          <span className="text-[10px] text-gray-400">Dr. {bill.doctorName}</span>
                        </td>
                        <td className="p-3 text-gray-600 font-medium">{bill.appointmentDate}</td>
                        <td className="p-3 text-gray-500">
                          {bill.roomCategory ? `${bill.roomCategory} (Rm ${bill.roomNumber})` : 'Outpatient'}
                        </td>
                        <td className="p-3 font-bold text-gray-800">₹{bill.totalAmount}</td>
                        <td className="p-3 font-semibold text-emerald-600">₹{bill.paidAmount}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${statusClass}`}>
                            {bill.paymentStatus}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handlePrintBill(bill)}
                              className="border border-blue-200 text-blue-600 hover:bg-blue-50 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                            >
                              <PrinterIcon size={12} /> Print
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBill(bill)
                                setConsultFee(bill.consultationFee)
                                setRoomChgs(bill.roomCharges)
                                setOtherChgs(bill.otherCharges)
                                setShowEditModal(true)
                              }}
                              className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                            >
                              <EditIcon size={12} /> Charges
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* SECTION 4: PAYMENT HISTORY */}
        {activeSection === 'history' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-500 font-semibold">
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Bill Number</th>
                  <th className="p-3">Patient Name</th>
                  <th className="p-3">Attending Doctor</th>
                  <th className="p-3">Amount Received</th>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3">Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {paymentLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-gray-400 italic">No transaction history logs recorded.</td>
                  </tr>
                ) : (
                  paymentLogs.map((log, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50/50">
                      <td className="p-3 font-medium text-gray-600">
                        {new Date(log.paymentDate).toLocaleString()}
                      </td>
                      <td className="p-3 font-bold text-gray-800">{log.billNumber}</td>
                      <td className="p-3 font-semibold text-gray-800">{log.patientName}</td>
                      <td className="p-3 text-gray-600">Dr. {log.doctorName}</td>
                      <td className="p-3 font-bold text-emerald-600">₹{log.amountPaid}</td>
                      <td className="p-3 font-medium capitalize text-gray-700">{log.paymentMethod}</td>
                      <td className="p-3 font-mono text-[10px] text-gray-500">{log.transactionId}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* MODAL 1: MARK AS PAID */}
      {showPaidModal && selectedBill && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-1">
              <DollarSignIcon className="text-emerald-600" size={16} /> Collect Payment Dues
            </h3>
            <p className="text-[11px] text-gray-400 mb-4">
              Enter payment details for invoice <span className="font-bold text-gray-700">{selectedBill.billNumber}</span>. Total remaining balance is <span className="font-bold text-red-500">₹{selectedBill.totalAmount - selectedBill.paidAmount}</span>.
            </p>
            <form onSubmit={handleMarkPaidSubmit} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-gray-700">Payment Collection Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="border p-2.5 rounded-lg bg-white text-gray-800 font-semibold"
                >
                  <option value="Cash">Counter Cash</option>
                  <option value="Bank Transfer">Direct Bank Transfer</option>
                  <option value="Card">Terminal Credit/Debit Card</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-gray-700">Amount Paid (₹) *</label>
                <input
                  type="number"
                  required
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="border p-2.5 rounded-lg outline-primary font-bold text-gray-800"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t mt-2">
                <button
                  type="button"
                  onClick={() => setShowPaidModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-gray-50 font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white hover:bg-primary-dark font-bold rounded-xl transition shadow"
                >
                  Register Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE CHARGES */}
      {showEditModal && selectedBill && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-1">
              <EditIcon className="text-primary" size={16} /> Update Bill Charges
            </h3>
            <p className="text-[11px] text-gray-400 mb-4">
              Override billing components for invoice <span className="font-bold text-gray-700">{selectedBill.billNumber}</span>.
            </p>
            <form onSubmit={handleUpdateChargesSubmit} className="flex flex-col gap-3.5 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-gray-700">Doctor Consultation Fee (₹)</label>
                <input
                  type="number"
                  value={consultFee}
                  onChange={(e) => setConsultFee(e.target.value)}
                  className="border p-2.5 rounded-lg outline-primary font-bold text-gray-800"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-gray-700">Room Accommodation Fee (₹)</label>
                <input
                  type="number"
                  value={roomChgs}
                  onChange={(e) => setRoomChgs(e.target.value)}
                  className="border p-2.5 rounded-lg outline-primary font-bold text-gray-800"
                  disabled={!selectedBill.roomCategory}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-gray-700">Other / Miscellaneous Fee (₹)</label>
                <input
                  type="number"
                  value={otherChgs}
                  onChange={(e) => setOtherChgs(e.target.value)}
                  className="border p-2.5 rounded-lg outline-primary font-bold text-gray-800"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t mt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-gray-50 font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition"
                >
                  Update Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: GENERATE BILL MANUALLY */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-1.5">
              <RefreshCwIcon className="text-primary" size={16} /> Generate Invoice Manually
            </h3>
            <p className="text-[11px] text-gray-400 mb-4">
              Select a completed clinical visit to generate or refresh its consolidated hospital bill.
            </p>
            <form onSubmit={handleGenerateBillSubmit} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-gray-700">Select Completed Visit *</label>
                <select
                  required
                  value={targetAppointmentId}
                  onChange={(e) => setTargetAppointmentId(e.target.value)}
                  className="border p-2.5 rounded-lg bg-white text-gray-800 font-semibold"
                >
                  <option value="">-- Choose Completed Appointment --</option>
                  {billingCandidates.map((appt, idx) => (
                    <option key={idx} value={appt._id}>
                      {appt.userData.name} (Dr. {appt.docData.name} | {appt.slotDate})
                    </option>
                  ))}
                </select>
                {billingCandidates.length === 0 && (
                  <p className="text-[10px] text-amber-600 font-bold mt-1">No completed clinical visits await manual invoice generation.</p>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t mt-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-gray-50 font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!targetAppointmentId}
                  className="px-5 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition disabled:opacity-50"
                >
                  Generate Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BillingManagement
