const express = require('express');
const orderRouter = express.Router();

const { createOrder,
    getAllOrders,
    getSingleOrder,
    updateOrderStatus,
    getMyOrders,
    delete_Order
} = require('../controllers/orderController');

const { AuthenticateUser, isUserAdmin } = require("../middleware/Authenticate");

orderRouter.route("/order/create").post(AuthenticateUser, createOrder);
orderRouter.route("/order/orders").get(AuthenticateUser, isUserAdmin('admin'), getAllOrders);
orderRouter.route("/order/:id").get(AuthenticateUser, isUserAdmin('admin'), getSingleOrder).delete(AuthenticateUser, isUserAdmin('admin'), delete_Order).put(AuthenticateUser, isUserAdmin('admin'), updateOrderStatus);
orderRouter.route("/order/orders/me").get(AuthenticateUser, getMyOrders);




module.exports = orderRouter;