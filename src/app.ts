import express, { Request, Response } from "express";
import { errorMiddleware } from "./middlewares/Error.js";
import userRoutes from "./routes/User.js";
import productRoutes from "./routes/Product.js";
import orderRoutes from "./routes/Order.js";
import paymentRoutes from "./routes/Payment.js";
import statsRoutes from "./routes/Stats.js";
import { dbConnect } from "./utils/Database.js";
import { config } from "dotenv";
import morgan from "morgan";
import Stripe from "stripe";
import cors from "cors";

config({
  path: "./.env",
});
const port = process.env.PORT || 3000;
const app = express();

app.use(express.json()); // Middleware to fetch data from request.
app.use(morgan("dev")); // It gives request information in Console.
app.use(cors());
dbConnect(process.env.DB_URL || "");

const stripeKey = process.env.STRIPE_KEY || "";
export const stripe = new Stripe(stripeKey);

// Importing Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/dashboard", statsRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("API is Working well");
});

app.use("/uploads", express.static("uploads")); // Declares upload folder as static folder so that pictures can be accessed.
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is running on Port ${port}`);
});
