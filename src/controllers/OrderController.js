const Order = require('../models/ordersModel');
const Product = require('../models/productModel');              // yeh line of code hai jo product model ko import kar raha hai
const catchAsyncErrors = require("../Middleware/asyncErrors");
const ErrorHandler = require("../Utils/errorHandler");
const User_Model = require('../models/userModel');


const createOrder = catchAsyncErrors(
    async (req, res, next) => {
        const {
            Shippinginfo,
            orderItems,
            paymentinfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice
        } = req.body;

        const NewOrder = await Order.create(
            {
                Shippinginfo,
                orderItems,
                paymentinfo,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice,
                user: req.user._id
            }
        )
        if (!NewOrder) {
            return next(new ErrorHandler('Order not created', 404))
        }
        res.status(200).json({
            success: true,
            message: 'Order created successfully',
        })
    })


// get order details - all orders for a Admin

const getAllOrders = catchAsyncErrors(
    async (req, res, next) => {
        const orders = await Order.find();
        if (!orders) {
            return next(new ErrorHandler('No orders found', 404));
        }
        let totalAmount = 0;
        for (let order of orders) {
            totalAmount += Number(order.totalPrice);
            await User_Model.populate(order, { path: 'user', select: 'name' });
        }
        res.status(200).json({
            success: true,
            total: totalAmount,
            totalOrders: orders.length,
            Orders: orders
        })
    }
)


// get order details - one order for a user

const getSingleOrder = catchAsyncErrors(
    async (req, res, next) => {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return next(new ErrorHandler(`Requested order can't be found`, 404))
        }
        res.status(200).json({
            success: true,
            orders: order
        })
    }
)

// get order details - all users orders for a user
const getMyOrders = catchAsyncErrors(
    async (req, res, next) => {
        const orderlist = await Order.find({ user: req.user._id });

        if (!orderlist) {
            return next(new ErrorHandler(`Your have an empty cart.`, 404));
        }
        res.status(200).json({
            success: true,
            OrderList: orderlist,
            user: req.user.name
        })
    }
)

// update order details - one order for a user
const updateOrderStatus = catchAsyncErrors(
    async (req, res, next) => {
        const existingOrder = await Order.findById(req.params.id);
        if (!existingOrder) {
            return next(new ErrorHandler(`Requested order can't be found`, 404));
        }
        if (existingOrder.orderStatus === "Delivered") {
            return next(new ErrorHandler(`Order has been delivered already`, 400));
        }

        existingOrder.orderItems.forEach(async (order) => {
            await updateStock(order.product, order.qty, next);
        })
        existingOrder.orderStatus = req.body.orderStatus;
        if (req.body.orderStatus === 'Delivered') {
            existingOrder.deliveredAt = Date.now();
        }
        existingOrder.save({ validateBeforeSave: false });
        res.status(200).json({
            success: true,
            message: 'Order updated successfully',
        })
    }
)


async function updateStock(id, qty, next) {
    const product = await Product.findById(id);
    if (!product) {
        return next(new ErrorHandler(`Product not found`, 404))
    }
    product.Stock = product.Stock - qty;
    await product.save({ validateBeforeSave: false });
}





// delete order - only for admin
const delete_Order = catchAsyncErrors(
    async (req, res, next) => {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return next(new ErrorHandler(`Requested order can't be found`, 404))
        }
        res.status(200).json({
            success: true,
            message: 'Order deleted successfully',
        })
    }
)



module.exports = {
    createOrder,
    getAllOrders,
    getSingleOrder,
    updateOrderStatus,
    getMyOrders,
    delete_Order
}