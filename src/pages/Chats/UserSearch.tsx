import type { FC } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useUserSearch } from "./UserSearch.hooks";
import { highlightMatch } from "./UserSearch.helpers";
import styles from "./UserSearch.module.css";

export const UserSearch: FC = () => {
  const {
    text,
    setText,
    users,
    isSearching,
    hasMore,
    fetchNextPage,
    dataLength,
  } = useUserSearch();

  const hasQuery = text.trim().length > 0;
  const isInitialLoading = hasQuery && isSearching;
  const isEmpty = hasQuery && !isSearching && dataLength === 0;
  const isIdle = !hasQuery;

  return (
    <div className={styles.container}>
      <input
        className={styles.searchInput}
        placeholder="Search by name or email..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div id="scrollableDiv" className={styles.resultsList}>
        {isIdle && (
          <div className={styles.stateContainer}>
            <svg
              className={styles.stateIcon}
              viewBox="0 0 24 24"
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p className={styles.stateText}>Start typing to search users</p>
          </div>
        )}

        {isInitialLoading && (
          <div className={styles.stateContainer}>
            <span className={styles.spinner} />
            <p className={styles.stateText}>Searching...</p>
          </div>
        )}

        {isEmpty && (
          <div className={styles.stateContainer}>
            <svg
              className={styles.stateIcon}
              viewBox="0 0 24 24"
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16" y1="16" x2="21" y2="21" />
              <line x1="8.5" y1="8.5" x2="13.5" y2="13.5" />
              <line x1="13.5" y1="8.5" x2="8.5" y2="13.5" />
            </svg>
            <p className={styles.stateText}>No users found for “{text}”</p>
          </div>
        )}

        {!isIdle && !isInitialLoading && !isEmpty && (
          <InfiniteScroll
            dataLength={dataLength}
            next={fetchNextPage}
            hasMore={hasMore}
            loader={
              <div className={styles.loading}>
                <span className={styles.spinnerSmall} />
                Loading...
              </div>
            }
            scrollableTarget="scrollableDiv"
          >
            {users.map((u) => (
              <div key={u.email} className={styles.resultItem}>
                <div className={styles.resultName}>
                  {highlightMatch(u.firstName, text)}{" "}
                  {highlightMatch(u.lastName, text)}
                </div>
                <div className={styles.resultEmail}>
                  {highlightMatch(u.email, text)}
                </div>
              </div>
            ))}
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
};
