import mongoose from "mongoose";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-middleware to hash password
userSchema.pre("save", async function (next) {
  try {
    // check if password is modified
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateJWTtoken = function () {
  const payload = {
    _id: this._id,
  };
  const secret_key = process.env.SECRET_KEY;
  const options = {
    expiresIn: "1d",
  };
  const token = JWT.sign(payload, secret_key, options);
  return token;
};

export const UserSchema = mongoose.model("User", userSchema);
