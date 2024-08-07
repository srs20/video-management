import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Servering is running at port : ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB Connection Failed !!", error);
  });

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
