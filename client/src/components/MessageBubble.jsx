import { FiTrash2 } from "react-icons/fi";
import API from "../api/axios";

function MessageBubble({ msg, currentUser, setMessages }) {
  const isMe = msg.sender === currentUser?._id;

  // Emojini tekshirish uchun xavfsiz Regex
  const emojiRegex = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])$/;
  const isOnlySticker = msg.sticker || (msg.text && emojiRegex.test(msg.text.trim()));

  // DELETE MESSAGE
  const deleteMessageHandler = async () => {
    try {
      await API.delete(`/messages/${msg._id}`);
      setMessages((prev) => prev.filter((m) => m._id !== msg._id));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    // mb-6 orqali xabarlarning orasida chiroyli bo'shliq (masofa) ochildi
    <div className={`mb-6 flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
      
      <div
        className={`group relative px-4 py-2.5 rounded-2xl transition-all duration-200
          ${
            isOnlySticker
              ? "bg-transparent text-white max-w-full" // Stikerlar ekran kengligini buzmaydi
              : isMe
              ? "bg-[#3390ec] text-white shadow-md max-w-[85%] md:max-w-[70%]" 
              : "bg-[#1e293b] text-white shadow-md max-w-[85%] md:max-w-[70%]" 
          }
        `}
      >
        
        {/* TEXT MESSAGE */}
        {msg.text && !msg.sticker && (
          emojiRegex.test(msg.text.trim()) ? (
            // FAQAT BITTA EMOJI (STIKER) BO'LSA
            <div className="flex flex-col items-end gap-1">
              <div className="text-6xl my-2 select-none filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
                {msg.text}
              </div>
              <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full">
                <span className="text-[10px] text-white/80">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {isMe && <span className="text-[10px] text-cyan-300">✓✓</span>}
              </div>
            </div>
          ) : (
            // ODDIY UZUN MATNLAR
            <div className="flex items-end gap-4 w-full">
              <span className="break-words text-[15px] block whitespace-pre-wrap flex-1 leading-relaxed">
                {msg.text}
              </span>
              <div className="flex items-center gap-1 whitespace-nowrap ml-auto pt-1 select-none self-end">
                <span className="text-[11px] opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {isMe && <span className="text-[11px] text-cyan-200">✓✓</span>}
              </div>
            </div>
          )
        )}

        {/* IMAGE MESSAGE */}
        {msg.image && (
          <div className="relative max-w-full my-1">
            <img
              src={msg.image}
              alt=""
              className="rounded-xl max-h-[350px] w-full object-cover border border-white/5"
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-full">
              <span className="text-[10px] text-white">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {isMe && <span className="text-[10px] text-cyan-300">✓✓</span>}
            </div>
          </div>
        )}

        {/* STICKER MESSAGE */}
        {msg.sticker && (
          <div className="flex flex-col items-end gap-1">
            <div className="text-6xl my-2 select-none filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
              {msg.sticker}
            </div>
            <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full">
              <span className="text-[10px] text-white/85">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {isMe && <span className="text-[10px] text-cyan-300">✓✓</span>}
            </div>
          </div>
        )}

        {/* VOICE MESSAGE */}
        {msg.voice && (
          <div className="my-1 min-w-[260px] max-w-full">
            <audio controls className="w-full h-10 custom-audio">
              <source src={msg.voice} type="audio/webm" />
            </audio>
            <div className="flex justify-end items-center gap-1 mt-1 opacity-70 select-none">
              <span className="text-[11px]">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {isMe && <span className="text-[11px] text-cyan-200">✓✓</span>}
            </div>
          </div>
        )}

        {/* DELETE BUTTON */}
        <button
          onClick={deleteMessageHandler}
          className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-red-500 text-white hidden group-hover:flex items-center justify-center shadow-md hover:bg-red-600 transition-transform active:scale-95 z-20"
        >
          <FiTrash2 className="text-sm" />
        </button>

      </div>
    </div>
  );
}

export default MessageBubble;