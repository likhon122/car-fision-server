import { model, Schema } from "mongoose";
import { TUser, UserModel } from "./auth.interface";
import bcrypt from "bcrypt";
import config from "../../config";

const userSchema = new Schema<TUser, UserModel>(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: [true, "Name is required"]
    },
    age: {
      type: String
    },
    currentCountry: {
      type: String
    },
    currentCity: {
      type: String
    },
    currentStreet: {
      type: String
    },
    permanentCountry: {
      type: String
    },
    permanentCity: {
      type: String
    },
    permanentStreet: {
      type: String
    },
    blood: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    },
    phone: {
      type: String
    },
    gender: {
      type: String,
      enum: ["Male", "Female"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user"
    },
    isBlocked: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;

  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds)
  );
});

userSchema.post("save", async function (doc, next) {
  doc.password = "";
  next();
});

userSchema.statics.isUserExistsById = async function (id) {
  return await AuthUser.findOne({ id: id });
};
userSchema.statics.isUserExistsByEmail = async function (email) {
  return await AuthUser.findOne({ email: email }).select("+password");
};

userSchema.statics.isPasswordMatch = async function (
  plainTextPassword,
  hashPassword
) {
  return await bcrypt.compare(plainTextPassword, hashPassword);
};

export const AuthUser = model<TUser, UserModel>("User", userSchema);
