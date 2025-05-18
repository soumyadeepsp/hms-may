// create a DoctorToken schema
import mongoose from 'mongoose';

const doctorTokenSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: [String], required: true },
});

// create a DoctorToken model
const DoctorToken = mongoose.model('DoctorToken', doctorTokenSchema);

// export the DoctorToken model
export default DoctorToken;