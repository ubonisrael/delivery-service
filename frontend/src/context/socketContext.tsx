import { createContext, useContext, useEffect, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/authContext";

const SOCKET_URL = import.meta.env.PROD ? window.location.origin : "http://localhost:3000";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socket = useMemo(() => io(SOCKET_URL, { autoConnect: false, withCredentials: true }), []);
  const { setUser } = useAuth(); // Get the user from the auth context

  useEffect(() => {
    socket.connect(); // Connect when the provider mounts

    socket.on("private_chat_created", async (response) => {
        console.log(response);
        setUser(prev => ({...prev, chats: [...prev.chats, { name: response.name, type: response.type, _id: response._id}]}));
      });
    return () => {
      socket.disconnect(); // Cleanup on unmount
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
