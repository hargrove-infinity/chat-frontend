import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "../../state/store";
import {
  selectGetUsers,
  selectHasMoreUsers,
  selectUsersPageNumber,
  selectUsers,
  selectUsersLength,
} from "../../state/usersSlice";

const SEARCH_DEBOUNCE_MS = 400;
const PAGE_SIZE = "5";

export const useUserSearch = () => {
  const [text, setRawText] = useState("");

  // True from the moment the user types — synchronously, in the same
  // update as the text change — until the debounced page-0 fetch for
  // that text settles. Deliberately NOT derived from the store's shared
  // `loadingGetUsers` flag: that flag is also true during "load more"
  // pagination fetches, and conflating the two would blank out the
  // results list every time the user scrolls to load the next page.
  const [isPending, setIsPending] = useState(false);

  const getUsers = useStore(selectGetUsers);
  const hasMore = useStore(selectHasMoreUsers);
  const users = useStore(selectUsers);
  const nextPage = useStore(selectUsersPageNumber);
  const dataLength = useStore(selectUsersLength);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guards against a slow, now-stale request clearing the pending flag
  // after the user has already moved on to a newer query.
  const requestIdRef = useRef(0);

  // Wraps the raw setState so `isPending` flips in the SAME render as the
  // text change — React batches both calls from one event handler. This
  // is what removes the one-frame "No users found" flash: there is never
  // a render where the query is non-empty but pending is still false.
  const setText = useCallback((value: string) => {
    setRawText(value);
    setIsPending(value.trim().length > 0);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Guard: don't fetch on mount or when the input is cleared
    if (!text.trim().length) {
      return;
    }

    const currentRequestId = ++requestIdRef.current;

    debounceRef.current = setTimeout(() => {
      getUsers({ text, size: PAGE_SIZE, page: "0" }).finally(() => {
        // Only the latest debounced request may clear the pending flag,
        // so a stale in-flight request resolving late can't flip the UI
        // out of "searching" for whatever the user is currently typing.
        if (currentRequestId === requestIdRef.current) {
          setIsPending(false);
        }
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text, getUsers]);

  const fetchNextPage = useCallback(() => {
    getUsers({ text, size: PAGE_SIZE, page: String(nextPage + 1) });
  }, [text, getUsers, nextPage]);

  return {
    text,
    setText,
    users,
    isSearching: isPending,
    hasMore,
    dataLength,
    fetchNextPage,
  };
};
