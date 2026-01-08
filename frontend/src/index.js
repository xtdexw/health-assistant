import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// 引入魔珐星云SDK
const script = document.createElement('script');
script.src = 'https://media.xingyun3d.com/xingyun3d/general/litesdk/xmovAvatar@latest.js';
script.async = true;
document.head.appendChild(script);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
