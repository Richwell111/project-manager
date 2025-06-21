import bcrypt from "bcrypt";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import Verification from "../models/verification.js";
import { sendEmail } from "../libs/send-email.js";
import aj from "../libs/arcjet.js";
import { isEmailTypo } from "../libs/mail-check.js";


export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const typoSuggestion = isEmailTypo(email);
    if (typoSuggestion) {
      return res.status(400).json({
        message: `Did you mean ${typoSuggestion}?`,
      });
    }

    const decision = await aj.protect(req, { email, requested: 1 });
    console.log("Arcjet decision denied?", decision.isDenied());

    if (decision.isDenied()) {
      return res.status(403).json({ message: "Invalid email address" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
    });

    const verificationToken = jwt.sign(
      { userId: newUser._id, purpose: "email-verification" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await Verification.create({
      userId: newUser._id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const emailBody = `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`;
    const emailSubject = "Verify your email";

    const isEmailSent = await sendEmail(email, emailSubject, emailBody);
    if (!isEmailSent) {
      return res
        .status(500)
        .json({ message: "Failed to send verification email" });
    }

    return res.status(201).json({
      message: "Verification email sent. Please check and verify your account",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    if (!user.isEmailVerified) {
      const existingVerification = await Verification.findOne({
        userId: user._id,
      });

      if (existingVerification && existingVerification.expiresAt > new Date()) {
        return res.status(400).json({
          message:
            "Email not verified. Please check your email for verification link.",
        });
      } else {
        await Verification.findByIdAndDelete(existingVerification?._id);
        const verificationToken = jwt.sign(
          { userId: user._id, purpose: "email-verification" },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        await Verification.create({
          userId: user._id,
          token: verificationToken,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        });
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        const emailBody = `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`;
        const emailSubject = "Verify your email";
        const isEmailSent = await sendEmail(email, emailSubject, emailBody);
        if (!isEmailSent) {
          return res
            .status(500)
            .json({ message: "Failed to send verification email" });
        }
        return res.status(201).json({
          message:
            "Verification email sent. Please check your email to verify your account",
        });
      }
    }

    const token = jwt.sign(
      { userId: user._id, purpose: "login" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    user.lastLogin = new Date();
    await user.save();

    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({
      message: "Log in successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if(!payload){
      return res.status(401).json({ message: "Unauthorized" });
    }

    
   const {userId, purpose} = payload;
    if (purpose !== "email-verification") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const verification = await Verification.findOne({
      userId,
      token
    });

    if (!verification) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const isTokenExpired = verification.expiresAt < new Date();
    if (isTokenExpired) {
      return res.status(401).json({ message: "Verification token expired" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }
    user.isEmailVerified = true;
    await user.save();
    await Verification.findByIdAndDelete(verification._id);

    return res.status(200).json({ message: "Email verified successfully" });

    
    
  } catch (error) {
    
  }
}
export const resetPasswordRequest = async (req, res) => {

  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if(!user.isEmailVerified) {
      return res.status(400).json({
        message: "Email not verified. Please verify your email before resetting password.",
      });
    }
    const resetToken = jwt.sign(
      { userId: user._id, purpose: "reset-password" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const existingVerification = await Verification.findOne({
      userId: user._id,
     
    });
    if (existingVerification && existingVerification.expiresAt > new Date()) {
      // If a reset token already exists and is still valid, delete it
     return res.status(400).json({
        message: "A reset password request is already in progress. Please check your email.",
      }); 
    }
    if (existingVerification && existingVerification.expiresAt < new Date()) {
      // If the existing reset token has expired, delete it
      await Verification.findByIdAndDelete(existingVerification._id);
    }

    const resetPasswordToken = jwt.sign(
      { userId: user._id, purpose: "reset-password" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    await Verification.create({
      userId: user._id,
      token: resetPasswordToken,
      expiresAt: new Date(Date.now() + 60 * 15 * 1000), // 15 minutes
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetPasswordToken}`;
    const emailBody = `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`;
    const emailSubject = "Reset your password";
    const isEmailSent = await sendEmail(email, emailSubject, emailBody);
    if (!isEmailSent) {
      return res
        .status(500)
        .json({ message: "Failed to send reset password email" });
    }

    return res.status(200).json({
      message: "Reset password email sent. Please check your email",
    });
  } catch (error) {
    console.error("Reset password request error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const verifyResetPasswordTokenAndResetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }
   const { userId, purpose } = payload;
    if (purpose !== "reset-password") {
      return res.status(401).json({ message: "Unauthorized" });
    }
  const verification = await Verification.findOne({
      userId,
      token,
    }); 
    if (!verification) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const isTokenExpired = verification.expiresAt < new Date();
    if (isTokenExpired) {
      return res.status(401).json({ message: "Token expired" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Unauthorized" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }   
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    user.password = newPassword;
    await user.save();
    await Verification.findByIdAndDelete(verification._id);
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}