import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const MyAppointments = () => {

    const { backendUrl, token, requestRoom } = useContext(AppContext)
    const navigate = useNavigate()

    const [appointments, setAppointments] = useState([])
    const [payment, setPayment] = useState('')
    const [postRoomCategories, setPostRoomCategories] = useState({})

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Function to format the date eg. ( 20_01_2000 => 20 Jan 2000 )
    const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split('_')
        return dateArray[0] + " " + months[Number(dateArray[1]) - 1] + " " + dateArray[2]
    }

    // Getting User Appointments Data Using API
    const getUserAppointments = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
            setAppointments(data.appointments.reverse())

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Function to cancel appointment Using API
    const cancelAppointment = async (appointmentId) => {

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

                console.log(response)

                try {
                    const { data } = await axios.post(backendUrl + "/api/user/verifyRazorpay", response, { headers: { token } });
                    if (data.success) {
                        navigate('/my-appointments')
                        getUserAppointments()
                    }
                } catch (error) {
                    console.log(error)
                    toast.error(error.message)
                }
            }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    // Function to make payment using razorpay
    const appointmentRazorpay = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/payment-razorpay', { appointmentId }, { headers: { token } })
            if (data.success) {
                // Use the order from the backend which now has the correct amount
                initPay(data.order);
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Function to make payment using stripe
    const appointmentStripe = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/payment-stripe', { appointmentId }, { headers: { token } })
            if (data.success) {
                const { session_url } = data
                window.location.replace(session_url)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Function to reschedule appointment
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

    useEffect(() => {
        if (token) {
            getUserAppointments()
        }
    }, [token])

    return (
        <div>
            <p className='pb-3 mt-12 text-lg font-medium text-gray-600 border-b'>My appointments</p>
            <div className=''>
                {appointments.map((item, index) => (
                    <div key={index} className='flex flex-wrap sm:flex-nowrap gap-4 p-4 border-b'>
                        <div>
                            <img className='w-36 bg-[#EAEFFF]' src={item.docData.image} alt="" />
                        </div>
                        <div className='flex-1 text-sm text-[#5E5E5E]'>
                            <p className='text-[#262626] text-base font-semibold'>{item.docData.name}</p>
                            <p>{item.docData.speciality}</p>
                            <p className='text-[#464646] font-medium mt-1'>Address:</p>
                            <p className=''>{item.docData.address.line1}</p>
                            <p className=''>{item.docData.address.line2}</p>
                            <p className=' mt-1'><span className='text-sm text-[#3C3C3C] font-medium'>Date & Time:</span> {slotDateFormat(item.slotDate)} |  {item.slotTime}</p>
                            <p className=' mt-1'>
                              <span className='text-sm text-[#3C3C3C] font-medium'>Status: </span>
                              {item.cancelled ? (
                                <span className="text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded text-xs">Cancelled</span>
                              ) : item.isCompleted ? (
                                <span className="text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded text-xs">Completed</span>
                              ) : item.isRejected ? (
                                <span className="text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded text-xs">Rejected</span>
                              ) : item.isAccepted ? (
                                <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded text-xs">Accepted</span>
                              ) : (
                                <span className="text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded text-xs">Pending Confirmation</span>
                              )}
                            </p>

                            {/* Room Request Status & Detail Block */}
                            {item.roomRequested ? (
                                <div className="mt-2 p-2.5 bg-gray-50 border border-gray-150 rounded-lg text-xs flex flex-col gap-1 max-w-sm">
                                    <p className="font-semibold text-gray-700">Room Allocation: <span className="text-primary font-bold">{item.roomStatus}</span></p>
                                    {item.roomStatus === 'Allocated' && (
                                        <>
                                            <p className="text-gray-600">Room Number: <span className="font-semibold text-gray-800">{item.roomNumber}</span></p>
                                            <p className="text-gray-600">Category: <span className="font-semibold text-gray-800">{item.roomCategory}</span></p>
                                            <p className="text-gray-600">Admission Date: <span className="font-semibold text-gray-800">{new Date(item.roomAdmissionDate).toLocaleDateString()}</span></p>
                                            {item.roomExpectedDischarge && (
                                                <p className="text-gray-600">Expected Discharge: <span className="font-semibold text-gray-800">{item.roomExpectedDischarge}</span></p>
                                            )}
                                        </>
                                    )}
                                </div>
                            ) : (
                                !item.cancelled && !item.isRejected && !item.isCompleted && item.isAccepted && (
                                    <div className="mt-2.5 p-3 border border-dashed border-gray-300 rounded-lg text-xs flex flex-col gap-2 bg-white max-w-xs">
                                        <p className="font-semibold text-gray-700">Need Hospital Admission?</p>
                                        <div className="flex gap-2 items-center">
                                            <select
                                                value={postRoomCategories[item._id] || 'General Ward'}
                                                onChange={(e) => setPostRoomCategories(prev => ({ ...prev, [item._id]: e.target.value }))}
                                                className="border rounded px-2 py-1 outline-primary text-gray-800 text-[11px] bg-white flex-1"
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
                                                className="px-2.5 py-1 bg-primary text-white font-bold rounded text-[10px] hover:bg-primary-dark transition"
                                            >
                                                Request
                                            </button>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                        <div></div>
                        <div className='flex flex-col gap-2 justify-end text-sm text-center'>
                            {!item.cancelled && !item.isRejected && !item.isCompleted && payment !== item._id && <button onClick={() => setPayment(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'>Pay Online</button>}
                            {!item.cancelled && !item.isRejected && !item.isCompleted && payment === item._id && <button onClick={() => appointmentStripe(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-gray-100 hover:text-white transition-all duration-300 flex items-center justify-center'><img className='max-w-20 max-h-5' src={assets.stripe_logo} alt="" /></button>}
                            {!item.cancelled && !item.isRejected && !item.isCompleted && payment === item._id && <button onClick={() => appointmentRazorpay(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-gray-100 hover:text-white transition-all duration-300 flex items-center justify-center'><img className='max-w-20 max-h-5' src={assets.razorpay_logo} alt="" /></button>}
                            {!item.cancelled && !item.isRejected && item.payment && !item.isCompleted && item.paidAmount < item.amount && (
                                <div className='flex flex-col gap-1'>
                                    <button onClick={() => appointmentRazorpay(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'>
                                        Pay Online
                                    </button>
                                </div>
                            )}
                            {!item.cancelled && !item.isRejected && item.payment && !item.isCompleted && item.paidAmount >= item.amount && <button className='sm:min-w-48 py-2 border rounded text-[#696969] bg-[#EAEFFF]'>Paid</button>}
                            {item.isCompleted && <button className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'>Completed</button>}
                            {item.isRejected && <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment Rejected</button>}
                            {!item.cancelled && !item.isRejected && !item.isCompleted && <button onClick={() => rescheduleAppointment(item)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'>Reschedule appointment</button>}
                            {!item.cancelled && !item.isRejected && !item.isCompleted && <button onClick={() => cancelAppointment(item._id)} className='text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'>Cancel appointment</button>}
                            {item.cancelled && !item.isCompleted && <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment cancelled</button>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MyAppointments