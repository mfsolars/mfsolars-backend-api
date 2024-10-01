const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    Shippinginfo: {
        address: {
            type: String,
            required: [true, 'Please enter your address']
        },
        city: {
            type: String,
            required: [true, 'Please enter your city'],
            default: "Gauteng"
        },
        postalCode: {
            type: String,
            required: [true, 'Please enter your postal code']
        },
        country: {
            type: String,
            required: [true, 'Please enter your country'],
            default: "South Africa"
        },
        phoneno: {
            type: Number,
            required: [true, 'Please enter your phone number']
        },
    },
    orderItems: [
        {
            name: {
                type: String,
                required: [true, 'Please enter product name']
            },
            qty: {
                type: Number,
                required: [true, 'Please enter product quantity']
            },
            image: {
                type: String,
                required: [true, 'Please enter product image']
            },
            price: {
                type: Number,
                required: [true, 'Please enter product price']
            },
            product: {
                type: mongoose.Schema.ObjectId,
                required: true,
                ref: 'Product'
            },
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'User'
    },
    paymentinfo: {
        id: {
            type: String,
        },
        status: {
            type: String,
            required: true
        },

    },
    paidAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    orderStatus: {
        type: String,
        required: true,
        default: 'Processing'
    },
    deliveredAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }

}
)




module.exports = mongoose.model('Order', orderSchema)