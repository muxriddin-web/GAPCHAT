import User from "../models/User.js";
import Message from "../models/Message.js";

export const getUsers = async (req, res) => {

  try {

    const users = await User.find().select(
      "-password"
    );

    res.json(users);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// ADD CONTACT
export const addContact =
  async (req, res) => {

    try {

      const {

        currentUserId,
        contactId,

      } = req.body;




      const user =
        await User.findById(
          currentUserId
        );




      // ALREADY EXISTS
      if (

        user.contacts.includes(
          contactId
        )

      ) {

        return res.status(400)
          .json({

            message:
              "Already added",

          });

      }




      user.contacts.push(
        contactId
      );

      await user.save();




      res.json({

        message:
          "Contact added",

      });

    } catch (error) {

      res.status(500).json({

        message:error.message,

      });

    }

  };




// DELETE CHAT
export const deleteChat =
  async (req, res) => {

    try {

      const {

        currentUserId,
        selectedUserId,

      } = req.body;




      await Message.deleteMany({

        $or:[

          {
            sender:currentUserId,
            receiver:selectedUserId,
          },

          {
            sender:selectedUserId,
            receiver:currentUserId,
          },

        ],

      });




      res.json({

        message:
          "Chat deleted",

      });

    } catch (error) {

      res.status(500).json({

        message:error.message,

      });

    }

  };