import express, { NextFunction, Request, Response } from "express";
import Status from "../utils/Status.js";
import { ControllerType } from "../types/Types.js";

export const errorMiddleware = (
  error: Status,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  error.message = error.message || "Server Error";
  error.statusCode = error.statusCode || 500;

  if (error.name === "CastError") error.message = "Invalid ID";
  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
  });
};

// Its a Wrapper Function
export const TryCatch = (func: ControllerType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(func(req, res, next)).catch(next);
  };
};
