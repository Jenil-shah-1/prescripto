import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios';

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = '₹'
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '')
    const [role, setRole] = useState(localStorage.getItem('role') ? localStorage.getItem('role') : '')
    
    // Patient Profile State
    const [userData, setUserData] = useState(false)
    const [medicalHistory, setMedicalHistory] = useState([])

    // Doctor Panel States
    const [doctorProfileData, setDoctorProfileData] = useState(false)
    const [doctorAppointments, setDoctorAppointments] = useState([])
    const [doctorDashData, setDoctorDashData] = useState(false)
    const [doctorPatients, setDoctorPatients] = useState([])
    const [doctorNotifications, setDoctorNotifications] = useState([])
    const [doctorUnreadCount, setDoctorUnreadCount] = useState(0)

    // Getting Doctors list using API
    const getDoctosData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/list')
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Getting Patient Profile using API
    const loadUserProfileData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token } })
            if (data.success) {
                setUserData(data.userData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Getting Doctor Profile using API
    const getDoctorProfileData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/profile', { headers: { dtoken: token } })
            if (data.success) {
                setDoctorProfileData(data.profileData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Getting Doctor Appointments using API
    const getDoctorAppointments = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/appointments', { headers: { dtoken: token } })
            if (data.success) {
                setDoctorAppointments(data.appointments.reverse())
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Getting Doctor Dashboard using API
    const getDoctorDashData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/dashboard', { headers: { dtoken: token } })
            if (data.success) {
                setDoctorDashData(data.dashData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Getting Doctor Patients using API
    const getDoctorPatients = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/patients', { headers: { dtoken: token } })
            if (data.success) {
                setDoctorPatients(data.patients)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Getting Doctor Notifications using API
    const getDoctorNotifications = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/notifications', { headers: { dtoken: token } })
            if (data.success) {
                setDoctorNotifications(data.notifications)
                setDoctorUnreadCount(data.notifications.filter(n => !n.isRead).length)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Mark Doctor Notifications Read
    const markDoctorNotificationsRead = async (notificationId = null) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/doctor/mark-notification-read', { notificationId }, { headers: { dtoken: token } })
            if (data.success) {
                getDoctorNotifications()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Unified Status Updater (Accept, Reject, Cancel, Complete)
    const updateAppointmentStatus = async (appointmentId, action) => {
        try {
            const headers = role === 'doctor' ? { dtoken: token } : { atoken: token };
            const { data } = await axios.patch(backendUrl + '/api/doctor/appointment-status', { appointmentId, action }, { headers })
            if (data.success) {
                toast.success(data.message)
                if (role === 'doctor') {
                    getDoctorAppointments()
                    getDoctorDashData()
                } else {
                    getDoctosData()
                }
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

    // Accept Doctor Appointment
    const acceptDoctorAppointment = async (appointmentId) => {
        return await updateAppointmentStatus(appointmentId, 'accept')
    }

    // Complete Doctor Appointment (with consultation details)
    const completeDoctorAppointment = async (appointmentId, notesData) => {
        try {
            const endpoint = role === 'admin' ? '/api/admin/complete-appointment' : '/api/doctor/complete-appointment';
            const headers = role === 'admin' ? { atoken: token } : { dtoken: token };
            
            const { data } = await axios.post(
                backendUrl + endpoint, 
                { appointmentId, ...notesData }, 
                { headers }
            )
            if (data.success) {
                toast.success(data.message)
                if (role === 'doctor') {
                    getDoctorAppointments()
                    getDoctorDashData()
                }
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

    // Patient Room Request API
    const requestRoom = async (appointmentId, roomCategory) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/request-room', { appointmentId, roomCategory }, { headers: { token } })
            if (data.success) {
                toast.success(data.message)
                loadUserProfileData()
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

    // Patient Medical History API
    const getMedicalHistory = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/medical-history', { headers: { token } })
            if (data.success) {
                setMedicalHistory(data.history)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Cancel Doctor Appointment
    const cancelDoctorAppointment = async (appointmentId) => {
        return await updateAppointmentStatus(appointmentId, 'cancel')
    }

    // Reject Doctor Appointment
    const rejectDoctorAppointment = async (appointmentId) => {
        return await updateAppointmentStatus(appointmentId, 'reject')
    }

    // Update Doctor Profile
    const updateDoctorProfile = async (profileUpdateData) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/doctor/update-profile', profileUpdateData, { headers: { dtoken: token } })
            if (data.success) {
                toast.success(data.message)
                getDoctorProfileData()
                getDoctosData()
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

    // Update Doctor Availability Grid
    const updateDoctorAvailability = async (availabilityData) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/doctor/update-availability', availabilityData, { headers: { dtoken: token } })
            if (data.success) {
                toast.success(data.message)
                getDoctorProfileData()
                getDoctosData()
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

    // Save Appointment Doctor Notes
    const saveDoctorNotes = async (appointmentId, notes) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/doctor/update-notes', { appointmentId, notes }, { headers: { dtoken: token } })
            if (data.success) {
                toast.success(data.message)
                getDoctorAppointments()
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

    // Change Doctor Password
    const changeDoctorPassword = async (oldPassword, newPassword, confirmPassword) => {
        try {
            const { data } = await axios.patch(backendUrl + '/api/doctor/change-password', { oldPassword, newPassword, confirmPassword }, { headers: { dtoken: token } })
            if (data.success) {
                toast.success(data.message)
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

    // Update Doctor Email
    const updateDoctorEmail = async (newEmail) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/doctor/update-email', { newEmail }, { headers: { dtoken: token } })
            if (data.success) {
                toast.success(data.message)
                getDoctorProfileData()
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

    useEffect(() => {
        getDoctosData()
    }, [])

    useEffect(() => {
        if (token) {
            if (role === 'doctor') {
                getDoctorProfileData()
                getDoctorNotifications()
            } else {
                loadUserProfileData()
            }
        } else {
            setUserData(false)
            setDoctorProfileData(false)
        }
    }, [token, role])

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        setToken('')
        setRole('')
        setUserData(false)
        setDoctorProfileData(false)
    }

    const value = {
        doctors, getDoctosData,
        currencySymbol,
        backendUrl,
        token, setToken,
        role, setRole,
        userData, setUserData, loadUserProfileData,
        logout,
        // Doctor Specific Exports
        doctorProfileData, setDoctorProfileData, getDoctorProfileData,
        doctorAppointments, getDoctorAppointments,
        doctorDashData, getDoctorDashData,
        doctorPatients, getDoctorPatients,
        doctorNotifications, getDoctorNotifications,
        doctorUnreadCount, markDoctorNotificationsRead,
        acceptDoctorAppointment, completeDoctorAppointment, cancelDoctorAppointment, rejectDoctorAppointment,
        updateDoctorProfile, updateDoctorAvailability, saveDoctorNotes,
        changeDoctorPassword, updateDoctorEmail, updateAppointmentStatus,
        medicalHistory, getMedicalHistory, requestRoom
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider;