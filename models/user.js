// create a user schema
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    type: { type: String, required: true, enum: ['patient', 'doctor'] },
    mobile: { type: Number, required: true },
    mobileVerified: { type: Boolean, required: true, default: false },
    otp: { type: Number },
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

// create a user model
const User = mongoose.model('User', userSchema);

// export the user model
export default User;