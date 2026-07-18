import billModel from "../models/billModel.js"
import appointmentModel from "../models/appointmentModel.js"

const ROOM_RATES = {
    "General Ward": 400,
    "Semi Private / Twin Sharing": 1000,
    "Twin Sharing": 1000,
    "Private Room": 2000,
    "Private": 2000,
    "ICU": 5000
}

const calculateChargeableDays = (admitTime, dischargeTime) => {
    const admit = new Date(admitTime);
    const discharge = new Date(dischargeTime);
    
    // Clear time for date calculations to find calendar days
    const admitDate = new Date(admit.getFullYear(), admit.getMonth(), admit.getDate());
    const dischargeDate = new Date(discharge.getFullYear(), discharge.getMonth(), discharge.getDate());
    
    // Calculate difference in calendar days
    const diffTime = dischargeDate - admitDate;
    const calendarDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (calendarDays <= 0) {
        // Discharged on the same day as admission
        return 1;
    }
    
    // Check if discharge time on discharge day is after 10:00 AM
    const dischargeHour = discharge.getHours();
    const dischargeMin = discharge.getMinutes();
    
    if (dischargeHour > 10 || (dischargeHour === 10 && dischargeMin > 0)) {
        // Count the discharge day as an additional day
        return calendarDays + 1;
    } else {
        // Do not charge the discharge day
        return calendarDays;
    }
}

const generateBill = async (appointmentId, customDischargeDate = null) => {
    try {
        const appointment = await appointmentModel.findById(appointmentId)
        if (!appointment) return null

        // Check if a bill already exists for this appointment
        let existingBill = await billModel.findOne({ appointmentId })
        if (existingBill) {
            // Update the bill if it already exists (e.g. updating charges or discharge)
            let roomDays = 0
            let roomRate = 0
            let roomCharges = 0

            if (appointment.roomRequested && appointment.roomAdmissionDate) {
                const dischargeDate = customDischargeDate || appointment.roomDischargedAt || Date.now()
                roomDays = calculateChargeableDays(appointment.roomAdmissionDate, dischargeDate)
                roomRate = ROOM_RATES[appointment.roomCategory] || 400
                roomCharges = roomDays * roomRate
            }

            existingBill.roomAdmissionDate = appointment.roomAdmissionDate
            existingBill.roomDischargeDate = customDischargeDate || appointment.roomDischargedAt
            existingBill.roomDays = roomDays
            existingBill.roomRatePerDay = roomRate
            existingBill.roomCharges = roomCharges
            existingBill.roomNumber = appointment.roomNumber
            existingBill.roomCategory = appointment.roomCategory
            existingBill.totalAmount = existingBill.consultationFee + roomCharges + existingBill.otherCharges
            existingBill.paidAmount = appointment.paidAmount || 0

            if (existingBill.paidAmount >= existingBill.totalAmount) {
                existingBill.paymentStatus = "Paid"
            } else if (existingBill.paidAmount > 0) {
                existingBill.paymentStatus = "Partially Paid"
            } else {
                existingBill.paymentStatus = "Pending"
            }

            await existingBill.save()
            
            // Sync status back to appointment
            appointment.roomStatus = "Discharged"
            appointment.roomDischargedAt = customDischargeDate || appointment.roomDischargedAt || Date.now()
            await appointment.save()

            return existingBill
        }

        // Calculate Room Charges
        let roomDays = 0
        let roomRate = 0
        let roomCharges = 0

        if (appointment.roomRequested && appointment.roomAdmissionDate) {
            const dischargeDate = customDischargeDate || appointment.roomDischargedAt || Date.now()
            roomDays = calculateChargeableDays(appointment.roomAdmissionDate, dischargeDate)
            roomRate = ROOM_RATES[appointment.roomCategory] || 400
            roomCharges = roomDays * roomRate
        }

        let count = await billModel.countDocuments()
        let billNumber = `BILL-${10001 + count}`
        let exists = await billModel.findOne({ billNumber })
        while (exists) {
            count++
            billNumber = `BILL-${10001 + count}`
            exists = await billModel.findOne({ billNumber })
        }

        const consultationFee = appointment.amount || 0
        const otherCharges = 0
        const totalAmount = consultationFee + roomCharges + otherCharges
        const paidAmount = appointment.paidAmount || 0

        let paymentStatus = "Pending"
        if (paidAmount >= totalAmount) {
            paymentStatus = "Paid"
        } else if (paidAmount > 0) {
            paymentStatus = "Partially Paid"
        }

        const billData = {
            billNumber,
            appointmentId: appointment._id.toString(),
            userId: appointment.userId,
            docId: appointment.docId,
            patientName: appointment.userData?.name || "Patient",
            doctorName: appointment.docData?.name || "Doctor",
            appointmentDate: appointment.slotDate || "",
            billDate: Date.now(),
            dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // Due in 7 days
            consultationFee,
            roomCategory: appointment.roomRequested ? appointment.roomCategory : "",
            roomNumber: appointment.roomRequested ? appointment.roomNumber : "",
            roomAdmissionDate: appointment.roomAdmissionDate || null,
            roomDischargeDate: customDischargeDate || appointment.roomDischargedAt || null,
            roomDays,
            roomRatePerDay: roomRate,
            roomCharges,
            otherCharges,
            totalAmount,
            paidAmount,
            paymentStatus,
            paymentHistory: paidAmount > 0 ? [{
                paymentDate: Date.now(),
                amountPaid: paidAmount,
                paymentMethod: "Pre-paid Deposit",
                transactionId: "PRE-PAID"
            }] : []
        }

        const newBill = new billModel(billData)
        await newBill.save()

        return newBill
    } catch (error) {
        console.log("Error generating bill:", error)
        return null
    }
}

export { generateBill, ROOM_RATES }
