/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Schema, model } from 'mongoose';
import { OrderData } from './orderInterface';
import { TProduct } from '../products/product.interface';


const OrderSchema = new Schema<OrderData>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Products',
      required: true, 
    },
    quantity: {
      type: Number,
      required: true, 
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Shipped', 'Pending'],
      default: 'Pending',
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['succeeded', 'failed', 'pending'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.pre('save', async function (next) {
  try {
    const order = this as OrderData; 
    const productId = order.product;
    const orderQuantity = order.quantity;
    const product = await mongoose.model<TProduct>('Products').findById(productId);

    if (!product) {
      const error = new Error('Product not found');
      (error as any).statusCode = 404;
      return next(error);
    }

    if (product.inStock < orderQuantity) {
      const error = new Error('Insufficient stock for the product');
      (error as any).statusCode = 400; 
      return next(error);
    }

    product.inStock -= orderQuantity;
    if (product.stock !== undefined) {
      product.stock = product.inStock > 0;
    }

    await product.save();
    next();
  } catch (error: any) {
    console.error('Error in pre-save middleware:', error);
    next(error);
  }
});


export const Orders = model<OrderData>('Orders', OrderSchema);
