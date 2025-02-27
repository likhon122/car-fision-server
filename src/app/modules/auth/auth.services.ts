/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { TUser, TUserLogin } from "./auth.interface";
import { AuthUser } from "./auth.model";
import AppError from "../../error/AppError";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../../config";
import { createToken } from "./auth.utils";
import { generateUserId } from "../../utils/generateUserId";

// create user services
const createUserIntoDB = async (payload: TUser) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    payload.id = await generateUserId();
    const existingUser = await AuthUser.findOne({
      email: payload.email
    }).session(session);
    if (existingUser) {
      throw new AppError(400, "Email is already registered.");
    }
    const newUser = await AuthUser.create([payload], { session });

    if (!newUser) {
      throw new AppError(400, "Failed to create user !");
    }
    const user = newUser[0];
    // create token and sent to the user
    const jwtPaylod = {
      id: user.id,
      role: user.role as string
    };

    const accessToken = createToken(
      jwtPaylod,
      config.jwt_access_secret as string,
      config.jwt_access_expires_in as string
    );
    const refreshToken = createToken(
      jwtPaylod,
      config.jwt_refresh_secret as string,
      config.jwt_refresh_expires_in as string
    );

    await session.commitTransaction();
    await session.endSession();
    return { accessToken, refreshToken };
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(400, error);
  }
};

// login user services
const loginUserServices = async (payload: TUserLogin) => {
  const user = await AuthUser.isUserExistsByEmail(payload.email);
  if (!user) {
    throw new AppError(404, "This user is not found !");
  }
  const passMatch = await AuthUser.isPasswordMatch(
    payload.password,
    user.password
  );

  if (!passMatch) {
    throw new AppError(403, "Invalid credentials");
  }

  const isBlocked = user.isBlocked;
  if (isBlocked) {
    throw new AppError(403, "This user is blocked !");
  }

  // create token and sent to the user
  const jwtPaylod = {
    id: user.id,
    role: user.role as string
  };

  const accessToken = createToken(
    jwtPaylod,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );
  const refreshToken = createToken(
    jwtPaylod,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );

  return { accessToken, refreshToken };
};

// refresh token services
const refreshToken = async (token: string) => {
  const decoded = jwt.verify(
    token,
    config.jwt_refresh_secret as string
  ) as JwtPayload;

  const { id } = decoded;
  const user = await AuthUser.isUserExistsById(id);

  if (!user) {
    throw new AppError(404, "This user is not found !");
  }

  if (user?.isBlocked) {
    throw new AppError(401, "This user is blocked !");
  }

  const jwtPayload = {
    id: user.id,
    role: user.role as string
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  return {
    accessToken
  };
};

const getMe = async (userId: string, role: string) => {
  console.log(role);
  const result = await AuthUser.findOne({ id: userId });

  return result;
};

const updateUserInDB = async (userId: string, payload: Partial<TUser>) => {
  console.log(userId, payload);
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Update the user directly in the database while filtering undefined fields
    const updatedUser = await AuthUser.findOneAndUpdate(
      { id: userId },
      { $set: payload },
      { new: true, session, runValidators: true, omitUndefined: true }
    );

    if (!updatedUser) {
      throw new AppError(404, "User not found or update failed!");
    }

    await session.commitTransaction();
    await session.endSession();

    return { message: "User updated successfully", user: updatedUser };
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(400, error);
  }
};
export const authUserServices = {
  createUserIntoDB,
  loginUserServices,
  refreshToken,
  getMe,
  updateUserInDB
};
