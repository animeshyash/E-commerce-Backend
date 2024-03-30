import { User } from "../models/User.js";
import Status from "../utils/Status.js";
import { TryCatch } from "./Error.js";

export const adminOnly = TryCatch(async (req, res, next) => {
  const { id } = req.query;

  if (!id) return next(new Status("Please Login First", 401));

  const user = await User.findById(id);

  if (!user) return next(new Status("Invalid User ID", 401));

  if (user.role !== "admin")
    return next(new Status("Unauthorized Access", 401));

  next();
});

// ? -> Query. :id -> Params
