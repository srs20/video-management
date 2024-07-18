import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./env",
});

connectDB();

// const app = express();

// (async () => {
//   try {
//     mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`);
//     app.on("error", (error) => {
//       console.log("DB connection failed");
//       throw error;
//     });

//     app.listen(process.env.PORT, () => {
//       console.log(`App is listening to ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// })();
