import { Types } from "mongoose";

export interface TOrder {
  email: string;
  product: Types.ObjectId;
  quantity: number;
  totalPrice: number;
  created_at?: Date;
  updated_at?: Date;
}
export type CartItem = {
  _id: string;
  quantity: number;
};

export type OrderData = {
  product: Types.ObjectId;
  status: "Pending" | "Shipped";
  totalAmount: number;
  currency: string;
  paymentId: string;
  paymentStatus: string;
  quantity: number;
  user: Types.ObjectId;
  orderDate: Date;
};
