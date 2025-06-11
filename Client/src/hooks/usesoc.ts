import { useEffect } from "react";
import WebSocket from "ws";
export const usesoc = () => {
  const ws = new WebSocket(import.meta.env.VITE_SOCKET_URL);
  useEffect(() => {
    ws.onopen = () => {
      console.log("connection opened");
    };
    ws.onmessage = (message) => {
      console.log(`message recieved: ${message}`);
    };
    ws.onclose = (message) => {
      console.log(`message recieved: ${message}`);
    };
    ws.send("connecnted"); 
  });
  return [];
};
