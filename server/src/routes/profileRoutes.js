import express from "express";

import User from "../models/User.js";

const router = express.Router();


// UPDATE PROFILE
router.put(
  "/update/:id",

  async (req, res) => {

    try {

      const updatedUser =
        await User.findByIdAndUpdate(

          req.params.id,

          {
            username:
              req.body.username,

            bio:
              req.body.bio,

            profilePic:
              req.body.profilePic,
          },

          {
            new:true,
          }
        );

      res.json(updatedUser);

    } catch (error) {

      res.status(500).json({
        message:error.message,
      });

    }

  }
);

export default router;