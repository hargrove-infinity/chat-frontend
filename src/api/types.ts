import type { AxiosPromise, AxiosError, AxiosResponse } from "axios";

// Axios
interface ApiResponsePayload<T> {
  payload: T;
}

export type ApiPromise<T> = AxiosPromise<ApiResponsePayload<T>>;

export interface ApiErrorPayload {
  errors: string[];
}

export type ApiError = AxiosError<ApiErrorPayload> & {
  response: AxiosResponse<ApiErrorPayload>;
};

// Auth
export interface AuthCredentials {
  email: string;
  password: string;
}

// Chats

export type Participant = { id: string; name: string; isTyping: boolean };

/**
 * Chat received from server (matches backend ChatDTO)
 * Contains resolved name for both direct and group chats
 */
export type Chat = {
  id: string;
  type: "direct" | "group";
  /** Resolved chat name (participant's name for direct, stored name for group) */
  name: string | null;
  participants: Participant[];
  lastMessage: string | null;
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * Message status for tracking send state
 */
export enum MessageStatusEnum {
  /** Message is being sent to server */
  SENDING = "SENDING",
  /** Message successfully delivered to server */
  SENT = "SENT",
  /** Message failed to send */
  ERROR = "ERROR",
}

/**
 * Message received from server (matches backend MessageDTO)
 */
export type MessageServer = {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string | null;
  content: string;
  status: MessageStatusEnum;
  createdAt: string;
  updatedAt: string;
};

/**
 * Client-side message with additional UI state
 * Extends MessageServer with optimistic update support
 */
export type MessageLocal = Omit<MessageServer, "createdAt" | "updatedAt"> & {
  isMine: boolean;
  /** Error message from SendMessageAck when send fails (status becomes ERROR) */
  error: string | null;
  /** Null for optimistic messages before server confirmation */
  createdAt: string | null;
  /** Null for optimistic messages before server confirmation */
  updatedAt: string | null;
};
