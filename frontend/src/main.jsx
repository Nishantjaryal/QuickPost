import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
import ChatProvider from './Context/ChatProvider.jsx'

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ChatProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </ChatProvider>
  </BrowserRouter>
);


// whatever the state we created in context api now it will be appear in entire app  