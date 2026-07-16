import express from 'express';
import { loginAdmin, appointmentsAdmin, appointmentCancel, addDoctor, allDoctors, adminDashboard, getRoomsAdmin, assignRoomAdmin, transferRoomAdmin, dischargeRoomAdmin, cancelRoomRequestAdmin, rejectRoomRequestAdmin, approveRoomRequestAdmin, getBillsAdmin, markBillPaidAdmin, generateBillAdmin, updateChargesAdmin } from '../controllers/adminController.js';
import { changeAvailablity, appointmentComplete } from '../controllers/doctorController.js';
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';
const adminRouter = express.Router();

adminRouter.post("/login", loginAdmin)
adminRouter.post("/add-doctor", authAdmin, upload.single('image'), addDoctor)
adminRouter.get("/appointments", authAdmin, appointmentsAdmin)
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel)
adminRouter.get("/all-doctors", authAdmin, allDoctors)
adminRouter.post("/change-availability", authAdmin, changeAvailablity)
adminRouter.get("/dashboard", authAdmin, adminDashboard)

// Room Management Routes
adminRouter.get("/rooms", authAdmin, getRoomsAdmin)
adminRouter.post("/room-assign", authAdmin, assignRoomAdmin)
adminRouter.post("/room-transfer", authAdmin, transferRoomAdmin)
adminRouter.post("/room-discharge", authAdmin, dischargeRoomAdmin)
adminRouter.post("/room-cancel", authAdmin, cancelRoomRequestAdmin)
adminRouter.post("/room-reject", authAdmin, rejectRoomRequestAdmin)
adminRouter.post("/room-approve", authAdmin, approveRoomRequestAdmin)
adminRouter.post("/complete-appointment", authAdmin, appointmentComplete)

// Billing Routes
adminRouter.get("/bills", authAdmin, getBillsAdmin)
adminRouter.post("/mark-bill-paid", authAdmin, markBillPaidAdmin)
adminRouter.post("/generate-bill", authAdmin, generateBillAdmin)
adminRouter.post("/update-charges", authAdmin, updateChargesAdmin)

export default adminRouter;