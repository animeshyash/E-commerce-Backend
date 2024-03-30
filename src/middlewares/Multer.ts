// Its a Middleware for Fetching Photos.
import multer from "multer";
import { v4 as uuid } from "uuid"; // V4 is a method of UUID, used to generate random ID.

// Creating Local Disk Storage
const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, "uploads");
  },
  filename(req, file, callback) {
    const id = uuid();
    const ext = file.originalname.split(".").pop();
    callback(null, `${id}.${ext}`);
  },
});

export const singleUpload = multer({ storage }).single("photo");
