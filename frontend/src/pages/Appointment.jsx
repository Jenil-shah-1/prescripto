import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import axios from 'axios'
import { toast } from 'react-toastify'

const Appointment = () => {

    const { docId } = useParams()
    const location = useLocation()
    const { doctors, currencySymbol, backendUrl, token, getDoctosData } = useContext(AppContext)
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const [docInfo, setDocInfo] = useState(false)
    const [docSlots, setDocSlots] = useState([])
    const [slotIndex, setSlotIndex] = useState(0)
    const [slotTime, setSlotTime] = useState('')
    const [showPaymentPopup, setShowPaymentPopup] = useState(false)
    const [paymentType, setPaymentType] = useState('full') // 'full' or 'minimum'
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
    const [reason, setReason] = useState('')
    const [needAdmission, setNeedAdmission] = useState(false)
    const [roomCategory, setRoomCategory] = useState('General Ward')

    const navigate = useNavigate()

    const fetchDocInfo = async () => {
        const docInfo = doctors.find((doc) => doc._id === docId)
        setDocInfo(docInfo)
    }

    const getAvailableSolts = async () => {
        setDocSlots([])

        // getting current date
        let today = new Date()
        
        // Booking allowed rolling from today (future slots only) up to the next 3 days (today + 3 days)
        let startDate = new Date(today)
        let endDate = new Date(today)
        endDate.setDate(today.getDate() + 3)

        // Generate slots starting from today
        let currentDate = new Date(startDate)
        
        const dayIndexMap = {
            0: 'Sunday',
            1: 'Monday',
            2: 'Tuesday',
            3: 'Wednesday',
            4: 'Thursday',
            5: 'Friday',
            6: 'Saturday'
        }

        while (currentDate <= endDate) {
            const dayOfWeekIndex = currentDate.getDay()
            const dayName = dayIndexMap[dayOfWeekIndex]
            const isWorkingDay = docInfo.workingDays ? docInfo.workingDays.includes(dayName) : true

            let timeSlots = [];

            if (isWorkingDay) {
                // setting end time of the date
                let endTime = new Date(currentDate)
                endTime.setHours(21, 0, 0, 0)

                // setting hours 
                if (today.getDate() === currentDate.getDate() && today.getMonth() === currentDate.getMonth()) {
                    let nextHour = today.getHours() >= 10 ? today.getHours() : 10
                    currentDate.setHours(nextHour)
                    currentDate.setMinutes(today.getMinutes() > 30 ? 30 : 0)
                } else {
                    currentDate.setHours(10)
                    currentDate.setMinutes(0)
                }

                while (currentDate < endTime) {
                    const isPast = currentDate <= today

                    if (!isPast) {
                        const hh = currentDate.getHours().toString().padStart(2, '0')
                        const mm = currentDate.getMinutes().toString().padStart(2, '0')
                        const time24 = `${hh}:${mm}`

                        const isSlotInDoctorAvailability = docInfo.timeSlots ? docInfo.timeSlots.includes(time24) : true

                        if (isSlotInDoctorAvailability) {
                            let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                            let day = currentDate.getDate()
                            let month = currentDate.getMonth()
                            let year = currentDate.getFullYear()

                            const slotDate = day + "_" + (month + 1) + "_" + year
                            const slotTime = formattedTime

                            const bookedSlotsArray = docInfo.slots_booked?.[slotDate] || []
                            const bookingsCount = bookedSlotsArray.filter(time => time === slotTime).length
                            const isSlotAvailable = bookingsCount < 2

                            if (isSlotAvailable) {
                                // Add slot to array
                                timeSlots.push({
                                    datetime: new Date(currentDate),
                                    time: formattedTime
                                })
                            }
                        }
                    }

                    // Increment current time by 30 minutes
                    currentDate.setMinutes(currentDate.getMinutes() + 30);
                }
            }

            if (timeSlots.length > 0) {
                setDocSlots(prev => ([...prev, timeSlots]))
            }
            
            // Move to next day
            currentDate = new Date(currentDate)
            currentDate.setDate(currentDate.getDate() + 1)
            currentDate.setHours(0, 0, 0, 0)
        }
    }

    const bookAppointment = async () => {
        if (!token) {
            toast.warning('Login to book appointment')
            return navigate('/login')
        }

        const date = docSlots[slotIndex][0].datetime

        let day = date.getDate()
        let month = date.getMonth() + 1
        let year = date.getFullYear()

        const slotDate = day + "_" + month + "_" + year

        try {
            if (location.state?.isRescheduling) {
                const { data } = await axios.post(backendUrl + '/api/user/reschedule-appointment', {
                    appointmentId: location.state.appointmentId,
                    newSlotDate: slotDate,
                    newSlotTime: slotTime
                }, { headers: { token } })

                if (data.success) {
                    toast.success(data.message)
                    getDoctosData()
                    navigate('/my-appointments')
                } else {
                    toast.error(data.message)
                }
                return; // Return early for rescheduling
            }

            // Regular booking flow
            const { data } = await axios.post(backendUrl + '/api/user/book-appointment', { 
                docId, 
                slotDate, 
                slotTime,
                paymentType,
                reason,
                roomRequested: needAdmission,
                roomCategory: needAdmission ? roomCategory : ""
            }, { headers: { token } })

            if (data.success) {
                // Initialize Razorpay payment
                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount: data.amount * 100,
                    currency: "INR",
                    name: "Appointment Payment",
                    description: `${paymentType === 'minimum' ? 'Minimum' : 'Full'} Payment for Appointment`,
                    order_id: data.orderId,
                    handler: async (response) => {
                        try {
                            const verifyData = await axios.post(backendUrl + "/api/user/verifyRazorpay", response, { headers: { token } });
                            if (verifyData.data.success) {
                                toast.success("Payment Successful");
                                getDoctosData();
                                navigate('/my-appointments');
                            } else {
                                toast.error(verifyData.data.message || "Payment verification failed");
                            }
                        } catch (error) {
                            console.log(error);
                            toast.error(error.message || "Payment verification failed");
                        }
                    },
                    prefill: {
                        name: "Patient",
                        email: "",
                        contact: ""
                    },
                    theme: {
                        color: "#3399cc"
                    }
                };
                const rzp = new window.Razorpay(options);
                rzp.open();
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const handlePaymentSelection = () => {
        if (!slotTime) {
            toast.warning('Please select a time slot first')
            return
        }
        
        // Skip payment popup for rescheduling
        if (location.state?.isRescheduling) {
            bookAppointment();
            return;
        }
        
        setShowPaymentPopup(true)
    }

    // Function to handle month navigation
    const handleMonthChange = (direction) => {
        let newMonth = currentMonth
        let newYear = currentYear
        
        if (direction === 'next') {
            newMonth = currentMonth + 1
            if (newMonth > 11) {
                newMonth = 0
                newYear = currentYear + 1
            }
        } else {
            newMonth = currentMonth - 1
            if (newMonth < 0) {
                newMonth = 11
                newYear = currentYear - 1
            }
        }
        
        setCurrentMonth(newMonth)
        setCurrentYear(newYear)
        
        // Find the first slot in the selected month
        const firstSlotInMonth = docSlots.findIndex(slot => {
            if (slot.length > 0) {
                const slotDate = slot[0].datetime
                return slotDate.getMonth() === newMonth && slotDate.getFullYear() === newYear
            }
            return false
        })
        
        if (firstSlotInMonth !== -1) {
            setSlotIndex(firstSlotInMonth)
        }
    }

    // Function to get filtered slots for the current month
    const getFilteredSlots = () => {
        if (!docSlots.length) return [];
        
        return docSlots.filter(slot => {
            if (slot.length > 0) {
                const slotDate = slot[0].datetime;
                return slotDate.getMonth() === currentMonth && slotDate.getFullYear() === currentYear;
            }
            return false;
        });
    }

    // Function to check if we're at the two-month limit
    const isAtTwoMonthLimit = () => {
        const today = new Date();
        const twoMonthsFromNow = new Date(today);
        twoMonthsFromNow.setMonth(today.getMonth() + 2);
        twoMonthsFromNow.setDate(today.getDate() - 1);
        
        return currentMonth === twoMonthsFromNow.getMonth() && 
               currentYear === twoMonthsFromNow.getFullYear();
    }

    // Function to check if we're at the current month
    const isAtCurrentMonth = () => {
        const today = new Date();
        return currentMonth === today.getMonth() && currentYear === today.getFullYear();
    }

    useEffect(() => {
        if (doctors.length > 0) {
            fetchDocInfo()
        }
    }, [doctors, docId])

    useEffect(() => {
        if (docInfo) {
            getAvailableSolts()
        }
    }, [docInfo])

    // Set payment type to 'full' for rescheduling
    useEffect(() => {
        if (location.state?.isRescheduling) {
            setPaymentType('full')
        }
    }, [location.state?.isRescheduling])

    return docInfo ? (
        <div className='max-w-6xl mx-auto'>
            {/* ---------- Doctor Details ----------- */}
            <div className='flex flex-col sm:flex-row gap-4'>
                <div>
                    <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
                </div>

                <div className='flex-1 border border-[#ADADAD] rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>

                    {/* ----- Doc Info : name, degree, experience ----- */}

                    <p className='flex items-center gap-2 text-3xl font-medium text-gray-700'>{docInfo.name} <img className='w-5' src={assets.verified_icon} alt="" /></p>
                    <div className='flex items-center gap-2 mt-1 text-gray-600'>
                        <p>{docInfo.degree} - {docInfo.speciality}</p>
                        <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
                    </div>

                    {/* ----- Doc About ----- */}
                    <div>
                        <p className='flex items-center gap-1 text-sm font-medium text-[#262626] mt-3'>About <img className='w-3' src={assets.info_icon} alt="" /></p>
                        <p className='text-sm text-gray-600 max-w-[700px] mt-1'>{docInfo.about}</p>
                    </div>

                    <p className='text-gray-600 font-medium mt-4'>Appointment fee: <span className='text-gray-800'>{currencySymbol}{docInfo.fees}</span> </p>
                </div>
            </div>

            {/* Booking slots */}
            <div className='sm:ml-72 sm:pl-4 mt-8 font-medium text-[#565656]'>
                <p>{location.state?.isRescheduling ? 'Reschedule to' : 'Booking slots'}</p>
                
                {/* Month Navigation */}
                <div className='flex justify-between items-center mt-4 mb-2'>
                    <button 
                        onClick={() => handleMonthChange('prev')} 
                        className={`text-primary hover:underline ${isAtCurrentMonth() ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isAtCurrentMonth()}
                    >
                        &lt; Previous Month
                    </button>
                    <h3 className='text-lg font-semibold'>{months[currentMonth]} {currentYear}</h3>
                    <button 
                        onClick={() => handleMonthChange('next')} 
                        className={`text-primary hover:underline ${isAtTwoMonthLimit() ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isAtTwoMonthLimit()}
                    >
                        Next Month &gt;
                    </button>
                </div>
                
                <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
                    {getFilteredSlots().map((item, index) => (
                        <div 
                            onClick={() => setSlotIndex(docSlots.indexOf(item))} 
                            key={index} 
                            className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === docSlots.indexOf(item) ? 'bg-primary text-white' : 'border border-[#DDDDDD]'}`}
                        >
                            <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                            <p>{item[0] && item[0].datetime.getDate()}</p>
                            <p className='text-xs'>{item[0] && months[item[0].datetime.getMonth()]}</p>
                        </div>
                    ))}
                </div>

                <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
                    {docSlots.length && docSlots[slotIndex].map((item, index) => (
                        <p 
                            onClick={() => setSlotTime(item.time)} 
                            key={index} 
                            className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'text-[#949494] border border-[#B4B4B4]'}`}
                        >
                            {item.time.toLowerCase()}
                        </p>
                    ))}
                </div>

                {!location.state?.isRescheduling && (
                    <div className="flex flex-col gap-4 mt-6 max-w-md w-full text-xs font-semibold text-gray-500 border border-gray-200 p-4 rounded-xl bg-gray-50/50">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-700">Do you need hospital admission / room request?</span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setNeedAdmission(true)}
                                    type="button" 
                                    className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${needAdmission ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                                >
                                    Yes
                                </button>
                                <button 
                                    onClick={() => setNeedAdmission(false)}
                                    type="button" 
                                    className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${!needAdmission ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                                >
                                    No
                                </button>
                            </div>
                        </div>

                        {needAdmission && (
                            <div className="flex flex-col gap-1.5">
                                <p className="text-gray-600">Select Room Category:</p>
                                <select 
                                    value={roomCategory} 
                                    onChange={(e) => setRoomCategory(e.target.value)}
                                    className="border border-gray-300 rounded-lg p-2 outline-primary text-xs font-medium bg-white text-gray-800"
                                >
                                    <option value="General Ward">General Ward (Capacity: 5 beds/room)</option>
                                    <option value="ICU">ICU (Capacity: 1 bed/room)</option>
                                    <option value="Semi Private / Twin Sharing">Semi Private / Twin Sharing (Capacity: 2 beds/room)</option>
                                    <option value="Private Room">Private Room (Capacity: 1 bed/room)</option>
                                </select>
                            </div>
                        )}
                    </div>
                )}

                {!location.state?.isRescheduling && (
                    <div className="flex flex-col gap-2 mt-4 max-w-md w-full text-xs font-semibold text-gray-500">
                        <p>Reason for Consultation / Disease:</p>
                        <input 
                            type="text" 
                            value={reason} 
                            onChange={(e) => setReason(e.target.value)} 
                            placeholder="e.g. Cough, Fever, Routine Checkup" 
                            className="border border-gray-300 rounded-xl px-4 py-2.5 outline-primary text-sm w-full font-medium text-gray-800"
                        />
                    </div>
                )}

                <button onClick={handlePaymentSelection} className='bg-primary text-white text-sm font-light px-20 py-3 rounded-full my-6'>
                    {location.state?.isRescheduling ? 'Reschedule Appointment' : 'Book an appointment'}
                </button>
            </div>

            {/* Payment Popup */}
            {showPaymentPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-medium">Select Payment Option</h3>
                            <button 
                                onClick={() => setShowPaymentPopup(false)} 
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="flex flex-col gap-4 mb-6">
                            <div 
                                className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${paymentType === 'full' ? 'border-primary bg-primary bg-opacity-5' : 'hover:bg-gray-50'}`} 
                                onClick={() => setPaymentType('full')}
                            >
                                <input 
                                    type="radio" 
                                    checked={paymentType === 'full'} 
                                    onChange={() => setPaymentType('full')} 
                                    className="h-4 w-4 text-primary"
                                />
                                <div>
                                    <p className='font-medium'>Full Payment</p>
                                    <p className='text-sm text-gray-600'>Pay the complete amount: {currencySymbol}{docInfo.fees}</p>
                                </div>
                            </div>
                            <div 
                                className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${paymentType === 'minimum' ? 'border-primary bg-primary bg-opacity-5' : 'hover:bg-gray-50'}`} 
                                onClick={() => setPaymentType('minimum')}
                            >
                                <input 
                                    type="radio" 
                                    checked={paymentType === 'minimum'} 
                                    onChange={() => setPaymentType('minimum')} 
                                    className="h-4 w-4 text-primary"
                                />
                                <div>
                                    <p className='font-medium'>Minimum Payment (20%)</p>
                                    <p className='text-sm text-gray-600'>Pay {currencySymbol}{Math.ceil(docInfo.fees * 0.2)} now, rest later</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setShowPaymentPopup(false)} 
                                className="flex-1 text-gray-600 border px-4 py-2 rounded-full hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    setShowPaymentPopup(false);
                                    bookAppointment();
                                }} 
                                className="flex-1 bg-primary text-white px-4 py-2 rounded-full"
                            >
                                {location.state?.isRescheduling ? 'Reschedule Appointment' : 'Book an appointment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Listing Releated Doctors */}
            <RelatedDoctors speciality={docInfo.speciality} docId={docId} />
        </div>
    ) : null
}

export default Appointment