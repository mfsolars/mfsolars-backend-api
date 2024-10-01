const SolarInstallment = require('../models/solarinstallmentModel');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middleware/asyncErrors');



// Create a new contact in database

const createInstallationRequest = catchAsyncErrors(
    async (req, res, next) => {
        if (!req.body.name || !req.body.email || !req.body.message || !req.body.phone || !req.body.address) {
            return next(new ErrorHandler("Please fill all the fields", 400));
        }
        const contact = await SolarInstallment.create(req.body);
        res.status(201).json({
            success: true,
            message: "Request sent successfully",
        })
    }
)

module.exports = { createInstallationRequest }