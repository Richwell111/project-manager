import mongoose,{ Schema }
 from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        select: false, // Do not return password in queries
    },
    profilePicture: {
        type: String,
        
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    lastLogin: {
        type: Date,
        
    },
    is2FAEnabled: {
        type: Boolean,
        default: false,
    },
    twoFAOtp: {
        type: String,
        select: false, // Do not return OTP in queries
    },
    twoFAOtpExpires: {
        type: Date,
        select: false, // Do not return OTP expiration in queries
        
    },
}, {
    timestamps: true
});
const User = mongoose.model("User", userSchema);
export default User;