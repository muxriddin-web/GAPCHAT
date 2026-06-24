import { useRef, useState } from "react";
import {
  FiSend,
  FiImage,
  FiSmile,
  FiMic,
  FiSquare,
} from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";

function ChatInput({
  text,
  setText,
  sendMessageHandler,
  sendImageHandler,
  sendStickerHandler, // Prop xatolik bermasligi uchun qoldirildi
  sendVoiceHandler,
}) {
  const [recording, setRecording] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
      
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  // START RECORD
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
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

  // FORM SUBMIT
  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      sendMessageHandler();
    }
  };

  return (
    <div className="p-2 md:p-4 relative w-full box-border">
      <div className="rounded-xl p-2 border border-white/5 bg-[#0e1621]">
        
        {/* 🚀 EMOJI PICKER PANEL: Tepadagi ortiqcha STICKERS bloki olib tashlandi */}
        {showStickers && (
          <div className="absolute bottom-[100%] left-2 right-2 mb-2 flex flex-col bg-[#111c29] p-2 rounded-2xl border border-white/10 shadow-2xl z-50 animate-fade-in">
            <div className="overflow-hidden rounded-xl">
              <EmojiPicker
                theme="dark"
                width="100%"
                height={260} // Balandligi biroz moslashtirildi
                lazyLoadEmojis={true}
                skinTonesDisabled={true}
                searchDisabled={false}
                suggestedEmojisMode="none" // Kutubxonaning ichki tavsiyalarini ham o'chiradi
                onEmojiClick={(emojiData) => {
                  setText((prev) => prev + emojiData.emoji);
                }}
              />
            </div>
          </div>
        )}

        {/* RECORDING STATUS */}
        {recording && (
          <div className="text-red-400 text-xs mb-2 flex items-center gap-2 px-1 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            🎤 Ovoz yozilmoqda...
          </div>
        )}

        {/* INPUT INTERFACE */}
        <form onSubmit={handleSubmit} className="flex items-center gap-1.5 w-full">

          {/* RASM TUGMASI */}
          <label className="w-10 h-10 flex-shrink-0 rounded-xl bg-[#17212b] text-slate-400 flex items-center justify-center cursor-pointer hover:bg-[#223040] transition active:scale-95">
            <FiImage className="text-lg" />
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                sendImageHandler(e);
                e.target.value = "";
              }}
            />
          </label>

          {/* EMOJI TUGMASI */}
          <button
            type="button"
            onClick={() => setShowStickers(!showStickers)}
            className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center transition active:scale-95 ${
              showStickers ? "bg-blue-500 text-white" : "bg-[#17212b] text-slate-400 hover:bg-[#223040]"
            }`}
          >
            <FiSmile className="text-lg" />
          </button>

          {/* INPUT MAYDONI */}
          <input
            type="text"
            placeholder="Xabar yozing..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 min-w-0 h-10 bg-[#17212b]/50 border border-white/5 rounded-xl px-3 text-white placeholder-slate-500 outline-none focus:border-blue-500/50 transition text-sm md:text-base"
          />

          {/* DYNAMIC TUGMA: Telegram uslubida (Yozganda SEND, bo'sh turganda MIC) */}
          {text.trim() ? (
            <button
              type="submit"
              className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center text-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              <FiSend />
            </button>
          ) : (
            <>
              {!recording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="w-10 h-10 flex-shrink-0 rounded-xl bg-[#17212b] text-slate-400 hover:bg-[#223040] flex items-center justify-center transition active:scale-95"
                >
                  <FiMic className="text-lg" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="w-10 h-10 flex-shrink-0 rounded-xl bg-red-500 text-white flex items-center justify-center animate-pulse active:scale-95"
                >
                  <FiSquare className="text-xs" />
                </button>
              )}
            </>
          )}

        </form>
      </div>
    </div>
  );
}

export default ChatInput;