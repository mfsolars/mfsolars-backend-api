const { generateTokenFromid } = require('./generateToken');

const sendTokenResponse = (User_current, statusCode, message, res) => {
    const options = {
    httpOnly: true, // Recommended for security
    sameSite: 'None', // Ensure this is a string and case-sensitive
    secure: true, // This ensures the cookie is only sent over HTTPS
};
    const token_for_user = generateTokenFromid(User_current._id);
    res.cookie('token', token_for_user, options);
    res.status(statusCode).json({
        success: true,
        message: message,
        userlogged: User_current
    })
}

module.exports = sendTokenResponse;
