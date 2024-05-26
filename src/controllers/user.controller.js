import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary, ApiResponse } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"

// --------------------- Register user -------------------------------

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

// --------------------- login user --------------------------------

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        // user.save(); // yha jaise hi save karvayenge mongoose ke model kick in hone lag jate hai, password hona hi chahiye and all that, yha password to dala hi nhi hai ek hi field ko update kiya hai
        // esi situation me ham ek parameter pass karte hai 
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating refresh and access token")
    }
}


const loginUser = asyncHandler(async (req, res) => {

    // get userData from the frontend
    // req body -> data 
    // userName or email
    // find the user 
    // password check
    // access and refreshToken
    // send cookies 

    const { email, userName, password } = req.body;

    // if (!email || !userName) {
    if (!(email || userName)) {
        throw new ApiError(400, "username or password is required")
    }

    // userName and email dono ke through ham user ko get kar rhe hai
    const user = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "user does not exist");
    }

    // findOne, create and all mongoose ke method hai jinhe ham capital User se access kar sakte hai 
    // isPasswordCorrect, generateAccessToken, generateRefreshToken ye sab method hamare user ke andar available hai jo hamne db se liya hai
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid use credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    // yha hame again user ko access karna padega kyoki abhi tak purane user me refresh token and accessToken ki value save nhi hui hai  
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true, // now this cookies are modifiable from the server
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "user logged in successfully"
            )
        )
})


// ------------------------- logout user --------------------------------------

const logoutUser = asyncHandler(async (req, res) => {
    // we will have to remove refresh and access token from the db

    // req.user hamne auth.middleware me set kiya tha vhi hai ye

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true // return me jo response milega usme new updated value milegi
        }
    )

    const options = {
        httpOnly: true,
        secure: true, // now this cookies are modifiable from the server
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

// ------------------------------ RefreshAccessToken -------------------------------

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { newRefreshAccessToken, accessToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshAccessToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshAccessToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid refresh token")
    }
})



// ---------------------- change current password ----------------------------------

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid credentials")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false }); // baki ke validation nhi karna chahte isliye validateBeforeSave: false

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(200, req.user, "current user fetched successfully");
})

// Note :- agar ham khi par file update karva rhe hai to uske alag controller rkhna hai, alag endpoints rakhna hai 

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const updatedUser = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        { new: true } // update hone ke baad jo information hai vo hame return hoti hai  
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Account details updated successfully"))
})


const updateUserAvatar = asyncHandler(async (req, res) => {
    // here we are getting one file
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "avatar update successfully")
        )
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    // here we are getting one file
    const coverLImageocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "cover image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverLImageocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on coverLImage")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "cover Image update successfully")
        )
})


export { registerUser, loginUser, logoutUser, refreshAccessToken, getCurrentUser, changeCurrentPassword, updateAccountDetails, updateUserAvatar, updateUserCoverImage };