import type { CreateChatArgs } from "../state/chatsSlice";
import type { GetUsersArgs } from "../state/usersSlice";
import { api } from "./api";
import { LOGIN, CHATS, MESSAGES, USERS } from "./endpoints";
import type {
  ApiPromise,
  AuthCredentials,
  Chat,
  MessageDTO,
  UsersPayload,
} from "./types";

// Auth
export const loginRequest = (args: AuthCredentials): ApiPromise<string> => {
  return api.post(LOGIN, args);
};

// Chats
export const createChatRequest = (body: CreateChatArgs): ApiPromise<Chat[]> => {
  return api.post(CHATS, body);
};

export const getChatsRequest = (): ApiPromise<Chat[]> => {
  return api.get(CHATS);
};

export const getMessagesByChatRequest = (
  chatId: string,
): ApiPromise<MessageDTO[]> => {
  return api.get(`${CHATS}/${chatId}${MESSAGES}`);
};

// Users
export const getUsersRequest = (
  args: GetUsersArgs,
): ApiPromise<UsersPayload> => {
  const { page, size, text } = args;
  return api.get(USERS, { params: { page, size, text } });
};
