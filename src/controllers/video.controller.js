import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const videoLocalPath = req.files?.videoFile[0].path;
  const thumbnailLocalPath = req.files?.thumbnail[0].path;

  if (!videoLocalPath && !thumbnailLocalPath) {
    throw new ApiError(400, "Video File and Thumbnail is Required");
  }

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile && !thumbnail) {
    throw new ApiError(400, "Video File and Thumbnail is Required");
  }

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    owner: req.user?._id,
    title,
    description,
    duration: videoFile?.duration,
  });

  console.log(video);

  const uploadedVideo = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(video._id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullname: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);

  if (uploadedVideo.length === 0) {
    throw new ApiError(500, "Something Went Wrong !!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, uploadedVideo[0], "Video Uploaded Successfully")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!videoId) {
    throw new ApiError(400, "Video Id invalid");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullname: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);

  console.log(video);

  if (video.length === 0) {
    throw new ApiError(400, "Video Not Found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video Fetched Successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body;

  if (!title && !description) {
    throw new ApiError(400, "Title and Description are required");
  }

  const thumbnailLocalPath = req.file?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail Required");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail) {
    new ApiError(400, "Error While uploading");
  }

  const video = await Video.findByIdAndUpdate(
    new mongoose.Types.ObjectId(videoId),
    {
      $set: {
        title: title,
        description: description,
        thumbnail: thumbnail?.url,
      },
    },
    { new: true }
  );

  res.status(200).json(200, video, "Video Details updated successfully");
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullname: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);

  if (video[0].owner._id.toString() !== req.user?._id.toString()) {
    throw new ApiError(401, "You are not the owner of the video");
  }

  const deletedVideo = await Video.findByIdAndDelete(
    new mongoose.Types.ObjectId(videoId)
  );

  if (!deletedVideo) {
    throw new ApiError(401, "Something Went Wrong");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "Video Deleted Successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullname: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);

  if (video.length === 0) {
    throw new ApiError(400, "Video Not Found");
  }

  if (video[0].owner._id.toString() !== req.user?._id.toString()) {
    throw new ApiError(401, "You are not the owner of the video");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    new mongoose.Types.ObjectId(videoId),
    {
      $set: {
        isPublished: !video[0]?.isPublished,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedVideo,
        `${
          updatedVideo.isPublished
            ? "Video is published"
            : "Video is unpublished"
        }`
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
