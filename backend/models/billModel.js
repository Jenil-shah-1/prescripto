import mongoose from "mongoose"

const billSchema = new mongoose.Schema({
    billNumber: { type: String, required: true, unique: true },
    appointmentId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    patientName: { type: String, required: true },
    doctorName: { type: String, required: true },
    appointmentDate: { type: String, required: true },
    billDate: { type: Number, default: Date.now },
    dueDate: { type: Number, required: true },
    consultationFee: { type: Number, required: true },
    roomCategory: { type: String, default: "" },
    roomNumber: { type: String, default: "" },
    roomAdmissionDate: { type: Number },
    roomDischargeDate: { type: Number },
    roomDays: { type: Number, default: 0 },
    roomRatePerDay: { type: Number, default: 0 },
    roomCharges: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, default: "Pending" }, // "Pending", "Paid", "Partially Paid", "Cancelled"
    paymentHistory: [
        {
            paymentDate: { type: Number, default: Date.now },
            amountPaid: { type: Number },
            paymentMethod: { type: String },
            transactionId: { type: String, default: "" }
        }
    ]
}, { timestamps: true })

const billModel = mongoose.models.bill || mongoose.model("bill", billSchema)
export default billModel
