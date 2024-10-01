let mongoose = require('mongoose');


const productSchema = mongoose.Schema({  // Schema is a class in mongoose     means structure of product what product will contain in its object
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please enter product description'],
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        maxLength: [8, 'Product price cannot exceed 8 characters'],
        default: 0.0
    },
    ratings: {
        type: Number,
        default: 0
    },
    productImages: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            },
        }   // array of objects of product images      tasveer ka url aur public id   mtlb aik normal url hona aur aik public id hona jo hm cloudinary pr upload karein ga aur us ka url hm yahan save karein ga jo public url banay ga cloudinary pr
    ],
    
    category: {
        type: String,
        required: [true, 'Please enter product category'],
    },
    Stock: {
        type: Number,
        required: [true, 'Please enter product stock'],
        maxLength: [3, 'Product stock cannot exceed 3 characters'],
        default: 1
    },
    numberOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true,
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    creator: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now   // Date.now is a function which returns current date and time
    }
}
);


module.exports = mongoose.model('Product', productSchema);   // Product is the name of model and productSchema is the schema of product model