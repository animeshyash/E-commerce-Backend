import mongoose from "mongoose";
import validator from "validator"; // It helps in validation.
interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  photo: string;
  role: "admin" | "user";
  gender: "male" | "female";
  dob: Date;
  createdAt: Date;
  updatedAt: Date;
  age: number; // Its a Virtual Attribute
}

const schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: [true, "Please enter ID"],
    },
    name: {
      type: String,
      required: [true, "Please enter your Name"],
    },
    email: {
      type: String,
      unique: [true, "Email Address already exists"],
      required: [true, "Please enter your Email"],
      validate: validator.default.isEmail,
    },
    photo: {
      type: String,
      required: [true, "Please add your Photo"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Please enter your Gender"],
    },
    dob: {
      type: Date,
      required: [true, "Please enter your Date of Birth"],
    },
  },
  { timestamps: true }
);

// Giving age Virtually
schema.virtual("age").get(function () {
  const today = new Date();
  const dob = this.dob;
  let age = today.getFullYear() - dob.getFullYear();

  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  ) {
    age--;
  }
  return age;
});

export const User = mongoose.model<IUser>("User", schema);
