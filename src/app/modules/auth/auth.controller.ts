import config from "../../config";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { authUserServices } from "./auth.services";

// create user controller
const createUserController = catchAsync(async (req, res) => {
  const userData = req.body;
  const result = await authUserServices.createUserIntoDB(userData);
  const { refreshToken, accessToken } = result;
  res.cookie("refreshToken", refreshToken, {
    secure: config.NODE_ENV === "production",
    httpOnly: true
  });
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "User registered successfully",
    data: {
      token: accessToken
    }
  });
});

// login user controller
const loginUserController = catchAsync(async (req, res) => {
  const loginUserData = req.body;
  const result = await authUserServices.loginUserServices(loginUserData);

  const { refreshToken, accessToken } = result;

  res.cookie("refreshToken", refreshToken, {
    secure: config.NODE_ENV === "production",
    httpOnly: true
  });

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Logged in successfully",
    data: {
      token: accessToken
    }
  });
});

// refresh token controller
const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await authUserServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Access token is retrieved successfully!",
    data: result
  });
});

const updateProfile = catchAsync(async (req, res) => {
  const { profileData } = req.body;
  const userId = req.user.id;
  console.log(userId, profileData);
  const result = await authUserServices.updateUserInDB(userId, profileData);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Access token is retrieved successfully!",
    data: result
  });
});

const getMe = catchAsync(async (req, res) => {
  const { id, role } = req.user;
  const result = await authUserServices.getMe(id, role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User is retrieved successfully",
    data: result
  });
});

export const userControllers = {
  createUserController,
  loginUserController,
  refreshToken,
  getMe,
  updateProfile
};
