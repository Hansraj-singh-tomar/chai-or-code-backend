import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary, ApiResponse } from "../utils/cloudinary.js"


const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({ message: "ok" })

    // get user details from frontend
    // validation - not empty
    // check if user already exist: check with userName and email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const { fullName, email, userName, password } = req.body;
    console.log("email", email);

    // if (fullName === "") {
    //     throw new ApiError(400, "fullname is required")
    // }

    // har ek field ko alag-alag check karne ki jagah ham, js ke insights ka use karenge
    if ([fullName, email, userName, password].some((field) => field.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = User.findOne({
        $or: [{ userName }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email and userName already exists")
    }

    // req.body jaise hame express se milta hai same way multer gives us req.files with that we can get and handle our files
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowercase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken") // this field won't come from the db

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // res.send(createdUser);
    return res.status(201).json(new ApiResponse(200, createdUser, "User registered Successfully"))
})

export default registerUser;