// create a Feedback schema
import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true }
});

// create a Feedback model
const Feedback = mongoose.model('Feedback', feedbackSchema);
// add this feedback ID to the feedbakack array in user collecrion'

// export the Feedback model
export default Feedback;