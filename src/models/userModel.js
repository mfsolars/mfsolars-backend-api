const mongoose = require('mongoose');
const bycrypter = require('bcryptjs');
const validator = require('validator');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String, required: [true, "Please enter your name"],
        minLength: [4, "Name must be at least 4 characters"],
        maxLength: [30, "Name cannot exceed 30 characters"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        validate: [validator.isEmail, "Please enter a valid email"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minLength: [8, "Password must be at least 8 characters"],
        select: false,        // yeh confirm kara ga k data fetch ka doraan password show nahi ho --- security purpose
    },
    wishlist: [
        {
            product: {  // yeh product ka object hai jis mai product ki id save ho gi
                type: mongoose.Schema.ObjectId,
                ref: 'Product',
                required: true,
            }
        },
    ],  // yeh array hai jis mai user ki wishlist save ho gi
    cart: [
        {
            product: {  // yeh product ka object hai jis mai product ki id save ho gi
                type: mongoose.Schema.ObjectId,
                ref: 'Product',
                required: true,
            }
        },
    ],  // yeh array hai jis mai user ki cart items save ho gi
    role: {
        type: String,
        default: 'user',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    resetPasswordToken: String,         // yeh token save kara ga jab user password reset kara ga to uss token ko save kara ga 
    resetPasswordExpire: Date,          // yeh token ki expiry date save kara ga so that user ko pata chalay k token expire ho gaya hai ya nahi
});

userSchema.pre('save', async function (next) {

    if (!this.isModified('password')) {
        // yeh check kara ga k agar password change hua hai to hash kara ga

        next();
    }

    this.password = await bycrypter.hash(this.password, 10);      // yeh password ko hash kara ga
})

// reset password token method 
userSchema.methods.GenerateResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(18).toString('hex');  // yeh token generate kara ga 
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');  // yeh token ko hash kara ga 

    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;  // yeh token ki expiry date set kara ga 10 minutes k baad expire ho jaye ga

    return resetToken;  // yeh token ko return kara ga 
}


module.exports = mongoose.models.User || mongoose.model('User', userSchema);