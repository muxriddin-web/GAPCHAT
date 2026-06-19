import bcrypt from "bcryptjs";

import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";


// REGISTER USER
export const registerUser = async (req, res) => {

  try {

    console.log("BODY:", req.body);

    const {
      username,
      email,
      password,
    } = req.body;

    // CHECK EMPTY
    if (!username || !email || !password) {

      return res.status(400).json({
        message: "Please fill all fields",
      });

    }

    // CHECK USER
    const userExists = await User.findOne({
      email,
    });

    if (userExists) {

      return res.status(400).json({
        message: "User already exists",
      });

    }

    // HASH PASSWORD
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    // CREATE USER
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // RESPONSE
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });

  }
};


// LOGIN USER
export const loginUser = async (req, res) => {

  try {

    const {
      email,
      password,
    } = req.body;

    // FIND USER
    const user = await User.findOne({
      email,
    });

    if (!user) {

      return res.status(400).json({
        message: "Invalid email",
      });

    }

    // CHECK PASSWORD
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {

      return res.status(400).json({
        message: "Invalid password",
      });

    }

    // RESPONSE
    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });

  }
};