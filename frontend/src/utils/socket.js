import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socketUrl =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const socket = io(socketUrl, {
  withCredentials: true,
});

// Custom hook for using socket in components
const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return { socket, isConnected };
};

export default useSocket;

