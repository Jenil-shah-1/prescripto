import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/userModel.js";
import { sendVerificationMail } from "./emailsender.js";
import { ObjectId } from "mongodb";
import roomModel from "../models/roomModel.js";
import billModel from "../models/billModel.js";
import { generateBill } from "../utils/billGenerator.js";

// API for admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for appointment cancellation
const appointmentCancel = async (req, res) => {
  return res.json({ success: false, message: "Unauthorized action: Admin is not authorized to cancel appointments. Only the assigned Doctor can manage appointment statuses." });
};

// API for adding Doctor
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file;

    // checking for all data to add doctor
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // validating email format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // validating strong password
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
    const hashedPassword = await bcrypt.hash(password, salt);

    // upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const imageUrl = imageUpload.secure_url;

    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: Date.now(),
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();
    res.json({ success: true, message: "Doctor Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});

    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      patients: users.length,
      latestAppointments: appointments.reverse(),
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all rooms and occupancy
const getRoomsAdmin = async (req, res) => {
  try {
    const rooms = await roomModel.find({});
    res.json({ success: true, rooms });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to assign room to a request
const assignRoomAdmin = async (req, res) => {
  try {
    const { appointmentId, roomNumber, expectedDischarge } = req.body;
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    const room = await roomModel.findOne({ roomNumber });
    if (!room) {
      return res.json({ success: false, message: "Room not found" });
    }

    if (room.status === "Maintenance" || room.occupiedBeds >= room.capacity) {
      return res.json({ success: false, message: "This room is full or unavailable." });
    }

    const finalAdmissionDate = req.body.admissionDate ? new Date(req.body.admissionDate).getTime() : Date.now();

    // Assign patient to room
    room.patients.push({
      patientId: appointment.userId,
      patientName: appointment.userData.name,
      appointmentId: appointment._id.toString(),
      admissionDate: finalAdmissionDate,
      expectedDischarge: expectedDischarge || ""
    });
    room.occupiedBeds += 1;
    room.status = room.occupiedBeds === room.capacity ? "Full" : "Partially Occupied";
    await room.save();

    // Update appointment
    appointment.roomRequested = true;
    if (!appointment.roomRequestedBy) {
      appointment.roomRequestedBy = "admin";
    }
    appointment.roomNumber = roomNumber;
    appointment.roomCategory = room.category;
    appointment.roomStatus = "Allocated";
    appointment.roomAdmissionDate = finalAdmissionDate;
    appointment.roomExpectedDischarge = expectedDischarge || "";
    await appointment.save();

    res.json({ success: true, message: "Room allocated successfully", appointment });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to transfer patient
const transferRoomAdmin = async (req, res) => {
  try {
    const { appointmentId, newRoomNumber } = req.body;
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    const currentRoom = await roomModel.findOne({ roomNumber: appointment.roomNumber });
    const newRoom = await roomModel.findOne({ roomNumber: newRoomNumber });

    if (!newRoom) {
      return res.json({ success: false, message: "New room not found" });
    }

    if (newRoom.status === "Maintenance" || newRoom.occupiedBeds >= newRoom.capacity) {
      return res.json({ success: false, message: "New room is full or unavailable." });
    }

    // Remove from current room
    if (currentRoom) {
      currentRoom.patients = currentRoom.patients.filter(
        p => p.appointmentId !== appointmentId
      );
      currentRoom.occupiedBeds = Math.max(0, currentRoom.occupiedBeds - 1);
      currentRoom.status = currentRoom.occupiedBeds === 0 ? "Available" : "Partially Occupied";
      await currentRoom.save();
    }

    const finalAdmissionDate = req.body.admissionDate ? new Date(req.body.admissionDate).getTime() : Date.now();

    // Add to new room
    newRoom.patients.push({
      patientId: appointment.userId,
      patientName: appointment.userData.name,
      appointmentId: appointment._id.toString(),
      admissionDate: finalAdmissionDate,
      expectedDischarge: appointment.roomExpectedDischarge || ""
    });
    newRoom.occupiedBeds += 1;
    newRoom.status = newRoom.occupiedBeds === newRoom.capacity ? "Full" : "Partially Occupied";
    await newRoom.save();

    // Update appointment
    appointment.roomNumber = newRoomNumber;
    appointment.roomCategory = newRoom.category;
    appointment.roomAdmissionDate = finalAdmissionDate;
    await appointment.save();

    res.json({ success: true, message: "Patient transferred successfully", appointment });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to discharge patient
const dischargeRoomAdmin = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    const room = await roomModel.findOne({ roomNumber: appointment.roomNumber });
    if (room) {
      room.patients = room.patients.filter(p => p.appointmentId !== appointmentId);
      room.occupiedBeds = Math.max(0, room.occupiedBeds - 1);
      room.status = room.occupiedBeds === 0 ? "Available" : "Partially Occupied";
      await room.save();
    }

    const finalDischargeDate = req.body.dischargeDate ? new Date(req.body.dischargeDate).getTime() : Date.now();

    // Update appointment
    appointment.roomStatus = "Discharged";
    appointment.roomDischargedAt = finalDischargeDate;
    await appointment.save();

    // Generate bill automatically
    await generateBill(appointmentId, finalDischargeDate);

    res.json({ success: true, message: "Patient discharged successfully", appointment });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel room allocation/request
const cancelRoomRequestAdmin = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    const room = await roomModel.findOne({ roomNumber: appointment.roomNumber });
    if (room) {
      room.patients = room.patients.filter(p => p.appointmentId !== appointmentId);
      room.occupiedBeds = Math.max(0, room.occupiedBeds - 1);
      room.status = room.occupiedBeds === 0 ? "Available" : "Partially Occupied";
      await room.save();
    }

    // Update appointment
    appointment.roomStatus = "Cancelled";
    appointment.roomNumber = "";
    await appointment.save();

    res.json({ success: true, message: "Room request cancelled successfully", appointment });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const rejectRoomRequestAdmin = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }
    appointment.roomStatus = "Rejected";
    await appointment.save();
    res.json({ success: true, message: "Room request rejected successfully", appointment });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const approveRoomRequestAdmin = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }
    appointment.roomStatus = "Approved";
    await appointment.save();
    res.json({ success: true, message: "Room request approved successfully", appointment });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all hospital bills
const getBillsAdmin = async (req, res) => {
  try {
    const bills = await billModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, bills });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to manually mark bill as paid
const markBillPaidAdmin = async (req, res) => {
  try {
    const { billId, paymentMethod, amountPaid } = req.body;
    const bill = await billModel.findById(billId);
    if (!bill) {
      return res.json({ success: false, message: "Bill not found" });
    }

    const amt = Number(amountPaid) || (bill.totalAmount - bill.paidAmount);
    bill.paidAmount += amt;
    if (bill.paidAmount >= bill.totalAmount) {
      bill.paymentStatus = "Paid";
    } else if (bill.paidAmount > 0) {
      bill.paymentStatus = "Partially Paid";
    }

    bill.paymentHistory.push({
      paymentDate: Date.now(),
      amountPaid: amt,
      paymentMethod: paymentMethod || "Cash",
      transactionId: "CASH-" + Date.now()
    });

    await bill.save();

    // Also sync payment status to the corresponding appointment
    if (bill.paymentStatus === "Paid") {
      await appointmentModel.findByIdAndUpdate(bill.appointmentId, { 
        payment: true, 
        paidAmount: bill.paidAmount 
      });
    } else {
      await appointmentModel.findByIdAndUpdate(bill.appointmentId, { 
        paidAmount: bill.paidAmount 
      });
    }

    res.json({ success: true, message: "Bill updated successfully", bill });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to manually generate/recalculate bill
const generateBillAdmin = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const bill = await generateBill(appointmentId);
    if (!bill) {
      return res.json({ success: false, message: "Failed to generate bill" });
    }
    res.json({ success: true, message: "Bill generated/recalculated successfully", bill });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update billing charges manually
const updateChargesAdmin = async (req, res) => {
  try {
    const { billId, consultationFee, roomCharges, otherCharges } = req.body;
    const bill = await billModel.findById(billId);
    if (!bill) {
      return res.json({ success: false, message: "Bill not found" });
    }

    if (consultationFee !== undefined) bill.consultationFee = Number(consultationFee);
    if (roomCharges !== undefined) bill.roomCharges = Number(roomCharges);
    if (otherCharges !== undefined) bill.otherCharges = Number(otherCharges);

    bill.totalAmount = bill.consultationFee + bill.roomCharges + bill.otherCharges;

    if (bill.paidAmount >= bill.totalAmount) {
      bill.paymentStatus = "Paid";
    } else if (bill.paidAmount > 0) {
      bill.paymentStatus = "Partially Paid";
    } else {
      bill.paymentStatus = "Pending";
    }

    await bill.save();

    res.json({ success: true, message: "Charges updated successfully", bill });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  loginAdmin,
  appointmentsAdmin,
  appointmentCancel,
  addDoctor,
  allDoctors,
  adminDashboard,
  getRoomsAdmin,
  assignRoomAdmin,
  transferRoomAdmin,
  dischargeRoomAdmin,
  cancelRoomRequestAdmin,
  rejectRoomRequestAdmin,
  approveRoomRequestAdmin,
  getBillsAdmin,
  markBillPaidAdmin,
  generateBillAdmin,
  updateChargesAdmin
};
