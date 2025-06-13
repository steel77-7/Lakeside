import { useEffect, useRef } from "react";

export const useSoc = () => {
  const ws = useRef<WebSocket | null>(null);
  useEffect(() => {
    ws.current = new WebSocket(import.meta.env.VITE_SOCKET_URL);
    ws.current.onopen = () => {
      console.log("connection opened");
    };
    ws.current.onmessage = (message: any) => {
      console.log(`message recieved: ${message}`);
    };
    ws.current.onclose = (message: any) => {
      console.log(`message recieved: ${message}`);
    };
    return () => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, []);
  return ws;
};
