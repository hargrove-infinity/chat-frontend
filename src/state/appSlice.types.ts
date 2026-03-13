import type { EventsMap } from "@socket.io/component-emitter";
import type { Socket } from "socket.io-client";
import type { MessageDTO } from "../api/types";
import type { CHAT_EVENTS, CONNECTION_EVENTS } from "../constants/socket";

/**
 * Acknowledgment response from server after sending a message via Socket.IO
 * Discriminated union based on success/failure
 */
type SendMessageAck =
  | {
      ok: true;
      /** Temporary ID from the original request for matching optimistic message */
      tempId: string;
      /** Server-generated message with real ID and timestamps */
      message: MessageDTO;
    }
  | {
      ok: false;
      /** Temporary ID from the original request for matching optimistic message */
      tempId: string;
      /** Error description from server explaining why the send failed */
      error: string;
    };

/**
 * Payload sent from client when sending a message
 */
type ChatMessagePayload = {
  content: string;
  chatId: string;
  /**
   * Temporary ID generated on the client for optimistic UI updates
   * Used to match the optimistic message with the server response
   */
  tempId: string;
};

type SendMessageCallback = (res: SendMessageAck) => void;

type ServerToClientEventsChats = {
  [CONNECTION_EVENTS.ONLINE]: (userId: string) => void;
  [CHAT_EVENTS.NEW_MESSAGE]: (message: MessageDTO) => void;
  [CHAT_EVENTS.START_TYPING_BROADCAST]: (
    payload: TypingBroadcastPayload,
  ) => void;
  [CHAT_EVENTS.STOP_TYPING_BROADCAST]: (
    payload: TypingBroadcastPayload,
  ) => void;
  [CONNECTION_EVENTS.OFFLINE]: (userId: string) => void;
};

type ClientToServerEventsChats = {
  [CHAT_EVENTS.SEND_MESSAGE]: (
    payload: ChatMessagePayload,
    callback: SendMessageCallback,
  ) => void;
  [CHAT_EVENTS.START_TYPING_DISPATCH]: (chatId: string) => void;
  [CHAT_EVENTS.STOP_TYPING_DISPATCH]: (chatId: string) => void;
};

type TypingBroadcastPayload = { chatId: string; userId: string };

export type ChatSocket = Socket<
  ServerToClientEventsChats,
  ClientToServerEventsChats
>;

export type AdminSocket = Socket<EventsMap>;
