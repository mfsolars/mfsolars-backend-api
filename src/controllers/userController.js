const User = require('../models/userModel');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middleware/asyncErrors');
const sendTokenResponse = require('../utils/responseWithToken');
const sendEmail = require('../utils/sendEmail');

const bcrypter = require('bcryptjs');
const crypto = require('crypto');



const registerUser = catchAsyncErrors(
    async (req, res, next) => {

        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return next(new ErrorHandler("Please fill all the fields", 400));
        }


        const Is_user_exist = await User.findOne({ email });
        if (Is_user_exist) {
            return next(new ErrorHandler("User already exists", 400));
        }
        const usernew = await User.create({
            name, email, password, role
        }
        );
        // console.log("User created successfully");
        sendTokenResponse(usernew, 201, "User Registered successfully", res);
    })




const loginUser = catchAsyncErrors(
    async (req, res, next) => {

        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ErrorHandler("Please enter email and password", 400));
        }
        const existingUser = await User.findOne({ email })
        if (!existingUser) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }

        const user_password_hashed = await User.findOne({ email }).select("+password");     // this return the object with password selected 

        const is_validUser = await bcrypter.compare(password, user_password_hashed.password);
        if (is_validUser) {
            return sendTokenResponse(existingUser, 200, "User Logged in successfully", res);
        }


        return next(new ErrorHandler("Un-Authorized Access", 401));

    }
)



const logoutUser = catchAsyncErrors(
    async (req, res, next) => {
        res.clearCookie("token");
        res.status(200).json({
            success: true,
            message: "User Logged out successfully"
        })
    }
)

const forgetPassword = catchAsyncErrors(
    async (req, res, next) => {

        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return next(new ErrorHandler("User not found with this email", 404));
        }
        const resetToken = user.GenerateResetPasswordToken();

        await user.save({ validateBeforeSave: false });
        const resetLink = `${req.protocol}://${req.get("host")}/my-account/reset-password/${resetToken}`;
        const email_message = `Follow link to reset your password. \n\n${resetLink}\n\nIf you have not requested this email then please ignore it`;
        try {

            await sendEmail({
                email: user.email,
                subject: "MF-Solars Password Recovery",
                message: email_message
            });
            res.status(200).json({
                success: true,
                message: `Email sent to ${user.email} successfully.\n Please check your email and if you haven't requested this email then please ignore it`
            })
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return next(new ErrorHandler("Email could not be sent", 500));

        }
    }
)



// reset password
const resetPassword = catchAsyncErrors(
    async (req, res, next) => {

        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");       // url ma sa token uthain ga q k forgot password sa url ma token bhaja tha 
        const user = await User.findOne({                 // agr uss token sa user mil jata ha to uska password reset ho jaye ga
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }       // ye dekha ga k ziada time toh nahi ho gya token ko expire hona ma
        });

        if (!user) {
            return next(new ErrorHandler("Password reset token is invalid or has been expired", 400));
        }

        if (req.body.password !== req.body.confirmPassword) {
            return next(new ErrorHandler("Password does not match", 400));
        }
        user.password = req.body.password;                                                              // ab user ka password change ho jaye ga    jo body ma pass tha wo schema ma challa gya ha
        user.resetPasswordToken = undefined;                                                          // qk password change ho gya ha to token expire ho jaye ga
        user.resetPasswordExpire = undefined;                                                         // token ka kaam khatam tou expire b kr dia ha
        user.save();                                                                                                    // kaam kr ka save kr dia ha object ko
        sendTokenResponse(user, 200, "Password reset successfully", res);       // database ma sb save ho gya ha ab user ko token bhej dia ha
        // mtlb user ko kya pta k uska password change ho gya ha       tou iss lia response bhaj dein ga q k uss ka function bnaya hua iss lia aisa kya wrna res.status(200).json({success: true, message: "Password reset successfully"}) b likh sktay thay
    })


// get user details 
const getUserDetails = catchAsyncErrors(
    async (req, res, next) => {
        const user = await User.findById(req.user.id);                              // req.user.id is coming from Authenticate.js      mtlb jo user login ha uska id ha jisa hm na token bna k bheja tha aur req ka andr save kia tha
        res.status(200).json({
            success: true,
            user
        })
    });

// update password
const updatePassword = catchAsyncErrors(
    async (req, res, next) => {
        const user = await User.findById(req.user.id).select("+password");      // user ka password select kr rha ha q k user ka password select nahi ho rha tha
        const isMatch = await bcrypter.compare(req.body.oldPassword, user.password);      // user ka password match ho rha ha ya nahi
        if (!isMatch) {
            return next(new ErrorHandler("Old password is incorrect", 400));
        }
        if (req.body.password !== req.body.confirmPassword) {
            return next(new ErrorHandler("Password does not match", 400));
        }
        user.password = req.body.password;              // user ka password change ho jaye ga
        await user.save();                                          // save kr dia ha
        sendTokenResponse(user, 200, "Password updated successfully", res);       // user ko token bhej dia ha
    }// user ko kya pta k uska password change ho gya ha       tou iss lia response bhaj dein ga q k uss ka function bnaya hua iss lia aisa kya wrna res.status(200).json({success: true, message: "Password reset successfully"}) b likh sktay thay
)



const updateProfile = catchAsyncErrors(
    async (req, res, next) => {
        const newUserData = {
            name: req.body.name,
            email: req.body.email
        };
        await User.findByIdAndUpdate(req.user.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        res.status(200).json({
            success: true
        })
    }
)




// admin access only
const getAllUsers = catchAsyncErrors(
    async (req, res, next) => {
        const users = await User.find();
        res.status(200).json({
            success: true,
            users: users
        })
    }
);

// get user by id  admin access only
const getSinglelUser = catchAsyncErrors(
    async (req, res, next) => {
        const user = await User.findById(req.params.id);
        if (!user) {
            return next(new ErrorHandler(`User does not found with id: ${req.params.id}`, 404));
        }
        res.status(200).json({
            success: true,
            users: user
        })
    }
);


// admin routes for user update and delete
const updateProfile_admincall = catchAsyncErrors(
    async (req, res, next) => {
        const newUserData = {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role
        };
        const existingUser = await User.findByIdAndUpdate(req.params.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });
        if (!existingUser) {
            return next(new ErrorHandler(`User does not found with id: ${req.params.id}`, 404));
        }

        res.status(200).json({
            success: true,
            message: `User ${existingUser.name}'s credentials updated successfully`
        })
    }
)



const deleteUser_admincall = catchAsyncErrors(
    async (req, res, next) => {
        const existingUser = await User.findById(req.params.id);
        if (!existingUser) {
            return next(new ErrorHandler(`User does not found with id: ${req.params.id}`, 404));
        }
        await existingUser.deleteOne();
        res.status(200).json({
            success: true,
            message: `User ${existingUser.name} deleted successfully`
        })
    }
)


module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    forgetPassword,
    resetPassword,
    getUserDetails,
    updatePassword,
    updateProfile,
    getAllUsers,
    getSinglelUser,
    updateProfile_admincall,
    deleteUser_admincall
};