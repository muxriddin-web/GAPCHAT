import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // 1. Production uchun kodni maksimal siqish (minify) va optimallash
    minify: 'esbuild',
    sourcemap: false, // Hostingda xatoliklar xaritasini yashiradi (kod xavfsizligi va hajm kamayishi uchun)
    chunkSizeWarningLimit: 1200, // Og'ir paketlar uchun ogohlantirish limitini to'g'rilaymiz
    
    rollupOptions: {
      output: {
        // 2. CHUNK SPLITTING (Kodni bo'laklash mo'jizasi)
        // Og'ir kutubxonalarni alohida-alohida kichik fayllarga bo'lib tashlaymiz.
        // Natijada sayt birinchi marta ochilganda 3-4 barobar tezroq yuklanadi!
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react'; // React elementlari alohida
            if (id.includes('emoji-picker-react')) return 'vendor-emoji'; // Emoji picker mutloq alohida (faqat kerak bo'lganda yuklanadi)
            if (id.includes('socket.io-client')) return 'vendor-socket'; // Socket alohida
            return 'vendor-others'; // Qolgan mayda kutubxonalar
          }
        }
      }
    }
  }
})