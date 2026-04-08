import type { EventsMap } from "@socket.io/component-emitter";
import type { Socket } from "socket.io-client";
import type { MessageDTO } from "../api/types";
import type { CHAT_EVENTS, CONNECTION_EVENTS } from "../constants/socket";

/* ====================== PAYLOAD TYPES ====================== */

/**
 * Payload broadcast to other users when someone starts/stops typing
 */
export type TypingBroadcastPayload = {
  chatId: string;
  userId: string;
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

/**
 * Generic payload for read receipt events.
 * Used in both directions:
 * - Client → Server: when reader reads message
 * - Server → Client: when notifying the author that their message was read
 */
export type ReadReceiptPayload = {
  readerId: string;
  messageIds: string[];
};

/** Successful acknowledgment — server confirmed the message was stored and returns the real message */
type SendMessageAckSuccess = {
  ok: true;
  tempId: string;
  /** Server-generated message with real ID and timestamps */
  message: MessageDTO;
};

/** Failed acknowledgment — server rejected the message and returns an error description */
type SendMessageAckFailure = {
  ok: false;
  tempId: string;
  /** Error message describing why the send failed */
  error: string;
};

/**
 * Acknowledgment response from server after sending a message
 * Discriminated union based on success/failure
 */
type SendMessageAck = SendMessageAckSuccess | SendMessageAckFailure;

/**
 * Callback function type for Socket.IO message acknowledgment
 */
type SendMessageCallback = (res: SendMessageAck) => void;

/* ====================== SERVER → CLIENT EVENTS ====================== */

/**
 * Events emitted from server to client in the chat namespace.
 * These notify the client of changes (new messages, typing, read receipts, connection status, etc.).
 */
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
  [CHAT_EVENTS.NOTIFY_AUTHOR_MESSAGE_WAS_READ]: (
    payload: ReadReceiptPayload,
  ) => void;
};

/* ====================== CLIENT → SERVER EVENTS ====================== */

/**
 * Events emitted from client to server in the chat namespace.
 * These are actions initiated by the frontend.
 */
type ClientToServerEventsChats = {
  [CHAT_EVENTS.SEND_MESSAGE]: (
    payload: ChatMessagePayload,
    callback: SendMessageCallback,
  ) => void;
  [CHAT_EVENTS.START_TYPING_DISPATCH]: (chatId: string) => void;
  [CHAT_EVENTS.STOP_TYPING_DISPATCH]: (chatId: string) => void;
  [CHAT_EVENTS.MESSAGE_WAS_READ]: (payload: ReadReceiptPayload) => void;
};

/* ====================== TYPED SOCKETS ====================== */

/**
 * Typed Socket.IO socket for the chat namespace (Frontend)
 */
export type ChatSocket = Socket<
  ServerToClientEventsChats,
  ClientToServerEventsChats
>;

/**
 * Typed Socket for admin namespace
 */
export type AdminSocket = Socket<EventsMap>;
