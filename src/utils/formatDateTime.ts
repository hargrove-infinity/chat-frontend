export const formatDateTime = (dateTime: string): string => {
  return new Date(dateTime).toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });
};
