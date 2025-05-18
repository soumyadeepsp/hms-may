// create a DoctorToken schema
import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: [String], required: true },
    startTime: { type: Date, default: Date.now },
});

// create a DoctorToken model
const Session = mongoose.model('Session', sessionSchema);

// export the DoctorToken model
export default Session;