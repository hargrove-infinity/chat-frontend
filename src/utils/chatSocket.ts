declare const io: typeof import("socket.io-client").io;

import { CHAT_NAMESPACE } from "../constants/socket";
import type { ChatSocket } from "../state/appSlice.types";
import { getToken } from "./token";

const chatSocket: ChatSocket = io(
  `${import.meta.env.VITE_BASE_URL}${CHAT_NAMESPACE}`,
  {
    auth: { token: getToken() },
    transports: ["polling", "websocket"],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  },
);

export default chatSocket;