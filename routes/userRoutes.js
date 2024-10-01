const { registerUser,
    loginUser,
    logoutUser,
    forgetPassword,
    resetPassword,
    getUserDetails,
    updatePassword,
    updateProfile,
    getSinglelUser,
    getAllUsers,
    updateProfile_admincall,
    deleteUser_admincall } = require('../controllers/userController');

const express = require('express');
const { AuthenticateUser, isUserAdmin } = require('../middleware/Authenticate');
const user_router = express.Router();

// Path: backend/Routes/userRoutes.js
user_router.route('/register').post(registerUser);
user_router.route('/login').post(loginUser);
user_router.route('/logout').get(logoutUser)
user_router.route('/forgetpassword').post(forgetPassword)
user_router.route('/resetpassword/:token').put(resetPassword)
// user authorities
user_router.route('/me').get(AuthenticateUser, getUserDetails);
user_router.route('/me/password/update').put(AuthenticateUser, updatePassword);
user_router.route('/me/update').put(AuthenticateUser, updateProfile);
// admin authorities 
user_router.route('/admin/users').get(AuthenticateUser, isUserAdmin("admin"), getAllUsers);
user_router.route('/admin/user/:id').get(AuthenticateUser, isUserAdmin("admin"), getSinglelUser);
user_router.route('/admin/update/user/:id').put(AuthenticateUser, isUserAdmin("admin"), updateProfile_admincall);
user_router.route('/admin/drop/user/:id').delete(AuthenticateUser, isUserAdmin("admin"), deleteUser_admincall);





module.exports = user_router;