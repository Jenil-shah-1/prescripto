import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { sendVerificationMail } from "./emailsender.js";
import { ObjectId } from "mongodb";
import userModel from "../models/userModel.js";
import notificationModel from "../models/notificationModel.js";
import { generateBill } from "../utils/billGenerator.js";
import billModel from "../models/billModel.js";


// API for doctor Login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await doctorModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      
      const doctorData = user.toObject();
      delete doctorData.password;

      res.json({ success: true, token, doctor: doctorData });
    } else {
      res.json({ success: false, message: "Invalid password" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Server error" });
  }
};

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });

      const newNotification = new notificationModel({
        recipientId: docId,
        title: "Appointment Cancelled",
        message: `Appointment on ${appointmentData.slotDate} at ${appointmentData.slotTime} for ${appointmentData.userData.name} has been cancelled.`,
        type: "cancelled"
      });
      await newNotification.save();

      const data = await appointmentModel.find({
        _id: new ObjectId(appointmentId),
      });
      const email = data[0].userData.email;
      const doctorName = data[0].docData.name;
      const date = data[0].slotDate + " " + data[0].slotTime;
      //sending the email
      sendVerificationMail(email, doctorName, date);

      return res.json({ success: true, message: "Appointment Cancelled" });
    }

    res.json({ success: false, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to mark appointment completed for doctor panel
// API to mark appointment completed for doctor/admin panel with notes and optional follow-up
const appointmentComplete = async (req, res) => {
  try {
    const { docId, appointmentId, diagnosis, doctorNotes, prescription, nextVisitRequired, followUpDate, followUpTime, followUpReason, followUpNotes } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // Verify authorized doctor (Admin is NOT allowed to complete consultations)
    const { dtoken } = req.headers;
    if (!dtoken) {
      return res.json({ success: false, message: "Unauthorized action: Doctor authorization is required" });
    }
    if (appointmentData.docId !== docId) {
      return res.json({ success: false, message: "Unauthorized action: You can only complete appointments assigned to you" });
    }

    // Make clinical inputs optional
    const finalDiagnosis = diagnosis || "";
    const finalNotes = doctorNotes || "";
    const finalPrescription = (prescription && Array.isArray(prescription)) ? prescription : [];

    let followUpAppointmentId = "";

    // If follow-up required, create the follow-up appointment
    if (nextVisitRequired) {
      if (!followUpDate || !followUpTime) {
        return res.json({ success: false, message: "Follow-up date and time are required." });
      }

      // Check slot capacity (max 2 patients)
      const activeFollowupsCount = await appointmentModel.countDocuments({
        docId: appointmentData.docId,
        slotDate: followUpDate,
        slotTime: followUpTime,
        cancelled: { $ne: true },
        isRejected: { $ne: true }
      });
      if (activeFollowupsCount >= 2) {
        return res.json({ success: false, message: "Follow-up time slot is already full." });
      }

      // Create linked follow-up appointment
      const followUpData = {
        userId: appointmentData.userId,
        docId: appointmentData.docId,
        userData: appointmentData.userData,
        docData: appointmentData.docData,
        amount: appointmentData.amount,
        minAmount: appointmentData.minAmount,
        paidAmount: 0, 
        payment: false,
        slotTime: followUpTime,
        slotDate: followUpDate,
        status: "Follow-up Scheduled",
        isAccepted: true,
        originalAppointmentId: appointmentId,
        isFollowUp: true,
        reason: followUpReason || "Follow-up Consultation",
        doctorNotes: followUpNotes || "",
        date: Date.now()
      };

      const newFollowup = new appointmentModel(followUpData);
      await newFollowup.save();
      followUpAppointmentId = newFollowup._id.toString();

      // Book doctor slot
      const doctor = await doctorModel.findById(appointmentData.docId);
      let slots_booked = doctor.slots_booked || {};
      if (!slots_booked[followUpDate]) {
        slots_booked[followUpDate] = [];
      }
      slots_booked[followUpDate].push(followUpTime);
      await doctorModel.findByIdAndUpdate(appointmentData.docId, { slots_booked });
    }

    // Save clinical records and mark completed
    appointmentData.diagnosis = finalDiagnosis;
    appointmentData.doctorNotes = finalNotes;
    appointmentData.prescription = finalPrescription;
    appointmentData.nextVisitRequired = nextVisitRequired || false;
    
    // Doctor Admission Recommendation
    if (req.body.admissionRecommendedByDoctor) {
      appointmentData.roomRequested = true;
      appointmentData.roomCategory = req.body.recommendedRoomCategory || "General Ward";
      appointmentData.roomRequestedBy = "doctor";
      appointmentData.roomStatus = "Pending";
      appointmentData.admissionRecommendedByDoctor = true;
      appointmentData.recommendedRoomCategory = req.body.recommendedRoomCategory || "General Ward";
      appointmentData.expectedStayDays = Number(req.body.expectedStayDays) || 0;
    }

    appointmentData.isCompleted = true;
    appointmentData.status = "completed";
    appointmentData.completedBy = "doctor";
    appointmentData.completedAt = Date.now();
    appointmentData.updatedAt = Date.now();
    if (followUpAppointmentId) {
      appointmentData.followUpAppointmentId = followUpAppointmentId;
    }

    await appointmentData.save();

    // Generate consolidated bill if patient is not admitted/no room requested
    if (!appointmentData.roomRequested || appointmentData.roomStatus === "No Request" || appointmentData.roomStatus === "Cancelled" || appointmentData.roomStatus === "Rejected") {
      await generateBill(appointmentId);
    }

    const newNotification = new notificationModel({
      recipientId: appointmentData.docId,
      title: "Appointment Completed",
      message: `Appointment on ${appointmentData.slotDate} for ${appointmentData.userData.name} has been completed.`,
      type: "status_change"
    });
    await newNotification.save();

    return res.json({ success: true, message: "Appointment Completed successfully", appointment: appointmentData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all doctors list for Frontend
const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to change doctor availablity for Admin and Doctor Panel
const changeAvailablity = async (req, res) => {
  try {
    const { docId } = req.body;

    const docData = await doctorModel.findById(docId);
    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });
    res.json({ success: true, message: "Availablity Changed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get doctor profile for  Doctor Panel
const doctorProfile = async (req, res) => {
  try {
    const { docId } = req.body;
    const profileData = await doctorModel.findById(docId).select("-password");

    res.json({ success: true, profileData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update doctor profile data from Doctor Panel
const updateDoctorProfile = async (req, res) => {
  try {
    const { docId, fees, address, available, name, degree, speciality, experience, about, hospital, languages, image } = req.body;
    
    const updateData = {};
    if (fees !== undefined) updateData.fees = Number(fees);
    if (address !== undefined) updateData.address = address;
    if (available !== undefined) updateData.available = available;
    if (name !== undefined) updateData.name = name;
    if (degree !== undefined) updateData.degree = degree;
    if (speciality !== undefined) updateData.speciality = speciality;
    if (experience !== undefined) updateData.experience = experience;
    if (about !== undefined) updateData.about = about;
    if (hospital !== undefined) updateData.hospital = hospital;
    if (languages !== undefined) updateData.languages = languages;
    if (image !== undefined) updateData.image = image;

    await doctorModel.findByIdAndUpdate(docId, updateData);

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
  try {
    const { docId } = req.body;

    const appointments = await appointmentModel.find({ docId });

    let earnings = 0;
    let completedCount = 0;
    let cancelledCount = 0;
    let pendingCount = 0;
    let upcomingCount = 0;
    let todayCount = 0;

    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const todayStr = `${day}_${month}_${year}`;

    appointments.forEach((item) => {
      if (item.isCompleted) {
        earnings += item.amount;
        completedCount++;
      } else if (item.cancelled) {
        cancelledCount++;
      } else {
        pendingCount++;
        if (item.isAccepted) {
          upcomingCount++;
        }
      }

      if (item.slotDate === todayStr && !item.cancelled) {
        todayCount++;
      }
    });

    let patientsList = [];
    appointments.forEach((item) => {
      if (!patientsList.includes(item.userId)) {
        patientsList.push(item.userId);
      }
    });

    // Chart 1: Appointments by Day for Last 7 Days
    const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let weeklyBookings = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = weekdayNames[d.getDay()];
      weeklyBookings[dayName] = 0;
    }

    appointments.forEach((item) => {
      if (item.date) {
        const itemDate = new Date(item.date);
        const diffTime = Math.abs(new Date() - itemDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
          const dayName = weekdayNames[itemDate.getDay()];
          if (weeklyBookings[dayName] !== undefined) {
            weeklyBookings[dayName]++;
          }
        }
      }
    });

    const weeklyChartData = Object.keys(weeklyBookings).reverse().map(day => ({
      name: day,
      count: weeklyBookings[day]
    }));

    // Chart 2: Patient Statistics (Age Groups)
    let under18 = 0, age18to35 = 0, age36to50 = 0, over50 = 0;
    const calculateAge = (dob) => {
      if (!dob || dob === 'Not Selected') return 30;
      const birthDate = new Date(dob);
      if (isNaN(birthDate)) return 30;
      const todayDate = new Date();
      let age = todayDate.getFullYear() - birthDate.getFullYear();
      const m = todayDate.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && todayDate.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    appointments.forEach((item) => {
      const age = calculateAge(item.userData.dob);
      if (age < 18) under18++;
      else if (age <= 35) age18to35++;
      else if (age <= 50) age36to50++;
      else over50++;
    });

    const patientStats = [
      { name: "Under 18", count: under18 },
      { name: "18-35", count: age18to35 },
      { name: "36-50", count: age36to50 },
      { name: "Over 50", count: over50 }
    ];

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patientsList.length,
      completed: completedCount,
      cancelled: cancelledCount,
      pending: pendingCount,
      upcoming: upcomingCount,
      today: todayCount,
      weeklyChartData,
      patientStats,
      latestAppointments: appointments.reverse().slice(0, 5),
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to accept appointment
const acceptAppointment = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, { isAccepted: true });

      const newNotification = new notificationModel({
        recipientId: docId,
        title: "Appointment Accepted",
        message: `Appointment on ${appointmentData.slotDate} at ${appointmentData.slotTime} for ${appointmentData.userData.name} has been accepted.`,
        type: "status_change"
      });
      await newNotification.save();

      return res.json({ success: true, message: "Appointment Accepted" });
    }
    res.json({ success: false, message: "Appointment not found or unauthorized" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get unique patients list
const getDoctorPatients = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId });
    
    let uniqueUserIds = [];
    appointments.forEach((item) => {
      if (!uniqueUserIds.includes(item.userId)) {
        uniqueUserIds.push(item.userId);
      }
    });

    const patientsInfo = await userModel.find({ _id: { $in: uniqueUserIds } }).select("-password");

    const patients = patientsInfo.map((patient) => {
      const patientAppointments = appointments.filter(app => app.userId === patient._id.toString());
      return {
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        gender: patient.gender,
        dob: patient.dob,
        image: patient.image,
        address: patient.address,
        appointments: patientAppointments
      };
    });

    res.json({ success: true, patients });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update availability (workingDays, workingHours, timeSlots)
const updateAvailability = async (req, res) => {
  try {
    const { docId, workingDays, workingHours, timeSlots } = req.body;
    
    const updateData = {};
    if (workingDays) updateData.workingDays = workingDays;
    if (workingHours) updateData.workingHours = workingHours;
    if (timeSlots) updateData.timeSlots = timeSlots;

    await doctorModel.findByIdAndUpdate(docId, updateData);
    res.json({ success: true, message: "Availability schedule updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get doctor notifications
const getDoctorNotifications = async (req, res) => {
  try {
    const { docId } = req.body;
    const notifications = await notificationModel.find({ recipientId: docId }).sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to mark notification(s) as read
const markNotificationRead = async (req, res) => {
  try {
    const { docId, notificationId } = req.body;
    if (notificationId) {
      await notificationModel.findOneAndUpdate({ _id: notificationId, recipientId: docId }, { isRead: true });
    } else {
      await notificationModel.updateMany({ recipientId: docId }, { isRead: true });
    }
    res.json({ success: true, message: "Notifications updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update appointment notes
const updateAppointmentNotes = async (req, res) => {
  try {
    const { docId, appointmentId, notes } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, { doctorNotes: notes });
      return res.json({ success: true, message: "Doctor notes saved successfully" });
    }
    res.json({ success: false, message: "Appointment not found or unauthorized" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to change doctor password
const changeDoctorPassword = async (req, res) => {
  try {
    const { docId, oldPassword, newPassword, confirmPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.json({ success: false, message: "Old and New passwords are required" });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.json({ success: false, message: "New passwords do not match" });
    }

    if (newPassword.length < 8) {
      return res.json({ success: false, message: "New password must be at least 8 characters long" });
    }

    const doctor = await doctorModel.findById(docId);
    const isMatch = await bcrypt.compare(oldPassword, doctor.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Incorrect current password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await doctorModel.findByIdAndUpdate(docId, { password: hashedPassword });
    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Helper function to release doctor slot (splicing out exactly one instance of the slotTime)
const releaseDoctorSlot = async (docId, slotDate, slotTime) => {
  try {
    const doctor = await doctorModel.findById(docId);
    if (doctor && doctor.slots_booked && doctor.slots_booked[slotDate]) {
      let slots_booked = doctor.slots_booked;
      const index = slots_booked[slotDate].indexOf(slotTime);
      if (index > -1) {
        slots_booked[slotDate].splice(index, 1);
        await doctorModel.findByIdAndUpdate(docId, { slots_booked });
      }
    }
  } catch (err) {
    console.error("Failed to release slot:", err);
  }
};

// API to update appointment status (Accept, Reject, Cancel, Complete)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId, action } = req.body; // action: 'accept' | 'reject' | 'cancel' | 'complete'
    const { dtoken } = req.headers;

    if (!dtoken) {
      return res.json({ success: false, message: "Unauthorized action: Doctor authorization is required" });
    }

    let callerDocId = null;
    try {
      const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET);
      callerDocId = token_decode.id;
    } catch (err) {
      return res.json({ success: false, message: "Invalid token" });
    }

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    if (appointment.docId !== callerDocId) {
      return res.json({ success: false, message: "Unauthorized action: This appointment is not assigned to you" });
    }

    const currentStatus = appointment.status || "pending";

    if (action === "accept") {
      if (currentStatus !== "pending") {
        return res.json({ success: false, message: `Cannot accept appointment with current status: ${currentStatus}` });
      }
      appointment.status = "accepted";
      appointment.isAccepted = true;
      appointment.acceptedBy = "doctor";
      appointment.acceptedAt = Date.now();
    } 
    else if (action === "reject") {
      if (currentStatus !== "pending") {
        return res.json({ success: false, message: `Cannot reject appointment with current status: ${currentStatus}` });
      }
      appointment.status = "rejected";
      appointment.isRejected = true;
      appointment.rejectedBy = "doctor";
      appointment.rejectedAt = Date.now();

      await releaseDoctorSlot(appointment.docId, appointment.slotDate, appointment.slotTime);
    } 
    else if (action === "cancel") {
      if (currentStatus !== "accepted" && currentStatus !== "pending") {
        return res.json({ success: false, message: `Cannot cancel appointment with current status: ${currentStatus}` });
      }
      appointment.status = "cancelled";
      appointment.cancelled = true;
      appointment.cancelledBy = "doctor";
      appointment.cancelledAt = Date.now();

      await releaseDoctorSlot(appointment.docId, appointment.slotDate, appointment.slotTime);
    } 
    else if (action === "complete") {
      if (currentStatus !== "accepted") {
        return res.json({ success: false, message: `Cannot complete appointment with current status: ${currentStatus}` });
      }
      appointment.status = "completed";
      appointment.isCompleted = true;
      appointment.completedBy = "doctor";
      appointment.completedAt = Date.now();
    } 
    else {
      return res.json({ success: false, message: "Invalid action" });
    }

    appointment.updatedAt = Date.now();
    await appointment.save();

    const newNotification = new notificationModel({
      recipientId: appointment.docId,
      title: `Appointment ${action.toUpperCase()}ed`,
      message: `Appointment for ${appointment.userData.name} has been ${action}ed by Doctor.`,
      type: "status_change"
    });
    await newNotification.save();

    res.json({ success: true, message: `Appointment status updated to ${appointment.status}`, appointment });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update doctor email
const updateDoctorEmail = async (req, res) => {
  try {
    const { docId, newEmail } = req.body;

    if (!newEmail) {
      return res.json({ success: false, message: "New email is required" });
    }

    const doctor = await doctorModel.findById(docId);
    if (doctor.email === newEmail) {
      return res.json({ success: false, message: "New email is same as current email" });
    }

    const emailExists = await doctorModel.findOne({ email: newEmail });
    if (emailExists) {
      return res.json({ success: false, message: "Email is already in use by another account" });
    }

    await doctorModel.findByIdAndUpdate(docId, { email: newEmail });
    res.json({ success: true, message: "Email updated successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for doctor to get patient's completed medical history
const getPatientHistoryDoctor = async (req, res) => {
  try {
    const { patientId } = req.body;
    if (!patientId) {
      return res.json({ success: false, message: "patientId is required" });
    }
    const history = await appointmentModel.find({ userId: patientId, isCompleted: true });
    res.json({ success: true, history });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for doctors to view their patients' bills
const getBillsDoctor = async (req, res) => {
  try {
    const { docId } = req.body; // from authDoctor middleware
    const bills = await billModel.find({ docId }).sort({ createdAt: -1 });
    res.json({ success: true, bills });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
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
};
