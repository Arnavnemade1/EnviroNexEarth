import { createRoot } from 'react-dom/client'
import { Ion } from 'cesium';
import App from './App.tsx'
import './index.css'

// Set Cesium Ion access token (free tier token for basic usage)
// Get your own at https://cesium.com/ion/tokens
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkYWI2ZjQ3MC03NDdjLTQ3OTYtYTkwMS0yNWZjMWQ3MzU5YWEiLCJpZCI6MjM4NTA0LCJpYXQiOjE3Mzc1MDk4MDh9.DqN1YDUfGKtK1lOo4Eb8aX74yVFe6t1VaNzDPcJNx94';

createRoot(document.getElementById("root")!).render(<App />);
