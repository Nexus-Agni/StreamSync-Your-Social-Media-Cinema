import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
-mongooseAggregatePaginate;
import  jwt  from "jsonwebtoken";
import bcrypt from "bcrypt";

const UserSchema = new Schema ({
    username : {
        type : String,
        required : true,
        unique : true,
        index : true,
        trim : true,
        lowercase : true,
    },
    email : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true,
    },
    fullname : {
        type: String,
        required : true,
        trim : true,
        index : true,
    },
    avatar : {
        type : String,  // cloudinary image url
        required : true,
        trim : true,
    },
    coverImage : {
        type : String,  // cloudinary image url
    }, 
    isLoggedIn : {
        type : Boolean
    },
    watchHistory : [
        {
            type : Schema.Types.ObjectId,
            ref : "Video",
        }
    ],
    password : {
        type : String,
        required : [true, "Please enter your password"],
    },
    refreshToken : {
        type : String,
    }
}, {
    timestamps : true,
})

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
})

UserSchema.methods.isPasswordCorrect = async function (password) {
    // console.log("Hashed Password: ", this.password);
    // console.log("Password: ", password);
    return await bcrypt.compare(password, this.password);
}

UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id : this._id,
            email : this.email,
            username : this.username,
            fullname : this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRES_IN
        }
    )
}
UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id : this._id,
            email : this.email,
            username : this.username,
            fullname : this.fullname
        },
        process.env.REFRESH_TOKEN_SECRET ,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRES_IN
        }
    )
}

export const User = mongoose.model("User", UserSchema)