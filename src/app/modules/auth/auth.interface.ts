import { Model, Types } from "mongoose";
import { USER_ROLE } from "./auth.constant";

export interface TUser {
  id: string;
  _id?: Types.ObjectId;
  name: string;
  age?: string;
  gender?: "Male" | "Female";
  blood?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  phone?: string;
  email: string;
  currentCountry?: string;
  currentCity?: string;
  currentStreet?: string;
  permanentCountry?: string;
  permanentCity?: string;
  permanentStreet?: string;
  password: string;
  role?: "admin" | "user";
  isBlocked?: boolean;
}

export interface UserModel extends Model<TUser> {
  isUserExistsById(id: string): Promise<TUser>;
  isUserExistsByEmail(email: string): Promise<TUser>;
  isPasswordMatch(
    plainTextPassword: string,
    hashPassword: string
  ): Promise<boolean>;
}

export type TUserLogin = {
  email: string;
  password: string;
};

export type TUserRole = keyof typeof USER_ROLE;
