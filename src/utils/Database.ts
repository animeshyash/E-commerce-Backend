import mongoose from "mongoose";

export const dbConnect = (uri: string) => {
  mongoose
    .connect(uri, {
      dbName: "Ecom",
    })
    .then((c) => console.log("Database connected Successfully"))
    .catch((e) => console.log("Database connection Failed"));
};
