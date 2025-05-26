// create a Appointment schema
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // e.g., "09:00"
    status: { type: String, required: true, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    feedbackId: { type: mongoose.Schema.Types.ObjectId, ref: 'Feedback' }, // reference to Feedback model
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// create a Appointment model
const Appointment = mongoose.model('Appointment', appointmentSchema);
// export the Appointment model
export default Appointment;