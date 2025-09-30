import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";

// User Schema for mongodb
const userSchema = new Schema({
    avatar: {
        type: {
            url: String,
            localPath: String,
        },
        default: {
            url: `https://plcacehold.co/200x200`,
            localPath: "",
        }
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        minlength: [3, "Username must be at least 3 characters long"],
        match: [/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores and hyphens"]
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String,
    },
    forgotPasswordToken: {
        type: String,
    },
    passwordTokenExpiry: {
        type: Date
    },
    emailVerificationToken: {
        type: String,
    },
    emailVerificationExpiry: {
        type: Date
    }
}, 
{ 
    timestamps: true 
}
);

// Pre-save middleware for validation and password hashing
userSchema.pre("save", async function (next){
    // Validate username is not null or empty
    if (!this.username || typeof this.username !== 'string' || this.username.trim().length === 0) {
        next(new Error('Username cannot be null or empty'));
        return;
    }
    
    // Password hashing
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    
    next();
})

// Method to compare password
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

// Method to generate access token
userSchema.methods.generateAccessToken = function() {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
    }, 
    process.env.ACCESS_TOKEN_SECRET, 
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
)}

// Method to generate refresh token
userSchema.methods.geneateRefreshToken = function(){
    return jwt.sign({
        _id: this._id,
    }, 
    process.env.REFRESH_TOKEN_SECRET, 
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
)}

userSchema.methods.generateTempararyToken = function() {
    const unHashedToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(unHashedToken).digest("hex");
    const tokenExpiry = Date.now() + 20 * 60 * 1000; // 20 minutes

    return { unHashedToken, hashedToken, tokenExpiry };
}

export const User = mongoose.model("User", userSchema);
