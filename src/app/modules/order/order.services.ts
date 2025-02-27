/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { Orders } from "./order.model";
import { CartItem, OrderData } from "./orderInterface";
import { AuthUser } from "../auth/auth.model";
import { Types } from "mongoose";
import axios from "axios";
import { Request } from "express";
import { SurjoPayAuthResponse, surjoPayConfig } from "../../config";

export const getAuthToken = async (): Promise<SurjoPayAuthResponse> => {
  try {
    const response = await axios.post(
      `${surjoPayConfig.SP_ENDPOINT}/get_token`,
      {
        username: surjoPayConfig.SP_USERNAME,
        password: surjoPayConfig.SP_PASSWORD
      }
    );

    if (!response.data.token) {
      throw new Error("No token found in response");
    }

    return response.data;
  } catch (error: any) {
    console.error("Auth token error:", error.response?.data || error);
    throw error;
  }
};

const orderProductService = async (req: Request, price: number) => {
  try {
    const orderId = Date.now().toString();

    console.log(price);

    try {
      const authResponse = await getAuthToken();

      const clientIp = req?.ip || req?.connection?.remoteAddress || "127.0.0.1";

      // Build callback URLs with ONLY your order ID
      const returnUrl = new URL(surjoPayConfig.SP_RETURN_URL);
      returnUrl.searchParams.append("internal_order_id", orderId);

      const cancelUrl = new URL(surjoPayConfig.SP_CANCEL_URL);
      cancelUrl.searchParams.append("internal_order_id", orderId);

      // 1. First prepare initial payment data without URLs
      const initialPaymentData = {
        prefix: surjoPayConfig.SP_PREFIX,
        token: authResponse.token,
        store_id: authResponse.store_id,
        order_id: orderId,
        return_url: returnUrl.toString(),
        cancel_url: cancelUrl.toString(),
        amount: 888,
        currency: "BDT",
        customer_name: "John Doe",
        customer_email: "md.likhonislam2x@gmail.com",
        customer_phone: "01700000000",
        customer_address: "Dhaka",
        customer_city: "Dhaka",
        customer_postcode: "1206",
        client_ip: clientIp
      };

      // 6. Make final payment request with complete data
      const finalPaymentResponse = await axios.post(
        `${surjoPayConfig.SP_ENDPOINT}/secret-pay`,
        initialPaymentData,
        {
          headers: {
            Authorization: `Bearer ${authResponse.token}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("Final payment response:", finalPaymentResponse?.data);

      return {
        paymentUrl: finalPaymentResponse?.data?.checkout_url,
        paymentId: finalPaymentResponse?.data?.sp_order_id
      };
    } catch (error) {
      console.error("Error initiating ShurjoPay payment:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error initiating ShurjoPay payment:", error);
    throw error;
  }
};

const callbackOrder = async (
  cartData: CartItem[],
  paymentDetails: Stripe.PaymentIntent,
  userId: string
): Promise<any[]> => {
  try {
    const { id: paymentId, amount, currency, status } = paymentDetails;

    // Verify the user exists
    const user = await AuthUser.isUserExistsById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Convert user ID to ObjectId
    const userIdObject = new Types.ObjectId(user._id);

    // Process each cart item into an order
    const orders = await Promise.all(
      cartData.map(async (item) => {
        // Ensure quantity is included in the order data
        const orderData: OrderData = {
          product: new Types.ObjectId(item._id), // Convert product ID to ObjectId
          quantity: item.quantity, // Add quantity from cartData
          totalAmount: amount / 100,
          currency,
          status: "Pending",
          paymentId,
          paymentStatus: status,
          user: userIdObject,
          orderDate: new Date()
        };

        // Create and save the order
        const order = new Orders(orderData);
        return await order.save();
      })
    );

    return orders;
  } catch (error) {
    console.error("Error processing orders:", error);
    throw error;
  }
};

// Calculate Revenue from Orders Services
const getTotalRevenueFromDB = async () => {
  const result = await Orders.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPrice" }
      }
    }
  ]);

  const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;
  return totalRevenue;
};

const getUserOrder = async (id: string) => {
  const user = await AuthUser.isUserExistsById(id);
  const orders = await Orders.find({ user: user._id })
    .populate("user")
    .populate("product");
  return orders;
};

export const ordersServices = {
  orderProductService,
  getTotalRevenueFromDB,
  callbackOrder,
  getUserOrder
};
