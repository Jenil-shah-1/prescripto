import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";


export const AdminContext = createContext()

const AdminContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [aToken, setAToken] = useState(localStorage.getItem('aToken') ? localStorage.getItem('aToken') : '')

    const [appointments, setAppointments] = useState([])
    const [doctors, setDoctors] = useState([])
    const [dashData, setDashData] = useState(false)
    const [rooms, setRooms] = useState([])
    const [bills, setBills] = useState([])

    // Getting all Doctors data from Database using API
    const getAllDoctors = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/admin/all-doctors', { headers: { aToken } })
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }

    }

    // Function to change doctor availablity using API
    const changeAvailability = async (docId) => {
        try {

            const { data } = await axios.post(backendUrl + '/api/admin/change-availability', { docId }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }


    // Getting all appointment data from Database using API
    const getAllAppointments = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/admin/appointments', { headers: { aToken } })
            if (data.success) {
                setAppointments(data.appointments.reverse())
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }

    }

    // Unified Status Updater (Accept, Reject, Cancel, Complete)
    const updateAppointmentStatus = async (appointmentId, action) => {
        try {
            const { data } = await axios.patch(backendUrl + '/api/doctor/appointment-status', { appointmentId, action }, { headers: { atoken: aToken } })
            if (data.success) {
                toast.success(data.message)
                getAllAppointments()
                getDashData()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return false
        }
    }

    // Function to cancel appointment using API
    const cancelAppointment = async (appointmentId) => {
        return await updateAppointmentStatus(appointmentId, 'cancel')
    }

    const acceptAppointment = async (appointmentId) => {
        return await updateAppointmentStatus(appointmentId, 'accept')
    }

    const completeAppointment = async (appointmentId, notesData) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/complete-appointment', { appointmentId, ...notesData }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                getAllAppointments()
                getDashData()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return false
        }
    }

    const getRooms = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/rooms', { headers: { aToken } })
            if (data.success) {
                setRooms(data.rooms)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const assignRoom = async (appointmentId, roomNumber, admissionDate, expectedDischarge) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/admin/room-assign', 
                { appointmentId, roomNumber, admissionDate, expectedDischarge }, 
                { headers: { aToken } }
            )
            if (data.success) {
                toast.success(data.message)
                getRooms()
                getAllAppointments()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return false
        }
    }

    const transferRoom = async (appointmentId, roomNumber, admissionDate) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/admin/room-transfer', 
                { appointmentId, roomNumber, admissionDate }, 
                { headers: { aToken } }
            )
            if (data.success) {
                toast.success(data.message)
                getRooms()
                getAllAppointments()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return false
        }
    }

    const dischargeRoom = async (appointmentId, dischargeDate) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/admin/room-discharge', 
                { appointmentId, dischargeDate }, 
                { headers: { aToken } }
            )
            if (data.success) {
                toast.success(data.message)
                getRooms()
                getAllAppointments()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return false
        }
    }

    const cancelRoomRequest = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/admin/room-cancel', 
                { appointmentId }, 
                { headers: { aToken } }
            )
            if (data.success) {
                toast.success(data.message)
                getRooms()
                getAllAppointments()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return false
        }
    }

    const approveRoomRequest = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/admin/room-approve', 
                { appointmentId }, 
                { headers: { aToken } }
            )
            if (data.success) {
                toast.success(data.message)
                getRooms()
                getAllAppointments()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return false
        }
    }

    const rejectRoomRequest = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/admin/room-reject', 
                { appointmentId }, 
                { headers: { aToken } }
            )
            if (data.success) {
                toast.success(data.message)
                getRooms()
                getAllAppointments()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return false
        }
    }

    const rejectAppointment = async (appointmentId) => {
        return await updateAppointmentStatus(appointmentId, 'reject')
    }

    // Getting all bills from database
    const getBillsAdmin = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/bills', { headers: { aToken } })
            if (data.success) {
                setBills(data.bills)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Mark manual bill paid status
    const markBillPaid = async (billId, paymentMethod, amountPaid) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/admin/mark-bill-paid', 
                { billId, paymentMethod, amountPaid }, 
                { headers: { aToken } }
            )
            if (data.success) {
                toast.success(data.message)
                getBillsAdmin()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return false
        }
    }

    // Recalculate or manually generate consolidated invoice
    const triggerGenerateBillAdmin = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/admin/generate-bill', 
                { appointmentId }, 
                { headers: { aToken } }
            )
            if (data.success) {
                toast.success(data.message)
                getBillsAdmin()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return false
        }
    }

    // Update bill charges manually
    const updateCharges = async (billId, chargesData) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/admin/update-charges', 
                { billId, ...chargesData }, 
                { headers: { aToken } }
            )
            if (data.success) {
                toast.success(data.message)
                getBillsAdmin()
                return true
            } else {
                toast.error(data.message)
                return false
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return false
        }
    }

    // Getting Admin Dashboard data from Database using API
    const getDashData = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/admin/dashboard', { headers: { aToken } })

            if (data.success) {
                setDashData(data.dashData)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

    const getEligiblePatients = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/eligible-patients', { headers: { aToken } })
            if (data.success) {
                return data.appointments;
            } else {
                toast.error(data.message)
                return [];
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return [];
        }
    }

    const value = {
        aToken, setAToken,
        doctors,
        getAllDoctors,
        changeAvailability,
        appointments,
        getAllAppointments,
        getDashData,
        cancelAppointment,
        acceptAppointment,
        completeAppointment,
        rejectAppointment,
        updateAppointmentStatus,
        dashData,
        rooms,
        getRooms,
        assignRoom,
        transferRoom,
        dischargeRoom,
        cancelRoomRequest,
        approveRoomRequest,
        rejectRoomRequest,
        bills,
        getBillsAdmin,
        markBillPaid,
        triggerGenerateBillAdmin,
        updateCharges,
        getEligiblePatients
    }

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )

}

export default AdminContextProvider