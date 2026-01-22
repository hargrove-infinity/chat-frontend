import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";
import { CHATS } from "../../constants/routes";
import { messagesMap } from "./Chats.statics";

export const useChatsMessages = () => {
  const { contactId } = useParams();
  const [serverMessages, setServerMessages] = useState<string[]>([]);

  useEffect(() => {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

    const chatSocket = io(`${import.meta.env.VITE_BASE_URL}/chat`, {
      auth: { token },
    });

    const onConnect = () => {
      console.log("Connected");
      chatSocket.emit("chat message", "Hello from the Frontend");
    };

    const onMessage = (msg: string) => {
      console.log(`message: ${msg}`);
      setServerMessages((prev) => [...prev, msg]);
    };

    const onDisconnect = (reason: Socket.DisconnectReason): void => {
      console.log("Reason of disconnect:", reason);
    };

    const onConnectError = (error: Error) => {
      console.log("Error:", error);
    };

    chatSocket.on("connect", onConnect);
    chatSocket.on("chat message", onMessage);
    chatSocket.on("connect_error", onConnectError);
    chatSocket.on("disconnect", onDisconnect);

    return () => {
      chatSocket.off("connect", onConnect);
      chatSocket.off("chat message", onMessage);
      chatSocket.off("connect_error", onConnectError);
      chatSocket.off("disconnect", onDisconnect);
      chatSocket.disconnect();
    };
  }, []);

  return { serverMessages, messages: contactId ? messagesMap[contactId] : [] };
};

export const useChatsNavigation = () => {
  const navigate = useNavigate();

  const onContactClick = (id: string): void => {
    navigate(`${CHATS}/${id}`, { replace: false });
  };

  return { onContactClick };
};

export const useChats = () => {
  const messages = useChatsMessages();
  const navigation = useChatsNavigation();

  return { messages, navigation };
};
