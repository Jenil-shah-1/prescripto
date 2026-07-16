import mongoose from "mongoose"

const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true, unique: true },
    category: { type: String, required: true }, // "General Ward", "ICU", "Semi Private / Twin Sharing", "Private Room"
    capacity: { type: Number, required: true },
    occupiedBeds: { type: Number, default: 0 },
    status: { type: String, default: "Available" }, // "Available", "Partially Occupied", "Full", "Maintenance"
    patients: [
        {
            patientId: { type: String, required: true },
            patientName: { type: String, required: true },
            appointmentId: { type: String, required: true },
            admissionDate: { type: Number, required: true },
            expectedDischarge: { type: String, default: "" }
        }
    ]
})

const roomModel = mongoose.models.room || mongoose.model("room", roomSchema)
export default roomModel
