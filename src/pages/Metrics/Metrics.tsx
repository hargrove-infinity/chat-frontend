import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  ADMIN_EVENTS,
  ADMIN_NAMESPACE,
  CONNECTION_EVENTS,
  WELCOME_EVENTS,
} from "../../constants/socket";
import { getToken } from "../../utils/token";

export const Metrics = () => {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const adminSocket = io(
      `${import.meta.env.VITE_BASE_URL}${ADMIN_NAMESPACE}`,
      { auth: { token: getToken(), isAdmin: true } },
    );

    const onConnect = () => {
      console.log("Connected");
      adminSocket.emit(
        CONNECTION_EVENTS.ADMIN,
        `Socket ${adminSocket.id} has connected from the Frontend (admin part)`,
      );
    };

    const onWelcomeMessage = (msg: string) => {
      console.log(`message: ${msg}`);
      setMessages((prev) => [...prev, msg]);
    };

    const onMetricsMessage = (msg: string) => {
      console.log("metrics message:", msg);
    };

    const onDisconnect = (reason: Socket.DisconnectReason): void => {
      console.log("Reason of disconnect:", reason);
    };

    const onConnectError = (error: Error) => {
      console.log("Error:", error);
    };

    adminSocket.on("connect", onConnect);
    adminSocket.on(WELCOME_EVENTS.ADMIN, onWelcomeMessage);
    adminSocket.on(ADMIN_EVENTS.METRICS, onMetricsMessage);
    adminSocket.on("connect_error", onConnectError);
    adminSocket.on("disconnect", onDisconnect);

    return () => {
      adminSocket.off("connect", onConnect);
      adminSocket.off(WELCOME_EVENTS.ADMIN, onWelcomeMessage);
      adminSocket.off(ADMIN_EVENTS.METRICS, onMetricsMessage);
      adminSocket.off("connect_error", onConnectError);
      adminSocket.off("disconnect", onDisconnect);
      adminSocket.disconnect();
    };
  }, []);

  return (
    <>
      <p>Metrics</p>
      {messages.map((msg, idx) => (
        <div key={`${msg}-${idx}`}>{msg}</div>
      ))}
    </>
  );
};
