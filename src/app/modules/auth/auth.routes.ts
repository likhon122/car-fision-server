import express from "express";
import { userValidation } from "./auth.validation";
import validateRequest from "../../middleware/validateRequest";
import { userControllers } from "./auth.controller";
import auth from "../../middleware/auth";

const router = express.Router();

// User auth routes
router.post(
  "/register",
  validateRequest(userValidation.userValidationSchema),
  userControllers.createUserController
);
router.post(
  "/login",
  validateRequest(userValidation.userValidationLoginSchema),
  userControllers.loginUserController
);
router.post(
  "/refresh-token",
  validateRequest(userValidation.refreshTokenValidationSchema),
  userControllers.refreshToken
);
router.patch(
  "/update-profile",
  auth("admin", "user"),
  userControllers.updateProfile
);
router.get("/me", auth("admin", "user"), userControllers.getMe);

export const UserRoute = router;
