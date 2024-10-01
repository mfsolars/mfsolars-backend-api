// importing modules to use in this file
const express = require("express");
const {
    getProducts,
    createProduct,
    updateProduct,
    DeleteProduct,
    getProductDetails,
    reviewProduct,
    getAllProductReviews,
    deleteReview,
    addProductToWishlist,
    removeFromWishlist,
    getWishlist,
    addProductToCart,
    removeFromCart,
    getCart,
    getAllProducts 
} = require("../controllers/ProductController");

const { AuthenticateUser, isUserAdmin } = require("../middleware/Authenticate");

// -------------------------------------------------------
// Router Creation 
const router = express.Router();  // router ka object bana lia    ab routes bna skta hain

router.route("/products").get(getProducts);
router.route("/products/all").get(AuthenticateUser,isUserAdmin("admin"),getAllProducts);
router.route("/products/:id").get(getProductDetails);  // router.route("/api/mfsolars/v1/products/:id").get(getProductDetails);  // mtlb jb iss url pr get request aii gi tou getProductDetails function chalay ga

router.route("/products/new").post(AuthenticateUser, isUserAdmin("admin"), createProduct);  // router.route("/api/mfsolars/v1/products/:id").post(createProduct);  // mtlb jb iss url pr post request aii gi tou createProduct function chalay ga
router.route("/products/:id").put(AuthenticateUser, isUserAdmin("admin"), updateProduct).delete(AuthenticateUser, isUserAdmin("admin"), DeleteProduct);  // router.route("/api/mfsolars/v1/products/:id").put(updateProduct).delete(DeleteProduct);  // mtlb jb iss url pr put request aii gi tou updateProduct function chalay ga

// reviews part `
router.route("/product/review").post(AuthenticateUser, reviewProduct).get(getAllProductReviews).delete(AuthenticateUser, deleteReview);;  // router.route("/api/mfsolars/v1/reviews").post(createReview); 
// mtlb jb iss url pr post request aii gi tou createReview function chalay ga
router.route("/product/wishlist").post(AuthenticateUser, addProductToWishlist).delete(AuthenticateUser, removeFromWishlist).get(AuthenticateUser, getWishlist); 
router.route("/product/cart").post(AuthenticateUser, addProductToCart).delete(AuthenticateUser, removeFromCart).get(AuthenticateUser, getCart); 
// -------------------------------------------------------
// Exporting Router
module.exports = router;    // router ko export kia hai