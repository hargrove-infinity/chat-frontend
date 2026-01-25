import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const Metrics = () => {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // TODO: Maybe remove it later
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpGTeA3...";

    const adminSocket = io(`${import.meta.env.VITE_BASE_URL}/admin`, {
      auth: { token, isAdmin: true },
    });

    const onConnect = () => {
      console.log("Connected");
      adminSocket.emit("chat message", "Hello from the Frontend");
    };

    const onMessage = (msg: string) => {
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
    adminSocket.on("chat message", onMessage);
    adminSocket.on("metrics", onMetricsMessage);
    adminSocket.on("connect_error", onConnectError);
    adminSocket.on("disconnect", onDisconnect);

    return () => {
      adminSocket.off("connect", onConnect);
      adminSocket.off("chat message", onMessage);
      adminSocket.off("metrics", onMetricsMessage);
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
