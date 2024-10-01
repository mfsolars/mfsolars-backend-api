const Contact = require('../models/contactModel');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middleware/asyncErrors');



// Create a new contact in database

const createContact = catchAsyncErrors(
    async (req, res, next) => {
        if (!req.body.name || !req.body.email || !req.body.message || !req.body.phone) {
            return next(new ErrorHandler("Please fill all the fields", 400));
        }
        const contact = await Contact.create(req.body);
        res.status(201).json({
            success: true,
            message: "Response sent successfully",
        })
    }
)

module.exports = { createContact }