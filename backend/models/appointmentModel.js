import mongoose from "mongoose"

const appointmentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    userData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true },
    minAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    date: { type: Number, required: true },
    cancelled: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    isAccepted: { type: Boolean, default: false },
    isRejected: { type: Boolean, default: false },
    status: { type: String, default: "pending" },
    reason: { type: String, default: "General Consultation" },
    doctorNotes: { type: String, default: "" },
    acceptedBy: { type: String, default: "" },
    acceptedAt: { type: Number },
    rejectedBy: { type: String, default: "" },
    rejectedAt: { type: Number },
    cancelledBy: { type: String, default: "" },
    cancelledAt: { type: Number },
    completedBy: { type: String, default: "" },
    completedAt: { type: Number },
    updatedAt: { type: Number },

    // Room Request Fields
    roomRequested: { type: Boolean, default: false },
    roomCategory: { type: String, default: "" },
    roomNumber: { type: String, default: "" },
    roomStatus: { type: String, default: "No Request" }, // "Pending", "Approved", "Rejected", "Allocated", "Discharged", "No Request"
    roomAdmissionDate: { type: Number },
    roomDischargedAt: { type: Number },
    roomExpectedDischarge: { type: String, default: "" },
    roomRequestedBy: { type: String, default: "" }, // "patient" | "doctor"
    admissionRecommendedByDoctor: { type: Boolean, default: false },
    recommendedRoomCategory: { type: String, default: "" },
    expectedStayDays: { type: Number, default: 0 },

    // Consultation Fields
    diagnosis: { type: String, default: "" },
    prescription: [
        {
            medicine: { type: String },
            dosage: { type: String },
            advice: { type: String }
        }
    ],
    nextVisitRequired: { type: Boolean, default: false },

    // Follow-up Links
    originalAppointmentId: { type: String, default: "" },
    followUpAppointmentId: { type: String, default: "" },
    isFollowUp: { type: Boolean, default: false }
})

const appointmentModel = mongoose.models.appointment || mongoose.model("appointment", appointmentSchema)
export default appointmentModel