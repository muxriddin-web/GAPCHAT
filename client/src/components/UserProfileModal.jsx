import {
  FiX,
  FiUserPlus,
  FiTrash2,
} from "react-icons/fi";

import API from "../api/axios";

function UserProfileModal({

  open,
  setOpen,
  user,

}) {

  const currentUser = JSON.parse(
    localStorage.getItem("userInfo")
  );




  // CLOSE
  const closeHandler = (e) => {

    e.stopPropagation();

    setOpen(false);

  };




  // ADD CONTACT
  const addContactHandler =
    async () => {

      try {

        await API.post(

          "/users/add-contact",

          {

            currentUserId:
              currentUser._id,

            contactId:
              user._id,

          }

        );

        alert(
          "Contact added"
        );

      } catch (error) {

        console.log(error);

      }

    };




  // DELETE CHAT
  const deleteChatHandler =
    async (e) => {

      e.stopPropagation();

      try {

        await API.post(

          "/users/delete-chat",

          {

            currentUserId:
              currentUser._id,

            selectedUserId:
              user._id,

          }

        );




        // LOCAL STORAGE
        const deletedChats =

          JSON.parse(

            localStorage.getItem(
              "deletedChats"
            )

          ) || [];




        // SAVE
        localStorage.setItem(

          "deletedChats",

          JSON.stringify([

            ...deletedChats,

            user._id,

          ])

        );




        alert("Chat deleted");

        setOpen(false);




        // REFRESH
        window.location.reload();

      } catch (error) {

        console.log(error);

      }

    };




  // EMPTY
  if (!open || !user)
    return null;




  return (

    <div

      onClick={() =>
        setOpen(false)
      }

      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"

    >

      {/* MODAL */}
      <div

        onClick={(e) =>
          e.stopPropagation()
        }

        className="relative w-full max-w-md bg-[#111827] rounded-[40px] border border-white/10 overflow-hidden shadow-2xl"

      >

        {/* CLOSE */}
        <button

          onClick={closeHandler}

          className="absolute top-5 right-5 z-20 w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 transition flex items-center justify-center text-xl"

        >

          <FiX />

        </button>





        {/* TOP */}
        <div className="h-[170px] bg-gradient-to-br from-blue-500 via-cyan-400 to-cyan-300" />





        {/* CONTENT */}
        <div className="px-8 pb-8 -mt-20 relative z-10">

          {/* AVATAR */}
          <img

            src={user.profilePic}

            alt=""

            className="w-36 h-36 rounded-[32px] border-4 border-[#111827] object-cover shadow-2xl"

          />





          {/* USER INFO */}
          <div className="mt-5">

            <h2 className="text-3xl font-black text-white">

              {user.username}

            </h2>

            <p className="text-slate-400 mt-1 break-all">

              {user.email}

            </p>

          </div>





          {/* BIO */}
          <div className="mt-6 bg-[#0f172a] rounded-3xl p-5 border border-white/5">

            <p className="text-sm text-slate-300 leading-7">

              {

                user.bio ||

                "No bio yet"

              }

            </p>

          </div>





          {/* BUTTONS */}
          <div className="grid grid-cols-2 gap-4 mt-6">

            {/* ADD */}
            <button

              onClick={
                addContactHandler
              }

              className="h-[60px] rounded-3xl bg-gradient-to-r from-blue-500 to-cyan-400 font-bold flex items-center justify-center gap-3 hover:scale-[1.03] transition"

            >

              <FiUserPlus />

              Add Contact

            </button>





            {/* DELETE */}
            <button

              onClick={
                deleteChatHandler
              }

              className="h-[60px] rounded-3xl bg-red-500/10 border border-red-500/10 text-red-400 font-bold flex items-center justify-center gap-3 hover:bg-red-500/20 transition"

            >

              <FiTrash2 />

              Delete Chat

            </button>

          </div>

        </div>

      </div>

    </div>

  );

}

export default UserProfileModal;