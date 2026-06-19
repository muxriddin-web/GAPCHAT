function ChatTopbar({

  selectedUser,

}) {

  return (

    <div className="h-[90px] glass border-b border-white/5 px-6 flex items-center justify-between">

      <div className="flex items-center gap-4">

        <div className="relative">

          <img
            src={selectedUser.profilePic}
            alt=""
            className="w-14 h-14 rounded-2xl object-cover"
          />

          <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-400 border-2 border-[#071018]" />

        </div>

        <div>

          <h2 className="text-xl font-bold">

            {selectedUser.username}

          </h2>

          <p className="text-sm text-green-400">

            Online now

          </p>

        </div>

      </div>

    </div>
  );
}

export default ChatTopbar;