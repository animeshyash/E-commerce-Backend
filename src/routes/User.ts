import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUser,
  newUser,
} from "../controllers/User.js";
import { adminOnly } from "../middlewares/Auth.js";

const router = express.Router();

router.post("/new", newUser);
router.get("/all", adminOnly, getAllUsers);
router.get("/:id", getUser);
router.delete("/:id", adminOnly, deleteUser);

export default router;
