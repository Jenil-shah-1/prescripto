import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipientId: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true }, // 'new_appointment', 'cancelled', 'rescheduled', 'status_change'
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const notificationModel = mongoose.models.notification || mongoose.model("notification", notificationSchema);

export default notificationModel;
