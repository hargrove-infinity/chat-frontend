import { api } from "./api";
import { LOGIN, CHATS, MESSAGES } from "./endpoints";
import type { ApiPromise, AuthCredentials, Chat, Message } from "./types";

// Auth
export const loginRequest = (args: AuthCredentials): ApiPromise<string> => {
  return api.post(LOGIN, args);
};

// Chats
export const getChatsRequest = (): ApiPromise<Chat[]> => {
  return api.get(CHATS);
};

export const getMessagesByChatRequest = (
  chatId: string,
): ApiPromise<Message[]> => {
  return api.get(`${CHATS}/${chatId}${MESSAGES}`);
};
