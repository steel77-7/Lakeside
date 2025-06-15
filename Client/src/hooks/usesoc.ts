import { useEffect, useRef } from "react";

export const useSoc = () => {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(import.meta.env.VITE_SOCKET_URL);
    ws.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connection opened");
    };

    socket.onmessage = (event: MessageEvent) => {
      console.log("WebSocket message received:", event.data);
    };

    socket.onclose = (event: CloseEvent) => {
      console.warn("WebSocket closed:", event.code, event.reason);
    };

    socket.onerror = (error: Event) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, []);

  return ws;
};
