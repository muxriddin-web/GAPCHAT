import { useRef, useState } from "react";
import {
  FiSend,
  FiImage,
  FiSmile,
  FiMic,
  FiSquare,
} from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";

const STICKERS = [
  "😀", "😂", "😍", "🥰", "😎", "🤔",
  "😢", "😭", "😡", "😴", "👍", "👏",
  "🔥", "❤️", "💯", "🎉", "🚀", "🤝",
];

function ChatInput({
  text,
  setText,
  sendMessageHandler,
  sendImageHandler,
  sendStickerHandler,
  sendVoiceHandler,
}) {
  const [recording, setRecording] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
    
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null); // Brauzer mikrofon chirog'ini o'chirish uchun ref

  // START RECORD
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream; // Streamni saqlaymiz
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        sendVoiceHandler(audioBlob);
        
        // Mikrofondan foydalanishni to'liq to'xtatish (Brauzerdagi qizil belgi o'chadi)
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Mikrofon ruxsati berilmadi:", error);
    }
  };

  // STOP RECORD
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // FORM SUBMIT (Enter bosganda yoki mobile klaviaturada yuborish silliq ishlashi uchun)
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessageHandler();
  };

  return (
    <div className="p-4 md:p-5 relative">
      <div className="rounded-xl p-3 border border-white/5 bg-[#0e1621]">
        
        {/* EMOJI PICKER VA STIKERLAR PANELI (Ekranni surib yubormasligi uchun absolute qilindi) */}
        {showStickers && (
          <div className="absolute bottom-[100%] left-4 right-4 mb-3 flex flex-col gap-2 bg-[#111c29] p-3 rounded-2xl border border-white/10 shadow-2xl z-50 transition-all">
            {/* Tezkor Stikerlar (Bosilganda srazi xabar bo'lib ketadi) */}
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 max-h-[100px] overflow-y-auto mb-2 border-b border-white/5 pb-2 scrollbar-none">
              {STICKERS.map((sticker) => (
                <button
                  key={sticker}
                  type="button"
                  onClick={() => {
                    sendStickerHandler(sticker); // To'g'ridan-to'g'ri stiker xabar yuborish
                    setShowStickers(false);
                  }}
                  className="w-10 h-10 flex items-center justify-center text-2xl rounded-xl hover:bg-[#1f2d3d] hover:scale-110 transition active:scale-95"
                >
                  {sticker}
                </button>
              ))}
            </div>
            
            {/* To'liq Emoji Picker (Yozish jarayonida qotmasligi uchun optimallashtirildi) */}
            <div className="overflow-hidden rounded-xl">
              <EmojiPicker
                theme="dark"
                width="100%"
                height={280}
                lazyLoadEmojis={true}
                skinTonesDisabled={true}
                searchDisabled={false}
                onEmojiClick={(emojiData) => {
                  setText((prev) => prev + emojiData.emoji); // Matnga qo'shadi, panel yopilmaydi
                }}
              />
            </div>
          </div>
        )}

        {/* RECORDING STATUS */}
        {recording && (
          <div className="text-red-400 text-sm mb-2 flex items-center gap-2 px-1 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            🎤 Ovoz yozilmoqda...
          </div>
        )}

        {/* INPUT INTERFACE */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 md:gap-3">

          {/* RASM YUKLASH TUGMASI */}
          <label className="w-11 h-11 md:w-13 md:h-13 rounded-xl bg-[#17212b] text-slate-400 hover:text-white flex items-center justify-center cursor-pointer hover:bg-[#223040] transition active:scale-95 select-none">
            <FiImage className="text-xl" />
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                sendImageHandler(e);
                e.target.value = ""; // Bir xil rasmni ketma-ket tanlasa ham ishlaydigan qilish bug-fix
              }}
            />
          </label>

          {/* EMOJI/STIKER OCHISH TUGMASI */}
          <button
            type="button"
            onClick={() => setShowStickers(!showStickers)}
            className={`w-11 h-11 md:w-13 md:h-13 rounded-xl flex items-center justify-center transition active:scale-95 ${
              showStickers ? "bg-blue-500 text-white" : "bg-[#17212b] text-slate-400 hover:bg-[#223040] hover:text-white"
            }`}
          >
            <FiSmile className="text-xl" />
          </button>

          {/* MATN LI INPUT VALYUTASI */}
          <input
            type="text"
            placeholder="Xabar yozing..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 h-11 md:h-13 bg-[#17212b]/50 border border-white/5 rounded-xl px-4 text-white placeholder-slate-500 outline-none focus:border-blue-500/50 transition text-sm md:text-base"
          />

          {/* MIKROFON / STOP TUGMASI */}
          {!recording ? (
            <button
              type="button"
              onClick={startRecording}
              className="w-11 h-11 md:w-13 md:h-13 rounded-xl bg-[#17212b] text-slate-400 hover:bg-[#223040] hover:text-white flex items-center justify-center transition active:scale-95"
            >
              <FiMic className="text-xl" />
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="w-11 h-11 md:w-13 md:h-13 rounded-xl bg-red-500 text-white flex items-center justify-center animate-pulse shadow-lg shadow-red-500/20 active:scale-95"
            >
              <FiSquare className="text-sm" />
            </button>
          )}

          {/* YUBORISH TUGMASI */}
          <button
            type="submit"
            disabled={!text.trim()}
            className={`w-11 h-11 md:w-13 md:h-13 rounded-xl flex items-center justify-center text-xl transition active:scale-95 ${
              text.trim()
                ? "bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-md shadow-blue-500/20 cursor-pointer hover:scale-105"
                : "bg-[#17212b] text-slate-600 cursor-not-allowed"
            }`}
          >
            <FiSend />
          </button>

        </form>

      </div>
    </div>
  );
}

export default ChatInput;