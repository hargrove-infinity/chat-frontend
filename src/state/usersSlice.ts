import type { StateCreator } from "zustand";
import type { User } from "../api/types";
import { getUsersRequest } from "../api/requests";
import { isApiError, isAxiosError } from "../api/utils";

export type GetUsersArgs = {
  text: string;
  page: string;
  size: string;
  requestId: number;
};

export const initialUsersState = {
  errors: null,
  loadingGetUsers: false,
  users: [],
  hasMore: false,
  pageNumber: 0,
  latestRequestId: 0,
};

export interface UsersSlice {
  errors: null | string[];
  loadingGetUsers: boolean;
  users: User[];
  hasMore: boolean;
  pageNumber: number;
  latestRequestId: number;
  getUsers: (args: GetUsersArgs) => Promise<void>;
}

export const createUsersSlice: StateCreator<UsersSlice> = (set, get) => ({
  ...initialUsersState,
  getUsers: async (args: GetUsersArgs) => {
    const prevUsers = get().users;

    try {
      set({ loadingGetUsers: true, latestRequestId: args.requestId });

      const res = await getUsersRequest(args);

      if (get().latestRequestId !== args.requestId) {
        return;
      }

      const { payload } = res.data;

      const newUsers =
        args.page === "0"
          ? payload.content
          : [...prevUsers, ...payload.content];

      set({
        loadingGetUsers: false,
        users: newUsers,
        hasMore: payload.hasMore,
        pageNumber: payload.pageNumber,
      });
    } catch (error) {
      set({ loadingGetUsers: false });

      if (isAxiosError(error)) {
        if (isApiError(error)) {
          set({ errors: error.response.data.errors });
          return;
        }
        set({ errors: ["Unknown axios error"] });
        return;
      }

      set({ errors: ["Unknown error"] });
    }
  },
});

export const selectGetUsers = (state: UsersSlice) => {
  return state.getUsers;
};

export const selectUsers = (state: UsersSlice) => {
  return state.users;
};

export const selectUsersLength = (state: UsersSlice) => {
  return state.users.length;
};

export const selectHasMoreUsers = (state: UsersSlice) => {
  return !!state.hasMore;
};

export const selectLoadingGetUsers = (state: UsersSlice) => {
  return state.loadingGetUsers;
};

export const selectUsersPageNumber = (state: UsersSlice) => {
  return state.pageNumber;
};
