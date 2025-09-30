import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api_error.js";
import { ApiResponse } from "../utils/api_response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";

const registerUser = asyncHandler(async(req, res) => {
    const { email, username, password, role } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
        throw new ApiError(400, "Username is required and must be a non-empty string");
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username: username.toLowerCase() }]
    })

    if (existedUser) {
        throw new ApiError(400, "User already exists with this email or username");
    }

    const sanitizedUsername = username.trim().toLowerCase();
    
    const user = await User.create({
        email,
        username: sanitizedUsername,
        password,
        isEmailVerified: false
    });

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTempararyToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    
    await user.save({ validateBeforeSave: false });

    await sendEmail({
        to: user?.email,
        subject: "Verify your email",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        )
    })

    const createdUser =  await User.findById(user._id).select("-password -refreshToken  -emailVerificationToken -emailVerificationExpiry")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user");
    }

    return res.status(201).json(new ApiResponse(200, {user: createdUser}, "User registered successfully. Please verify your email to activate your account"));

})

const generataAccessAndRefreshTokens = async (userId) => {
    try {
        await User.findById(userId)
        const AccessToken = user.geneateAccessToken();
        const RefreshToken = user.geneateRefreshToken();

        user.RefreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { AccessToken, RefreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access tokens");
    }
}


export { registerUser };
