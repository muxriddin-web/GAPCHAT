import mongoose from "mongoose";

const userSchema =
  mongoose.Schema({

    username:{
      type:String,
      required:true,
    },

    email:{
      type:String,
      required:true,
    },

    password:{
      type:String,
      required:true,
    },

    profilePic:{
      type:String,
      default:
        "https://i.imgur.com/HeIi0wU.png",
    },

    bio:{
      type:String,
      default:"Hey there 👋",
    },

    contacts:[
      {
        type:
          mongoose.Schema.Types.ObjectId,

        ref:"User",
      },
    ],

  },
  {
    timestamps:true,
  });

const User = mongoose.model(
  "User",
  userSchema
);

export default User;