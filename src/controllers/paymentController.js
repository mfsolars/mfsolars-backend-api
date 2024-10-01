const catchAsyncErrors = require('../middleware/asyncErrors');
const Paystack = require('paystack-api')('sk_test_13baab920f5d20864ec628ca927b67a196a3dfac'); // Paystack secret key

const Makepayment = catchAsyncErrors(async (req, res, next) => {


    const { email, amount } = req.body;

    // Initialize Paystack transaction
    const myPayment = await Paystack.transaction.initialize({
        email: email, 
        amount: amount,
        currency: 'ZAR', // Currency is ZAR for South Africa
        metadata: {
            company: "mf-solars", 
        },
    });

    res.status(200).json({
        success: true,
        authorization_url: myPayment.data.authorization_url, 
        reference: myPayment.data.reference, 
    });


});



const verifyPayment = catchAsyncErrors(async (req, res, next) => {
    const reference = req.params.reference;
    console.log(reference, "backend");

    if (!reference) {
        return res.status(400).json({ success: false, message: "Reference is missing" });
    }

    try {
        const verification = await paystack.transaction.verify({ reference });
        console.log(verification);

        // Check if verification was successful
        if (verification.data.status === 'success') {
            return res.status(200).json({ success: true, message: 'Payment successful', data: verification });
        } else {
            return res.status(400).json({ success: false, message: 'Payment failed', data: verification });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
});


module.exports = { Makepayment, verifyPayment};