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
export type Chat = {
  id: string;
  type: "direct" | "group";
  name: string;
  participants: string[];
  lastMessage?: string;
  createdAt: string;
  updatedAt: string;
};

export type MessageLocal = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  isMine: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MessageServer = Omit<MessageLocal, "isMine">;
