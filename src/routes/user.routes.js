import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured routes

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/changepassword").post(verifyJWT, changeCurrentPassword);
router.route("/userdetails").post(verifyJWT, getCurrentUser);
router.route("/updateuserdetails").post(verifyJWT, updateAccountDetails);
router
  .route("/updateavatar")
  .post(upload.single("avatar"), verifyJWT, updateUserAvatar);

router
  .route("/updatecoverimage")
  .post(upload.single("coverImage"), verifyJWT, updateUserCoverImage);

export default router;
