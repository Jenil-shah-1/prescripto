import express from 'express';
import { 
  loginDoctor, 
  appointmentsDoctor, 
  appointmentCancel, 
  doctorList, 
  changeAvailablity, 
  appointmentComplete, 
  doctorDashboard, 
  doctorProfile, 
  updateDoctorProfile,
  acceptAppointment,
  getDoctorPatients,
  updateAvailability,
  getDoctorNotifications,
  markNotificationRead,
  updateAppointmentNotes,
  changeDoctorPassword,
  updateDoctorEmail,
  updateAppointmentStatus,
  getPatientHistoryDoctor,
  getBillsDoctor
} from '../controllers/doctorController.js';
import authDoctor from '../middleware/authDoctor.js';
const doctorRouter = express.Router();

doctorRouter.post("/login", loginDoctor)
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel)
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor)
doctorRouter.get("/list", doctorList)
doctorRouter.post("/change-availability", authDoctor, changeAvailablity)
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete)
doctorRouter.get("/dashboard", authDoctor, doctorDashboard)
doctorRouter.get("/profile", authDoctor, doctorProfile)
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile)
doctorRouter.post("/accept-appointment", authDoctor, acceptAppointment)
doctorRouter.get("/patients", authDoctor, getDoctorPatients)
doctorRouter.post("/update-availability", authDoctor, updateAvailability)
doctorRouter.get("/notifications", authDoctor, getDoctorNotifications)
doctorRouter.post("/mark-notification-read", authDoctor, markNotificationRead)
doctorRouter.post("/update-notes", authDoctor, updateAppointmentNotes)
doctorRouter.post("/change-password", authDoctor, changeDoctorPassword)
doctorRouter.post("/update-email", authDoctor, updateDoctorEmail)
doctorRouter.post("/patient-history", authDoctor, getPatientHistoryDoctor)
doctorRouter.get("/bills", authDoctor, getBillsDoctor)

// PATCH routes for Feature 9 requirements
doctorRouter.patch("/change-password", authDoctor, changeDoctorPassword)
doctorRouter.patch("/appointment-status", updateAppointmentStatus)

export default doctorRouter;