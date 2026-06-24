import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ChatProvider } from './context/ChatContext.jsx'; // Context providerni import qilamiz

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChatProvider> {/* 🚀 Butun ilovani o'rab qo'yamiz */}
      <App />
    </ChatProvider>
  </React.StrictMode>,
);