import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io(import.meta.env.VITE_BASE_URL);

function App() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const onConnect = () => {
      console.log("Connected");

      socket.emit("chat message", "Hello from the Frontend");
    };

    const onMessage = (msg: string) => {
      console.log(`message: ${msg}`);
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("connect", onConnect);
    socket.on("chat message", onMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("chat message", onMessage);
    };
  }, []);

  return (
    <>
      {messages.map((msg, idx) => (
        <div key={`${msg}-${idx}`}>{msg}</div>
      ))}
    </>
  );
}

export default App;
