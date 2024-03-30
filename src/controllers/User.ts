import { NextFunction, Request, Response } from "express";
import { User } from "../models/User.js";
import { NewUserRequestBody } from "../types/Types.js";
import { TryCatch } from "../middlewares/Error.js";
import Status from "../utils/Status.js";

export const newUser = TryCatch(
  async (
    req: Request<{}, {}, NewUserRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, photo, gender, _id, dob } = req.body;

    let user = await User.findById(_id);

    if (user) {
      return res.status(200).json({
        success: true,
        message: `Welcome ${user.name}`,
      });
    }

    if (!name || !_id || !email || !photo || !gender || !dob)
      next(new Status("Please fill all the Details", 400));

    user = await User.create({
      name,
      email,
      photo,
      gender,
      _id,
      dob: new Date(dob),
    });

    return res.status(200).json({
      success: true,
      message: `Welcome ${user.name}`,
    });
  }
);

export const getAllUsers = TryCatch(async (req, res, next) => {
  const users = await User.find({});

  return res.status(200).json({
    success: true,
    message: "Users Received Successfully",
    users,
  });
});

export const getUser = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);

  if (!user) {
    return next(new Status("Invalid ID", 400));
  }

  return res.status(200).json({
    success: true,
    message: "Users Received Successfully",
    user,
  });
});

export const deleteUser = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);

  if (!user) {
    return next(new Status("Invalid ID", 400));
  }

  await user.deleteOne();

  return res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});
