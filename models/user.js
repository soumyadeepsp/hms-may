// create a user schema
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    type: { type: String, required: true, enum: ['patient', 'doctor'] },
    description: { type: String },
    mobile: { type: Number, required: true },
    mobileVerified: { type: Boolean, required: true, default: false },
    emailVerified: { type: Boolean, required: true, default: false },
    otp: { type: Number },
    // i want feedback given to store an array of feedback ids 
    feedbackGiven: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Feedback' }],
    feedbackTaken:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Feedback' }],
    // i want to store the available slots of the doctor in this field in the form of a JSON
    // the key will be the date and the value will be an array of slots available on that date
    // for example: { "2023-10-01": ["09:00", "10:00", "11:00"], "2023-10-02": ["09:00", "10:00"] }
    availableSlots: { type: Object, default: {} },
    // i want to store the appointments of the user in this field in the form of an array of appointment ids
    appointmentsAsPatient: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],
    appointmentsAsDoctor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],
    otpVerified: { type: Boolean, default: false },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// 🔐 Pre-save hook to hash password
userSchema.pre('save', async function (next) {
    const user = this;
    // Only hash the password if it has been modified or is new
    if (!user.isModified('password')) return next();
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        user.password = hashedPassword;
        next();
    } catch (err) {
        next(err);
    }
});

// create a function that will delete the otp after 30 seconds of saving it
userSchema.methods.deleteOtp = async function () {
    const user = this;
    setTimeout(async () => {
        user.otp = undefined;
        await user.save();
    }, 30000);
};

// create a user model
const User = mongoose.model('User', userSchema);

// export the user model
export default User;