import { useState } from "react";

import {
  FiX,
  FiEdit2,
  FiSave,
} from "react-icons/fi";

import API from "../api/axios";

function ProfileModal({

  open,
  setOpen,

}) {

  const storedUser =
    JSON.parse(
      localStorage.getItem(
        "userInfo"
      )
    );

  const [username, setUsername] =
    useState(
      storedUser.username
    );

  const [bio, setBio] =
    useState(
      storedUser.bio || ""
    );

  const [profilePic, setProfilePic] =
    useState(
      storedUser.profilePic
    );

  const [loading, setLoading] =
    useState(false);




  // IMAGE UPLOAD
  const uploadImageHandler =
    async (e) => {

      const file =
        e.target.files[0];

      if (!file) return;

      const formData =
        new FormData();

      formData.append(
        "image",
        file
      );

      try {

        setLoading(true);

        const res =
          await fetch(

            `https://api.imgbb.com/1/upload?key=${
              import.meta.env
                .VITE_IMGBB_KEY
            }`,

            {
              method: "POST",
              body: formData,
            }

          );

        const data =
          await res.json();

        setProfilePic(
          data.data.url
        );

        setLoading(false);

      } catch (error) {

        console.log(error);

        setLoading(false);

      }

    };




  // SAVE
  const saveHandler =
    async () => {

      try {

        setLoading(true);

        const { data } =
          await API.put(
            `/users/update-profile/${storedUser._id}`,
            {
              username,
              bio,
              profilePic,
            }
          );




        localStorage.setItem(

          "userInfo",

          JSON.stringify(data)

        );

        setLoading(false);

        window.location.reload();

      } catch (error) {

        console.log(error);

        setLoading(false);

      }

    };




  if (!open) return null;

  return (

    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">

      <div className="w-full max-w-lg rounded-[40px] overflow-hidden bg-[#0f172a] border border-white/10 relative">

        {/* TOP */}
        <div className="h-[180px] bg-gradient-to-br from-blue-500 to-cyan-400 relative">

          <button
            onClick={() =>
              setOpen(false)
            }
            className="absolute top-5 right-5 w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white text-xl"
          >

            <FiX />

          </button>

        </div>





        {/* CONTENT */}
        <div className="px-8 pb-8 -mt-20">

          {/* IMAGE */}
          <div className="relative w-fit">

            <img
              src={profilePic}
              alt=""
              className="w-40 h-40 rounded-[35px] object-cover border-4 border-[#0f172a]"
            />

            <label className="absolute bottom-2 right-2 w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center cursor-pointer">

              <FiEdit2 />

              <input
                type="file"
                hidden
                accept="image/*"
                onChange={
                  uploadImageHandler
                }
              />

            </label>

          </div>





          {/* USERNAME */}
          <div className="mt-6">

            <p className="text-sm text-slate-400 mb-2">

              Username

            </p>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
              className="w-full h-[60px] rounded-2xl bg-[#111827] border border-white/5 px-5 outline-none"
            />

          </div>





          {/* BIO */}
          <div className="mt-5">

            <p className="text-sm text-slate-400 mb-2">

              Bio

            </p>

            <textarea
              value={bio}
              onChange={(e) =>
                setBio(
                  e.target.value
                )
              }
              placeholder="Write your bio..."
              className="w-full h-[120px] rounded-2xl bg-[#111827] border border-white/5 p-5 outline-none resize-none"
            />

          </div>





          {/* SAVE */}
          <button
            onClick={saveHandler}
            disabled={loading}
            className="mt-6 w-full h-[62px] rounded-3xl bg-gradient-to-r from-blue-500 to-cyan-400 font-bold text-lg flex items-center justify-center gap-3"
          >

            <FiSave />

            {
              loading
                ? "Saving..."
                : "Save Changes"
            }

          </button>

        </div>

      </div>

    </div>

  );
}

export default ProfileModal;