import { useEffect, useState } from "react";
import AppRoutes from "./routes/AppRoutes";

function App() {
  // 1. OPTIMALLASHISH: Global internet aloqasini tekshirish statusi
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);

    // Brauzer tarmoq hodisalarini tinglaymiz
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return (
    // 2. OPTIMALLASHISH: h-[100dvh] - Mobil brauzerlarda ekran surilib ketishini oldini oladi (Dynamic Viewport)
    // antialiased - Shriftlarni har qanday ekranda maksimal darajada silliq ko'rsatadi
    <div className="w-full h-[100dvh] bg-[#0e1621] text-white overflow-hidden antialiased select-none">
      
      {/* 3. OPTIMALLASHISH: Global Oflayn Banner (Internet uzilsa daxshatli ogohlantirish beradi) */}
      {isOffline && (
        <div className="bg-red-500/90 backdrop-blur-md text-white text-center text-xs md:text-sm py-2 font-bold sticky top-0 left-0 w-full z-[9999] shadow-lg flex items-center justify-center gap-2 transition-all duration-300 animate-slide-down">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          Internet aloqasi uzildi. NexChat oflayn rejimda!
        </div>
      )}

      {/* Asosiy sahifalar arxitekturasi */}
      <AppRoutes />
      
    </div>
  );
}

export default App;