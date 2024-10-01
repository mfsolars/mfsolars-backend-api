const Product = require('../models/productModel');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middleware/asyncErrors');
const Features = require('../utils/Features');
const Usermodel = require('../models/userModel');


const createProduct = catchAsyncErrors(
    async (req, res, next) => {

        req.body.creator = req.user.id;

        const createProduct = await Product.create(req.body);

        res.status(201).json({
            success: true,
            createProduct: createProduct
        })
    }
);


const addProductToWishlist = catchAsyncErrors(async (req, res, next) => {
    const user = req.user;
    const productId = req.body.product;

    // Check product exists
    const productExists = user.wishlist.some(item => item.product.toString() === productId);

    if (productExists) {
        return res.status(400).json({
            success: false,
            message: 'Product already in wishlist'
        });
    }

    // Add product to wishlist
    user.wishlist.push({ product: productId });
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Product added to wishlist successfully'
    });
});


const addProductToCart = catchAsyncErrors(async (req, res, next) => {
    const user = req.user;
    const productId = req.body.product;

    // Check product exists
    const productExists = user.cart.some(item => item.product.toString() === productId);

    if (productExists) {
        return res.status(400).json({
            success: false,
            message: 'Product already in wishlist'
        });
    }

    // Add product to cart
    user.cart.push({ product: productId });
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Product added to cart successfully'
    });
});




const removeFromWishlist = catchAsyncErrors(async (req, res, next) => {
    const user = req.user;
    const productId = req.body.product; // Assuming req.body contains a product field with the product ID

    // Check if the product exists in the wishlist
    const productIndex = user.wishlist.findIndex(item => item.product.toString() === productId);

    if (productIndex === -1) {
        return res.status(400).json({
            success: false,
            message: 'Product not found in wishlist'
        });
    }

    // Remove the product from the wishlist
    user.wishlist.splice(productIndex, 1);
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Product removed from wishlist successfully'
    });
});

const removeFromCart = catchAsyncErrors(async (req, res, next) => {
    const user = req.user;
    const productId = req.body.product; // Assuming req.body contains a product field with the product ID

    // Check if the product exists in the wishlist
    const productIndex = user.cart.findIndex(item => item.product.toString() === productId);

    if (productIndex === -1) {
        return res.status(400).json({
            success: false,
            message: 'Product not found in cart'
        });
    }

    // Remove the product from the cart
    user.cart.splice(productIndex, 1);
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Product removed from cart successfully'
    });
});

const getCart = catchAsyncErrors(async (req, res, next) => {
    await req.user.populate('cart.product');
    const cart = req.user.cart.map(item => item.product);

    res.status(200).json({
        success: true,
        cart: cart
    });
});
const getWishlist = catchAsyncErrors(async (req, res, next) => {
    await req.user.populate('wishlist.product');
    const wishlist = req.user.wishlist.map(item => item.product);

    res.status(200).json({
        success: true,
        wishlist: wishlist
    });
});





// get method for getting all products from database
const getProducts = catchAsyncErrors(
    async (req, res) => {
        const resultsPerPage = 8;
        const productsCount = await Product.countDocuments();  // yeh line of code hai jo database se count kr k products ki total count nikal raha hai
        let features = new Features(Product.find(), req.query).search().filter().pagination(resultsPerPage);         // yeh line of code hai jo Features.js ka class call kara ga aur uss ka functions call kara ga
        const products = await features.query;
        res.status(200).json({
            success: true,
            products: products,
            productsCount: productsCount,
            resultsPerPage: resultsPerPage
        })
    }
);


const getAllProducts = catchAsyncErrors(
    async (req, res) => {

        let Products = await Product.find();

        await Usermodel.populate(Products, {
            path: 'creator',
            select: 'name'
        });


        res.status(200).json({
            success: true,
            products: Products
        })
    }
);





// update product in database --------- This must be admin access only

const updateProduct = catchAsyncErrors(
    async (req, res, next) => {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return next(new ErrorHandler("Product not found", 500));
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {    // ye function id ka use kr k product ko find krta hai and then update krta hai
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        res.status(200).json({
            success: true,
            updatedProduct: product
        })



    }
);








// delete product in database --------- This must be admin access only

const DeleteProduct = catchAsyncErrors(
    async (req, res, next) => {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return next(new ErrorHandler("Product not found", 404));
        }


        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "product deleted successfully"
        })



    }
);






// get product details by id


const getProductDetails = catchAsyncErrors(
    async (req, res, next) => {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return next(new ErrorHandler("Product not found", 404));
        }


        res.status(200).json({
            success: true,
            product: product
        })
    }
);


// review Product 

const reviewProduct = catchAsyncErrors(
    async (req, res, next) => {
        const { rating, comment, productId } = req.body;
        const newReview = {
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment
        }
        let existing_product = await Product.findById(productId);
        if (!existing_product) {
            return next(new ErrorHandler("Product not found", 404));
        }
        let isReviewed = existing_product.reviews.find(
            (review) => review.user.toString() === req.user._id.toString()
            // review.user q k review ka user id aik object id hai aur req.user._id aik string hai to hm ne dono ko string me convert kr k compare kia hai
        );
        if (isReviewed) {
            existing_product.reviews.forEach(review => {
                if (review.user.toString() === req.user._id.toString()) {
                    review.comment = comment;
                    review.rating = rating;
                }
            });
        } else {
            existing_product.reviews.push(newReview);
            existing_product.numberOfReviews = existing_product.reviews.length;
        }
        let avg = 0;
        // taking rating average 
        existing_product.reviews.map((item) => (avg += item.rating))
        existing_product.ratings = avg / existing_product.reviews.length;
        // yeh line of code hai jo rating ka average nikal raha hai
        await existing_product.save({ validateBeforeSave: false });
        res.status(200).json({
            success: true,
            message: "Review added successfully"
        })

    })


// get all product reviews
const getAllProductReviews = catchAsyncErrors(
    async (req, res, next) => {
        const product = await Product.findById(req.query.productid);
        if (!product) {
            return next(new ErrorHandler("Product not found", 404));
        }
        res.status(200).json({
            success: true,
            reviews: product.reviews
        })
    })

// delete product reveiw by id
const deleteReview = catchAsyncErrors(
    async (req, res, next) => {
        const product = await Product.findById(req.query.productid);
        if (!product) {
            return next(new ErrorHandler("Product not found", 404));
        }
        const reviews = product.reviews.filter(review => review._id.toString() !== req.query.reviewid.toString());
        if (JSON.stringify(reviews) === JSON.stringify(product.reviews)) {
            return next(new ErrorHandler("Review not found", 404));
        }
        let avg = 0;
        // taking rating average
        reviews.map((item) => (avg += item.rating))
        product.ratings = avg / reviews.length;

        product.reviews = reviews;
        product.numberOfReviews = reviews.length;
        await product.save({ validateBeforeSave: false });
        res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        })
    }
)




module.exports = {
    DeleteProduct,
    getProductDetails,
    updateProduct,
    getProducts,
    createProduct,
    reviewProduct,
    getAllProductReviews,
    deleteReview,
    addProductToWishlist,
    removeFromWishlist,
    getWishlist,
    getCart,
    addProductToCart,
    removeFromCart,
    getAllProducts
}