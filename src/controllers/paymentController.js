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
    const { reference } = req.body;

  try {
      const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET}`,
      },
    });

    if (response.data.data.status === 'success') {
      // success
      res.json({ status: 'success', data: response.data });
    
    } else {
        // failed
      res.json({ status: 'failed', data: response.data });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ status: 'error', message: 'Payment verification failed.' });
  }
});


module.exports = { Makepayment, verifyPayment};