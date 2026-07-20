import { Fragment, type ReactNode } from "react";
import classes from "./UserSearch.module.css";

/**
 * Escapes characters with special meaning in regular expressions so that
 * arbitrary user-typed search text (e.g. containing `.`, `+`, `(` from an
 * email) can be safely used inside a RegExp constructor.
 */
const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Splits `text` around every case-insensitive occurrence of `query` and
 * wraps the matches in a highlighted <mark>. Returns the original text
 * untouched when there's nothing to highlight. Since String.split with a
 * capturing group interleaves [nonMatch, match, nonMatch, match, ...],
 * every odd-indexed part is always a match — no need to re-test with the
 * (stateful, due to /g) regex.
 */
export const highlightMatch = (text: string, query: string): ReactNode => {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) return text;

  const pattern = new RegExp(`(${escapeRegExp(trimmedQuery)})`, "gi");
  const parts = text.split(pattern);

  if (parts.length === 1) return text;

  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className={classes.highlightMark}>
        {part}
      </mark>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
};
