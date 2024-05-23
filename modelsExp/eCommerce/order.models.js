import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        quantity: {
            type: Number,
            required: true,
        }
    }
)

const orderSchema = new mongoose.Schema(
    {
        orderPrice: {
            type: Number,
            required: true,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        orderItems: {
            type: [orderItemSchema],
            // both is same
            // type: [
            //     {
            //         productId: {
            //             type: mongoose.Schema.Types.ObjectId,
            //             ref: "Product"
            //         },
            //         quantity: {
            //             type: Number,
            //             required: true,
            //         }
            //     }
            // ]
        },
        address: {
            type: String,
            required: true
        },
        status: {
            type: String,
            default: "PENDING",
            enum: ["PENDING", "CANCELLED", "DELIVERED"]
        }
    },
    { timestamps: true }
)

export const Order = mongoose.model("Order", orderSchema);