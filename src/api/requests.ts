import { api } from "./api";
import { LOGIN, CHATS, MESSAGES, METRICS_LOGS } from "./endpoints";
import type {
  ApiPromise,
  AuthCredentials,
  Chat,
  LogInput,
  MessageDTO,
} from "./types";

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
): ApiPromise<MessageDTO[]> => {
  return api.get(`${CHATS}/${chatId}${MESSAGES}`);
};

// Metrics
export const sendMetricsLogsRequest = (
  errorLogs: LogInput[],
): ApiPromise<Record<string, never>> => {
  return api.post(METRICS_LOGS, errorLogs);
};
