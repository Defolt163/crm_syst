// hooks/useSocket.js
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const useSocket = (userData) => {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io("wss://192.168.0.106:3001",{
      secure: true,
      rejectUnauthorized: false // если самоподписанный
    });
    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef;
};

export default useSocket;
