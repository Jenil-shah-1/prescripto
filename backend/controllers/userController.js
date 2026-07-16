import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { v2 as cloudinary } from 'cloudinary'
import stripe from "stripe";
import razorpay from 'razorpay';
import { sendPaymentReceipt } from './emailsender.js';
import paymentModel from "../models/paymentModel.js";
import notificationModel from "../models/notificationModel.js";
import billModel from "../models/billModel.js";

// Gateway Initialize
const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// API to register user
const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        // checking for all data to register user
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword,
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to login user
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user profile data
const getProfile = async (req, res) => {

    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update user profile
const updateProfile = async (req, res) => {

    try {

        const { userId, name, phone, address, dob, gender, email, emergencyContact, occupation, bloodGroup, allergies, medicalConditions, insurance } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob) {
            return res.json({ success: false, message: "Required fields missing" })
        }

        const updateData = { name, phone, dob }
        if (address) updateData.address = JSON.parse(address)
        if (gender) updateData.gender = gender
        if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact
        if (occupation !== undefined) updateData.occupation = occupation
        if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup
        if (allergies !== undefined) updateData.allergies = allergies
        if (medicalConditions !== undefined) updateData.medicalConditions = medicalConditions
        if (insurance !== undefined) updateData.insurance = insurance

        if (email) {
            const existingUser = await userModel.findOne({ email })
            if (existingUser && existingUser._id.toString() !== userId) {
                return res.json({ success: false, message: "Email is already in use by another account" })
            }
            updateData.email = email
        }

        await userModel.findByIdAndUpdate(userId, updateData)

        if (imageFile) {

            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageURL })
        }

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to book appointment 
const bookAppointment = async (req, res) => {

    try {

        const { userId, docId, slotDate, slotTime, paymentType, reason, roomRequested, roomCategory } = req.body
        const docData = await doctorModel.findById(docId).select("-password")

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor is unavailable.' })
        }

        // Feature 2: Rolling Booking Window (Today + Next 3 Days)
        const now = new Date()
        const allowedDates = [];
        for (let i = 0; i <= 3; i++) {
            const d = new Date()
            d.setDate(now.getDate() + i)
            const dateStr = `${d.getDate()}_${d.getMonth() + 1}_${d.getFullYear()}`
            allowedDates.push(dateStr)
        }

        if (!allowedDates.includes(slotDate)) {
            return res.json({ success: false, message: "You can only book appointments within the next 3 days." })
        }

        // Past time validation if date is today
        const currentDayStr = `${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}`
        if (slotDate === currentDayStr) {
            const parseTimeToMinutes = (timeStr) => {
                const matchStr = timeStr.trim().toUpperCase()
                const isPM = matchStr.includes("PM")
                const isAM = matchStr.includes("AM")
                
                const cleanStr = matchStr.replace("AM", "").replace("PM", "").trim()
                const [hoursStr, minutesStr] = cleanStr.split(":")
                let hours = parseInt(hoursStr, 10)
                const minutes = parseInt(minutesStr, 10)
                
                if (isPM && hours < 12) {
                    hours += 12
                }
                if (isAM && hours === 12) {
                    hours = 0
                }
                return hours * 60 + minutes
            }

            const currentMinutes = now.getHours() * 60 + now.getMinutes()
            const slotMinutes = parseTimeToMinutes(slotTime)

            if (slotMinutes <= currentMinutes) {
                return res.json({ success: false, message: "This slot has already passed." })
            }
        }

        // Feature 3: Slot capacity verification (Maximum 2 patients per slot)
        const activeAppointmentsCount = await appointmentModel.countDocuments({
            docId,
            slotDate,
            slotTime,
            cancelled: { $ne: true },
            isRejected: { $ne: true }
        });

        if (activeAppointmentsCount >= 2) {
            return res.json({ success: false, message: "This slot is full." })
        }

        let slots_booked = docData.slots_booked || {};
        let currentBooked = slots_booked[slotDate] || [];

        const occurrences = currentBooked.filter(t => t === slotTime).length;
        if (occurrences >= 2) {
            return res.json({ success: false, message: "This slot is full." });
        }

        currentBooked.push(slotTime);
        slots_booked[slotDate] = currentBooked;

        const userData = await userModel.findById(userId).select("-password")
        const totalAmount = docData.fees
        const minAmount = Math.ceil(totalAmount * 0.2) // 20% of total fees
        const paidAmount = paymentType === 'minimum' ? minAmount : totalAmount

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: totalAmount,
            minAmount: minAmount,
            paidAmount: paidAmount,
            slotTime,
            slotDate,
            status: "pending",
            reason: reason || 'General Consultation',
            date: Date.now(),
            roomRequested: roomRequested || false,
            roomCategory: roomRequested ? (roomCategory || "") : "",
            roomStatus: roomRequested ? "Pending" : "No Request"
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        // save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        // Create notification for the doctor
        const newNotification = new notificationModel({
            recipientId: docId,
            title: "New Appointment Booked",
            message: `${userData.name} booked an appointment for ${slotDate} at ${slotTime}.`,
            type: "new_appointment"
        });
        await newNotification.save();

        // Create Razorpay order
        const options = {
            amount: paidAmount * 100,
            currency: process.env.CURRENCY,
            receipt: newAppointment._id,
        }

        // creation of an order
        const order = await razorpayInstance.orders.create(options)

        res.json({ 
            success: true, 
            message: 'Appointment Created',
            appointmentId: newAppointment._id,
            orderId: order.id,
            amount: paidAmount
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {

        const { userId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify appointment user 
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // releasing doctor slot 
        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked || {}
        if (slots_booked[slotDate]) {
            const index = slots_booked[slotDate].indexOf(slotTime)
            if (index > -1) {
                slots_booked[slotDate].splice(index, 1)
            }
        }

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        // Create notification for doctor
        const newNotification = new notificationModel({
            recipientId: docId,
            title: "Appointment Cancelled",
            message: `${appointmentData.userData.name} cancelled their appointment for ${slotDate} at ${slotTime}.`,
            type: "cancelled"
        });
        await newNotification.save();

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {

        const { userId } = req.body
        const appointments = await appointmentModel.find({ userId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to make payment of appointment using razorpay
const paymentRazorpay = async (req, res) => {
    try {
        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        // If no payment has been made yet, allow minimum payment (20%)
        // Otherwise, charge exactly 80% of the total amount
        const amountToCharge = appointmentData.paidAmount === 0 ? 
            appointmentData.minAmount : 
            appointmentData.amount - appointmentData.minAmount;

        // creating options for razorpay payment
        const options = {
            amount: amountToCharge * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }

        // creation of an order
        const order = await razorpayInstance.orders.create(options)

        res.json({ success: true, order })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to verify payment of razorpay
const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if (orderInfo.status === 'paid') {
            const appointmentData = await appointmentModel.findById(orderInfo.receipt)
            
            // Calculate the current payment amount
            const currentPayment = orderInfo.amount / 100;
            
            // Update appointment with new payment status
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { 
                payment: true,
                paidAmount: (appointmentData.paidAmount || 0) + currentPayment
            })

            // Create payment record
            const paymentData = {
                appointmentId: appointmentData._id,
                userId: appointmentData.userId,
                doctorId: appointmentData.docId,
                amount: currentPayment,
                transactionId: razorpay_payment_id,
                paymentStatus: 'success',
                paymentMethod: 'razorpay',
                doctorFees: appointmentData.amount
            };

            const newPayment = new paymentModel(paymentData);
            await newPayment.save();

            // Sync with Bill if exists
            const bill = await billModel.findOne({ appointmentId: appointmentData._id.toString() });
            if (bill) {
                bill.paidAmount = (appointmentData.paidAmount || 0) + currentPayment;
                if (bill.paidAmount >= bill.totalAmount) {
                    bill.paymentStatus = 'Paid';
                } else if (bill.paidAmount > 0) {
                    bill.paymentStatus = 'Partially Paid';
                }
                bill.paymentHistory.push({
                    paymentDate: Date.now(),
                    amountPaid: currentPayment,
                    paymentMethod: 'razorpay',
                    transactionId: razorpay_payment_id
                });
                await bill.save();
            }

            // Send payment receipt
            sendPaymentReceipt(appointmentData.userData.email, appointmentData, razorpay_payment_id);
            
            res.json({ success: true, message: "Payment Successful" })
        }
        else {
            res.json({ success: false, message: 'Payment Failed' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to make payment of appointment using Stripe
const paymentStripe = async (req, res) => {
    try {

        const { appointmentId } = req.body
        const { origin } = req.headers

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })
        }

        const currency = process.env.CURRENCY.toLocaleLowerCase()

        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: "Appointment Fees"
                },
                unit_amount: appointmentData.amount * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&appointmentId=${appointmentData._id}`,
            cancel_url: `${origin}/verify?success=false&appointmentId=${appointmentData._id}`,
            line_items: line_items,
            mode: 'payment',
        })

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const verifyStripe = async (req, res) => {
    try {

        const { appointmentId, success } = req.body

        if (success === "true") {
            const appointmentData = await appointmentModel.findById(appointmentId);
            if (appointmentData) {
                const unpaidAmount = appointmentData.amount - (appointmentData.paidAmount || 0);
                await appointmentModel.findByIdAndUpdate(appointmentId, { 
                    payment: true,
                    paidAmount: appointmentData.amount
                });
                
                // Sync with Bill
                const bill = await billModel.findOne({ appointmentId: appointmentId.toString() });
                if (bill) {
                    bill.paidAmount = bill.totalAmount; // Stripe clears the entire bill amount
                    bill.paymentStatus = 'Paid';
                    bill.paymentHistory.push({
                        paymentDate: Date.now(),
                        amountPaid: unpaidAmount,
                        paymentMethod: 'stripe',
                        transactionId: 'STRIPE-PAYMENT'
                    });
                    await bill.save();
                }
            }
            return res.json({ success: true, message: 'Payment Successful' })
        }

        res.json({ success: false, message: 'Payment Failed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to reschedule appointment
const rescheduleAppointment = async (req, res) => {
    try {
        const { userId, appointmentId, newSlotDate, newSlotTime } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify appointment user 
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        // Get doctor data
        const docData = await doctorModel.findById(appointmentData.docId).select("-password")
        let slots_booked = docData.slots_booked

        // Check if new slot is available
        if (slots_booked[newSlotDate] && slots_booked[newSlotDate].includes(newSlotTime)) {
            return res.json({ success: false, message: 'New slot is not available' })
        }

        // Remove old slot
        slots_booked[appointmentData.slotDate] = slots_booked[appointmentData.slotDate].filter(time => time !== appointmentData.slotTime)

        // Add new slot
        if (!slots_booked[newSlotDate]) {
            slots_booked[newSlotDate] = []
        }
        slots_booked[newSlotDate].push(newSlotTime)

        // Update doctor's slots
        await doctorModel.findByIdAndUpdate(appointmentData.docId, { slots_booked })

        // Update appointment with new slot while preserving payment status and amounts
        await appointmentModel.findByIdAndUpdate(appointmentId, {
            slotDate: newSlotDate,
            slotTime: newSlotTime,
            // Preserve existing payment fields
            payment: appointmentData.payment,
            amount: appointmentData.amount,
            minAmount: appointmentData.minAmount,
            paidAmount: appointmentData.paidAmount
        })

        // Create notification for doctor
        const newNotification = new notificationModel({
            recipientId: appointmentData.docId,
            title: "Appointment Rescheduled",
            message: `${appointmentData.userData.name} rescheduled their appointment from ${appointmentData.slotDate} to ${newSlotDate} at ${newSlotTime}.`,
            type: "rescheduled"
        });
        await newNotification.save();

        res.json({ success: true, message: 'Appointment Rescheduled Successfully' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API for patient to request room after booking/acceptance
const requestRoomUser = async (req, res) => {
    try {
        const { appointmentId, roomCategory } = req.body
        const appointment = await appointmentModel.findById(appointmentId)
        if (!appointment) {
            return res.json({ success: false, message: "Appointment not found" })
        }
        
        appointment.roomRequested = true
        appointment.roomCategory = roomCategory
        appointment.roomRequestedBy = "patient"
        appointment.roomStatus = "Pending"
        await appointment.save()
        
        res.json({ success: true, message: "Room request created successfully", appointment })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get patient completed medical history
const getPatientMedicalHistory = async (req, res) => {
    try {
        const { userId } = req.body // from authUser middleware
        const history = await appointmentModel.find({ userId, isCompleted: true })
        res.json({ success: true, history })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to retrieve patient's bills
const getBillsUser = async (req, res) => {
    try {
        const { userId } = req.body // from authUser middleware
        const bills = await billModel.find({ userId }).sort({ createdAt: -1 })
        res.json({ success: true, bills })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to retrieve patient's payment history entries
const getPaymentHistoryUser = async (req, res) => {
    try {
        const { userId } = req.body // from authUser middleware
        const bills = await billModel.find({ userId })
        let history = []
        bills.forEach(bill => {
            if (bill.paymentHistory && Array.isArray(bill.paymentHistory)) {
                bill.paymentHistory.forEach(item => {
                    history.push({
                        paymentDate: item.paymentDate,
                        appointmentId: bill.appointmentId,
                        billNumber: bill.billNumber,
                        amountPaid: item.amountPaid,
                        paymentMethod: item.paymentMethod,
                        transactionId: item.transactionId || 'N/A',
                        doctorName: bill.doctorName,
                        appointmentDate: bill.appointmentDate
                    })
                })
            }
        })
        history.sort((a, b) => b.paymentDate - a.paymentDate)
        res.json({ success: true, history })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    loginUser,
    registerUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    paymentRazorpay,
    verifyRazorpay,
    paymentStripe,
    verifyStripe,
    rescheduleAppointment,
    requestRoomUser,
    getPatientMedicalHistory,
    getBillsUser,
    getPaymentHistoryUser
}