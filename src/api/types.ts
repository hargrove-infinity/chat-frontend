import type { AxiosPromise, AxiosError, AxiosResponse } from "axios";

/**
 * AXIOS
 */
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

/**
 * AUTH
 */
export interface AuthCredentials {
  email: string;
  password: string;
}

/**
 * CHATS
 */

export type Participant = { id: string; name: string; isTyping: boolean };

/**
 * Chat received from server (matches backend ChatDTO)
 * Contains resolved name for both direct and group chats
 */
export type Chat = {
  id: string;
  type: "DIRECT" | "GROUP";
  /** Resolved chat name (participant's name for direct, stored name for group) */
  name: string | null;
  participants: Participant[];
  lastMessage: string | null;
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
  unreadMessages: number;
};

/**
 * Message status for tracking send state
 */
export enum MessageStatusEnum {
  /** Message is being sent to server */
  SENDING = "SENDING",
  /** Message successfully delivered to server */
  SENT = "SENT",
  /** Message read by all participants in a chat */
  READ = "READ",
  /** Message failed to send */
  ERROR = "ERROR",
}

type MessageReads = { userId: string; userName: string; read: boolean };

/**
 * Message received from server (matches backend MessageDTO)
 */
export type MessageDTO = {
  id: string;
  chatId: string;
  userId: string;
  senderName: string | null;
  content: string;
  status: MessageStatusEnum;
  reads: MessageReads[];
  createdAt: string;
  updatedAt: string;
};

/**
 * Client-side message with additional UI state
 * Extends MessageDTO with optimistic update support
 */
export type MessageLocal = Omit<MessageDTO, "createdAt" | "updatedAt"> & {
  isMine: boolean;
  /** Error message from SendMessageAck when send fails (status becomes ERROR) */
  error: string | null;
  /** Null for optimistic messages before server confirmation */
  createdAt: string | null;
  /** Null for optimistic messages before server confirmation */
  updatedAt: string | null;
};

/**
 * METRICS
 */
export type LogInput = {
  socketId: string | null;
  userId: string | null;
  event: string;
  message: string | null;
  name: string | null;
  namespace: string;
  source: string;
  timestamp: string;
};
